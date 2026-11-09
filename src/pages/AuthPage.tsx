import { useState, type FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { auth } from "../lib/firebase";
import { authMessage, useAuth } from "../lib/auth";
import { usePageTitle } from "../lib/usePageTitle";

export default function AuthPage() {
  usePageTitle("Entrar");
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const from = (useLocation().state as { from?: string } | null)?.from ?? "/";
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  if (!loading && user) return <Navigate to={from} replace />;

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setInfo("");
    try {
      if (mode === "signup") {
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        await updateProfile(cred.user, { displayName: name.trim() });
        await cred.user.getIdToken(true); // el nombre viaja en el token y la API lo usa en los comentarios
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }
      navigate(from, { replace: true });
    } catch (err) {
      setError(authMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function reset() {
    if (!email.trim()) {
      setError("Escribe tu email y vuelve a pulsar «He olvidado la contraseña».");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setError("");
      setInfo("Si el email tiene cuenta, te hemos enviado un enlace para cambiar la contraseña.");
    } catch (err) {
      setError(authMessage(err));
    }
  }

  return (
    <main className="wrap page page--narrow">
      <h1>{mode === "login" ? "Entrar" : "Crear cuenta"}</h1>
      <p className="prose">Con una cuenta puedes comentar las cervezas. Para mirar la colección no hace falta.</p>

      <div className="tabs" role="group" aria-label="Acceso">
        <button type="button" aria-pressed={mode === "login"} onClick={() => setMode("login")}>Ya tengo cuenta</button>
        <button type="button" aria-pressed={mode === "signup"} onClick={() => setMode("signup")}>Soy nuevo</button>
      </div>

      <form onSubmit={submit} className="form">
        {mode === "signup" && (
          <div className="field">
            <label htmlFor="name">Nombre (aparece en tus comentarios)</label>
            <input id="name" value={name} onChange={(e) => setName(e.target.value)} required maxLength={60} autoComplete="nickname" />
          </div>
        )}
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        </div>
        <div className="field">
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
          />
        </div>
        {error && <p role="alert" className="notice notice--error">{error}</p>}
        {info && <p role="status" className="notice">{info}</p>}
        <div className="form__actions">
          <button type="submit" className="btn" disabled={busy}>
            {busy ? "Un momento…" : mode === "login" ? "Entrar" : "Crear cuenta"}
          </button>
          {mode === "login" && (
            <button type="button" className="link-btn" onClick={() => void reset()}>He olvidado la contraseña</button>
          )}
        </div>
      </form>
    </main>
  );
}
