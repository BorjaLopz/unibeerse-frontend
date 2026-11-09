import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// En desarrollo, /api y /media van a la API local (mvn spring-boot:run en :8080).
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://localhost:8080",
      "/media": "http://localhost:8080",
    },
  },
});
