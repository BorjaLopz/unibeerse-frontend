import { flagCode, splitCountries } from "../lib/countries";

/** Banderas SVG propias (en /flags). Funcionan igual en Windows, donde los emojis de bandera salen como letras. */
export function Flags({ country }: { country: string }) {
  const codes = splitCountries(country)
    .map(flagCode)
    .filter((c): c is string => Boolean(c));
  if (!codes.length) return null;
  return (
    <span className="flags" aria-hidden="true">
      {codes.map((c) => (
        <img key={c} src={`/flags/${c}.svg`} alt="" width={20} height={15} loading="lazy" />
      ))}
    </span>
  );
}
