import styles from "../../../public/styles.json";
import ScrollTopComponent from "../ScrollTop/ScrollTopComponent";
import "./style.css";
import { Link } from "react-router-dom";

function StylesComponent() {
  return (
    <>
      <section id="title">
        <h2>Estilos</h2>
      </section>
      {styles.map((s, id) => {
        return (
          <>
            {s.active ? (
              <Link
                key={id}
                to={`/style/${s.itemKey}`}
                className="style-article"
              >
                <article id="article-style">
                  <h2>{s.style}</h2>
                  <p>{s.description}</p>
                </article>
              </Link>
            ) : (
              <>
                {" "}
                <section className="style-article-disable" key={id}>
                  <article id="article-style">
                    <h2>{s.style}</h2>
                    <p>{s.description}</p>
                  </article>
                </section>
              </>
            )}
          </>
        );
      })}
      <ScrollTopComponent />
    </>
  );
}

export default StylesComponent;
