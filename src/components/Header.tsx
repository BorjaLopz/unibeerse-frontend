import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { Logo } from "./Logo";

export function Header() {
  const { user, loading, isAdmin, logout } = useAuth();
  return (
    <header className="site-header">
      <div className="wrap site-header__row">
        <Link to="/" className="brand" aria-label="Unibeerse, inicio">
          <Logo size={34} />
          <span>Unibeerse</span>
        </Link>
        <nav aria-label="Principal" className="nav">
          <NavLink to="/" end>Catálogo</NavLink>
          <NavLink to="/estilos">Estilos</NavLink>
          <NavLink to="/contacto">Contacto</NavLink>
          {isAdmin && <NavLink to="/admin">Administrar</NavLink>}
        </nav>
        <div className="session">
          {loading ? null : user ? (
            <>
              <span className="session__name">{user.displayName || user.email?.split("@")[0]}</span>
              <button type="button" className="link-btn" onClick={() => void logout()}>
                Salir
              </button>
            </>
          ) : (
            <Link to="/entrar" className="btn btn--small">Entrar</Link>
          )}
        </div>
      </div>
    </header>
  );
}
