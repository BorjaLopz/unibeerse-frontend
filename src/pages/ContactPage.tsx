import { useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import { useBeers } from "../lib/beers";
import { usePageTitle } from "../lib/usePageTitle";

export default function ContactPage() {
  usePageTitle("Contacto");
  const [params] = useSearchParams();
  const { user } = useAuth();
  const { byId } = useBeers();
  const beerId = Number(params.get("cerveza")) || null;
  const beer = beerId ? byId(beerId) : undefined;

  const [kind, setKind] = useState<"contact" | "issue">(params.get("tipo") === "problema" ? "issue" : "contact");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [website, setWebsite] = useState(""); // campo trampa contra bots: las personas no lo ven
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api.contact({
        kind,
        beerId: kind === "issue" ? beerId : null,
        name: name || user?.displayName || "",
        email: email || user?.email || "",
        message,
        website,
      });
      setSent(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <main className="wrap page page--narrow">
        <h1>Mensaje enviado</h1>
        <p className="prose">Gracias. Lo leeré y, si hace falta, te contesto al email que has dejado.</p>
      </main>
    );
  }

  return (
    <main className="wrap page page--narrow">
      <h1>Contacto</h1>
      <p className="prose">Escríbeme para sugerir una cerveza, corregir una ficha o decir hola.</p>

      <form onSubmit={submit} className="form">
        <div className="tabs" role="group" aria-label="Motivo">
          <button type="button" aria-pressed={kind === "contact"} onClick={() => setKind("contact")}>Un mensaje</button>
          <button type="button" aria-pressed={kind === "issue"} onClick={() => setKind("issue")}>Un error en una ficha</button>
        </div>

        {kind === "issue" && beer && (
          <p className="notice">Ficha: <strong>{`${beer.brand} ${beer.name}`.trim()}</strong></p>
        )}

        <div className="field">
          <label htmlFor="c-name">Tu nombre</label>
          <input id="c-name" value={name || user?.displayName || ""} onChange={(e) => setName(e.target.value)} required maxLength={100} autoComplete="name" />
        </div>
        <div className="field">
          <label htmlFor="c-email">Tu email</label>
          <input id="c-email" type="email" value={email || user?.email || ""} onChange={(e) => setEmail(e.target.value)} required maxLength={200} autoComplete="email" />
        </div>
        <div className="field">
          <label htmlFor="c-msg">{kind === "issue" ? "¿Qué hay que corregir?" : "Mensaje"}</label>
          <textarea id="c-msg" rows={6} value={message} onChange={(e) => setMessage(e.target.value)} required maxLength={2000} />
        </div>
        <div className="hp" aria-hidden="true">
          <label htmlFor="c-web">No rellenes este campo</label>
          <input id="c-web" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
        </div>

        {error && <p role="alert" className="notice notice--error">{error}</p>}
        <div className="form__actions">
          <button type="submit" className="btn" disabled={busy}>{busy ? "Enviando…" : "Enviar mensaje"}</button>
        </div>
      </form>
    </main>
  );
}
