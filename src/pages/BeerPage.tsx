import { Link, useNavigate, useParams } from "react-router-dom";
import { useBeers } from "../lib/beers";
import { useAuth } from "../lib/auth";
import { describeFamily, familyOf } from "../lib/styles";
import { formatAbv, formatScore, photoOf } from "../lib/format";
import { splitCountries } from "../lib/countries";
import { usePageTitle } from "../lib/usePageTitle";
import { Flags } from "../components/Flags";
import { BottleGlyph } from "../components/BottleGlyph";
import { ScoreBadge } from "../components/ScoreBadge";
import { Comments } from "../components/Comments";
import { QuickScore } from "../components/QuickScore";
import NotFoundPage from "./NotFoundPage";

export default function BeerPage() {
  const id = Number(useParams().id);
  const { beers, status, byId } = useBeers();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const beer = Number.isFinite(id) ? byId(id) : undefined;
  usePageTitle(beer ? `${beer.brand} ${beer.name}`.trim() : undefined);

  if (status === "loading") return <main className="wrap page"><p className="muted state" role="status">Cargando…</p></main>;
  if (!beer) return <NotFoundPage />;

  const family = familyOf(beer.style);
  const description = describeFamily(family);
  const idx = beers.findIndex((b) => b.id === beer.id);
  const prev = beers[idx - 1];
  const next = beers[idx + 1];
  const src = photoOf(beer);
  // La siguiente cerveza sin nota a partir de esta (da la vuelta al final): así puntúas toda la colección seguida.
  const nextUnscored =
    [...beers.slice(idx + 1), ...beers.slice(0, idx)].find((b) => b.score == null && b.id !== beer.id);

  return (
    <main className="wrap page">
      <p className="crumbs">
        <button type="button" className="link-btn" onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/"))}>
          Volver al catálogo
        </button>
      </p>

      <article className="detail">
        <div className="detail__photo">
          <div className="detail__stage">
            {src ? <img src={src} alt={`${beer.brand} ${beer.name}`.trim()} width={640} height={640} /> : <BottleGlyph />}
          </div>
        </div>

        <div className="detail__body">
          {beer.brand && <p className="detail__brand">{beer.brand}</p>}
          <h1 className="detail__name">{beer.name}</h1>

          <dl className="facts">
            {beer.style && (<><dt>Estilo</dt><dd><Link to={`/?estilo=${family.id}`}>{beer.style.trim()}</Link></dd></>)}
            {beer.abv != null && (<><dt>Graduación</dt><dd>{formatAbv(beer.abv)}</dd></>)}
            {beer.country && (
              <>
                <dt>{splitCountries(beer.country).length > 1 ? "Países" : "País"}</dt>
                <dd className="facts__country"><Flags country={beer.country} /> {beer.country}</dd>
              </>
            )}
            {beer.score != null && (
              <>
                <dt>Nota</dt>
                <dd><ScoreBadge value={formatScore(beer.score)} size={64} /></dd>
              </>
            )}
          </dl>

          {isAdmin && <QuickScore beer={beer} nextUnscored={nextUnscored} />}

          {beer.notes && (
            <section aria-labelledby="notes-title">
              <h2 id="notes-title">Notas</h2>
              <p className="prose">{beer.notes}</p>
            </section>
          )}

          {description.length > 0 && (
            <section aria-labelledby="style-title">
              <h2 id="style-title">Sobre el estilo: {family.label}</h2>
              {description.map((d) => (
                <p className="prose" key={d}>{d}</p>
              ))}
            </section>
          )}

          <p className="detail__actions">
            <Link to={`/contacto?cerveza=${beer.id}&tipo=problema`}>¿Algo no cuadra en esta ficha? Avísame</Link>
            {isAdmin && <Link to={`/admin/${beer.id}`}>Editar</Link>}
          </p>
        </div>
      </article>

      <Comments beerId={beer.id} />

      <nav className="pager" aria-label="Cerveza anterior y siguiente">
        {prev ? <Link to={`/cerveza/${prev.id}`} rel="prev">Anterior: {prev.name}</Link> : <span />}
        {next ? <Link to={`/cerveza/${next.id}`} rel="next">Siguiente: {next.name}</Link> : <span />}
      </nav>
    </main>
  );
}
