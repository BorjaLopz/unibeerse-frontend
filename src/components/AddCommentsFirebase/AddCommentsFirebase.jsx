import { useState, useRef } from "react";
import "./styles.css";
import emailjs from "@emailjs/browser";
import toast from "react-hot-toast";
import { getSessionToken } from "../../helpers";

function AddCommentsFirebase({
  onClose,
  content,
  classes,
  formIssueVisibility,
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState(getSessionToken()?.email || "");
  const [issue, setIssue] = useState("");

  const form = useRef();

  const currenWidth = window.innerWidth;

  const handleSubmitForm = (e) => {
    e.preventDefault();
    // console.log("Datos enviados:", { name, email, issue });

    // emailjs.send(
    //   "service_751su1s",
    //   "template_swpat2t",
    //   {
    //     from_name: "Unibeerse",
    //     to_name: name,
    //     message: issue,
    //     reply_to: email,
    //     beer_id: content.id,
    //     beer_name: content.name,
    //     beer_brand: content.brand,
    //   },
    //   "93HxoJsy-yVEfyDYt"
    // );

    toast.success("Email enviado correctamente");

    resetFields();

    onClose();
  };

  const resetFields = () => {
    setName("");
    setEmail("");
    setIssue("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  };

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
        <form className="signUp_form" onSubmit={handleSubmit}>
          <label htmlFor="fullName">Nombre completo:</label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <button type="submit" className="signUp_button">
            Registrarse
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
