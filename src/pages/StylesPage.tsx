import { Link } from "react-router-dom";
import { useBeers } from "../lib/beers";
import { FAMILIES, describeFamily, familyOf } from "../lib/styles";
import { usePageTitle } from "../lib/usePageTitle";

export default function StylesPage() {
  usePageTitle("Estilos");
  const { beers } = useBeers();
  const counts = new Map<string, number>();
  beers.forEach((b) => {
    const id = familyOf(b.style).id;
    counts.set(id, (counts.get(id) ?? 0) + 1);
  });

  return (
    <main className="wrap page page--narrow">
      <header className="intro">
        <h1>Estilos de cerveza</h1>
        <p>Los grandes grupos en los que ordeno la colección y lo que los distingue.</p>
      </header>

      {FAMILIES.map((f) => {
        const texts = describeFamily(f);
        const n = counts.get(f.id) ?? 0;
        return (
          <section key={f.id} id={f.id} className="style" aria-labelledby={`h-${f.id}`}>
            <h2 id={`h-${f.id}`}>{f.label}</h2>
            {texts.map((t) => (
              <p className="prose" key={t}>{t}</p>
            ))}
            {n > 0 && (
              <p>
                <Link to={`/?estilo=${f.id}`}>Ver {n === 1 ? "la cerveza" : `las ${n} cervezas`} de este estilo</Link>
              </p>
            )}
          </section>
        );
      })}
    </main>
  );
}
