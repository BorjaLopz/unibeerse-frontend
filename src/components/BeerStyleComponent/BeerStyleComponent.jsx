import BeerIcon from "../BeerIcon";
import ScrollTopComponent from "../ScrollTop/ScrollTopComponent";
import "./style.css";
import { Link } from "react-router-dom";

function BeerStyleComponent({ b }) {
  return (
    <>
      <Link key={b?.id} to={`/beer/${b?.id - 1}`} className="currentBeer_style">
        <div id="beer_card_style">
          <div id="beer_brand_name">
            <h2 id="beer_brand">{`${
              b?.brand.length > 9 ? `${b?.brand.substring(0, 8)}...` : b?.brand
            }`}</h2>
            <h2 id="beer_name">{`${
              b?.name.length > 15 ? `${b?.name.substring(0, 14)}...` : b?.name
            }`}</h2>
          </div>
          {b?.img_file === "" ? (
            <div id="beer_icon_style">
              <BeerIcon style={b?.style?.toLowerCase()} />
            </div>
          ) : (
            <>
              <img
                src={b?.img_file}
                alt={`Imagen de ${b?.name}`}
                id="beer_image_style"
              />
            </>
          )}
          <div id="container_graduation_style">
            <p id="beer_graduation">{b?.graduation}</p>
            <p id="beer_style">{`${
              b?.style.length > 15 ? `${b?.style.substring(0, 15)}...` : b?.style
            }`}</p>
          </div>
        </div>
      </Link>
    </>
  );
}

export default BeerStyleComponent;
