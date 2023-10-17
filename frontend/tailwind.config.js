/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
    minHeight: {
      "1/2": "50%",
      "1/4": "25%",
    },
  },
  plugins: [require("@tailwindcss/aspect-ratio")],
};
