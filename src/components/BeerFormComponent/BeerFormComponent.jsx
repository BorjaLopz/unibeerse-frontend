import { useState } from "react";
import "./styles.css";
import starFilled from "/icons/filledStar.svg";
import starEmpty from "/icons/emptyStar.svg";
import { useParams } from "react-router-dom";
import axios from "axios";

const URL_POST = "http://localhost:3000/beer/comment";

function BeerFormComponent() {
  const [textAreaValue, setTextAreaValue] = useState("");
  const [rating, setRating] = useState(0);
  const { id } = useParams();

  const handleTextChange = (e) => {
    setTextAreaValue(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Haz algo con textareaValue y rating, como enviarlos a un servidor

    const beerJSON = { id: id, rating: rating, comment: textAreaValue };

    axios
      .post(URL_POST, beerJSON)
      .then((resp) => console.log(resp))
      .catch((e) => console.log(`Error en la llamada de la API ${e}`));

    const JSONstring = JSON.stringify(beerJSON);

    // console.log(`id: ${id}\nrating: ${rating}\ncomment: ${textAreaValue}`);

    // Borra el contenido del textarea y restablece la valoración
    setTextAreaValue("");
    setRating(0);
  };

  const handleRatingChange = (selectedRating) => {
    setRating(selectedRating);
  };

  const starIcons = [1, 2, 3, 4, 5].map((star) => (
    <article
      key={star}
      className={`star ${rating >= star ? "filled" : ""}`}
      onClick={() => handleRatingChange(star)}
    >
      {rating >= star ? (
        <img src={starFilled} alt="Star Filled" />
      ) : (
        <img src={starEmpty} alt="Star Empty" />
      )}
    </article>
  ));

  return (
    <section id="beerFormComponent">
      <form onSubmit={handleSubmit}>
        <label htmlFor="textArea">
          Danos tu opinión:
          <textarea
            name="textArea"
            id="textArea"
            cols="40"
            rows="5"
            value={textAreaValue}
            onChange={handleTextChange}
            placeholder="¡Comparte tu opinión!"
          ></textarea>
        </label>

        <section id="ratingSection">
          <p>Valoración:</p>
          <div className="star-container">{starIcons}</div>
        </section>

        <button type="submit">Enviar</button>
      </form>
    </section>
  );
}

export default BeerFormComponent;
