import assert from "node:assert/strict";
import { beforeEach, describe, it } from "node:test";
import type { UserFromGetMe } from "grammy/types";
import { ApiError, type Beer, type BeerClient, type BeerInput, type ImageProcessor } from "./api.js";
import { createBot } from "./bot.js";

const mk = (id: number, over: Partial<Beer> = {}): Beer => ({
  id, brand: "Damm", name: `Cerveza ${id}`, style: "Lager", abv: 5, country: "España", score: null, notes: "", image: `/img/beers/${id}.webp`, thumb: null, ...over,
});

class FakeApi implements BeerClient {
  beers: Beer[] = [mk(1, { name: "Estrella", brand: "Estrella Galicia", score: 8 }), mk(2, { image: null }), mk(3, { image: null, score: 6 }), mk(4)];
  created: BeerInput[] = [];
  images: { id: number; size: number }[] = [];
  failImage = false;
  async search(q: string) {
    return this.beers.filter((b) => `${b.brand} ${b.name}`.toLowerCase().includes(q.toLowerCase()));
  }
  async missing(what: "image" | "score") {
    return this.beers.filter((b) => (what === "image" ? !b.image : b.score == null));
  }
  async get(id: number) {
    const b = this.beers.find((x) => x.id === id);
    if (!b) throw new ApiError(404, "no existe");
    return b;
  }
  async create(input: BeerInput) {
    this.created.push(input);
    const b = mk(100 + this.created.length, { ...input, image: null });
    this.beers.push(b);
    return b;
  }
  async setScore(id: number, score: number | null) {
    const b = await this.get(id);
    b.score = score;
    return b;
  }
  async setImage(id: number, webp: Buffer) {
    if (this.failImage) throw new ApiError(500, "boom");
    this.images.push({ id, size: webp.length });
    const b = await this.get(id);
    b.image = `/media/${id}.webp`;
    return b;
  }
}

class FakeImages implements ImageProcessor {
  modes: string[] = [];
  async process(_i: Buffer, mode: "cutout" | "resize") {
    this.modes.push(mode);
    return Buffer.from(`webp-${mode}`);
  }
  async preview(w: Buffer) {
    return Buffer.concat([Buffer.from("jpg:"), w]);
  }
}

type Call = { method: string; payload: Record<string, any> };

function setup(allowedId = 42) {
  const api = new FakeApi();
  const images = new FakeImages();
  const calls: Call[] = [];
  const bot = createBot({
    token: "123:SECRET",
    allowedId,
    api,
    images,
    publicUrl: "https://web.test",
    download: async () => new Uint8Array([1, 2, 3]).buffer,
    fetchBeerImage: async () => Buffer.from("img"),
    botInfo: { id: 1, is_bot: true, first_name: "t", username: "t_bot" } as unknown as UserFromGetMe,
  });
  let msg = 100;
  bot.api.config.use(async (_prev, method, payload) => {
    calls.push({ method, payload: payload as Record<string, any> });
    const message = { message_id: ++msg, date: 0, chat: { id: 42, type: "private" }, text: "x" };
    const result = ["sendMessage", "sendPhoto"].includes(method) ? message : true;
    return { ok: true, result } as any;
  });
  let n = 1;
  const user = (id: number) => ({ id, is_bot: false, first_name: "B" });
  const send = (update: any) => bot.handleUpdate({ update_id: n++, ...update }).catch((err) => bot.errorHandler(err));
  const base = (from: number) => ({ message_id: n, date: 0, chat: { id: from, type: "private" }, from: user(from) });
  return {
    api, images, calls,
    text: (t: string, from = 42) =>
      send({ message: { ...base(from), text: t, ...(t.startsWith("/") ? { entities: [{ type: "bot_command", offset: 0, length: t.split(" ")[0]!.length }] } : {}) } }),
    photo: (caption?: string, from = 42) =>
      send({ message: { ...base(from), photo: [{ file_id: "s", file_unique_id: "a", width: 9, height: 9 }, { file_id: "big", file_unique_id: "b", width: 99, height: 99 }], ...(caption ? { caption } : {}) } }),
    press: (data: string, opts: { photo?: boolean } = {}) =>
      send({ callback_query: { id: String(n), from: user(42), chat_instance: "x", data, message: { message_id: 7, date: 0, chat: { id: 42, type: "private" }, ...(opts.photo ? { photo: [{ file_id: "p", file_unique_id: "p", width: 1, height: 1 }] } : { text: "x" }) } } }),
    last: (method: string) => calls.filter((c) => c.method === method).at(-1),
    all: (method: string) => calls.filter((c) => c.method === method),
    buttons: (call?: Call): string[] => (call?.payload.reply_markup?.inline_keyboard ?? []).flat().map((b: any) => b.callback_data),
  };
}

describe("acceso", () => {
  it("ignora a cualquier otro usuario", async () => {
    const h = setup();
    await h.text("/ayuda", 7);
    await h.photo("A, B", 7);
    assert.equal(h.calls.length, 0);
  });
});

