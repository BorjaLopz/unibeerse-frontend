// BeerContext.js
import React, { createContext, useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

const BeerContext = createContext();

const BeerProvider = ({ children }) => {
  const [beerData, setBeerData] = useState([]);
  const [loading, setLoading] = useState(true);

  const getBeersFirebase = async () => {
    try {
      const dataBruto = await getDocs(collection(db, "beers"));
      const unorderedData = dataBruto.docs.map((doc) => doc.data());
      const orderedData = unorderedData.sort((a, b) => a.ID - b.ID);
      setBeerData(orderedData);
      setLoading(false);
    } catch (e) {
      console.error("Error al obtener los datos: ", e);
      setLoading(false);
    }
  };

  useEffect(() => {
    getBeersFirebase();
  }, []);

  return (
    <BeerContext.Provider value={{ beerData, loading }}>
      {children}
    </BeerContext.Provider>
  );
};

export { BeerContext, BeerProvider };
