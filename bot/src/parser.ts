import type { BeerInput } from "./api.js";

const strip = (s: string): string =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();

/** Paises que se reconocen en el texto (nombre canonico con acentos). */
const COUNTRIES = [
  "España", "Alemania", "Bélgica", "Inglaterra", "Escocia", "Gales", "Reino Unido", "Irlanda", "Holanda",
  "Países Bajos", "Italia", "Francia", "Estados Unidos", "Japón", "México", "Portugal", "Dinamarca", "Chequia",
  "República Checa", "Suecia", "Noruega", "Finlandia", "Islandia", "Turquía", "Venezuela", "República Dominicana",
  "Panamá", "Austria", "Tailandia", "Singapur", "China", "Polonia", "Suiza", "Hungría", "Eslovaquia", "Eslovenia",
  "Croacia", "Grecia", "Rusia", "Ucrania", "Canadá", "Brasil", "Argentina", "Chile", "Colombia", "Perú", "Cuba",
  "Australia", "Nueva Zelanda", "India", "Corea del Sur", "Vietnam", "Filipinas", "Marruecos", "Sudáfrica",
  "Luxemburgo", "Lituania", "Letonia", "Estonia", "Israel",
];
const COUNTRY_BY_KEY = new Map(COUNTRIES.map((c) => [strip(c), c]));
COUNTRY_BY_KEY.set("eeuu", "Estados Unidos");
COUNTRY_BY_KEY.set("usa", "Estados Unidos");
COUNTRY_BY_KEY.set("turquia", "Turquía");

function asCountry(token: string): string | null {
  const parts = token.split("/").map((p) => p.trim()).filter(Boolean);
  if (!parts.length) return null;
  const known = parts.map((p) => COUNTRY_BY_KEY.get(strip(p)));
  return known.every(Boolean) ? (known as string[]).join(" / ") : null;
}

export interface ParsedBeer {
  beer: BeerInput;
}

/**
 * Lee el pie de foto: "Marca, Nombre, Estilo, graduación, país, nota". Todo menos el nombre es opcional y el
 * orden de lo numerico y del pais es libre:
 *   Estrella Galicia, Especial, Lager, 5,5, España
 *   1906 Reserva Especial · 6,5% · España · nota 8
 * Separadores: coma, punto y coma, barra vertical o salto de linea ("5,5" con coma decimal se respeta).
 * Devuelve null si no hay ni nombre.
 */
export function parseBeer(text: string): BeerInput | null {
  const normalized = text.replace(/(\d),(\d)/g, "$1.$2").replace(/·/g, "|");
  const tokens = normalized
    .split(/[\n;|,]/)
    .map((t) => t.trim())
    .filter(Boolean);

  let abv: number | null = null;
  let score: number | null = null;
  let country = "";
  const free: string[] = [];

  for (const t of tokens) {
    const noteMatch = /^nota\s*:?\s*(\d+(?:\.\d+)?)$/i.exec(t);
    if (noteMatch) {
      const n = Number(noteMatch[1]);
      if (n >= 0 && n <= 10) score = n;
      continue;
    }
    const num = /^(\d+(?:\.\d+)?)\s*(%?)(?:\s*(?:abv|grados|º))?$/i.exec(t);
    if (num) {
      const n = Number(num[1]);
      const hasPercent = num[2] === "%";
      // Un numero suelto solo es graduacion si es verosimil (<= 20): asi marcas como "86" o "1906" siguen siendo texto
      if (abv === null && (hasPercent ? n <= 99.9 : n <= 20)) {
        abv = n;
        continue;
      }
      if (abv !== null && score === null && !hasPercent && n <= 10) {
        score = n;
        continue;
      }
      // cualquier otro numero (p. ej. la marca "1906") se trata como texto
    }
    const c = asCountry(t);
    if (c && !country) {
      country = c;
      continue;
    }
    free.push(t);
  }

  if (!free.length) return null;
  const [brand, name, style] = free.length === 1 ? ["", free[0]!, ""] : [free[0]!, free[1]!, free[2] ?? ""];
  return {
    brand: brand.slice(0, 120),
    name: name.slice(0, 200),
    style: style.slice(0, 100),
    abv: abv === null ? null : Math.round(abv * 10) / 10,
    country,
    score: score === null ? null : Math.round(score * 10) / 10,
    notes: "",
  };
}
