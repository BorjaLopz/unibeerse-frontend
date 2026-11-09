const nf = new Intl.NumberFormat("es-ES", { minimumFractionDigits: 0, maximumFractionDigits: 1 });

export const formatAbv = (v: number | null) => (v == null ? "" : `${nf.format(v)} %`);
export const formatScore = (v: number | null) => (v == null ? "" : nf.format(v));

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
}

export const photoOf = (b: { image: string | null; thumb: string | null }, small = false) =>
  small ? (b.thumb ?? b.image) : b.image;
