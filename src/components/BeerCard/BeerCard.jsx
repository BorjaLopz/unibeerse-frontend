import { useParams, Link, useNavigate } from "react-router-dom";
import "./style.css";

import { useState, useEffect } from "react";
import useServer from "../../hooks/useServer";
import BeerIcon from "../BeerIcon";
import { splitCountryName, getCodeCountryByName } from "../../helpers";

import beerData from "/public/beer-data.json";

function BeerCard() {
  const { get } = useServer();
  const [beer, setBeer] = useState({});
  const [previousBeer, setPreviousBeer] = useState({});
  const [nextBeer, setNextBeer] = useState({});
  const { id } = useParams();
  const idInteger = parseInt(id);
  const navigate = useNavigate();

  const fetchBeerId = async () => {
    try {
      const res = await fetch(
        `https://primer-proyecto-nodejs.glitch.me/api/v1/beer/id/${
          idInteger + 1
        }`
      );
      const data = await res.json();

      if (!data) {
        navigate("/404");
      }

      setBeer(data.data[0]);
    } catch (e) {
      console.log("Error: ", e.message);
    }
  };

  const fetchPreviousBeer = async () => {
    try {
      const res = await fetch(
        `https://primer-proyecto-nodejs.glitch.me/api/v1/beer/id/${idInteger}`
      );

      const data = await res.json();

      setPreviousBeer(data?.data[0]);
    } catch (e) {
      console.log("Error: ", e.message);
    }
  };

  const fetchNextsBeer = async () => {
    try {
      const res = await fetch(
        `https://primer-proyecto-nodejs.glitch.me/api/v1/beer/id/${
          idInteger + 2
        }`
      );

      const data = await res.json();

      setNextBeer(data?.data[0]);
    } catch (e) {
      console.log("Error: ", e.message);
    }
  };

  const fetchCurrentBeerJSON = () => {
    try {
      const currentBeer = beerData.data.find((b) => {
        if (parseInt(b.id) === parseInt(id) + 1) {
          return b;
        }
      });

      setBeer(currentBeer);
    } catch (e) {
      console.error(`Error: ${e}`);
    }
  };

  const fetchNextBeerJSON = () => {
    try {
      const nextBeer = beerData.data.find((b) => {
        if (parseInt(b.id) === parseInt(id) + 2) {
          return b;
        }
      });

      setNextBeer(nextBeer);
    } catch (e) {
      console.error(`Error: ${e}`);
    }
  };

  const fetchPreviousBeerJSON = () => {
    try {
      const prevBeer = beerData.data.find((b) => {
        if (parseInt(b.id) === parseInt(id)) {
          return b;
        }
      });

      setPreviousBeer(prevBeer);
    } catch (e) {
      console.error(`Error: ${e}`);
    }
  };

  useEffect(() => {
    // fetchBeerId();
    // fetchPreviousBeer();
    // fetchNextsBeer();
    fetchCurrentBeerJSON();
    fetchNextBeerJSON();
    fetchPreviousBeerJSON();
  }, [id]);

  return (
    <main>
      <section className="main-container">
        <Link to={`/beer/${idInteger - 1}`}>
          {idInteger !== 0 ? (
            <>
              <div className="arrow left">
                <img src="/icons/LeftArrow.svg" alt="" />
              </div>
            </>
          ) : (
            ""
          )}
        </Link>
        <div className="_beerCard">
          <div id="beer_icon_card">
            {beer.img_file !== "" ? (
              <img
                src={`../${beer?.img_file}`}
                alt={`Imagen de ${beer.brand} | ${beer.name}`}
              />
            ) : (
              <BeerIcon style={beer.style} />
            )}
          </div>
          <div id="informacion_card">
            <div id="brand_name_beerCard">
              <h2>{beer?.brand}</h2>
              <h3>{beer?.name}</h3>
            </div>

            <div id="container_graduation_style_beerCard">
              <p id="beer_graduation">{beer?.graduation}</p>
              <p id="beer_style">{beer?.style}</p>
            </div>
            <div id="container_country_icon_beerCard">
              {splitCountryName(beer?.country)?.length ? (
                <>
                  <div id="container_country_card">
                    {beer?.country
                      .split(" /")
                      .flat()
                      .map((c) => {
                        return <p id="beer_country_card">{c}</p>;
                      })}
                  </div>
                </>
              ) : (
                <p id="beer_country_card">{beer?.country}</p>
              )}
              {splitCountryName(beer?.country)?.length ? (
                <>
                  {splitCountryName(beer?.country).map((item) => {
                    return (
                      <img
                        src={`https://flagcdn.com/w1280/${item}.png`}
                        alt={`Bandera de ${beer?.country}`}
                        id="flag_icon_card"
                      />
                    );
                  })}
                </>
              ) : (
                <>
                  <img
                    src={`https://flagcdn.com/w1280/${getCodeCountryByName(
                      beer?.country
                    )}.png`}
                    alt={`Bandera de ${beer?.country}`}
                    id="flag_icon_card"
                  />
                </>
              )}
            </div>
          </div>
        </div>

        {beer?.comments ? (
          <div id="commentas_card">
            {/* Comentarios */}
            <div id="comments_beer_card">
              <h2 id="h2_notas">Notas</h2>
              <h2 id="comment">{beer?.comments}</h2>
            </div>
          </div>
        ) : (
          <></>
        )}
        <Link to={`/beer/${idInteger + 1}`}>
          {nextBeer !== undefined ? (
            <>
              <div className="arrow rigth">
                <img src="/icons/RigthArrow.svg" alt="" />
              </div>
            </>
          ) : (
            ""
          )}
        </Link>
      </section>
    </main>
  );
}

export default BeerCard;

/*<div className="flex flex-col justify-center h-screen">
      <div className="relative flex flex-col md:flex-row md:space-x-5 space-y-3 md:space-y-0 rounded-xl shadow-lg p-3 max-w-xs md:max-w-3xl mx-auto border border-white bg-white">
        <div className="w-full md:w-1/3 bg-white grid place-items-center">
          {beer.img_file !== "" ? (
            <img
              src={beer.img_file}
              alt={`Imagen de ${beer.brand} | ${beer.name}`}
              className="rounded-xl"
              width={300}
            />
          ) : (
            <BeerIcon />
          )}
        </div>
        <div className="w-full md:w-2/3 bg-white flex flex-col space-y-2 p-3">
          <div className="flex justify-between item-center">
            <p className="text-gray-500 font-medium hidden md:block">
              {beer.style}
            </p>
          </div>
          <h3 className="font-black text-gray-800 md:text-3xl text-xl">
            {beer.brand} | {beer.name}
          </h3>
          {beer.comments !== "" ? (
            <p className="md:text-lg text-gray-500 text-base">
              {beer.comments}
            </p>
          ) : (
            <p className="md:text-lg text-gray-500 text-base">{`${
              beer.name
            }  de ${beer.brand.toLowerCase()} es una cerveza ${beer.style.toLowerCase()}`}</p>
          )}
          {beer.score ? (
            <p className="text-xl font-black text-gray-800">
              {beer.score}
              <span className="font-normal text-gray-600 text-base">/10</span>
            </p>
          ) : (
            <p className="text-xl font-black text-gray-800">
              {beer.score}
              <span className="font-normal text-gray-600 text-base">
                Sin valoración aún
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
    */
