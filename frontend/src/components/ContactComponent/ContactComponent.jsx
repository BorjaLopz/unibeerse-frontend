import React, { useState, useRef } from "react";
import "./style.css";
import emailjs from "@emailjs/browser";
import toast from "react-hot-toast";

function ContactComponent() {
  const [formName, setFormName] = useState();
  const [formSurname, setFormSurname] = useState();
  const [formEmail, setFormEmail] = useState();
  const [formMessage, setFormMessage] = useState();

  const form = useRef();

  const capitalizeEveryWord = (_sentence) => {
    const aux = _sentence.split(" ");

    for (let i = 0; i < aux.length; i++) {
      aux[i] = aux[i].charAt(0).toUpperCase() + aux[i].slice(1);
    }

    return aux.join(" ");
  };

  const resetFields = () => {
    setFormName("");
    setFormSurname("");
    setFormEmail("");
    setFormMessage("");
  };

  const handleSubmitForm = (e) => {
    e.preventDefault();

    const newName = capitalizeEveryWord(formName);
    const newSurname = capitalizeEveryWord(formSurname);

    emailjs.send(
      "service_oxjmqnd",
      "template_o80c0el",
      {
        from_name: "Borja",
        to_name: newName + " " + newSurname,
        message: formMessage,
        reply_to: formEmail,
      },
      "Lbix6O2NwDuZJPRYl"
    );

    toast.success("Email enviado correctamente");

    resetFields();
  };

  return (
    <>
      <div id="contactoBorja">
        <h2>Formulario contacto</h2>
      </div>
      <fieldset className="fieldset_general">
        <form ref={form} onSubmit={handleSubmitForm} className="first_form">
          <ul className="fieldset_contact">
            <li className="field_name">
              <label htmlFor="name">Nombre</label>
              <input
                type="text"
                name="name"
                id="name"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
              <label htmlFor="last-name">Apellidos</label>
              <input
                type="text"
                name="last-name"
                id="last-name"
                required
                value={formSurname}
                onChange={(e) => setFormSurname(e.target.value)}
              />
            </li>

            <li className="field_email">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                name="email"
                id="email"
                required
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
              />
            </li>
            <div className="field_message">
              <li>
                <label htmlFor="mensaje">Mensaje</label>
                <textarea
                  name="mensaje"
                  id="mensaje"
                  cols={60}
                  rows={4}
                  required
                  wrap="soft"
                  style={{ fontSize: 16 }}
                  value={formMessage}
                  onChange={(e) => setFormMessage(e.target.value)}
                />
              </li>
            </div>
          </ul>
          <button type="submit">Enviar</button>
        </form>
      </fieldset>
    </>
  );
}

export default ContactComponent;
