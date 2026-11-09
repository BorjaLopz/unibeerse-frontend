// Nombre del país (como lo escribes en la ficha) -> código de bandera en /public/flags/<codigo>.svg
export function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

const CODES: Record<string, string> = {
  espana: "es", alemania: "de", belgica: "be", inglaterra: "gb-eng", escocia: "gb-sct", gales: "gb-wls",
  "reino unido": "gb", irlanda: "ie", holanda: "nl", "paises bajos": "nl", italia: "it", francia: "fr",
  "estados unidos": "us", eeuu: "us", japon: "jp", mexico: "mx", portugal: "pt", dinamarca: "dk",
  chequia: "cz", "republica checa": "cz", suecia: "se", noruega: "no", finlandia: "fi", islandia: "is",
  turquia: "tr", venezuela: "ve", "republica dominicana": "do", panama: "pa", austria: "at",
  tailandia: "th", singapur: "sg", china: "cn", polonia: "pl", suiza: "ch", hungria: "hu",
  eslovaquia: "sk", eslovenia: "si", croacia: "hr", grecia: "gr", rusia: "ru", ucrania: "ua",
  canada: "ca", brasil: "br", argentina: "ar", chile: "cl", colombia: "co", peru: "pe", cuba: "cu",
  australia: "au", "nueva zelanda": "nz", india: "in", "corea del sur": "kr", vietnam: "vn",
  filipinas: "ph", marruecos: "ma", "sudafrica": "za", luxemburgo: "lu", lituania: "lt", letonia: "lv",
  estonia: "ee", israel: "il", belice: "bz",
};

/** Una cerveza puede tener varios países ("España / Francia"). */
export function splitCountries(country: string): string[] {
  return country
    .split("/")
    .map((c) => c.trim())
    .filter(Boolean);
}

export function flagCode(country: string): string | null {
  return CODES[normalize(country)] ?? null;
}

export const KNOWN_COUNTRIES = Object.keys(CODES);
