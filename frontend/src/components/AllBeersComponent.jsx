import { useEffect, useState, useContext } from "react";
import useServer from "../hooks/useServer";
import LoadingComponent from "./LoadingComponent/LoadingComponent";

import CustomPagination from "./CustomPagination/CustomPagination";
import CustomBeerCard from "./CustomBeerCard/CustomBeerCard";
import { removingAccents } from "../helpers";

function AllBeersComponent({ customFilter }) {
  const [beers, setBeers] = useState([]);
  const { get } = useServer();
  const [loading, setLoading] = useState(false);
  let filteredBeers = [];

  const [totalPages, setTotalPages] = useState(0);

  const itemsPerPage = 10;

  const getBeers = async () => {
    try {
      const res = await fetch(
        "https://primer-proyecto-nodejs.glitch.me/api/v1/beers/all"
      );
      const data = await res.json();
      setBeers(data.data);
      setLoading(true)
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

  useEffect(() => {
    getBeers();

    setTotalPages(Math.ceil(beers.length / itemsPerPage));
  }, []);

  beers.filter((beer) => {
    if (customFilter === "") {
      return beer;
    } else if (
      removingAccents(beer.name.toLowerCase()).includes(customFilter) ||
      removingAccents(beer.style.toLowerCase()).includes(customFilter) ||
      removingAccents(beer.brand.toLowerCase()).includes(customFilter) ||
      removingAccents(beer.country.toLowerCase()).includes(customFilter) ||
      removingAccents(beer.graduation.toLowerCase()).includes(customFilter)
    ) {
      filteredBeers.push(beer);
      return beer;
    }
  });

  return (
    <>
      {/* <AllBeersComponent /> */}
      {/* <SearchBar data={beers} /> */}
      <main>
        {loading ? (
          <CustomPagination
            data={customFilter !== "" ? filteredBeers : beers}
            pageLimit={5}
            dataLimit={20}
            RenderComponent={CustomBeerCard}
            filter={customFilter}
          />
        ) : (
          <LoadingComponent />
        )}
      </main>
    </>
  );
}

export default AllBeersComponent;
