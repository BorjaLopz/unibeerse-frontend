import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { useBeers } from "../lib/beers";
import { formatScore } from "../lib/format";
import type { Beer } from "../types";

/** Solo para administradores: pone o cambia la nota con un toque, sin abrir el formulario de edición. */
export function QuickScore({ beer, nextUnscored }: { beer: Beer; nextUnscored?: Beer }) {
  const { reload } = useBeers();
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  async function save(score: number | null) {
    setBusy(true);
    setError("");
    setStatus("");
    try {
      await api.updateBeer(beer.id, {
        brand: beer.brand,
        name: beer.name,
        style: beer.style,
        abv: beer.abv,
        country: beer.country,
        score,
        notes: beer.notes,
      });
      await reload();
      setStatus(score == null ? "Nota quitada" : `Nota guardada: ${formatScore(score)}`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const step = (delta: number) => {
    const next = Math.min(10, Math.max(0, (beer.score ?? 0) + delta));
    void save(next);
  };

  return (
    <section className="quick" aria-labelledby="quick-title">
      <h2 id="quick-title">Puntuar</h2>
      <div className="quick__row" role="group" aria-label="Nota de 1 a 10">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            type="button"
            className="quick__n"
            aria-pressed={beer.score === n}
            disabled={busy}
            onClick={() => void save(n)}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="quick__more">
        <button type="button" className="link-btn" disabled={busy} onClick={() => step(-0.5)}>Bajar medio punto</button>
        <button type="button" className="link-btn" disabled={busy} onClick={() => step(0.5)}>Subir medio punto</button>
        {beer.score != null && (
          <button type="button" className="link-btn link-btn--danger" disabled={busy} onClick={() => void save(null)}>
            Quitar nota
          </button>
        )}
        {nextUnscored && <Link to={`/cerveza/${nextUnscored.id}`}>Siguiente sin nota</Link>}
      </div>
      <p className="quick__status" role="status" aria-live="polite">{status}</p>
      {error && <p role="alert" className="notice notice--error">{error}</p>}
    </section>
  );
}
