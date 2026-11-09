import type { Beer, BeerInput } from "./api.js";

const nf = new Intl.NumberFormat("es-ES", { minimumFractionDigits: 0, maximumFractionDigits: 1 });

export const num = (v: number): string => nf.format(v);

/** Marca + nombre, sin repetir cuando el nombre ya empieza por la marca ("Duvel" / "Duvel" → "Duvel"). */
export function beerTitle(b: { brand: string; name: string }): string {
  const brand = b.brand.trim();
  const name = b.name.trim();
  const [nb, nn] = [norm(brand), norm(name)];
  if (!brand || nn === nb || nn.startsWith(nb + " ")) return name;
  return `${brand} ${name}`;
}

/** "1906 Reserva Especial · 6,5 % · España · Lager" (solo lo que haya). */
export function beerLine(b: BeerInput | Beer): string {
  return [beerTitle(b), b.abv != null ? `${num(b.abv)} %` : "", b.country, b.style.trim()].filter(Boolean).join(" · ");
}

export function scoreText(score: number | null): string {
  return score == null ? "sin nota" : `nota ${num(score)}/10`;
}

export const norm = (s: string): string =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
