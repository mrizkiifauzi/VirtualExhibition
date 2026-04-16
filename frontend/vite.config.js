import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Semua request /api → Laravel
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
      // Semua request /storage → Laravel public storage
      // Ini yang menghilangkan CORS error pada gambar / file 3D
      "/storage": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
});
