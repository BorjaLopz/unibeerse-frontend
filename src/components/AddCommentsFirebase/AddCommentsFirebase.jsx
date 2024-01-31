import { useState, useRef, useEffect } from "react";
import "./styles.css";
import emailjs from "@emailjs/browser";
import toast from "react-hot-toast";
import { getSessionToken } from "../../helpers";
import { useLocation } from "react-router-dom";
import {
  addDoc,
  collection,
  getFirestore,
  query,
  where,
  getDocs,
} from "firebase/firestore";

function AddCommentsFirebase({
  onClose,
  content,
  classes,
  formIssueVisibility,
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState(getSessionToken()?.email || "");
  const [comment, setComment] = useState("");

  const [issue, setIssue] = useState("");

  const form = useRef();

  const currenWidth = window.innerWidth;
  const maxLength = 200;
  const location = useLocation();
  const firestore = getFirestore();

  const resetFields = () => {
    setName("");
    setComment("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log(
      `Cosas a enviar: nombre: ${name}\nemail: ${email}\ncomentario: ${comment} \nidCerveza: ${content.ID}`
    );

    const commentId = await createCommentInFirestore(
      name,
      email,
      content.ID,
      comment
    );

    if (commentId) {
      toast.success("Comentario enviado con exito!");
    }

    resetFields();

    onClose();
  };

  async function createCommentInFirestore(name, email, beerID, comment) {
    try {
      // Añadir comentario a Firestore
      const docRef = await addDoc(collection(firestore, "comments"), {
        name,
        email,
        comment,
        beerID,
      });
      console.log("docRef.id: ", docRef.id);
      return docRef.id;
    } catch (error) {
      console.error("Error al añadir usuario a Firestore: ", error.message);
      return null;
    }
  }

  useEffect(() => {
    resetFields();
  }, [location]);

  return (
    <section
      className={`overlay ${formIssueVisibility === true ? "BGVisible" : ""}`}
    >
      <div className={`overlay-content ${classes}`}>
        {/*  */}
        <button onClick={onClose} className="closeFormButton">
          <img
            src="/icons/CrossWindowIcon.png"
            alt="Report Issue Icon"
            className="ReportIssueIcon"
          />
        </button>
        <form className="commentForm_form" onSubmit={handleSubmit}>
          <label htmlFor="fullName">Nombre</label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <label htmlFor="email">email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            required
            readOnly
          />

          <label htmlFor="comment">Comentario</label>
          <div className="textAreaContainer">
            <textarea
              name="comment"
              id="comment"
              cols="30"
              rows="4"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
              maxLength={maxLength}
            ></textarea>
            <div className="charCounter">
              {comment.length} / {maxLength}
            </div>
          </div>
          <button type="submit" className="commentForm_button">
            Registrar comentario
          </button>
        </form>
        {/* <form ref={form} onSubmit={handleSubmitForm} className="formIssues">
          <h3 style={{ fontStyle: "italic" }}>
            Reportar problema de {`${content.NOMBRE} - ${content.MARCA}`}
          </h3>
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
            Correo Electrónico:
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              readOnly
            />
          </label>

          <label htmlFor="mensaje">Mensaje</label>
          <textarea
            name="mensaje"
            id="mensaje"
            cols={`${currenWidth < 850 ? 30 : 60}`}
            rows={4}
            required
            wrap="soft"
            style={{ fontSize: 16, minHeight: "150px" }}
            value={issue}
            onChange={(e) => setIssue(e.target.value)}
          />

          <button type="submit" className="formulario-button">
            Enviar
          </button>
        </form> */}
      </div>
    </section>
  );
}
export default AddCommentsFirebase;
