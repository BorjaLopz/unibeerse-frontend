import "./style.css";
import BeerIcon from "../BeerIcon";
import { Link, useParams } from "react-router-dom";
import { getCodeCountryByName } from "../../helpers";
import { splitCountryName } from "../../helpers";

function CustomBeerCard({ data, page }) {
  const {
    MARCA,
    NOMBRE,
    ESTILO,
    GRADUACION,
    IMAGEN,
    NACIONALIDAD,
    NOTA,
    COMENTARIOS,
    ID,
  } = data;

  return (
    <Link key={ID} to={`/beer/${ID - 1}`} className="currentBeer">
      <div id="beer_card">
        <div id="beer_brand_name">
          <h2 id="beer_brand">{`${
            MARCA?.length > 8 ? `${MARCA.substring(0, 8)}...` : MARCA
          }`}</h2>
          <h2 id="beer_name">{`${
            NOMBRE?.length > 15 ? `${NOMBRE.substring(0, 15)}...` : NOMBRE
          }`}</h2>
        </div>
        <div id="beer_icon">
          {IMAGEN === "" ? (
            <>
              <BeerIcon style={ESTILO} />
            </>
          ) : (
            <>
              <img
                src={`/BeerImages/${IMAGEN}`}
                alt={`Imagen de ${NOMBRE}`}
                className="beer_image"
              />
            </>
          )}
        </div>
        <div id="container_graduation_style">
          <p id="beer_graduation">{GRADUACION}</p>
          <p id="beer_style">{`${
            ESTILO?.includes(" ")
              ? ESTILO?.length > 12
                ? `${ESTILO?.substring(0, 11)}...`
                : ESTILO
              : ESTILO?.length > 8
              ? `${ESTILO?.substring(0, 7)}...`
              : ESTILO
          }`}</p>
        </div>
        <div id="container_country_icon">
          <div id="container_country">
            {splitCountryName(NACIONALIDAD)?.length ? (
              <>
                {NACIONALIDAD.split(" /")
                  .flat()
                  .map((c) => {
                    return <p id="beer_country">{c}</p>;
                  })}
              </>
            ) : (
              <p id="beer_country">{NACIONALIDAD}</p>
            )}
          </div>
          <div id="container_country_flag">
            {splitCountryName(NACIONALIDAD)?.length ? (
              <>
                <div id="container_country_flag_multiple">
                  {splitCountryName(NACIONALIDAD).map((item) => {
                    return (
                      <img
                        src={`https://flagcdn.com/w1280/${item}.png`}
                        alt={`Bandera de ${NACIONALIDAD}`}
                        className="flag_icon"
                      />
                    );
                  })}
                </div>
              </>
            ) : (
              <img
                src={`https://flagcdn.com/w1280/${getCodeCountryByName(
                  NACIONALIDAD
                )}.png`}
                alt={`Bandera de ${NACIONALIDAD}`}
                className="flag_icon"
              />
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default CustomBeerCard;
