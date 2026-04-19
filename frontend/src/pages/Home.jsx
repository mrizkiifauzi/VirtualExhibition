import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import ArtworkCard from "../components/artwork/ArtworkCard";
import api from "../api/axios";
import useAuthStore from "../store/authStore";

// const JURUSAN = [
//   {
//     icon: "💻",
//     color: "from-blue-900/50 to-indigo-900/50",
//     border: "border-blue-500/30",
//   },
//   {
//     icon: "📊",
//     color: "from-green-900/50 to-teal-900/50",
//     border: "border-green-500/30",
//   },
//   {
//     icon: "🎨",
//     color: "from-pink-900/50 to-rose-900/50",
//     border: "border-pink-500/30",
//   },
//   {
//     icon: "🏭",
//     color: "from-orange-900/50 to-amber-900/50",
//     border: "border-orange-500/30",
//   },
//   {
//     icon: "🎬",
//     color: "from-purple-900/50 to-violet-900/50",
//     border: "border-purple-500/30",
//   },
//   {
//     icon: "⚙️",
//     color: "from-cyan-900/50 to-sky-900/50",
//     border: "border-cyan-500/30",
//   },
// ];

export default function Home() {
  const [prodis, setProdis] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [artworksByProdi, setArtworksByProdi] = useState({});
  const [stats, setStats] = useState({ artworks: null, users: null });
  const [loading, setLoading] = useState(true);
  const { isLoggedIn, isMahasiswa, isAdmin } = useAuthStore();
  const useTypewriter = (text, speed = 50) => {
    const [displayText, setDisplayText] = useState("");

    useEffect(() => {
      let i = 0;
      const timer = setInterval(() => {
        setDisplayText(text.substring(0, i + 1));
        i++;
        if (i >= text.length) clearInterval(timer);
      }, speed);

      return () => clearInterval(timer);
    }, [text, speed]);

    return displayText;
  };
  const fullText =
    "Jelajahi karya terbaik mahasiswa dalam galeri virtual 3D yang imersif. Temukan, apresiasi, dan berinteraksi dengan karya seni dan teknologi.";
  const animatedText = useTypewriter(fullText, 40);

  useEffect(() => {
    Promise.all([
      api.get("/program-studi"),
      api.get("/artworks?sort=best&tipe=image&per_page=6"),
      api.get("/stats"),
    ])
      .then(([prodiRes, artRes, statsRes]) => {
        setProdis(prodiRes.data);
        setFeatured(artRes.data.data || []);
        setStats({
          artworks: statsRes.data.total_artworks ?? 0,
          users: statsRes.data.total_users ?? 0,
        });
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!prodis.length) return;
    prodis.forEach((p) => {
      api
        .get(`/artworks?id_prodi=${p.id_prodi}&per_page=4`)
        .then(({ data }) => {
          setArtworksByProdi((prev) => ({
            ...prev,
            [p.id_prodi]: data.data || [],
          }));
        });
    });
  }, [prodis]);

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-900/5 rounded-full blur-3xl" />
        </div>

        <div className="relative text-center px-4 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-primary-900/50 border border-primary-500/30 text-primary-300 text-sm px-4 py-2 rounded-full mb-6">
            <span className="w-2 h-2 bg-primary-400 rounded-full animate-pulse" />
            Platform Pameran Digital Mahasiswa
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-white mb-6 leading-tight text-ani">
            Virtual{" "}
            <span className="bg-clip-text bg-gradient-to-r from-primary-400 to-violet-400">
              Exhibition
            </span>
          </h1>

          {/* Animated description */}
          <p className="text-lg sm:text-xl text-white/60 mb-10 max-w-2xl mx-auto min-h-[3rem]">
            {animatedText}
            <span className="animate-pulse border-r-2 border-primary-600 ml-1"></span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/exhibition"
              className="btn-primary px-8 py-3 text-base inline-flex items-center gap-2"
            >
              <span>🏛️</span> Masuk Pameran 3D
            </Link>
            <Link
              to="/gallery"
              className="btn-secondary px-8 py-3 text-base inline-flex items-center gap-2"
            >
              <span>🖼️</span> Lihat Semua Karya
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-sm mx-auto">
            {[
              ["🎓", prodis.length, "Program Studi"],
              ["🖼️", stats.artworks ?? "...", "Karya"],
              ["👥", stats.users ?? "...", "Pengguna"],
            ].map(([icon, val, label]) => (
              <div key={label} className="text-center">
                <div className="text-2xl mb-1">{icon}</div>
                <div className="text-2xl font-bold text-primary-400">{val}</div>
                <div className="text-xs text-white/40">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30 animate-bounce">
          <span className="text-xs">Scroll</span>
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </section>

      {/* Featured Artworks */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-white">
                Karya Terbaik Mahasiswa
              </h2>
            </div>
            <Link
              to="/gallery"
              className="text-primary-400 hover:text-primary-300 text-sm font-medium"
            >
              Lihat Semua →
            </Link>
          </div>

          {/* {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="card aspect-[4/3] animate-pulse bg-white/5"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((a) => (
                <ArtworkCard key={a.id} artwork={a} />
              ))}
            </div>
          )} */}
        </div>
      </section>

      {/* Gallery per Jurusan */}
      {/* {prodis.map((prodi, idx) => {
        const config = JURUSAN[idx] || JURUSAN[0]
        const karya  = artworksByProdi[prodi.id_prodi] || []
        return (
          <section key={prodi.id_prodi} className="py-16 px-4">
            <div className="max-w-7xl mx-auto">
              <div className={`bg-gradient-to-r ${config.color} border ${config.border} rounded-2xl p-6 mb-8`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{config.icon}</span>
                    <div>
                      <h2 className="text-xl font-bold text-white">{prodi.nama_prodi}</h2>
                      <p className="text-sm text-white/50">{prodi.jenjang} · {prodi.artworks_count || 0} karya</p>
                    </div>
                  </div>
                  <Link
                    to={`/gallery?id_prodi=${prodi.id_prodi}`}
                    className="btn-secondary text-sm py-1.5 px-4"
                  >
                    Lihat Semua →
                  </Link>
                </div>
              </div>

              {karya.length === 0 ? (
                <div className="text-center text-white/30 py-10">Belum ada karya dari jurusan ini</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {karya.map(a => <ArtworkCard key={a.id} artwork={a} />)}
                </div>
              )}
            </div>
          </section>
        )
      })} */}

      {/* CTA */}
      {!isAdmin() && (
        <section className="py-20 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="card p-10">
              <span className="text-5xl mb-4 block">🚀</span>
              <h2 className="text-3xl font-bold text-white mb-3">
                Siap Showcase Karyamu?
              </h2>
              <p className="text-white/60 mb-8">
                {isMahasiswa()
                  ? "Upload karya terbaikmu untuk ditampilkan di galeri virtual kami."
                  : "Daftar sebagai mahasiswa dan upload karya terbaikmu untuk ditampilkan di galeri virtual kami."}
              </p>
              <div className="flex gap-4 justify-center">
                <Link
                  to={isMahasiswa() ? "/upload" : "/register"}
                  className="btn-primary px-6 py-2.5"
                >
                  {isMahasiswa() ? "Upload Karyamu Sekarang" : "Daftar Sekarang"}
                </Link>
                <Link to="/gallery" className="btn-secondary px-6 py-2.5">
                  Jelajahi Galeri
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 text-center text-white/30 text-sm">
        <p>
          © {new Date().getFullYear()} Virtual Exhibition — Showcase Karya
          Mahasiswa
        </p>
      </footer>
    </div>
  );
}
