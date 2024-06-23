import React, { useState, useEffect } from "react";
import "./styles.css";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import "firebase/firestore";
import {
  addDoc,
  collection,
  getFirestore,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { saveSessionToken } from "../../helpers";
import { db } from "../firebaseConfig";

function AddNewBeerComponent() {
  const [beerName, setBeerName] = useState("");
  const [beerBrand, setBeerBrand] = useState("");
  const [beerCountry, setBeerCountry] = useState("");
  const [beerGraduation, setBeerGraduation] = useState("");
  const [beerStyle, setBeerStyle] = useState("");
  const [beerComments, setBeerComments] = useState("");
  const [beerID, setBeerID] = useState("");
  const [beerNota, setBeerNota] = useState("");

  const navigate = useNavigate();
  const firestore = getFirestore();

  //Obtenemos todas las cervezas para obtener el ultimo ID
  const getBeersFirebase = async () => {
    try {
      const dataBruto = await getDocs(collection(db, "beers"));

      const unorderedData = dataBruto.docs.map((doc) => doc.data());

      const orderedData = unorderedData.sort((a, b) => a.ID - b.ID);

      setBeerID(orderedData.length + 1);
    } catch (e) {
      console.error("Error al obtener los datos: ", e);
    }
  };

  useEffect(() => {
    //Obtenemos el siguiente ID a meter en la lista de cervezas
    getBeersFirebase();
  }, []);

  const isEmailAvailable = async (_email) => {
    const userCollection = collection(firestore, "users");
    const q = query(userCollection, where("email", "==", _email));

    const querySnapshot = await getDocs(q);
    return querySnapshot.empty; //True si esta disponible
  };

  async function addNewBeerFirebase(
    beerName,
    beerBrand,
    beerCountry,
    beerGraduation,
    beerStyle,
    beerComments,
    beerID,
    beerNota
  ) {
    try {
      const docRef = await addDoc(collection(firestore, "beers"), {
        NOMBRE: beerName,
        MARCA: beerBrand,
        NACIONALIDAD: beerCountry,
        GRADUACION: beerGraduation,
        ESTILO: beerStyle,
        COMENTARIOS: beerComments,
        NOTA: beerNota,
        ID: beerID,
        IMAGEN: "",
        IMAGEN_LOCAL: "",
      });

      return docRef.id;
    } catch (error) {
      console.error("Error al añadir usuario a Firestore: ", error.message);
      return null;
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      //Añadimos la cerveza a Firestore
      const beerIDdoc = await addNewBeerFirebase(
        beerName,
        beerBrand,
        beerCountry,
        beerGraduation,
        beerStyle,
        beerComments,
        beerID,
        beerNota
      );

      if (beerIDdoc) {
        toast.success(`${beerName} - ${beerBrand} añadida con exito!`);

        navigate("/");
      }
    } catch (error) {
      console.error("Error al registrar cerveza: ", error.message);
      toast.error("Error al registrar cerveza");
    }
    // try {
    //   if (password === confirmPassword) {
    //     encryptPassword();
    //     // Añadir usuario a Firestore
    //     const userId = await createUserInFirestore(
    //       email.toLowerCase(),
    //       name,
    //       "user",
    //       encryptedPassword
    //     );

    //     if (userId) {
    //       // Guardar token en sessionStorage
    //       saveSessionToken(email, "user", name);
    //       toast.success(`Bienvenido ${email.split("@")[0]}`);

    //       // Redirigir al usuario
    //       navigate("/");
    //     } else {
    //       // Manejar el caso de error al añadir usuario a Firestore
    //       toast.error("Usuario ya registrado");
    //     }
    //   } else {
    //     toast.error("Las contraseñas deben coincidir");
    //   }
    // } catch (error) {
    //   console.error("Error al registrar usuario: ", error.message);
    //   toast.error("Error al registrar usuario");
    // }
  };

  return (
    <div className="addNewBeer">
      <div className="addNewBeer_container">
        <h2>Formulario de Registro</h2>

        <form className="addNewBeer_form" onSubmit={handleSubmit}>
          <label htmlFor="beerID">ID de la cerveza</label>
          <input
            type="number"
            id="beerID"
            name="beerID"
            value={beerID}
            onChange={(e) => setBeerID(e.target.value)}
            readOnly
          />

          <label htmlFor="beerName">Nombre de la cerveza:</label>
          <input
            type="text"
            id="beerName"
            name="beerName"
            value={beerName}
            onChange={(e) => setBeerName(e.target.value)}
            required
          />

          <label htmlFor="beerBrand">Marca de la cerveza</label>
          <input
            type="text"
            id="beerBrand"
            name="beerBrand"
            value={beerBrand}
            onChange={(e) => setBeerBrand(e.target.value)}
            required
          />

          <label htmlFor="beerStyle">Estilo de la cerveza</label>
          <input
            type="text"
            id="beerStyle"
            name="beerStyle"
            value={beerStyle}
            onChange={(e) => setBeerStyle(e.target.value)}
            required
          />

          <label htmlFor="beerCountry">Pais de la cerveza</label>
          <input
            type="text"
            id="beerCountry"
            name="beerCountry"
            value={beerCountry}
            onChange={(e) => setBeerCountry(e.target.value)}
            required
          />

          <label htmlFor="beerGraduation">Graduación de la cerveza</label>
          <input
            type="number"
            id="beerGraduation"
            name="beerGraduation"
            value={beerGraduation}
            onChange={(e) => setBeerGraduation(e.target.value)}
            required
          />

          <label htmlFor="beerComments">Comentarios de la cerveza</label>
          <input
            type="number"
            id="beerComments"
            name="beerComments"
            value={beerComments}
            onChange={(e) => setBeerComments(e.target.value)}
          />

          <label htmlFor="beerNota">Nota de la cerveza</label>
          <input
            type="number"
            id="beerNota"
            name="beerNota"
            value={beerNota}
            onChange={(e) => setBeerNota(e.target.value)}
          />

          <button type="submit" className="addNewBeer_button">
            Registrar nueva cerveza
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddNewBeerComponent;
