import redes from "../../../public/redes.json";
import { Link, useLocation } from "react-router-dom";
import "./style.css";
import { useEffect } from "react";

function Footer() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ behavior: "smooth", top: "0px" });
  }, [location]);

  return (
    <footer>
      <div className="container-footer">
        <article className="container-column">
          <section className="redes-icon">
            <h3 className="column-title">Mis redes</h3>
            <ul id="listado-redes">
              {redes.map((r) => {
                return (
                  <li key={r.id}>
                    {r.name !== "Email" ? (
                      <Link to={`${r.url}`} target="_blank" className="icon">
                        <img
                          src={`../../../icons/${r.icon}.png`}
                          alt={`${r.name}`}
                        />
                      </Link>
                    ) : (
                      <a href={`mailto:${r.url}`} className="icon">
                        <img
                          src={`../../../icons/${r.icon}.png`}
                          alt={`${r.name}`}
                        />
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        </article>

        <article className="container-column">
          <h3 className="column-title">Enlaces Rápidos</h3>
          <ul className="column-animation">
            <li>
              <Link to={"/"}>Inicio</Link>
            </li>
            <li>
              <Link to={"/beers/page/1"}>Cervezas</Link>
            </li>
            <li>
              <Link to={"/styles"}>Estilos</Link>
            </li>
            <li>
              <Link to={"/login"}>Login</Link>
            </li>
          </ul>
        </article>
      </div>

      <div className="footer-bottom">
        <p>&copy; Borja 2023</p>
      </div>
    </footer>
  );
}

export default Footer;
