import { randomBytes } from "node:crypto";
import { Bot, InlineKeyboard, InputFile, type Context } from "grammy";
import type { UserFromGetMe } from "grammy/types";
import { ApiError, type Beer, type BeerClient, type BeerInput, type ImageProcessor } from "./api.js";
import { COMMANDS } from "./commands.js";
import { InputState } from "./input.js";
import { beerLine, beerTitle, norm, num, scoreText } from "./format.js";
import { parseBeer } from "./parser.js";

export { COMMANDS };

export interface BotDeps {
  token: string;
  /** Unico usuario de Telegram al que responde el bot. */
  allowedId: number;
  api: BeerClient;
  images: ImageProcessor;
  /** Descarga un fichero de Telegram por su file_id. */
  download: (fileId: string) => Promise<ArrayBuffer>;
  /** Descarga la foto publicada de una cerveza (para ensenarla al puntuar). Opcional. */
  fetchBeerImage?: (path: string) => Promise<Buffer | null>;
  /** Direccion publica de la web, para los enlaces. */
  publicUrl: string;
  /** Solo para tests: evita la llamada getMe. */
  botInfo?: UserFromGetMe;
}

type Target = { kind: "new"; data: BeerInput } | { kind: "existing"; beer: Beer };

interface PendingImage {
  target: Target;
  original: Buffer;
  webp: Buffer;
  mode: "cutout" | "resize";
  /** mensaje de la vista previa, para editarlo al cambiar los datos */
  messageId?: number;
  expires: number;
}

const TTL_MS = 10 * 60 * 1000;

const HELP = [
  "Esto es el bot de Unibeerse.",
  "",
  "Para añadir una cerveza, mándame su foto con los datos en el pie de foto:",
  "• Estrella Galicia, Especial, Lager, 5,5, España",
  "• 1906 Reserva Especial, 6,5%, España, nota 8",
  "Todo es opcional menos el nombre. Te quito el fondo, te enseño cómo queda y confirmas.",
  "Si la mandas sin pie de foto, te pregunto los datos.",
  "",
  ...COMMANDS.map((c) => `/${c.command}: ${c.description}`),
].join("\n");

const cut = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

