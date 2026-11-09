import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useBeers } from "../lib/beers";
import { normalize, splitCountries } from "../lib/countries";
import { FAMILIES, familyOf } from "../lib/styles";
import { usePageTitle } from "../lib/usePageTitle";
import { BeerCard } from "../components/BeerCard";
import type { Beer } from "../types";

type Sort = "recientes" | "antiguas" | "nombre" | "graduacion" | "nota";

const SORTS: { id: Sort; label: string }[] = [
  { id: "recientes", label: "Últimas añadidas" },
  { id: "antiguas", label: "Primeras añadidas" },
  { id: "nombre", label: "Nombre (A-Z)" },
  { id: "graduacion", label: "Más graduación" },
  { id: "nota", label: "Mejor nota" },
];

function sortBeers(list: Beer[], sort: Sort): Beer[] {
  const out = [...list];
  switch (sort) {
    case "antiguas": return out.sort((a, b) => a.id - b.id);
    case "nombre": return out.sort((a, b) => `${a.brand} ${a.name}`.localeCompare(`${b.brand} ${b.name}`, "es"));
    case "graduacion": return out.sort((a, b) => (b.abv ?? -1) - (a.abv ?? -1));
    case "nota": return out.sort((a, b) => (b.score ?? -1) - (a.score ?? -1));
    default: return out.sort((a, b) => b.id - a.id);
  }
}

export default function CatalogPage() {
  usePageTitle();
  const { beers, status, error, reload } = useBeers();
  // Los filtros viven en la URL: se pueden compartir y el botón "atrás" los conserva.
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";
  const family = params.get("estilo") ?? "";
  const country = params.get("pais") ?? "";
  const sort = (SORTS.some((s) => s.id === params.get("orden")) ? params.get("orden") : "recientes") as Sort;

  function update(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  }

  const enriched = useMemo(
    () =>
      beers.map((b) => ({
        beer: b,
        family: familyOf(b.style).id,
        countries: splitCountries(b.country),
        haystack: normalize(`${b.brand} ${b.name} ${b.style} ${b.country}`),
      })),
    [beers],
  );

  const familyCounts = useMemo(() => {
    const m = new Map<string, number>();
    enriched.forEach((e) => m.set(e.family, (m.get(e.family) ?? 0) + 1));
    return m;
  }, [enriched]);

  const countries = useMemo(() => {
    const m = new Map<string, number>();
    enriched.forEach((e) => e.countries.forEach((c) => m.set(c, (m.get(c) ?? 0) + 1)));
    return [...m.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "es"));
  }, [enriched]);

  const visible = useMemo(() => {
    const terms = normalize(q).split(/\s+/).filter(Boolean);
    const filtered = enriched
      .filter((e) => !family || e.family === family)
      .filter((e) => !country || e.countries.includes(country))
      .filter((e) => terms.every((t) => e.haystack.includes(t)))
      .map((e) => e.beer);
    return sortBeers(filtered, sort);
  }, [enriched, q, family, country, sort]);

  const hasFilters = Boolean(q || family || country);

  return (
    <main className="wrap page">
      <header className="intro">
        <h1>Mi colección de cervezas</h1>
        <p>Fotos, notas de cata y puntuaciones. Busca por nombre, filtra por estilo o por país.</p>
      </header>

      <div className="toolbar" role="search">
        <div className="field field--grow">
          <label htmlFor="q">Buscar</label>
          <input
            id="q"
            type="search"
            value={q}
            onChange={(e) => update("q", e.target.value)}
            placeholder="Marca, nombre, estilo o país"
            autoComplete="off"
          />
        </div>
        <div className="field">
          <label htmlFor="pais">País</label>
          <select id="pais" value={country} onChange={(e) => update("pais", e.target.value)}>
            <option value="">Todos</option>
            {countries.map(([c, n]) => (
              <option key={c} value={c}>{c} ({n})</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="orden">Ordenar por</label>
          <select id="orden" value={sort} onChange={(e) => update("orden", e.target.value === "recientes" ? "" : e.target.value)}>
            {SORTS.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="chips" role="group" aria-label="Filtrar por estilo">
        {FAMILIES.filter((f) => familyCounts.get(f.id)).map((f) => (
          <button
            key={f.id}
            type="button"
            className="chip"
            aria-pressed={family === f.id}
            onClick={() => update("estilo", family === f.id ? "" : f.id)}
          >
            {f.label} <span className="chip__n">{familyCounts.get(f.id)}</span>
          </button>
        ))}
      </div>

      {status === "loading" && <p className="muted state" role="status">Cargando la colección…</p>}
      {status === "error" && (
        <div className="state notice notice--error" role="alert">
          <p>{error}</p>
          <button type="button" className="btn btn--small" onClick={() => void reload()}>Reintentar</button>
        </div>
      )}

      {status === "ready" && (
        <>
          <p className="count" role="status" aria-live="polite">
            {visible.length === beers.length
              ? `${beers.length} cervezas`
              : `${visible.length} de ${beers.length} cervezas`}
            {hasFilters && (
              <button type="button" className="link-btn" onClick={() => setParams({}, { replace: true })}>
                Quitar filtros
              </button>
            )}
          </p>
          {visible.length === 0 ? (
            <p className="state muted">No hay cervezas con esos filtros. Prueba con otra búsqueda o quita alguno.</p>
          ) : (
            <div className="shelf">
              {visible.map((b, i) => (
                <BeerCard key={b.id} beer={b} priority={i < 8} />
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
}
