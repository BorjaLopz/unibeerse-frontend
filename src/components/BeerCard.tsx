import { Link } from "react-router-dom";
import type { Beer } from "../types";
import { brandIsRedundant, formatAbv, formatScore, photoOf } from "../lib/format";
import { Flags } from "./Flags";
import { BottleGlyph } from "./BottleGlyph";
import { ScoreBadge } from "./ScoreBadge";

export function BeerCard({ beer, priority = false }: { beer: Beer; priority?: boolean }) {
  const src = photoOf(beer, true);
  return (
    <Link to={`/cerveza/${beer.id}`} className="bottle">
      <div className="bottle__stage">
        {src ? (
          <img
            src={src}
            alt=""
            width={260}
            height={260}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
          />
        ) : (
          <BottleGlyph />
        )}
        {beer.score != null && (
          <span className="bottle__cap">
            <ScoreBadge value={formatScore(beer.score)} size={44} />
          </span>
        )}
      </div>
      <div className="bottle__text">
        {!brandIsRedundant(beer) && <span className="bottle__brand">{beer.brand}</span>}
        <span className="bottle__name">{beer.name}</span>
        <span className="bottle__meta">
          {beer.abv != null && <span>{formatAbv(beer.abv)}</span>}
          <Flags country={beer.country} />
          {beer.style && <span className="bottle__style">{beer.style.trim()}</span>}
        </span>
      </div>
    </Link>
  );
}
