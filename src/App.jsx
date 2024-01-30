import { Toaster } from "react-hot-toast";
import { Route, Routes } from "react-router-dom";
// import AllBeers from "./views/AllBeers";
import Contacto from "./views/Contacto";
import AñadirCerveza from "./views/AñadirCerveza";
import NotFound from "./views/NotFound";
import BeerCard from "./components/BeerCard/BeerCard";
import Header from "./components/Header/Header";
import { useState } from "react";
import AllBeersPage from "./views/AllBeersPage";
import StylesPage from "./views/StylesPages";
import StyleCard from "./components/StyleCardComponent/StyleCard";
import HomePage from "./views/HomePage";
import Footer from "./components/Footer/Footer";
import LogInComponent from "./components/LogInComponent/LogInComponent";
import SignUpComponent from "./components/SignUpComponent/SignUpComponent";
import AddNewBeerComponent from "./components/AddNewBeerComponent/AddNewBeerComponent";

function App() {
  const [customFilter, setCustomFilter] = useState("");
  return (
    <div className="app">
      <Header handleCustomFilter={setCustomFilter} />
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/contact" element={<Contacto />} />
        <Route path="/add" element={<AñadirCerveza />} />
        <Route
          path="/beers"
          element={<AllBeersPage customFilter={customFilter} />}
        />
        <Route
          path={`/beers/page/:numberPage`}
          element={<AllBeersPage customFilter={customFilter} />}
        />
        <Route path={`/beer/:id`} element={<BeerCard />} />
        <Route path="/styles" element={<StylesPage />} />
        <Route
          path="/style/:style"
          element={<StyleCard stylejson={"../public/style.json"} />}
        />
        <Route path="/login" element={<LogInComponent />} />
        <Route path="/signup" element={<SignUpComponent />} />
        <Route path="/addNewBeer" element={<AddNewBeerComponent />} />
        <Route path="/*" element={<NotFound />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
