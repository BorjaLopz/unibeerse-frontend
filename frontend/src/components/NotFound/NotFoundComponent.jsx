import { Link } from "react-router-dom";
import "./style.css";

function NotFoundComponent() {
  return (
    <div className="not-found">
      <img
        alt="not_found_image"
        className="not-found-image"
        src="../../icons/404_1.svg"
      />
      <h2>No has roto internet, pero no hemos encontrado lo que querías buscar</h2>
      <Link to="/">
        <button>Volver al Inicio</button>
      </Link>
    </div>
  );
}

export default NotFoundComponent;
