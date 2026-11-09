import { Link } from "react-router-dom";
import { usePageTitle } from "../lib/usePageTitle";

export default function NotFoundPage() {
  usePageTitle("No encontrado");
  return (
    <main className="wrap page page--narrow">
      <h1>Esta página no existe</h1>
      <p className="prose">La dirección está mal escrita o la cerveza se ha retirado de la colección.</p>
      <p><Link to="/" className="btn">Ir al catálogo</Link></p>
    </main>
  );
}
