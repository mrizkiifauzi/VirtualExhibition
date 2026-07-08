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
        rewrite: (path) => path.replace(/^\/storage/, ""),
      },
      // Semua request /artworks/<tipe>/* → Laravel public/artworks
      // Jangan proxy route SPA /artworks/:id karena ini akan ditangani oleh React Router.
      "/artworks/img": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
      "/artworks/video": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
      "/artworks/files": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
      "/artworks/thumbnails": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
});
