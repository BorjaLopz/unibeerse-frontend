// Genera migration/out/import.sql a partir de la exportacion de Firestore.
//     node migration/to-sql.mjs
// Si no existe migration/out/beers.json, usa public/beer-data.json (la copia que viene en el repo).
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

const read = (p) => JSON.parse(readFileSync(p, "utf8"));
const imageMap = read("migration/image-map.json"); // "Nombre original.png" -> "slug"

// --- Cervezas: acepta el formato de Firestore (MAYUSCULAS) o el de beer-data.json (minusculas) ---
let raw;
if (existsSync("migration/out/beers.json")) {
  raw = read("migration/out/beers.json").map((b) => ({
    id: b.ID, brand: b.MARCA, name: b.NOMBRE, style: b.ESTILO, abv: b.GRADUACION,
    country: b.NACIONALIDAD, score: b.NOTA, notes: b.COMENTARIOS, image: b.IMAGEN,
  }));
  console.log(`Cervezas de Firestore: ${raw.length}`);
} else {
  raw = read("public/beer-data.json").data.map((b) => ({
    id: b.id, brand: b.brand, name: b.name, style: b.style, abv: b.graduation,
    country: b.country, score: b.score, notes: b.comments, image: b.img_file,
  }));
  console.log(`Cervezas de beer-data.json: ${raw.length} (no hay exportacion de Firestore)`);
}

const str = (v) => (v == null ? "" : String(v)).replace(/\0/g, "").trim();
const sql = (v) => (v == null ? "NULL" : `'${String(v).replace(/'/g, "''")}'`);
const num = (v, min, max) => {
  const n = Number(str(v).replace(",", ".").replace("%", ""));
  return str(v) !== "" && Number.isFinite(n) && n >= min && n <= max ? n : null;
};

const seen = new Set();
const beers = [];
for (const b of raw) {
  const id = Number.parseInt(str(b.id), 10);
  if (!Number.isInteger(id) || id < 1 || seen.has(id)) {
    console.warn(`  Se omite una cerveza con ID no valido o repetido: ${JSON.stringify(b.id)} (${str(b.name)})`);
    continue;
  }
  seen.add(id);
  const file = str(b.image);
  const slug = file ? imageMap[file] : null;
  if (file && !slug) console.warn(`  Cerveza ${id}: no encuentro la imagen "${file}"`);
  beers.push({
    id,
    brand: str(b.brand).slice(0, 120),
    name: str(b.name).slice(0, 200) || "(sin nombre)",
    style: str(b.style).slice(0, 100),
    abv: num(b.abv, 0, 99.9),
    country: str(b.country).slice(0, 200),
    score: num(b.score, 0, 10),
    notes: str(b.notes).slice(0, 1000),
    image: slug ? `/img/beers/${slug}.webp` : null,
    thumb: slug ? `/img/beers/${slug}-sm.webp` : null,
  });
}

let out = "-- Generado por migration/to-sql.mjs. Ejecutar UNA vez sobre la base vacia (despues de arrancar la API).\nBEGIN;\n";
for (const b of beers) {
  out += `INSERT INTO beers (id, brand, name, style, abv, country, score, notes, image, thumb) VALUES (${b.id}, ${sql(b.brand)}, ${sql(b.name)}, ${sql(b.style)}, ${b.abv ?? "NULL"}, ${sql(b.country)}, ${b.score ?? "NULL"}, ${sql(b.notes)}, ${sql(b.image)}, ${sql(b.thumb)});\n`;
}

// --- Comentarios (sin emails) ---
let comments = 0;
if (existsSync("migration/out/comments.json")) {
  for (const c of read("migration/out/comments.json")) {
    const beerId = Number.parseInt(str(c.beerID), 10);
    const text = str(c.comment).slice(0, 1000);
    if (!seen.has(beerId) || !text) continue;
    out += `INSERT INTO comments (beer_id, uid, author_name, text) VALUES (${beerId}, NULL, ${sql(str(c.name).slice(0, 100) || "Anónimo")}, ${sql(text)});\n`;
    comments++;
  }
}

out += "SELECT setval(pg_get_serial_sequence('beers','id'), (SELECT COALESCE(MAX(id), 1) FROM beers));\nCOMMIT;\n";
mkdirSync("migration/out", { recursive: true });
writeFileSync("migration/out/import.sql", out);
console.log(`import.sql listo: ${beers.length} cervezas, ${comments} comentarios`);
