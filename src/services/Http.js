import { api_url } from "../config.js";

async function Http({ method = "GET", url, token, body }) {
  if (!url.startsWith("/")) {
    throw new Error("La URL debe comenzar con un /");
  }

  const fullURL = new URL(api_url + url);
  // console.log(fullURL);

  const config = {
    method,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  };

  try {
    const res = await fetch(fullURL.href, config);
    const data = await res.json();

    if (!res.ok) {
      throw data.error;
    }

    return { data, loading: false, error: null };
  } catch (error) {
    return { data: null, loading: false, error };
  }
}

export default Http;