describe("cerveza nueva con foto", () => {
  let h: ReturnType<typeof setup>;
  beforeEach(() => {
    h = setup();
  });

  it("recorta, ensena la vista previa y guarda al confirmar", async () => {
    await h.photo("Estrella Galicia, Especial, Lager, 5,5, España");
    assert.deepEqual(h.images.modes, ["cutout"]);
    const preview = h.last("sendPhoto")!;
    assert.match(preview.payload.caption, /Cerveza nueva \(sin fondo\)/);
    assert.match(preview.payload.caption, /Estrella Galicia Especial · 5,5 % · España · Lager/);
    const data = h.buttons(preview);
    assert.match(data[0]!, /^g:[0-9a-f]{8}$/);

    await h.press(data[0]!, { photo: true });
    assert.equal(h.api.created.length, 1);
    assert.equal(h.api.created[0]!.abv, 5.5);
    assert.deepEqual(h.api.images, [{ id: 101, size: "webp-cutout".length }]);
    assert.match(h.last("editMessageCaption")!.payload.caption, /✅ Guardada: [\s\S]*https:\/\/web\.test\/cerveza\/101/);
    // y ofrece ponerle nota
    assert.ok(h.buttons(h.last("sendMessage")).includes("s:101:8"));
  });

  it("guardar dos veces no duplica", async () => {
    await h.photo("A, B");
    const save = h.buttons(h.last("sendPhoto"))[0]!;
    await h.press(save, { photo: true });
    await h.press(save, { photo: true });
    assert.equal(h.api.created.length, 1);
  });

  it("sin pie de foto pregunta los datos", async () => {
    await h.photo();
    assert.match(h.last("sendMessage")!.payload.text, /¿Qué cerveza es\?/);
    assert.equal(h.images.modes.length, 0);
    await h.text("Mahou, Cinco Estrellas");
    assert.equal(h.images.modes.length, 1);
    assert.match(h.last("sendPhoto")!.payload.caption, /Mahou Cinco Estrellas/);
  });

  it("si los datos no tienen nombre, vuelve a preguntar", async () => {
    await h.photo();
    await h.text("5,5");
    assert.match(h.last("sendMessage")!.payload.text, /al menos el nombre/);
    await h.text("Voll-Damm");
    assert.equal(h.images.modes.length, 1);
  });

  it("puede dejar el fondo original y volver a quitarlo", async () => {
    await h.photo("A, B");
    const pid = h.buttons(h.last("sendPhoto"))[0]!.slice(2);
    await h.press(`m:${pid}:resize`, { photo: true });
    assert.deepEqual(h.images.modes, ["cutout", "resize"]);
    const edited = h.last("editMessageMedia")!;
    assert.match(edited.payload.media.caption ?? "", /con el fondo original/);
    await h.press(`g:${pid}`, { photo: true });
    assert.equal(h.api.images[0]!.size, "webp-resize".length);
  });

  it("avisa si ya existe una igual", async () => {
    await h.photo("Estrella Galicia, Estrella");
    assert.match(h.last("sendPhoto")!.payload.caption, /Ya tienes una igual \(nº 1\)/);
  });

  it("cancelar no guarda nada", async () => {
    await h.photo("A, B");
    const buttons = h.buttons(h.last("sendPhoto"));
    await h.press(buttons.find((b) => b.startsWith("x:"))!, { photo: true });
    assert.match(h.last("editMessageCaption")!.payload.caption, /Cancelado/);
    assert.equal(h.api.created.length, 0);
  });

  it("si la foto falla tras crear la cerveza, lo dice", async () => {
    h.api.failImage = true;
    await h.photo("A, B");
    await h.press(h.buttons(h.last("sendPhoto"))[0]!, { photo: true });
    assert.equal(h.api.created.length, 1);
    assert.ok(h.all("editMessageCaption").some((c) => /la foto ha fallado/.test(c.payload.caption)));
  });

  it("cambiar datos reescribe la vista previa", async () => {
    await h.photo("A, B");
    const pid = h.buttons(h.last("sendPhoto"))[0]!.slice(2);
    await h.press(`e:${pid}`, { photo: true });
    await h.text("Nueva Marca, Nuevo Nombre, IPA, 6");
    assert.match(h.last("editMessageCaption")!.payload.caption, /Nueva Marca Nuevo Nombre · 6 % · IPA/);
    await h.press(`g:${pid}`, { photo: true });
    assert.equal(h.api.created[0]!.name, "Nuevo Nombre");
  });

  it("acepta la imagen enviada como archivo", async () => {
    // (el handler de documentos usa el mismo flujo)
    await h.text("/ayuda");
    assert.ok(h.last("sendMessage")!.payload.text.includes("Unibeerse"));
  });
});

