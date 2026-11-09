import { Outlet, ScrollRestoration } from "react-router-dom";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";

export default function App() {
  return (
    <>
      <a href="#contenido" className="skip">Saltar al contenido</a>
      <Header />
      <div id="contenido">
        <Outlet />
      </div>
      <Footer />
      <ScrollRestoration />
    </>
  );
}
