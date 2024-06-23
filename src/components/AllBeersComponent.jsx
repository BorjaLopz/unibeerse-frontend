import { useEffect, useState, useRef, useContext } from "react";
import useServer from "../hooks/useServer";
import LoadingComponent from "./LoadingComponent/LoadingComponent";

import CustomPagination from "./CustomPagination/CustomPagination";
import CustomBeerCard from "./CustomBeerCard/CustomBeerCard";
import { removingAccents } from "../helpers";

import { BeerContext } from "./Context/BeerContext.jsx";

function AllBeersComponent({ customFilter }) {
  const { beerData, loading } = useContext(BeerContext);
  const [beers, setBeers] = useState([]);
  const { get } = useServer();

  const screenWidth = useRef(window.innerWidth);
  const screenHeight = useRef(window.innerHeight);

  let filteredBeers = [];

  const [beerJSON, setBeerJSON] = useState({});
  // const [beerData, setBeerData] = useState({});

  const [totalPages, setTotalPages] = useState(0);

  const itemsPerPage = 10;

  const getBeers = async () => {
    try {
      const res = await fetch(
        "https://primer-proyecto-nodejs.glitch.me/api/v1/beers/all"
      );
      const data = await res.json();
      setBeers(data.data);
      setLoading(true);
    } catch (e) {
      console.error(`Error: ${e}`);
    }
    // const { data } = await get({
    //   url: "https://primer-proyecto-nodejs.glitch.me/api/v1/beers/all/beers/all",
    // });
    // console.log("data");
    // console.log(data);
    // setLoading(true);
    // setBeers(data.data);
  };

  const getBeersJSON = () => {
    try {
      setBeerJSON(beerData.data);
      // console.log("beerData.data");
      // console.log(beerData.data);
      setLoading(true);
    } catch (e) {
      console.error(`Error: ${e}`);
    }
  };

  useEffect(() => {
    // getBeers();
    // getBeersJSON();
    setTotalPages(Math.ceil(beers.length / itemsPerPage));
  }, []);

  //Añadimos cervezas filtradas desde el archivo JSON
  /* SI USAMOS UN JSON HARDCODEADO */
  // if (customFilter !== "") {
  //   beerJSON.filter((beer) => {
  //     if (
  //       removingAccents(beer.name.toLowerCase()).includes(customFilter) ||
  //       removingAccents(beer.style.toLowerCase()).includes(customFilter) ||
  //       removingAccents(beer.brand.toLowerCase()).includes(customFilter) ||
  //       removingAccents(beer.country.toLowerCase()).includes(customFilter) ||
  //       removingAccents(beer.graduation.toLowerCase()).includes(customFilter)
  //     ) {
  //       filteredBeers.push(beer);
  //       return beer;
  //     }
  //   });
  // }

  /* USANDO FIREBASE */
  if (customFilter !== "") {
    beerData.filter((beer) => {
      if (
        removingAccents(beer.NOMBRE.toLowerCase()).includes(customFilter) ||
        removingAccents(beer.ESTILO.toLowerCase()).includes(customFilter) ||
        removingAccents(beer.MARCA.toLowerCase()).includes(customFilter) ||
        removingAccents(beer.NACIONALIDAD.toLowerCase()).includes(
          customFilter
        ) ||
        beer.GRADUACIÓN.toString().includes(customFilter)
        // removingAccents(beer.GRADUACIÓN).includes(customFilter)
      ) {
        filteredBeers.push(beer);
        return beer;
      }
    });
  }
  // beers.filter((beer) => {
  //   if (customFilter === "") {
  //     return beer;
  //   } else if (
  //     removingAccents(beer.name.toLowerCase()).includes(customFilter) ||
  //     removingAccents(beer.style.toLowerCase()).includes(customFilter) ||
  //     removingAccents(beer.brand.toLowerCase()).includes(customFilter) ||
  //     removingAccents(beer.country.toLowerCase()).includes(customFilter) ||
  //     removingAccents(beer.graduation.toLowerCase()).includes(customFilter)
  //   ) {
  //     filteredBeers.push(beer);
  //     return beer;
  //   }
  // });

  return (
    <>
      {/* <AllBeersComponent /> */}
      {/* <SearchBar data={beers} /> */}
      <main>
        {/* {loading ? (
          <CustomPagination
            data={customFilter !== "" ? filteredBeers : beerJSON}
            pageLimit={`${screenWidth.current < 500 ? 2 : 4}`}
            dataLimit={20}
            RenderComponent={CustomBeerCard}
            filter={customFilter}
          />
        ) : (
          <LoadingComponent />
        )} */}

        {!loading ? (
          customFilter === "" ? (
            <CustomPagination
              data={beerData}
              pageLimit={`${screenWidth.current < 500 ? 2 : 4}`}
              dataLimit={20}
              RenderComponent={CustomBeerCard}
              filter={customFilter}
            />
          ) : (
            <CustomPagination
              data={filteredBeers}
              pageLimit={`${screenWidth.current < 500 ? 2 : 4}`}
              dataLimit={filteredBeers.length}
              RenderComponent={CustomBeerCard}
              filter={customFilter}
              isShown={false}
            />
          )
        ) : (
          <LoadingComponent />
        )}
      </main>
    </>
  );
}

export default AllBeersComponent;
