import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import VirtualRoom from "../components/three/VirtualRoom";
import ArtworkPopup from "../components/three/ArtworkPopup";
import ArtworkCard from "../components/artwork/ArtworkCard";
import LoadingScreen from "../components/three/LoadingScreen";
import api from "../api/axios";

function useIsMobile() {
  const [mobile, setMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const h = () => setMobile(window.innerWidth < 768);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return mobile;
}

export default function Exhibition() {
  const isMobile = useIsMobile();
  const [artworks, setArtworks] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    api
      .get("/artworks?per_page=50")
      .then(({ data }) => setArtworks(data.data || []))
      .finally(() => setLoading(false));
  }, []);

  // Mobile fallback
  if (isMobile) {
    return (
      <div className="min-h-screen pt-16 bg-gray-950">
        <Navbar />
        <div className="px-4 py-10 mx-auto max-w-7xl">
          <div className="p-6 mb-8 text-center card">
            <span className="block mb-3 text-4xl">📱</span>
            <h2 className="mb-2 text-xl font-bold text-white">
              Galeri Mode Mobile
            </h2>
            <p className="text-sm text-white/50">
              Pameran 3D tersedia di desktop. Di bawah ini tampilan galeri untuk
              perangkat mobile.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {artworks.map((a) => (
              <ArtworkCard key={a.id} artwork={a} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Desktop entry screen
  if (!entered) {
    return (
      <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden bg-gray-950">
        <Navbar />
        {/* Background animation */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-primary-400 opacity-60 animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
              }}
            />
          ))}
        </div>

        <div className="relative max-w-lg px-4 text-center">
          <div className="flex items-center justify-center w-24 h-24 mx-auto mb-6 border-2 bg-primary-600/20 border-primary-500/50 rounded-2xl">
            <span className="text-5xl">🏛️</span>
          </div>
          <h1 className="mb-3 text-4xl font-bold text-white">
            Pameran Virtual 3D
          </h1>
          <p className="mb-4 text-white/60">
            Jelajahi galeri imersif dengan kontrol WASD. Klik karya untuk
            melihat detail dan berinteraksi.
          </p>

          <div className="p-4 mb-8 space-y-2 text-sm text-left card text-white/50">
            <div className="flex items-center gap-2">
              <kbd className="bg-white/10 px-2 py-0.5 rounded text-xs font-mono">
                W A S D
              </kbd>{" "}
              Bergerak
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base">🖱️</span> Drag mouse untuk memutar
              kamera
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base">🖱️</span> Klik karya untuk melihat
              detail
            </div>
            <div className="flex items-center gap-2">
              <kbd className="bg-white/10 px-2 py-0.5 rounded text-xs font-mono">
                Shift
              </kbd>{" "}
              Lari lebih cepat
            </div>
          </div>

          <button
            onClick={() => setEntered(true)}
            disabled={loading}
            className="w-full px-10 py-3 text-base btn-primary"
          >
            {loading ? "Memuat karya..." : "🚀 Masuk ke Pameran"}
          </button>
          <Link
            to="/gallery"
            className="block mt-4 text-sm transition-colors text-white/40 hover:text-white/70"
          >
            Atau lihat galeri biasa →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-950">
      {/* Exit button */}
      <div className="absolute z-30 flex gap-2 top-4 left-4">
        <button
          onClick={() => setEntered(false)}
          className="px-4 py-2 text-sm text-white transition-all border bg-black/60 backdrop-blur-sm rounded-xl border-white/20 hover:bg-white/20"
        >
          ← Keluar
        </button>
        <Link
          to="/gallery"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 text-sm text-white transition-all border bg-black/60 backdrop-blur-sm rounded-xl border-white/20 hover:bg-white/20"
        >
          🖼️ Galeri
        </Link>
      </div>

      {/* Artwork count */}
      <div className="absolute z-30 px-3 py-2 text-xs border top-4 right-4 bg-black/60 backdrop-blur-sm text-white/70 rounded-xl border-white/10">
        {artworks.length} karya dipamerkan
      </div>

      <VirtualRoom artworks={artworks} onArtworkClick={setSelected} />
      {selected && (
        <ArtworkPopup artwork={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
