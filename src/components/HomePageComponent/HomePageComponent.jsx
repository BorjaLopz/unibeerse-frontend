import "react-slideshow-image/dist/styles.css";
import { Fade, Zoom } from "react-slideshow-image";
import { Link } from "react-router-dom";
import "./style.css";

const images = [
  "/BeerIcons/Beer_1.svg",
  "/BeerIcons/Beer_2.svg",
  "/BeerIcons/Beer_3.svg",
  "/BeerIcons/Beer_4.svg",
  "/BeerIcons/Beer_5.svg",
  "/BeerIcons/Beer_6.svg",
  "/BeerIcons/Beer_7.svg",
];

function HomePageComponent() {
  const divStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundSize: "cover",
    height: "15rem",
  };
  return (
    <div className="home-component">
      <div className="container-title">
        <h2>UNI</h2>
        <img src="/favicon.svg" alt="beer" />
        <h2>SE</h2>
      </div>
      <p id="welcomeText">¡Bienvenido/a!</p>
      <div id="container-car-text">
        <div id="text">
          <p>
            En nuestro blog de cervezas, exploramos un mundo de sabores,
            culturas y amistad a través de la lente de esta maravillosa bebida.
            No importa si eres un aficionado apasionado, un curioso novato o
            simplemente alguien que disfruta de un buen vaso de cerveza de vez
            en cuando; aquí encontrarás algo para ti.
          </p>
          <p>
            Nuestro equipo de entusiastas cerveceros está constantemente
            buscando las últimas novedades en la industria cervecera, catando
            cervezas de todo el mundo y compartiendo nuestras experiencias
            contigo. Creemos en la diversidad y la inclusión, celebrando la
            riqueza de estilos, aromas y sabores que la cerveza tiene para
            ofrecer.
          </p>
        </div>

        <Fade arrows="" transitionDuration={1000} duration={2000} id="prueba">
          {images.map((image, index) => (
            <div id="car-home" key={index} style={{ ...divStyle }}>
              <img src={image} />
            </div>
          ))}
        </Fade>
        <Link to="/beers/page/1">
          <div id="container-text-arrow">
            <h3 id="first-paragraph">
              Explora, Celebra, Comparte: ¡La Cerveza une a Todos!
            </h3>
            <img src="/arrow.svg" alt="flecha" />
          </div>
        </Link>
      </div>
    </div>
  );
}

export default HomePageComponent;
