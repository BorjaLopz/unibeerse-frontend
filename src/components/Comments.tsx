import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../lib/auth";
import { formatDate } from "../lib/format";
import type { BeerComment } from "../types";

export function Comments({ beerId }: { beerId: number }) {
  const { user, isAdmin, loading } = useAuth();
  const [items, setItems] = useState<BeerComment[] | null>(null);
  const [error, setError] = useState("");
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const uid = user?.uid;

  const load = useCallback(async () => {
    try {
      setItems(await api.comments(beerId));
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
  }, [beerId]);

  // Vuelve a pedirlos al cambiar de cerveza o de sesión (para marcar los tuyos).
  useEffect(() => {
    if (loading) return;
    setItems(null);
    void load();
  }, [load, loading, uid]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    try {
      const created = await api.addComment(beerId, text);
      setItems((prev) => [...(prev ?? []), created]);
      setText("");
      setError("");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSending(false);
    }
  }

  async function remove(id: number) {
    if (!window.confirm("¿Borrar este comentario?")) return;
    try {
      await api.deleteComment(id);
      setItems((prev) => (prev ?? []).filter((c) => c.id !== id));
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <section aria-labelledby="comments-title" className="comments">
      <h2 id="comments-title">Comentarios{items ? ` (${items.length})` : ""}</h2>

      {items === null && !error && <p className="muted">Cargando comentarios…</p>}
      {items?.length === 0 && <p className="muted">Todavía no hay comentarios. Escribe el primero.</p>}

      <ul className="comments__list">
        {items?.map((c) => (
          <li key={c.id}>
            <p className="comments__who">
              <strong>{c.authorName}</strong>
              <time dateTime={c.createdAt}>{formatDate(c.createdAt)}</time>
              {(c.mine || isAdmin) && (
                <button type="button" className="link-btn link-btn--danger" onClick={() => void remove(c.id)}>
                  Borrar
                </button>
              )}
            </p>
            <p className="comments__text">{c.text}</p>
          </li>
        ))}
      </ul>

      {error && <p role="alert" className="notice notice--error">{error}</p>}

      {loading ? null : user ? (
        <form onSubmit={submit} className="comments__form">
          <label htmlFor="comment-text">Tu comentario</label>
          <textarea
            id="comment-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={1000}
            rows={3}
            required
          />
          <button type="submit" className="btn" disabled={sending || !text.trim()}>
            {sending ? "Publicando…" : "Publicar comentario"}
          </button>
        </form>
      ) : (
        <p>
          <Link to="/entrar" state={{ from: `/cerveza/${beerId}` }}>Entra</Link> para dejar un comentario.
        </p>
      )}
    </section>
  );
}
