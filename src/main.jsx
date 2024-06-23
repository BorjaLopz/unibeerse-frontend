import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";

import "./App.css";
import { BeerProvider } from "./components/Context/BeerContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <BeerProvider>
        <App />
      </BeerProvider>
    </BrowserRouter>ª
  </React.StrictMode>
);
