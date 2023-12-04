import "./style.css";
import BeerIcon from "../BeerIcon";
import { Link, useParams } from "react-router-dom";
import { getCodeCountryByName } from "../../helpers";
import { splitCountryName } from "../../helpers";

function CustomBeerCard({ data, page }) {
  const { id, brand, name, style, graduation, country, img_file } = data;

  return (
    <Link key={id} to={`/beer/${id - 1}`} className="currentBeer">
      <div id="beer_card">
        <div id="beer_brand_name">
          <h2 id="beer_brand">{`${
            brand.length > 8 ? `${brand.substring(0, 8)}...` : brand
          }`}</h2>
          <h2 id="beer_name">{`${
            name.length > 15 ? `${name.substring(0, 15)}...` : name
          }`}</h2>
        </div>
        <div id="beer_icon">
          {img_file === "" ? (
            <>
              <BeerIcon style={style} />
            </>
          ) : (
            <>
              <img
                src={`/BeerImages/${img_file}`}
                alt={`Imagen de ${name}`}
                className="beer_image"
              />
            </>
          )}
        </div>
        <div id="container_graduation_style">
          <p id="beer_graduation">{graduation}</p>
          <p id="beer_style">{`${
            style.includes(" ")
              ? style.length > 12
                ? `${style.substring(0, 11)}...`
                : style
              : style.length > 8
              ? `${style.substring(0, 7)}...`
              : style
          }`}</p>
        </div>
        <div id="container_country_icon">
          <div id="container_country">
            {splitCountryName(country)?.length ? (
              <>
                {country
                  .split(" /")
                  .flat()
                  .map((c) => {
                    return <p id="beer_country">{c}</p>;
                  })}
              </>
            ) : (
              <p id="beer_country">{country}</p>
            )}
          </div>
          <div id="container_country_flag">
            {splitCountryName(country)?.length ? (
              <>
                <div id="container_country_flag_multiple">
                  {splitCountryName(country).map((item) => {
                    return (
                      <img
                        src={`https://flagcdn.com/w1280/${item}.png`}
                        alt={`Bandera de ${country}`}
                        className="flag_icon"
                      />
                    );
                  })}
                </div>
              </>
            ) : (
              <img
                src={`https://flagcdn.com/w1280/${getCodeCountryByName(
                  country
                )}.png`}
                alt={`Bandera de ${country}`}
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
