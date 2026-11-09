import { useMemo, useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import { useBeers } from "../lib/beers";
import { KNOWN_COUNTRIES, normalize } from "../lib/countries";
import { toWebp } from "../lib/image";
import { photoOf } from "../lib/format";
import { usePageTitle } from "../lib/usePageTitle";
import type { Beer, BeerInput } from "../types";

function useAdminGuard() {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return <main className="wrap page"><p className="muted state" role="status">Comprobando sesión…</p></main>;
  if (!user) return <Navigate to="/entrar" state={{ from: "/admin" }} replace />;
  if (!isAdmin) return <Navigate to="/" replace />;
  return null;
}

export function AdminListPage() {
  usePageTitle("Administrar");
  const guard = useAdminGuard();
  const { beers } = useBeers();
  const [q, setQ] = useState("");
  const rows = useMemo(() => {
    const t = normalize(q);
    return [...beers].reverse().filter((b) => normalize(`${b.brand} ${b.name}`).includes(t));
  }, [beers, q]);
  if (guard) return guard;

  return (
    <main className="wrap page">
      <header className="intro intro--row">
        <h1>Administrar cervezas</h1>
        <Link to="/admin/nueva" className="btn">Añadir cerveza</Link>
      </header>
      <div className="field">
        <label htmlFor="admin-q">Buscar en la lista</label>
        <input id="admin-q" type="search" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <ul className="admin-list">
        {rows.map((b) => (
          <li key={b.id}>
            <Link to={`/admin/${b.id}`}>
              {photoOf(b, true) ? <img src={photoOf(b, true)!} alt="" width={40} height={40} loading="lazy" /> : <span className="admin-list__blank" />}
              <span><strong>{b.brand}</strong> {b.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}

const EMPTY: BeerInput = { brand: "", name: "", style: "", abv: null, country: "", score: null, notes: "" };

export function AdminFormPage() {
  const { id: param } = useParams();
  const isNew = param === "nueva";
  const id = Number(param);
  const { beers, byId, reload } = useBeers();
  const guard = useAdminGuard();
  usePageTitle(isNew ? "Añadir cerveza" : "Editar cerveza");
  const navigate = useNavigate();
  const existing: Beer | undefined = isNew ? undefined : byId(id);

  const [form, setForm] = useState<BeerInput | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const styles = useMemo(() => [...new Set(beers.map((b) => b.style.trim()).filter(Boolean))].sort(), [beers]);
  const countries = useMemo(
    () => [...new Set([...beers.flatMap((b) => b.country.split("/").map((c) => c.trim())), ...KNOWN_COUNTRIES.map(cap)])].filter(Boolean).sort(),
    [beers],
  );

  if (guard) return guard;
  if (!isNew && !existing) return <main className="wrap page"><p className="muted state">No existe esa cerveza.</p></main>;

  const f: BeerInput =
    form ??
    (existing
      ? { brand: existing.brand, name: existing.name, style: existing.style, abv: existing.abv, country: existing.country, score: existing.score, notes: existing.notes }
      : EMPTY);
  const set = <K extends keyof BeerInput>(k: K, v: BeerInput[K]) => setForm({ ...f, [k]: v });
  const num = (v: string) => (v.trim() === "" ? null : Number(v.replace(",", ".")));

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const saved = isNew ? await api.createBeer(f) : await api.updateBeer(id, f);
      if (file) await api.uploadImage(saved.id, await toWebp(file));
      await reload();
      navigate(`/cerveza/${saved.id}`);
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  async function remove() {
    if (!window.confirm(`¿Borrar «${f.name}»? Se borran también sus comentarios.`)) return;
    setBusy(true);
    try {
      await api.deleteBeer(id);
      await reload();
      navigate("/admin");
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <main className="wrap page page--narrow">
      <h1>{isNew ? "Añadir cerveza" : "Editar cerveza"}</h1>
      <form onSubmit={submit} className="form">
        <div className="field"><label htmlFor="a-brand">Marca</label><input id="a-brand" value={f.brand} onChange={(e) => set("brand", e.target.value)} maxLength={120} /></div>
        <div className="field"><label htmlFor="a-name">Nombre</label><input id="a-name" value={f.name} onChange={(e) => set("name", e.target.value)} required maxLength={200} /></div>
        <div className="field">
          <label htmlFor="a-style">Estilo</label>
          <input id="a-style" list="styles" value={f.style} onChange={(e) => set("style", e.target.value)} maxLength={100} />
          <datalist id="styles">{styles.map((s) => <option key={s} value={s} />)}</datalist>
        </div>
        <div className="field">
          <label htmlFor="a-country">País (si son varios, sepáralos con « / »)</label>
          <input id="a-country" list="countries" value={f.country} onChange={(e) => set("country", e.target.value)} maxLength={200} />
          <datalist id="countries">{countries.map((c) => <option key={c} value={c} />)}</datalist>
        </div>
        <div className="form__pair">
          <div className="field"><label htmlFor="a-abv">Graduación (%)</label><input id="a-abv" inputMode="decimal" value={f.abv ?? ""} onChange={(e) => set("abv", num(e.target.value))} /></div>
          <div className="field"><label htmlFor="a-score">Nota (0 a 10)</label><input id="a-score" inputMode="decimal" value={f.score ?? ""} onChange={(e) => set("score", num(e.target.value))} /></div>
        </div>
        <div className="field"><label htmlFor="a-notes">Notas</label><textarea id="a-notes" rows={4} value={f.notes} onChange={(e) => set("notes", e.target.value)} maxLength={1000} /></div>
        <div className="field">
          <label htmlFor="a-file">Foto (se reduce y convierte a WebP al subirla)</label>
          <input id="a-file" type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          {existing && photoOf(existing) && !file && <img className="admin-preview" src={photoOf(existing)!} alt="Foto actual" width={120} height={120} />}
        </div>
        {error && <p role="alert" className="notice notice--error">{error}</p>}
        <div className="form__actions">
          <button type="submit" className="btn" disabled={busy}>{busy ? "Guardando…" : "Guardar cambios"}</button>
          <Link to="/admin" className="link-btn">Cancelar</Link>
          {!isNew && <button type="button" className="link-btn link-btn--danger" onClick={() => void remove()} disabled={busy}>Borrar cerveza</button>}
        </div>
      </form>
    </main>
  );
}

function cap(s: string) {
  return s.replace(/(^|\s)\S/g, (m) => m.toUpperCase());
}
