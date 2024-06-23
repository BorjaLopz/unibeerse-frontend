import { useState, useRef, useEffect } from "react";
import "./style.css";
import toast from "react-hot-toast";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";

const DATA_LIMIT_PER_PAGE = 20;

function FormEditBeerComponent({
  onClose,
  content,
  classes,
  formIssueVisibility,
}) {
  const [name, setName] = useState(content?.NOMBRE || "");
  const [marca, setMarca] = useState(content?.MARCA || "");
  const [estilo, setEstilo] = useState(content?.ESTILO || "");
  const [graduacion, setGraduacion] = useState(content?.GRADUACION || "");
  const [nacionalidad, setNacionalidad] = useState(content?.NACIONALIDAD || "");
  const form = useRef();
  const navigate = useNavigate();

  const handleSubmitForm = (e) => {
    e.preventDefault();
    const newData = {
      MARCA: marca,
      ESTILO: estilo,
      NACIONALIDAD: nacionalidad,
      NOMBRE: name,
      GRADUACION: parseInt(graduacion),
    };

    updateBeerData("beers", "ID", content?.ID, newData);
  };

  //Conseguimos el numero de pagina mediante el ID de la cerveza
  const getPageNumberByID = (_id) => {
    return Math.ceil(_id / DATA_LIMIT_PER_PAGE);
  };

  const updateBeerData = async (collectionName, field, value, newData) => {
    const beerCollection = collection(db, collectionName);
    const q = query(beerCollection, where("ID", "==", value));
    try {
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const docRef = doc(db, collectionName, querySnapshot.docs[0].id);
        await updateDoc(docRef, newData);

        toast.success(`${content?.NOMBRE} editada con exito!`);
        const page = getPageNumberByID(content?.ID);
        setTimeout(() => {
          onClose();
          navigate(`/beers/page/${page}`);
        }, 1000);
      }
    } catch (e) {
      console.error("Error al actualizar los datos: ", e);
      toast.error(`Error al actualizar los datos: ${e}`);
    }
  };

  useEffect(() => {
    setName(content?.NOMBRE || "");
    setMarca(content?.MARCA || "");
    setNacionalidad(content?.NACIONALIDAD || "");
    setGraduacion(content?.GRADUACION || "");
    setEstilo(content?.ESTILO || "");
  }, [content]);

  return (
    <section
      className={`overlay ${formIssueVisibility === true ? "BGVisible" : ""}`}
    >
      <div className={`overlay-content? ${classes}`}>
        {/*  */}
        <button onClick={onClose} className="closeFormButton">
          <img
            src="/icons/CrossWindowIcon.png"
            alt="Report Issue Icon"
            className="ReportIssueIcon"
          />
        </button>
        <form ref={form} onSubmit={handleSubmitForm} className="formIssues">
          <h3 style={{ fontStyle: "italic" }}>
            Editar {`${content?.NOMBRE} - ${content?.MARCA}`}
          </h3>
          <label className="formulario-label">
            Marca:
            <input
              type="text"
              value={marca}
              onChange={(e) => setMarca(e.target.value)}
              required
            />
          </label>
          <label className="formulario-label">
            Nombre:
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>
          <label className="formulario-label">
            Estilo:
            <input
              type="text"
              value={estilo}
              onChange={(e) => setEstilo(e.target.value)}
              required
            />
          </label>
          <label className="formulario-label">
            Nacionalidad:
            <input
              type="text"
              value={nacionalidad}
              onChange={(e) => setNacionalidad(e.target.value)}
              required
            />
          </label>
          <label className="formulario-label">
            Graduacion:
            <input
              type="text"
              value={graduacion}
              onChange={(e) => setGraduacion(e.target.value)}
              required
            />
          </label>
          <button type="submit" className="formulario-button">
            Editar
          </button>
        </form>
      </div>
    </section>
  );
}
export default FormEditBeerComponent;
