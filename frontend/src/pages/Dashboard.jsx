import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import ArtworkCard from "../components/artwork/ArtworkCard";
import useAuthStore from "../store/authStore";
import api from "../api/axios";
import toast from "react-hot-toast";

const API_URL = "http://localhost:8000";

function StatusBadge({ status }) {
  const map = {
    pending: "badge-pending",
    verified: "badge-verified",
    rejected: "badge-rejected",
  };
  const label = {
    pending: "Menunggu",
    verified: "Terverifikasi",
    rejected: "Ditolak",
  };
  return <span className={map[status]}>{label[status]}</span>;
}

export default function Dashboard() {
  const { user } = useAuthStore();
  const [myArtworks, setMyArtworks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== "mahasiswa") {
      setLoading(false);
      return;
    }
    api
      .get("/artworks?my=1&per_page=20")
      .then(({ data }) => setMyArtworks(data.data || []))
      .finally(() => setLoading(false));
  }, [user]);

  const handleDelete = async (id) => {
    if (!confirm("Hapus karya ini?")) return;
    try {
      await api.delete(`/artworks/${id}`);
      setMyArtworks((prev) => prev.filter((a) => a.id !== id));
      toast.success("Karya dihapus");
    } catch {
      toast.error("Gagal menghapus karya");
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 pt-16">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <p className="text-white/50 mt-1">Selamat datang, {user?.name}!</p>
          </div>
          {user?.role === "mahasiswa" && (
            <Link to="/upload" className="btn-primary flex items-center gap-2">
              <span>+</span> Upload Karya
            </Link>
          )}
        </div>

        {/* Profile quick summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {/* Profile card */}
          <div className="card p-5 col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center text-2xl font-bold text-white">
                {user?.foto_profil ? (
                  <img
                    src={`${API_URL}/${user.foto_profil}`}
                    alt={user?.name || "Avatar"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  user?.name?.charAt(0).toUpperCase() || "?"
                )}
              </div>
              <div>
                <p className="font-semibold text-white">{user?.name}</p>
                <p className="text-xs text-white/40">{user?.email}</p>
                <span className="text-xs bg-primary-900/50 text-primary-300 px-2 py-0.5 rounded-full capitalize mt-1 inline-block">
                  {user?.role}
                </span>
              </div>
            </div>
            {user?.nim && (
              <p className="text-xs text-white/40">NIM: {user.nim}</p>
            )}
            {user?.program_studi && (
              <p className="text-xs text-primary-400 mt-1">
                {user.program_studi.nama_prodi}
              </p>
            )}
            <Link
              to="/profile"
              className="btn-secondary w-full text-center text-sm py-2 mt-4 block"
            >
              Edit Profil & Password
            </Link>
          </div>

          {/* Stats (mahasiswa only) */}
          {user?.role === "mahasiswa" && (
            <>
              <div className="card p-5 flex flex-col items-center justify-center text-center">
                <span className="text-4xl font-bold text-primary-400">
                  {myArtworks.length}
                </span>
                <span className="text-sm text-white/50 mt-1">Total Karya</span>
              </div>
              <div className="card p-5 flex flex-col items-center justify-center text-center">
                <span className="text-4xl font-bold text-green-400">
                  {myArtworks.filter((a) => a.status === "verified").length}
                </span>
                <span className="text-sm text-white/50 mt-1">
                  Karya Terverifikasi
                </span>
              </div>
            </>
          )}

          {user?.role === "pengunjung" && (
            <div className="card p-5 col-span-2 flex flex-col items-center justify-center text-center gap-3">
              <span className="text-4xl">🎓</span>
              <p className="text-white/70 text-sm">
                Daftar sebagai mahasiswa untuk bisa mengupload karya!
              </p>
              <Link to="/register" className="btn-primary text-sm px-6 py-2">
                Daftar Sebagai Mahasiswa
              </Link>
            </div>
          )}
        </div>

        {/* My Artworks */}
        {user?.role === "mahasiswa" && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-white">Karya Saya</h2>
              <Link
                to="/upload"
                className="text-primary-400 text-sm hover:text-primary-300"
              >
                + Upload Baru
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="card aspect-[4/3] animate-pulse" />
                ))}
              </div>
            ) : myArtworks.length === 0 ? (
              <div className="card p-12 text-center">
                <span className="text-5xl mb-4 block">🖼️</span>
                <p className="text-white/50 mb-4">
                  Belum ada karya yang diupload
                </p>
                <Link to="/upload" className="btn-primary px-6">
                  Upload Karya Pertama
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {myArtworks.map((a) => (
                  <div key={a.id} className="card p-4 flex items-center gap-4">
                    {/* Thumbnail */}
                    <div className="w-16 h-16 bg-gray-900 rounded-xl overflow-hidden shrink-0">
                      {a.thumbnail || a.tipe === "image" ? (
                        <img
                          src={`${API_URL}/${a.thumbnail || a.file_path}`}
                          alt={a.judul}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl">
                          {a.tipe === "video" ? "🎬" : "🎲"}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-white truncate">
                          {a.judul}
                        </p>
                        <StatusBadge status={a.status} />
                      </div>
                      {a.status === "pending" && (
                        <p className="text-xs text-yellow-400/70 mb-2">
                          ⏳ Menunggu verifikasi
                        </p>
                      )}
                      <p className="text-xs text-white/40">
                        {new Date(a.created_at).toLocaleDateString("id-ID")} ·
                        ❤️ {a.likes_count || 0} · ⭐{" "}
                        {a.ratings_avg_nilai
                          ? Number(a.ratings_avg_nilai).toFixed(1)
                          : "—"}{" "}
                        · 💬 {a.comments_count || 0}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        to={`/artworks/${a.id}`}
                        className="btn-secondary text-xs py-1.5 px-3"
                      >
                        Lihat
                      </Link>
                      <button
                        onClick={() => handleDelete(a.id)}
                        className="btn-danger text-xs py-1.5 px-3"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


