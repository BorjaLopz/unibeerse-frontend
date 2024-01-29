import { useParams, Link, useNavigate } from "react-router-dom";
import "./style.css";

import { useState, useEffect } from "react";
import useServer from "../../hooks/useServer";
import BeerIcon from "../BeerIcon";
import {
  splitCountryName,
  getCodeCountryByName,
  getSessionToken,
} from "../../helpers";

import beerData from "/public/beer-data.json";
import BeerFormComponent from "../BeerFormComponent/BeerFormComponent";
import BeerCommentsComponent from "../BeerCommentsComponent/BeerCommentsComponent";
import ReportIssueIcon from "../ReportIssueIcon";
import FormReportIssueComponent from "../FormReportIssueComponent/FormReportIssueComponent";
import FormEditBeerComponent from "../FormEditBeerComponent/FormEditBeerComponent";

/* FIREBASE */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebaseConfig";

function BeerCard() {
  const { get } = useServer();
  const [beer, setBeer] = useState({});
  const [previousBeer, setPreviousBeer] = useState({});
  const [nextBeer, setNextBeer] = useState({});
  const [formIssueVisibility, setFormIssueVisibility] = useState(false);
  const [formEditVisibility, setFormEditVisibility] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const { id } = useParams();
  const idInteger = parseInt(id);
  const navigate = useNavigate();

  /* Primera aproximacion */
  // const fetchBeerId = async () => {
  //   try {
  //     const res = await fetch(
  //       `https://primer-proyecto-nodejs.glitch.me/api/v1/beer/id/${
  //         idInteger + 1
  //       }`
  //     );
  //     const data = await res.json();

  //     if (!data) {
  //       navigate("/404");
  //     }

  //     setBeer(data.data[0]);
  //   } catch (e) {
  //     console.log("Error: ", e.message);
  //   }
  // };

  // const fetchPreviousBeer = async () => {
  //   try {
  //     const res = await fetch(
  //       `https://primer-proyecto-nodejs.glitch.me/api/v1/beer/id/${idInteger}`
  //     );

  //     const data = await res.json();

  //     setPreviousBeer(data?.data[0]);
  //   } catch (e) {
  //     console.log("Error: ", e.message);
  //   }
  // };

  // const fetchNextsBeer = async () => {
  //   try {
  //     const res = await fetch(
  //       `https://primer-proyecto-nodejs.glitch.me/api/v1/beer/id/${
  //         idInteger + 2
  //       }`
  //     );

  //     const data = await res.json();

  //     setNextBeer(data?.data[0]);
  //   } catch (e) {
  //     console.log("Error: ", e.message);
  //   }
  // };

  /* Aproximacion con JSON */
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

  const getBeerByIDFirebase = async (coleccion, id) => {
    try {
      const q = query(collection(db, coleccion), where("ID", "==", id));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const beerData = querySnapshot.docs[0].data();
        // console.log("beerData");
        // console.log(beerData);
        return beerData;
      } else {
        console.log("NO EXISTE");
        return null;
      }
    } catch (e) {
      console.error("Error al obtener el elemento: ", e);
      throw e;
    }
  };

  /* Aproximacion con Firebase */
  const fetchCurrentBeerFirebase = async () => {
    try {
      const data = await getBeerByIDFirebase("beers", idInteger + 1);
      // console.log("data");
      // console.log(data);
      setBeer(data);
      // console.log("beer");
      // console.log(beer);
    } catch (e) {
      console.error(`Error: ${e}`);
    }
  };

  const fetchNextBeerFirebase = async () => {
    try {
      const nextBeer = await getBeerByIDFirebase("beers", idInteger + 2);
      // console.log("data");
      // console.log(data);
      nextBeer(nextBeer);
      // console.log("beer");
      // console.log(beer);
    } catch (e) {
      console.error(`Error: ${e}`);
    }
  };

  const fetchPreviousBeerFirebase = async () => {
    try {
      const prevBeer = await getBeerByIDFirebase("beers", idInteger - 1);
      // console.log("data");
      // console.log(data);
      previousBeer(prevBeer);
      // console.log("beer");
      // console.log(beer);
    } catch (e) {
      console.error(`Error: ${e}`);
    }
  };

  const handleReportIssueToggle = () => {
    setFormIssueVisibility((prevVisibility) => !prevVisibility);
  };

  const handleEditBeerToggle = () => {
    setFormEditVisibility((prevVisibility) => !prevVisibility);
  };

  //Comprobamos si carga beer con useEffect
  // useEffect(() => {
  //   console.log("beer: ", beer);
  // }, [beer]);

  useEffect(() => {
    // fetchBeerId();
    // fetchPreviousBeer();
    // fetchNextsBeer();
    const token = getSessionToken();
    setIsAdmin(token?.rol === "admin");
    setIsRegistered(!!token || false);
    fetchCurrentBeerFirebase();
    fetchNextBeerJSON();
    fetchPreviousBeerJSON();
  }, [id]);

  return (
    <main>
      <section className="main-container">
        <div className="_beerCard">
          <div id="beer_icon_card">
            {/* Comprobamos si esta registrado */}
            {isRegistered && (
              <div id="buttonReportIssue">
                <button onClick={handleReportIssueToggle}>
                  <img
                    src="/icons/reportIssueIcon.png"
                    alt="Report Issue Icon"
                    className="ReportIssueIcon"
                  />
                </button>
              </div>
            )}
            {isAdmin && (
              <div id="buttonEditBeer">
                <button onClick={handleEditBeerToggle}>
                  <img
                    src="/icons/editBeerIcon.png"
                    alt="Edit Beer Icon"
                    className="EditBeerIcon"
                  />
                </button>
              </div>
            )}

            {beer.IMAGEN !== "" ? (
              <img
                src={`${beer.IMAGEN}`}
                alt={`Imagen de ${beer.MARCA} | ${beer.NOMBRE}`}
              />
            ) : (
              <BeerIcon style={beer.ESTILO} />
            )}
          </div>

          <div id="brand_name_beerCard">
            <h2 className={`${beer?.MARCA?.length > 12 ? "brandShorter" : ""}`}>
              {beer?.MARCA}
            </h2>
            <h3>{beer?.NOMBRE}</h3>
          </div>

          <div id="informacion_card">
            <div id="container_graduation_style_beerCard">
              <p id="beer_graduation">{beer?.GRADUACIÓN}</p>
              <p id="beer_style">{beer?.ESTILO}</p>
            </div>
            <div id="container_country_icon_beerCard">
              {splitCountryName(beer?.NACIONALIDAD)?.length ? (
                <>
                  <div id="container_country_card">
                    {beer?.NACIONALIDAD.split(" /")
                      .flat()
                      .map((c) => {
                        return <p id="beer_country_card">{c}</p>;
                      })}
                  </div>
                </>
              ) : (
                <p id="beer_country_card">{beer?.NACIONALIDAD}</p>
              )}
              {splitCountryName(beer?.NACIONALIDAD)?.length ? (
                <>
                  {splitCountryName(beer?.NACIONALIDAD).map((item) => {
                    return (
                      <img
                        src={`https://flagcdn.com/w1280/${item}.png`}
                        alt={`Bandera de ${beer?.NACIONALIDAD}`}
                        id="flag_icon_card"
                      />
                    );
                  })}
                </>
              ) : (
                <>
                  <img
                    src={`https://flagcdn.com/w1280/${getCodeCountryByName(
                      beer?.NACIONALIDAD
                    )}.png`}
                    alt={`Bandera de ${beer?.NACIONALIDAD}`}
                    id="flag_icon_card"
                  />
                </>
              )}
            </div>
          </div>
        </div>

        {/* Comentamos comentarios jejeje */}
        {/* {beer?.comments ? (
          <div id="commentas_card">
            <div id="comments_beer_card">
              <h2 id="h2_notas">Notas</h2>
              <h2 id="comment">{beer?.comments}</h2>
            </div>
          </div>
        ) : (
          <></>
        )} */}

        {/* MOSTRAMOS EL FORMULARIO PARA REPORTAR ALGÚN ERROR */}
        {/* {formIssueVisibility && (
          <FormReportIssueComponent
            onClose={handleReportIssueToggle}
            content={beer}
            classes={`${formIssueVisibility === true ? "visibleForm" : ""}`}
            formIssueVisibility={formIssueVisibility}
          />
        )} */}

        <FormReportIssueComponent
          onClose={handleReportIssueToggle}
          content={beer}
          classes={`${formIssueVisibility === true ? "visibleForm" : ""}`}
          formIssueVisibility={formIssueVisibility}
        />

        <FormEditBeerComponent
          onClose={handleEditBeerToggle}
          content={beer}
          classes={`${formEditVisibility === true ? "visibleForm" : ""}`}
          formIssueVisibility={formEditVisibility}
        />

        <div className="arrowContainer">
          <div className={`left ${idInteger === 0 ? "blocked" : ""}`}>
            <Link to={`/beer/${idInteger - 1}`}>
              <>
                <div className="arrow">
                  <img src="/icons/LeftArrow.svg" alt="" />
                </div>
              </>
            </Link>
          </div>
          <div className={`right ${nextBeer === undefined ? "blocked" : ""}`}>
            <Link to={`/beer/${idInteger + 1}`}>
              <>
                <div className="arrow">
                  <img src="/icons/RigthArrow.svg" alt="" />
                </div>
              </>
            </Link>
          </div>
        </div>
      </section>

      {/* En caso de que se pudiera modificar un fichero desde cliente, que no se puede :/ */}
      {/* <BeerFormComponent /> */}
      {/* <BeerCommentsComponent /> */}
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
