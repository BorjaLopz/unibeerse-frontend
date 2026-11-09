import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Navigate, RouterProvider, createBrowserRouter, useParams } from "react-router-dom";
import "@fontsource-variable/archivo/wdth.css";
import "./styles/app.css";
import App from "./App";
import { AuthProvider } from "./lib/auth";
import { BeersProvider } from "./lib/beers";
import CatalogPage from "./pages/CatalogPage";
import BeerPage from "./pages/BeerPage";
import StylesPage from "./pages/StylesPage";
import AuthPage from "./pages/AuthPage";
import ContactPage from "./pages/ContactPage";
import NotFoundPage from "./pages/NotFoundPage";
import { AdminFormPage, AdminListPage } from "./pages/AdminPage";

// Las direcciones de la web antigua (/beer/<posición>) siguen funcionando.
function LegacyBeer() {
  const n = Number(useParams().n);
  return <Navigate to={Number.isFinite(n) ? `/cerveza/${n + 1}` : "/"} replace />;
}

const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      { path: "/", element: <CatalogPage /> },
      { path: "/cerveza/:id", element: <BeerPage /> },
      { path: "/beer/:n", element: <LegacyBeer /> },
      { path: "/estilos", element: <StylesPage /> },
      { path: "/contacto", element: <ContactPage /> },
      { path: "/entrar", element: <AuthPage /> },
      { path: "/admin", element: <AdminListPage /> },
      { path: "/admin/:id", element: <AdminFormPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <BeersProvider>
        <RouterProvider router={router} />
      </BeersProvider>
    </AuthProvider>
  </StrictMode>,
);
