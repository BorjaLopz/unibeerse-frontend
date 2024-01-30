import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
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
  const [isAdmin, setIsAdmin] = useState(false);

  const beerPage = location.pathname.includes("beers/page/");
  const screenWidth = useRef(window.innerWidth);

  useEffect(() => {
    setIsMenuClicked(false);
    const userToken = getSessionToken();
    setIsLoggedIn(!!userToken);
    const token = getSessionToken();
    setIsAdmin(token?.rol === "admin" || false);
  }, [location]);

  const menuClass = isMenuClicked
    ? "menuBurguer visible"
    : "menuBurguer closed";

  console.log("screenWidth");
  console.log(screenWidth);

  const fontSizeMenu = screenWidth.current <= 350 ? "smallFont" : "normalFont";
  console.log("fontSizeMenu");
  console.log(fontSizeMenu);

  const newMenuClass = beerPage
    ? menuClass + " grande " + fontSizeMenu
    : menuClass;
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
          {/* <Link to="/contact">Contacto</Link> */}
          {isAdmin ? <Link to="/addNewBeer">Añadir</Link> : <></>}
          {isLoggedIn ? (
            <button onClick={handleLogOut}>LOGOUT</button>
          ) : (
            <Link to="/login">LogIN</Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default HamburguerMenuComponent;
