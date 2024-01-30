import { useState, useEffect } from "react";
import SearchIcon from "../SearchIcon";
import { removingAccents } from "../../helpers";
import { useLocation, useNavigate } from "react-router-dom";

import "./style.css";

function SearchBar({ handleFilter }) {
  const [inputText, setInputText] = useState("");
  const location = useLocation();

  let inputHandler = (e) => {
    let LowerText = removingAccents(e.target.value.toLowerCase());
    setInputText(LowerText);
    handleFilter(LowerText);
  };

  //Reseteamos el filtro cada vez que cambiamos de página
  useEffect(() => {
    setInputText("");
    handleFilter("");
  }, [location]);

  return (
    <>
      <>
        {" "}
        <section id="search-bar-input">
          <div className="search">
            <input
              type="search"
              name="search"
              placeholder="Busqueda"
              onChange={inputHandler}
            />
          </div>
        </section>
      </>
    </>
  );
}

export default SearchBar;
