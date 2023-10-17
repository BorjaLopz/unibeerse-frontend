import toast from "react-hot-toast";

import Http from "../services/Http.js";

// /beers/all -> Obtenemos todas las cervezas

/* 
  app.get("/beers/all", getAllBeersController);
*/

function useServer() {
  const handleResponse = ({ data, loading, error }) => {
    if (data) {
      // console.log("no hay fallo");
    }

    if (error) {
      toast.error(error.message);
    }

    return { data, loading, error };
  };

  return {
    get: ({ url }) => Http({ mehtod: "GET", url }).then(handleResponse),
  };
}

export default useServer;
