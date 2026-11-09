import { Bot } from "grammy";
import { HttpBeerApi, HttpImageProcessor } from "./api.js";
import { createBot } from "./bot.js";
import { COMMANDS } from "./commands.js";

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    console.error(`Falta la variable de entorno ${name}`);
    process.exit(1);
  }
  return value;
}

const token = required("UNIBEERSE_BOT_TOKEN");
const allowedId = Number(required("ALLOWED_TELEGRAM_ID"));
if (!Number.isSafeInteger(allowedId) || allowedId <= 0) {
  console.error("ALLOWED_TELEGRAM_ID debe ser un numero (tu ID de Telegram)");
  process.exit(1);
}
const apiKey = required("BOT_API_KEY");
const apiUrl = (process.env.UNIBEERSE_API_URL ?? "http://unibeerse-api:8080").replace(/\/$/, "");
const cutoutUrl = (process.env.CUTOUT_URL ?? "http://unibeerse-cutout:8000").replace(/\/$/, "");
const webUrl = (process.env.WEB_URL ?? "http://unibeerse-web").replace(/\/$/, "");
const publicUrl = (process.env.PUBLIC_URL ?? "").replace(/\/$/, "");

const bot: Bot = createBot({
  token,
  allowedId,
  api: new HttpBeerApi(apiUrl, apiKey),
  images: new HttpImageProcessor(cutoutUrl),
  publicUrl,
  download: async (fileId) => {
    const file = await bot.api.getFile(fileId);
    if (!file.file_path) throw new Error("Telegram no devolvio file_path");
    const res = await fetch(`https://api.telegram.org/file/bot${token}/${file.file_path}`, {
      signal: AbortSignal.timeout(30_000),
    });
    if (!res.ok) throw new Error(`Descarga de Telegram fallida: HTTP ${res.status}`);
    return res.arrayBuffer();
  },
  // Las fotos publicadas las sirve nginx (unibeerse-web) por la red interna
  fetchBeerImage: async (path) => {
    const res = await fetch(`${webUrl}${path}`, { signal: AbortSignal.timeout(15_000) });
    return res.ok ? Buffer.from(await res.arrayBuffer()) : null;
  },
});

const stop = () => void bot.stop().finally(() => process.exit(0));
process.once("SIGINT", stop);
process.once("SIGTERM", stop);

await bot.start({
  onStart: (me) => {
    console.log(`Bot @${me.username} escuchando (long polling)`);
    bot.api.setMyCommands(COMMANDS.map((c) => ({ ...c }))).catch((err) => console.error("setMyCommands:", String(err).replaceAll(token, "***")));
  },
});