export function createBot(deps: BotDeps): Bot {
  const bot = new Bot(deps.token, deps.botInfo ? { botInfo: deps.botInfo } : undefined);
  const pending = new Map<string, PendingImage>();
  let awaitingPhoto: { beer: Beer; expires: number } | null = null;
  const input = new InputState();

  const put = (p: PendingImage): string => {
    const now = Date.now();
    for (const [key, value] of pending) if (value.expires < now) pending.delete(key);
    const id = randomBytes(4).toString("hex");
    pending.set(id, p);
    return id;
  };
  const get = (id: string): PendingImage | undefined => {
    const p = pending.get(id);
    return p && p.expires >= Date.now() ? p : undefined;
  };

  // Solo tu usuario, solo en chat privado. A cualquier otro no se le responde.
  bot.use(async (ctx, next) => {
    if (ctx.chat?.type !== "private" || ctx.from?.id !== deps.allowedId) return;
    await next();
  });

  bot.catch(async (err) => {
    console.error("Error en el bot:", String(err.error).replaceAll(deps.token, "***"));
    const detail = err.error instanceof ApiError ? ` (${err.error.message})` : "";
    await err.ctx.reply(`⚠️ Algo ha fallado${detail}. Prueba de nuevo en un momento.`).catch(() => undefined);
  });

  // Cualquier comando cancela lo que se estaba esperando.
  bot.on("message::bot_command", async (_ctx, next) => {
    input.clear();
    awaitingPhoto = null;
    await next();
  });

  bot.command(["start", "ayuda", "help"], (ctx) => ctx.reply(HELP));
  bot.command("cancelar", (ctx) => ctx.reply("Cancelado."));

  // ---------- Buscar una cerveza ----------

  type Action = "score" | "foto";

  const pickKeyboard = (beers: Beer[], action: Action): InlineKeyboard => {
    const kb = new InlineKeyboard();
    for (const b of beers) kb.text(cut(beerLine(b), 60), `p:${action}:${b.id}`).row();
    return kb;
  };

  async function askWhich(ctx: Context, action: Action): Promise<void> {
    await ctx.reply("¿Qué cerveza? Escribe parte de la marca o del nombre.");
    input.set((c) => runSearch(c, action));
  }

  async function runSearch(ctx: Context, action: Action): Promise<void> {
    const q = ctx.message?.text?.trim() ?? "";
    if (!q) {
      input.set((c) => runSearch(c, action));
      return;
    }
    const found = await deps.api.search(q);
    if (found.length === 0) {
      await ctx.reply(`No encuentro ninguna con «${q}». Prueba con otra palabra.`);
      input.set((c) => runSearch(c, action));
    } else if (found.length === 1) {
      await choose(ctx, action, found[0]!);
    } else {
      await ctx.reply("¿Cuál de estas?", { reply_markup: pickKeyboard(found, action) });
    }
  }

  async function choose(ctx: Context, action: Action, beer: Beer): Promise<void> {
    if (action === "score") {
      await sendScoreCard(ctx, beer);
    } else {
      awaitingPhoto = { beer, expires: Date.now() + TTL_MS };
      await ctx.reply(`Mándame la foto de ${beerTitle(beer)}. Mejor con buena luz y sobre un fondo liso.`);
    }
  }

  bot.command("nota", (ctx) => askWhich(ctx, "score"));
  bot.command("foto", (ctx) => askWhich(ctx, "foto"));

  bot.callbackQuery(/^p:(score|foto):(\d+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const beer = await deps.api.get(Number(ctx.match[2]));
    await ctx.editMessageReplyMarkup({ reply_markup: undefined }).catch(() => undefined);
    await choose(ctx, ctx.match[1] as Action, beer);
  });

  bot.command("sinfoto", async (ctx) => {
    const list = await deps.api.missing("image");
    if (list.length === 0) {
      await ctx.reply("Todas las cervezas tienen foto 🎉");
      return;
    }
    const shown = list.slice(0, 10);
    const more = list.length > shown.length ? `\n…y ${list.length - shown.length} más.` : "";
    await ctx.reply(`📷 Sin foto: ${list.length}. Toca una para ponerle foto.${more}`, {
      reply_markup: pickKeyboard(shown, "foto"),
    });
  });

  // ---------- Puntuar ----------

  const scoreKeyboard = (beer: Beer): InlineKeyboard => {
    const kb = new InlineKeyboard();
    for (let n = 1; n <= 10; n++) {
      kb.text(String(n), `s:${beer.id}:${n}`);
      if (n === 5) kb.row();
    }
    return kb
      .row()
      .text("➖ ½", `s:${beer.id}:-`)
      .text("➕ ½", `s:${beer.id}:+`)
      .text("Quitar nota", `s:${beer.id}:x`)
      .row()
      .text("⏭ Siguiente sin nota", `n:${beer.id}`)
      .text("✅ Listo", "ok");
  };

  const cardText = (beer: Beer): string => `🍺 ${beerLine(beer)}\n${scoreText(beer.score)}`;

  async function sendScoreCard(ctx: Context, beer: Beer): Promise<void> {
    const reply_markup = scoreKeyboard(beer);
    const path = beer.thumb ?? beer.image;
    if (path && deps.fetchBeerImage) {
      try {
        const img = await deps.fetchBeerImage(path);
        if (img) {
          const jpeg = await deps.images.preview(img);
          await ctx.replyWithPhoto(new InputFile(jpeg, "cerveza.jpg"), { caption: cardText(beer), reply_markup });
          return;
        }
      } catch {
        // sin foto en la tarjeta: se manda solo el texto
      }
    }
    await ctx.reply(cardText(beer), { reply_markup });
  }

  async function editCard(ctx: Context, beer: Beer): Promise<void> {
    const message = ctx.callbackQuery?.message;
    const reply_markup = scoreKeyboard(beer);
    if (message && "photo" in message && message.photo) {
      await ctx.editMessageCaption({ caption: cardText(beer), reply_markup });
    } else {
      await ctx.editMessageText(cardText(beer), { reply_markup });
    }
  }

  bot.callbackQuery(/^s:(\d+):(\d+|\+|-|x)$/, async (ctx) => {
    const id = Number(ctx.match[1]);
    const v = ctx.match[2]!;
    const current = await deps.api.get(id);
    let next: number | null;
    if (v === "x") next = null;
    else if (v === "+") next = Math.min(10, (current.score ?? 0) + 0.5);
    else if (v === "-") next = Math.max(0, (current.score ?? 0) - 0.5);
    else next = Number(v);
    const saved = await deps.api.setScore(id, next);
    await ctx.answerCallbackQuery({ text: saved.score == null ? "Nota quitada" : `Nota: ${num(saved.score)}` });
    await editCard(ctx, saved);
  });

  async function nextUnscored(afterId: number): Promise<Beer | null> {
    const list = await deps.api.missing("score");
    return list.find((b) => b.id > afterId) ?? list.find((b) => b.id !== afterId) ?? null;
  }

  bot.callbackQuery(/^n:(\d+)$/, async (ctx) => {
    const next = await nextUnscored(Number(ctx.match[1]));
    if (!next) {
      await ctx.answerCallbackQuery({ text: "No quedan cervezas sin nota 🎉" });
      return;
    }
    await ctx.answerCallbackQuery();
    await ctx.editMessageReplyMarkup({ reply_markup: undefined }).catch(() => undefined);
    await sendScoreCard(ctx, next);
  });

  bot.callbackQuery("ok", async (ctx) => {
    await ctx.answerCallbackQuery({ text: "Hecho" });
    await ctx.editMessageReplyMarkup({ reply_markup: undefined }).catch(() => undefined);
  });

  bot.command("sinnota", async (ctx) => {
    const first = (await deps.api.missing("score"))[0];
    if (!first) {
      await ctx.reply("Todas las cervezas tienen nota 🎉");
      return;
    }
    await sendScoreCard(ctx, first);
  });

  // ---------- Fotos: cervezas nuevas y fotos de las existentes ----------

  const previewCaption = (p: PendingImage, warning = ""): string => {
    const how = p.mode === "cutout" ? "sin fondo" : "con el fondo original";
    if (p.target.kind === "existing") {
      return `📷 Foto nueva para ${beerTitle(p.target.beer)} (${how}).\n¿La guardo?`;
    }
    const d = p.target.data;
    return [`🆕 Cerveza nueva (${how})`, beerLine(d), d.score != null ? `Nota ${num(d.score)}/10` : "", warning, "", "¿La guardo así?"]
      .filter((l, i) => l !== "" || i === 4)
      .join("\n");
  };

  const previewKeyboard = (pid: string, p: PendingImage): InlineKeyboard => {
    const kb = new InlineKeyboard().text("✅ Guardar", `g:${pid}`).row();
    kb.text(p.mode === "cutout" ? "🖼 Dejar el fondo original" : "✂️ Quitar el fondo", `m:${pid}:${p.mode === "cutout" ? "resize" : "cutout"}`).row();
    if (p.target.kind === "new") kb.text("✏️ Cambiar datos", `e:${pid}`);
    return kb.text("❌ Cancelar", `x:${pid}`);
  };

  async function duplicateWarning(data: BeerInput): Promise<string> {
    try {
      const same = (await deps.api.search(`${data.brand} ${data.name}`)).find(
        (b) => norm(b.brand) === norm(data.brand) && norm(b.name) === norm(data.name),
      );
      return same ? `⚠️ Ya tienes una igual (nº ${same.id}). Si la guardas, quedarán dos.` : "";
    } catch {
      return "";
    }
  }

  async function startImage(ctx: Context, fileId: string, target: Target): Promise<void> {
    const status = await ctx.reply("⏳ Procesando la foto, puede tardar unos segundos…");
    const original = Buffer.from(await deps.download(fileId));
    const webp = await deps.images.process(original, "cutout");
    const jpeg = await deps.images.preview(webp);
    const p: PendingImage = { target, original, webp, mode: "cutout", expires: Date.now() + TTL_MS };
    const pid = put(p);
    const warning = target.kind === "new" ? await duplicateWarning(target.data) : "";
    const sent = await ctx.replyWithPhoto(new InputFile(jpeg, "vista-previa.jpg"), {
      caption: previewCaption(p, warning),
      reply_markup: previewKeyboard(pid, p),
    });
    p.messageId = sent.message_id;
    await ctx.api.deleteMessage(status.chat.id, status.message_id).catch(() => undefined);
  }

  async function onPhoto(ctx: Context, fileId: string, caption: string): Promise<void> {
    if (awaitingPhoto && awaitingPhoto.expires >= Date.now()) {
      const { beer } = awaitingPhoto;
      awaitingPhoto = null;
      await startImage(ctx, fileId, { kind: "existing", beer });
      return;
    }
    const data = parseBeer(caption);
    if (data) {
      await startImage(ctx, fileId, { kind: "new", data });
      return;
    }
    await ctx.reply(
      "¿Qué cerveza es? Escríbeme los datos: Marca, Nombre, Estilo, graduación, país.\nEj.: Estrella Galicia, Especial, Lager, 5,5, España",
    );
    const ask = async (c: Context): Promise<void> => {
      const parsed = parseBeer(c.message?.text ?? "");
      if (!parsed) {
        await c.reply("Necesito al menos el nombre. Prueba otra vez, o /cancelar.");
        input.set(ask);
        return;
      }
      await startImage(c, fileId, { kind: "new", data: parsed });
    };
    input.set(ask);
  }

  bot.on("message:photo", (ctx) => {
    const sizes = ctx.message.photo;
    return onPhoto(ctx, sizes[sizes.length - 1]!.file_id, ctx.message.caption ?? "");
  });

  // Mandada "como archivo" (sin comprimir): mejor calidad para recortar
  bot.on("message:document", async (ctx) => {
    const doc = ctx.message.document;
    if (!doc.mime_type?.startsWith("image/")) {
      await ctx.reply("Solo entiendo fotos. Mándame la imagen de la cerveza.");
      return;
    }
    await onPhoto(ctx, doc.file_id, ctx.message.caption ?? "");
  });

  const expired = (ctx: Context) => ctx.answerCallbackQuery({ text: "Ha caducado. Vuelve a mandar la foto.", show_alert: true });

  bot.callbackQuery(/^m:([0-9a-f]{8}):(cutout|resize)$/, async (ctx) => {
    const p = get(ctx.match[1]!);
    if (!p) return void (await expired(ctx));
    await ctx.answerCallbackQuery({ text: "Procesando…" });
    const mode = ctx.match[2] as "cutout" | "resize";
    p.webp = await deps.images.process(p.original, mode);
    p.mode = mode;
    const jpeg = await deps.images.preview(p.webp);
    const warning = p.target.kind === "new" ? await duplicateWarning(p.target.data) : "";
    await ctx.editMessageMedia(
      { type: "photo", media: new InputFile(jpeg, "vista-previa.jpg"), caption: previewCaption(p, warning) },
      { reply_markup: previewKeyboard(ctx.match[1]!, p) },
    );
  });

  bot.callbackQuery(/^e:([0-9a-f]{8})$/, async (ctx) => {
    const pid = ctx.match[1]!;
    const p = get(pid);
    if (!p || p.target.kind !== "new") return void (await expired(ctx));
    await ctx.answerCallbackQuery();
    p.messageId = ctx.callbackQuery.message?.message_id ?? p.messageId;
    await ctx.reply("Escríbeme los datos otra vez: Marca, Nombre, Estilo, graduación, país, nota.");
    const ask = async (c: Context): Promise<void> => {
      const parsed = parseBeer(c.message?.text ?? "");
      if (!parsed) {
        await c.reply("Necesito al menos el nombre. Prueba otra vez, o /cancelar.");
        input.set(ask);
        return;
      }
      p.target = { kind: "new", data: parsed };
      const warning = await duplicateWarning(parsed);
      if (p.messageId) {
        await c.api.editMessageCaption(c.chat!.id, p.messageId, {
          caption: previewCaption(p, warning),
          reply_markup: previewKeyboard(pid, p),
        });
      }
      await c.reply("Datos cambiados ✔️");
    };
    input.set(ask);
  });

  bot.callbackQuery(/^x:([0-9a-f]{8})$/, async (ctx) => {
    pending.delete(ctx.match[1]!);
    await ctx.answerCallbackQuery();
    await ctx.editMessageCaption({ caption: "Cancelado." });
  });

  bot.callbackQuery(/^g:([0-9a-f]{8})$/, async (ctx) => {
    const p = get(ctx.match[1]!);
    if (!p) return void (await expired(ctx));
    pending.delete(ctx.match[1]!); // un solo toque: evita guardarla dos veces
    await ctx.answerCallbackQuery({ text: "Guardando…" });

    if (p.target.kind === "existing") {
      const saved = await deps.api.setImage(p.target.beer.id, p.webp);
      await ctx.editMessageCaption({ caption: `✅ Foto guardada: ${beerTitle(saved)}\n${deps.publicUrl}/cerveza/${saved.id}` });
      return;
    }

    const created = await deps.api.create(p.target.data);
    try {
      await deps.api.setImage(created.id, p.webp);
    } catch (err) {
      await ctx.editMessageCaption({
        caption: `⚠️ He guardado la cerveza (${beerTitle(created)}) pero la foto ha fallado. Pónsela con /foto.`,
      });
      throw err;
    }
    await ctx.editMessageCaption({ caption: `✅ Guardada: ${beerLine(created)}\n${deps.publicUrl}/cerveza/${created.id}` });
    // Si no traia nota, se ofrece ponerla ahora
    if (created.score == null) await sendScoreCard(ctx, { ...created, thumb: null, image: null });
  });

  // ---------- Resto ----------

  bot.on("message:text", async (ctx) => {
    if (await input.handle(ctx)) return;
    await ctx.reply("No sé qué hacer con eso. Mándame la foto de una cerveza con sus datos en el pie, o mira /ayuda.");
  });

  return bot;
}