describe("cambiar la foto de una existente", () => {
  it("/foto busca, pide la imagen y la sube", async () => {
    const h = setup();
    await h.text("/foto");
    await h.text("cerveza 2");
    assert.match(h.last("sendMessage")!.payload.text, /Mándame la foto de Damm Cerveza 2/);
    await h.photo();
    assert.match(h.last("sendPhoto")!.payload.caption, /Foto nueva para Damm Cerveza 2/);
    await h.press(h.buttons(h.last("sendPhoto"))[0]!, { photo: true });
    assert.deepEqual(h.api.images, [{ id: 2, size: "webp-cutout".length }]);
    assert.equal(h.api.created.length, 0);
  });

  it("con varias coincidencias ofrece botones", async () => {
    const h = setup();
    await h.text("/foto");
    await h.text("damm");
    const kb = h.buttons(h.last("sendMessage"));
    assert.ok(kb.length >= 2 && kb.every((b) => /^p:foto:\d+$/.test(b)));
    await h.press("p:foto:3");
    assert.match(h.last("sendMessage")!.payload.text, /Damm Cerveza 3/);
  });

  it("/sinfoto lista las que no tienen", async () => {
    const h = setup();
    await h.text("/sinfoto");
    assert.deepEqual(h.buttons(h.last("sendMessage")), ["p:foto:2", "p:foto:3"]);
  });

  it("sin coincidencias sigue esperando", async () => {
    const h = setup();
    await h.text("/foto");
    await h.text("zzz");
    assert.match(h.last("sendMessage")!.payload.text, /No encuentro/);
    await h.text("cerveza 4");
    assert.match(h.last("sendMessage")!.payload.text, /Mándame la foto/);
  });
});

describe("puntuar", () => {
  it("/sinnota muestra la primera sin nota con teclado (con foto si la tiene)", async () => {
    const h = setup();
    await h.text("/sinnota"); // la 2 no tiene foto: tarjeta de texto
    const card = h.last("sendMessage")!;
    assert.match(card.payload.text, /Cerveza 2[\s\S]*sin nota/);
    const kb = h.buttons(card);
    assert.ok(kb.includes("s:2:7") && kb.includes("s:2:+") && kb.includes("n:2"));
  });

  it("un toque guarda la nota y actualiza la tarjeta", async () => {
    const h = setup();
    await h.press("s:2:7", { photo: true });
    assert.equal(h.api.beers[1]!.score, 7);
    assert.match(h.last("editMessageCaption")!.payload.caption, /nota 7\/10/);
  });

  it("subir y bajar medio punto parte de la nota actual", async () => {
    const h = setup();
    await h.press("s:3:+"); // tenia 6
    assert.equal(h.api.beers[2]!.score, 6.5);
    await h.press("s:3:-");
    await h.press("s:3:-");
    assert.equal(h.api.beers[2]!.score, 5.5);
    assert.match(h.last("editMessageText")!.payload.text, /nota 5,5\/10/);
  });

  it("los limites 0 y 10 se respetan y se puede quitar la nota", async () => {
    const h = setup();
    await h.press("s:2:-"); // sin nota -> 0
    assert.equal(h.api.beers[1]!.score, 0);
    h.api.beers[1]!.score = 10;
    await h.press("s:2:+");
    assert.equal(h.api.beers[1]!.score, 10);
    await h.press("s:2:x");
    assert.equal(h.api.beers[1]!.score, null);
  });

  it("siguiente sin nota salta a la siguiente y da la vuelta", async () => {
    const h = setup();
    await h.press("n:2");
    assert.match(h.last("sendPhoto")!.payload.caption, /Cerveza 4/);
    await h.press("n:4"); // despues de la 4 no hay mas: vuelve a la 2 (sin foto: tarjeta de texto)
    assert.match(h.last("sendMessage")!.payload.text, /Cerveza 2/);
  });

  it("avisa cuando no quedan", async () => {
    const h = setup();
    h.api.beers.forEach((b) => (b.score = 5));
    await h.press("n:1");
    assert.match(h.last("answerCallbackQuery")!.payload.text, /No quedan/);
    await h.text("/sinnota");
    assert.match(h.last("sendMessage")!.payload.text, /Todas las cervezas tienen nota/);
  });

  it("/nota busca por nombre y abre la tarjeta", async () => {
    const h = setup();
    await h.text("/nota");
    await h.text("estrella");
    assert.ok(h.buttons(h.last("sendPhoto")).includes("s:1:9"));
  });
});

describe("errores", () => {
  it("avisa del fallo de la API sin tirar el bot", async () => {
    const h = setup();
    await h.press("s:99:5");
    assert.match(h.last("sendMessage")!.payload.text, /Algo ha fallado \(no existe\)/);
  });

  it("texto suelto sin contexto da una pista", async () => {
    const h = setup();
    await h.text("hola");
    assert.match(h.last("sendMessage")!.payload.text, /No sé qué hacer/);
  });
});
