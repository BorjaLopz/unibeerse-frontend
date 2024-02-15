import { Link, useLocation } from "react-router-dom";
import SearchBar from "../SearchBar/SearchBar";
import { useState } from "react";
import "./style.css";
import HamburguerMenuComponent from "../HamburguerMenuComponent/HamburguerMenuComponent";

function Header({ handleCustomFilter }) {
  const [filter, setFilter] = useState("");
  const location = useLocation();
  const beerPage = location.pathname.includes("/beers/page/");
  const headerClass = location.pathname.includes("/beers/page/")
    ? "headerGrande"
    : "headerPequeño";

  const handleFilter = (_filter) => {
    setFilter(_filter);
    handleCustomFilter(_filter);
  };

  // console.log("filter");
  // console.log(filter);

  return (
    <>
      <header>
        {/* <section id="highView">
          <div className="mainIcon">
            <img src="../../../mainIcon.svg" alt="Icono Borja" />
          </div>
          <menu>
            <Link to="/">Inicio</Link>
            <Link to={`${`beers/page/1`}`}>Cervezas</Link>
            <Link to="/styles">Estilos</Link>
            <Link to="/contact">Contacto</Link>
          </menu>
          <SearchBar handleFilter={handleFilter} />
        </section> */}

        <section id="lowView" className={headerClass}>
          <div className="mainIcon">
            <h2 className="mainTitle">UNIBEERSE</h2>
          </div>

          <HamburguerMenuComponent handleFilter={handleFilter} />
          {beerPage && (
            <div id="searchHamburguer">
              {beerPage && <SearchBar handleFilter={handleFilter} />}
            </div>
          )}
        </section>
      </header>
    </>
  );
}

export default Header;
