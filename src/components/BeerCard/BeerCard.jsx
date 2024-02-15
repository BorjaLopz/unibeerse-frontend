import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
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
import AddCommentsFirebase from "../AddCommentsFirebase/AddCommentsFirebase";

/* FIREBASE */

import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebaseConfig";
import GetAllCommentsComponent from "../GetAllCommentsComponent/GetAllCommentsComponent";

function BeerCard() {
  const { get } = useServer();
  const [beer, setBeer] = useState({});
  const [previousBeer, setPreviousBeer] = useState({});
  const [nextBeer, setNextBeer] = useState({});
  const [formIssueVisibility, setFormIssueVisibility] = useState(false);
  const [formEditVisibility, setFormEditVisibility] = useState(false);
  const [formSendComments, setFormSendComments] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  const [showFormComments, setShowFormComments] = useState(false);
  const { id } = useParams();
  const location = useLocation();
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
        console.log(b.id);
        if (parseInt(b.id) === parseInt(id) + 1) {
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
      setNextBeer(nextBeer);
      // console.log("beer");
      // console.log(beer);
    } catch (e) {
      console.error(`Error: ${e}`);
    }
  };

  const fetchPreviousBeerFirebase = async () => {
    try {
      const prevBeer = await getBeerByIDFirebase("beers", idInteger - 1);
      // console.log("prevBeer");
      // console.log(prevBeer);
      setPreviousBeer(prevBeer);
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

  const handleSendCommentsToggle = () => {
    setFormSendComments((prevVisibility) => !prevVisibility);
  };

  useEffect(() => {
    // fetchBeerId();
    // fetchPreviousBeer();
    // fetchNextsBeer();
    const token = getSessionToken();
    setIsAdmin(token?.rol === "admin" || false);
    setIsRegistered(token?.rol === "user" || false);
    fetchCurrentBeerFirebase();
    fetchNextBeerFirebase();
    fetchPreviousBeerFirebase();
    // fetchNextBeerJSON();
    // fetchPreviousBeerJSON();
  }, [id]);

  useEffect(() => {
    setShowFormComments(true);
  }, [location]);

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

        {/* Formulario para enviar comentarios */}
        <AddCommentsFirebase
          onClose={handleSendCommentsToggle}
          content={beer}
          classes={`${formSendComments === true ? "visibleForm" : ""}`}
          formIssueVisibility={formSendComments}
        />

        {/* Flechas para cambiar a la siguiente o anterior cerveza */}
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
          <div className={`right ${nextBeer === null ? "blocked" : ""}`}>
            <Link to={`/beer/${idInteger + 1}`}>
              <>
                <div className="arrow">
                  <img src="/icons/RigthArrow.svg" alt="" />
                </div>
              </>
            </Link>
          </div>
        </div>

        {isRegistered === true ? (
          <GetAllCommentsComponent
            isRegistered={isRegistered}
            showFormComments={showFormComments}
            handleSendCommentsToggle={handleSendCommentsToggle}
            beerContent={beer}
          />
        ) : (
          <section className="registerToAddComments">
            Para poder añadir un comentario debes{" "}
            <span className="importantText">
              <Link to={"/signup"}>registrarte</Link>
            </span>
          </section>
        )}
      </section>

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

      {/* En caso de que se pudiera modificar un fichero desde cliente, que no se puede :/ */}
      {/* <BeerFormComponent /> */}
      {/* <BeerCommentsComponent /> */}
    </main>
  );
}

export default BeerCard;
