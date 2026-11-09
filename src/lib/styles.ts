import styleDescriptions from "../data/styles.json";
import { normalize } from "./countries";

/**
 * Las fichas tienen ~90 estilos escritos a mano ("Lager Pilsen", "Pale Ale ", "Dubbel - Trapenses"...).
 * Para filtrar de forma util se agrupan en familias; el orden de las reglas importa (gana la primera que encaja).
 */
export interface Family {
  id: string;
  label: string;
  test: RegExp;
  /** Claves de src/data/styles.json cuya descripcion se muestra. */
  describe: string[];
  /** Descripcion propia para las familias que no vienen en styles.json. */
  fallback?: string;
}

export const FAMILIES: Family[] = [
  { id: "pilsen", label: "Pilsen", test: /pils/, describe: ["Lager Pilsen"] },
  { id: "ipa", label: "IPA y Pale Ale", test: /ipa|india|pale ale/, describe: ["Pale Ale"] },
  {
    id: "trigo",
    label: "Trigo",
    test: /trigo|weiss|weizen|wheat|hefe|witbier|blanche/,
    describe: [],
    fallback:
      "Cervezas elaboradas con una parte importante de trigo. Suelen ser turbias, con cuerpo suave y notas de plátano, clavo o cítricos.",
  },
  { id: "stout", label: "Stout y Porter", test: /stout|porter/, describe: ["Stout", "Porter"] },
  { id: "trapenses", label: "Trapenses y abadía", test: /trapens|abadia|dubbel|tripel|quadrupel|abbey/, describe: ["Trapenses", "Abadia"] },
  { id: "belgas", label: "Belgas y lambic", test: /belga|belgian|saison|lambic/, describe: ["Saison belgas"] },
  {
    id: "afrutadas",
    label: "Afrutadas y radler",
    test: /afrutad|fruta|fruit|radler|shandy|limon/,
    describe: [],
    fallback: "Cervezas mezcladas con zumo o aromatizadas con fruta. Son ligeras, dulces y muy refrescantes.",
  },
  {
    id: "lager",
    label: "Lager",
    test: /lager|baja ferm|rubia|helles|marzen|festbier|dunkel|munich|bock|schwarz/,
    describe: ["Lager"],
  },
  {
    id: "ale",
    label: "Ale",
    test: /ale|alta ferm|tostada|roja|brown|amber|golden|scotch|scoth|irish|dark/,
    describe: ["Ale"],
  },
  {
    id: "otras",
    label: "Otras",
    test: /.*/,
    describe: [],
    fallback: "Estilos que no encajan en las demás familias.",
  },
];

export function familyOf(style: string): Family {
  const s = normalize(style);
  return FAMILIES.find((f) => f.test.test(s)) ?? FAMILIES[FAMILIES.length - 1];
}

interface StyleDescription {
  style: string;
  description: string;
}

/** Textos de la familia: los de styles.json y, si no hay, el propio. */
export function describeFamily(f: Family): string[] {
  const list = styleDescriptions as StyleDescription[];
  const found = f.describe
    .map((name) => list.find((d) => d.style === name)?.description)
    .filter((d): d is string => Boolean(d));
  if (found.length) return found;
  return f.fallback ? [f.fallback] : [];
}
