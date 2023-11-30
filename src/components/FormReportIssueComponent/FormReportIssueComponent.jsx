import { useState, useRef } from "react";
import "./style.css";
import emailjs from "@emailjs/browser";
import toast from "react-hot-toast";

function FormReportIssueComponent({ onClose, content }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [issue, setIssue] = useState("");

  const form = useRef();

  const currenWidth = window.innerWidth;

  const handleSubmitForm = (e) => {
    e.preventDefault();
    console.log("Datos enviados:", { name, email, issue });

    emailjs.send(
      "service_751su1s",
      "template_swpat2t",
      {
        from_name: "Unibeerse",
        to_name: name,
        message: issue,
        reply_to: email,
        beer_id: content.id,
        beer_name: content.name,
        beer_brand: content.brand,
      },
      "93HxoJsy-yVEfyDYt"
    );

    toast.success("Email enviado correctamente");

    resetFields();

    onClose();
  };

  const resetFields = () => {
    setName("");
    setEmail("");
    setIssue("");
  };

  console.log("content");
  console.log(content);
  return (
    <div className="overlay">
      <div className="overlay-content">
        {/*  */}
        <button onClick={onClose} className="closeFormButton">
          <img
            src="/public/CrossWindowIcon.svg"
            alt="Report Issue Icon"
            className="ReportIssueIcon"
          />
        </button>
        <form ref={form} onSubmit={handleSubmitForm} className="formIssues">
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
              required
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
        </form>
      </div>
    </div>
  );
}
export default FormReportIssueComponent;
