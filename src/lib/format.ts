const nf = new Intl.NumberFormat("es-ES", { minimumFractionDigits: 0, maximumFractionDigits: 1 });

export const formatAbv = (v: number | null) => (v == null ? "" : `${nf.format(v)} %`);
export const formatScore = (v: number | null) => (v == null ? "" : nf.format(v));

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
}

export const photoOf = (b: { image: string | null; thumb: string | null }, small = false) =>
  small ? (b.thumb ?? b.image) : b.image;

const plain = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

/** La marca sobra cuando el nombre ya la contiene ("Duvel" / "Duvel", "Estrella" / "Estrella Galicia"). */
export const brandIsRedundant = (b: { brand: string; name: string }) => {
  const brand = plain(b.brand);
  const name = plain(b.name);
  return !brand || name === brand || name.startsWith(brand + " ");
};

export const beerTitle = (b: { brand: string; name: string }) =>
  (brandIsRedundant(b) ? b.name : `${b.brand} ${b.name}`).trim();
