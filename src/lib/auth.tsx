import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { auth } from "./firebase";
import { api } from "./api";

interface AuthState {
  user: User | null;
  /** true hasta que Firebase responde si hay sesión guardada. */
  loading: boolean;
  isAdmin: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setLoading(false);
      if (!u) {
        setIsAdmin(false);
        return;
      }
      try {
        setIsAdmin((await api.me()).admin);
      } catch {
        setIsAdmin(false);
      }
    });
  }, []);

  const value: AuthState = { user, loading, isAdmin, logout: () => signOut(auth) };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}

/** Traduce los códigos de error de Firebase Auth. */
export function authMessage(err: unknown): string {
  const code = (err as { code?: string }).code ?? "";
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "El email o la contraseña no coinciden.";
    case "auth/email-already-in-use":
      return "Ya existe una cuenta con ese email. Prueba a entrar.";
    case "auth/weak-password":
      return "La contraseña necesita al menos 6 caracteres.";
    case "auth/invalid-email":
      return "El email no es válido.";
    case "auth/too-many-requests":
      return "Demasiados intentos. Espera unos minutos y prueba de nuevo.";
    case "auth/network-request-failed":
      return "No hay conexión. Comprueba tu red.";
    default:
      return "No se ha podido completar. Prueba de nuevo.";
  }
}
