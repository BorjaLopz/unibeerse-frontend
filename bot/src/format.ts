import type { Beer, BeerInput } from "./api.js";

const nf = new Intl.NumberFormat("es-ES", { minimumFractionDigits: 0, maximumFractionDigits: 1 });

export const num = (v: number): string => nf.format(v);

export function beerTitle(b: { brand: string; name: string }): string {
  return `${b.brand} ${b.name}`.trim();
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
