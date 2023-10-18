import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import "./style.css";
import SearchBar from "../SearchBar/SearchBar";

function HamburguerMenuComponent({ handleFilter }) {
  const location = useLocation();
  const [isMenuClicked, setIsMenuClicked] = useState(false);

  const beerPage = location.pathname.includes("beers");

  useEffect(() => {
    setIsMenuClicked(false);
  }, [location]);

  const menuClass = isMenuClicked
    ? "menuBurguer visible"
    : "menuBurguer closed";
  const burguerItem = isMenuClicked
    ? "burguerBar clicked"
    : "burguerBar unclicked";

  const updateMenu = () => {
    setIsMenuClicked(!isMenuClicked);
  };
  return (
    <div id="containerBurguerMenu">
      <nav>
        <div className="burguerMenu" onClick={updateMenu}>
          <div className={burguerItem}></div>
          <div className={burguerItem}></div>
          <div className={burguerItem}></div>
        </div>
      </nav>

      <div className={menuClass}>
        <div id="searchRoutes">
          <Link to="/">Inicio</Link>
          <Link to="/beers/page/1">Cervezas</Link>
          <Link to="/styles">Estilos</Link>
          <Link to="/contact">Contacto</Link>
        </div>
        <div id="searchHamburguer">
          {beerPage && <SearchBar handleFilter={handleFilter} />}
        </div>
      </div>
    </div>
  );
}

export default HamburguerMenuComponent;
