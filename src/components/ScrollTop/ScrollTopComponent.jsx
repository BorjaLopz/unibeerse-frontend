import { useState, useEffect } from "react";
import "./style.css";

function ScrollTopComponent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    });
  }, []);
  const goTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <button
        className={`scroll-top ${scrollY > 400 ? "show" : ""}`}
        // style={{ display: isVisible ? "block" : "none" }}
        onClick={goTop}
      >
        <img src="/icons/FlechaArriba.svg" alt="Flecha arriba" />
      </button>
    </>
  );
}

export default ScrollTopComponent;
