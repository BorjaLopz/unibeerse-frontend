import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import useServer from "../../hooks/useServer";
import BeerStyleComponent from "../BeerStyleComponent/BeerStyleComponent";
import stylejson from "../../../public/styles.json";
import LoadingComponent from "../LoadingComponent/LoadingComponent";
import { removingAccents } from "../../helpers";
import "./style.css";
import CustomBeerCard from "../CustomBeerCard/CustomBeerCard";

/* FIREBASE */
import { db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

import beerData from "/public/beer-data.json";
import ScrollTopComponent from "../ScrollTop/ScrollTopComponent";

function StyleCard() {
  const { style } = useParams();
  const [currentStyle, setCurrentStyle] = useState();
  const [loading, setLoading] = useState(true);
  const [beers, setBeers] = useState([]);
  const [randomBeers, setRandomBeers] = useState([]);
  const navigate = useNavigate();
  const { get } = useServer();

  const beerStyleExample = [];

  const numberOfExamples = 4;

  const getCurrentStyle = () => {
    if (style.split(" ").length > 1) {
      const [styleFiltered] = stylejson.filter(
        (s) =>
          s.itemKey.toLowerCase() === style.split(" ").slice(0)[0].toLowerCase()
      );
      if (!styleFiltered) {
        navigate("/404");
      }
      setCurrentStyle(styleFiltered);
    } else {
      const [styleFiltered] = stylejson.filter(
        (s) => s.itemKey.toLowerCase() === style.toLowerCase()
      );
      if (!styleFiltered) {
        navigate("/404");
      }
      setCurrentStyle(styleFiltered);
    }
  };

  const getBeers = async () => {
    try {
      const res = await fetch(
        "https://primer-proyecto-nodejs.glitch.me/api/v1/beers/all"
      );
      const data = await res.json();

      const filteredBeers = data.data.filter((b) => {
        if (style.split(" ").length > 1) {
          if (
            b?.style?.toLowerCase().includes(style.split(" ").slice(0)[0]) &&
            removingAccents(style.split(" ").slice(-1)[0]) ===
              removingAccents(b?.country.toLowerCase())
          ) {
            return b;
          }
        }
        if (b?.style?.toLowerCase() === currentStyle?.itemKey?.toLowerCase()) {
          return b;
        }
      });
      setBeers(filteredBeers);
    } catch (e) {
      console.error(`Error: ${e}`);
    }
  };

  const getBeersJSON = () => {
    try {
      const filteredBeers = beerData.data.filter((b) => {
        if (style.split(" ").length > 1) {
          if (
            b?.style?.toLowerCase().includes(style.split(" ").slice(0)[0]) &&
            removingAccents(style.split(" ").slice(-1)[0]) ===
              removingAccents(b?.country.toLowerCase())
          ) {
            return b;
          }
        }
        if (b?.style?.toLowerCase() === currentStyle?.itemKey?.toLowerCase()) {
          return b;
        }
      });
      setBeers(filteredBeers);
    } catch (e) {
      console.error(`Error: ${e}`);
    }
  };

  const getBeersFirebase = async () => {
    try {
      const dataBruto = await getDocs(collection(db, "beers"));
      // console.log(dataBruto);
      // console.log("dataBruto");
      const unorderedData = dataBruto.docs.map((doc) => doc.data());
      // console.log("unorderedData");
      // console.log(unorderedData);
      const orderedData = unorderedData.sort((a, b) => a.ID - b.ID);
      const filteredBeers = orderedData.filter((b) => {
        if (style.split(" ").length > 1) {
          if (
            b?.ESTILO?.toLowerCase().includes(ESTILO.split(" ").slice(0)[0]) &&
            removingAccents(ESTILO.split(" ").slice(-1)[0]) ===
              removingAccents(b?.NACIONALIDAD.toLowerCase())
          ) {
            return b;
          }
        }
        if (b?.ESTILO?.toLowerCase() === currentStyle?.itemKey?.toLowerCase()) {
          return b;
        }
      });

      console.log("filteredBeers");
      console.log(filteredBeers);
      setBeers(filteredBeers);

      // setBeers(orderedData);
      setLoading(true);
    } catch (e) {
      console.error("Error al obtener los datos: ", e);
    }
  };

  const selectBeersRandom = () => {
    setLoading(true);
    const copiaCervezas = [];
    const beersRandomized = [...beers].sort(() => 0.5 - Math.random());
    const beersSelected = beersRandomized.slice(0, numberOfExamples);

    for (let i = 0; i < numberOfExamples; i++) {
      if (beersSelected[i] !== undefined) {
        copiaCervezas.push(beersSelected[i]);
        beerStyleExample.push(beersSelected[i]);
        beerStyleExample.slice(0, 4);
      }
    }
    setRandomBeers(copiaCervezas);
  };

  const stopSpinner = () => {
    if (randomBeers.length > 0) {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCurrentStyle();
    stopSpinner();
  });

  useEffect(() => {
    // getBeers();
    // getBeersJSON();
    getBeersFirebase();
  }, [currentStyle]);

  useEffect(() => {
    selectBeersRandom();
  }, [beers]);

  useEffect(() => {
    setTimeout(() => {
      if (randomBeers.length === 0) {
        setLoading(false);
      }
    }, 5000);
  }, []);

  return (
    <>
      <main>
        <article id="description_style">
          {stylejson.map((s, id) => {
            return (
              <>
                {s.itemKey === style ? (
                  <div key={id}>
                    <h2>Cervezas estilo {s.style.toLowerCase()}</h2>
                    <p>{s.description}</p>
                  </div>
                ) : (
                  ""
                )}
              </>
            );
          })}
        </article>
        {loading ? (
          <LoadingComponent />
        ) : (
          <article id="ejemplos-cerveza">
            {randomBeers.length > 0 ? (
              <>
                <div id="mainTitleSection">
                  <h2>Cervezas similares</h2>
                </div>
                <ul id="beer_examples">
                  {randomBeers.map((b) => {
                    if (b !== undefined) {
                      return <CustomBeerCard data={b} />;
                    }
                  })}
                </ul>
              </>
            ) : (
              <h2>{`No hay cervezas ${style.toLowerCase()}`}</h2>
            )}
          </article>
        )}
        <ScrollTopComponent />
      </main>
    </>
  );
}

export default StyleCard;
