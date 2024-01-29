import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import "./style.css";
import SearchBar from "../SearchBar/SearchBar";
import {
  deleteSessionToken,
  getSessionToken,
  saveSessionToken,
} from "../../helpers";

function HamburguerMenuComponent({ handleFilter }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuClicked, setIsMenuClicked] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const beerPage = location.pathname.includes("beers");

  useEffect(() => {
    setIsMenuClicked(false);
    const userToken = getSessionToken();
    setIsLoggedIn(!!userToken);
  }, [location]);

  const menuClass = isMenuClicked
    ? "menuBurguer visible"
    : "menuBurguer closed";

  const newMenuClass = beerPage ? menuClass + " gap" : menuClass;
  const burguerItem = isMenuClicked
    ? "burguerBar clicked"
    : "burguerBar unclicked";

  const updateMenu = () => {
    setIsMenuClicked(!isMenuClicked);
  };

  const handleLogOut = () => {
    deleteSessionToken();
    setIsMenuClicked(false);
    navigate("/");
    setIsLoggedIn(false);
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

      <div className={newMenuClass}>
        <div id="searchRoutes">
          <Link to="/">Inicio</Link>
          <Link to="/beers/page/1">Cervezas</Link>
          <Link to="/styles">Estilos</Link>
          <Link to="/contact">Contacto</Link>
          {isLoggedIn ? (
            <button onClick={handleLogOut}>LOGOUT</button>
          ) : (
            <Link to="/login">LogIN</Link>
          )}
        </div>
        <div id="searchHamburguer">
          {beerPage && <SearchBar handleFilter={handleFilter} />}
        </div>
      </div>
    </div>
  );
}

export default HamburguerMenuComponent;
