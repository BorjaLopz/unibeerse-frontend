import { Link } from "react-router-dom";
import SearchBar from "../SearchBar/SearchBar";
import { useState } from "react";
import "./style.css";

function Header({ handleCustomFilter }) {
  const [filter, setFilter] = useState("");

  const handleFilter = (_filter) => {
    setFilter(_filter);
    handleCustomFilter(_filter);
  };

  return (
    <>
      <header>
        <div id="mainIcon">
          <img src="../../../mainIcon.svg" alt="Icono Borja" />
        </div>
        <menu>
          <Link to="/">Inicio</Link>
          <Link to="/beers/page/1">Cervezas</Link>
          <Link to="/styles">Estilos</Link>
          <Link to="/contact">Contacto</Link>
        </menu>
        <SearchBar handleFilter={handleFilter} />
      </header>
    </>
  );
}

export default Header;
