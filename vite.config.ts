import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": import.meta.dirname + "/src",
    },
  },
  server: {
    port: 5173,
    proxy: {
      // Forward API calls to the backend in development.
      // Backend default port: 5000 (see HRMS_Backend/.env).
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});
