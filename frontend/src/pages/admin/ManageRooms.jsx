import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/common/Navbar";
import api from "../../api/axios";
import toast from "react-hot-toast";

const API_URL = "http://localhost:8000";
const FRAME_OPTIONS = Array.from({ length: 27 }, (_, i) => i + 1);

export default function ManageRooms() {
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    api
      .get("/admin/artworks?status=verified&per_page=50")
      .then(({ data }) => setArtworks(data.data || []))
      .finally(() => setLoading(false));
  }, []);
  // Perubahan menghapus posisi karya padahal telah diterapkan di asset 3D
  // Mengapplykan karya ke frame 3D
  const saveFrame = async (id, frame) => {
    setSaving(id);
    try {
      await api.put(`/admin/artworks/${id}/position`, {
        posisi_3d: { frame },
      });
      setArtworks((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, posisi_3d: { frame } } : a,
        ),
      );
      toast.success(`Karya berhasil ditempatkan ke Frame ${frame}.`);
      setEditId(null);
    } catch {
      toast.error("Gagal menempatkan karya ke frame 3D.");
    } finally {
      setSaving(null);
    }
  };

    const removeFrame = async (id, frame) => {
  setSaving(id);

  try {
    await api.put(`/admin/artworks/${id}/position`, {
      posisi_3d: null,
    });

    setArtworks((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, posisi_3d: null }
          : a
      )
    );

    toast.success("Karya dilepas dari frame.");
    setEditId(null);
  } catch {
    toast.error("Gagal melepas karya dari frame.");
  } finally {
    setSaving(null);
  }
};
 
  return (
    <div className="min-h-screen bg-gray-950 pt-16">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/admin" className="text-white/40 hover:text-white text-sm">
            ← Admin Panel
          </Link>
          <h1 className="text-2xl font-bold text-white">Atur Ruang 3D</h1>
        </div>

        <div className="card p-4 mb-6 flex gap-3 bg-blue-900/20 border-blue-500/30">
          <span className="text-xl shrink-0">ℹ️</span>
          <div className="text-sm text-blue-300">
            <p className="font-medium mb-1">Pilih nomor frame untuk setiap karya:</p>
            <p className="text-blue-300/70">
              Setiap angka akan menempatkan karya ke objek <strong>Frame_#</strong> di ruangan 3D.
              Pilih 1–27 sesuai slot yang tersedia.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="card h-20 animate-pulse" />
            ))}
          </div>
        ) : artworks.length === 0 ? (
          <div className="card p-12 text-center">
            <span className="text-4xl mb-3 block">🏛️</span>
            <p className="text-white/50 mb-2">Belum ada karya terverifikasi</p>
            <Link
              to="/admin/artworks?status=pending"
              className="btn-primary text-sm"
            >
              Verifikasi Karya
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {artworks.map((a) => (
              <div key={a.id} className="card overflow-hidden">
                <div className="p-4 flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gray-900 rounded-xl overflow-hidden shrink-0">
                      {a.thumbnail || a.tipe === "image" ? (
                        <img
                          src={`${API_URL}/${a.thumbnail || a.file_path}`}
                          alt={a.judul}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">
                          {a.tipe === "video" ? "🎬" : "🎲"}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate">{a.judul}</p>
                      <p className="text-xs text-white/40">
                        {a.user?.name} · {a.program_studi?.nama_prodi}
                      </p>
                      {a.posisi_3d?.frame ? (
                        <p className="text-xs text-green-400 mt-0.5">
                          📍 Frame {a.posisi_3d.frame}
                        </p>
                      ) : (
                        <p className="text-xs text-yellow-400/70 mt-0.5">
                          ⚠️ Belum dipilih frame 3D
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditId(editId === a.id ? null : a.id)}
                        className={`text-sm px-4 py-2 rounded-lg transition-all ${
                          editId === a.id
                          ? "bg-white/20 text-white"
                          : "btn-secondary"
                        }`}
                        >
                        {editId === a.id
                          ? "Tutup"
                          : a.posisi_3d?.frame
                          ? "Ubah Frame"
                          : "➕ Pilih Frame"}
                      </button>
                          {a.posisi_3d?.frame && (
                            <button
                              onClick={() => removeFrame(a.id)}
                              className="text-sm px-4 py-2 rounded-lg transition-all bg-red-600 text-white hover:bg-red-700"
                            >
                              ❌ Lepas dari Frame
                            </button>
                          )}
                    </div>
                    
                  </div>

                  {editId === a.id && (
                    <div className="border-t border-white/10 p-5 bg-white/[0.02]">
                      
                      <p className="text-xs font-medium text-white/50 mb-3">
                        Pilih slot frame 1–27:
                      </p>
                      <div className="grid grid-cols-4 md:grid-cols-7 gap-2 mb-4">
                        {FRAME_OPTIONS.map((frame) => (
                          <button
                            key={frame}
                            disabled={saving === a.id}
                            onClick={() => saveFrame(a.id, frame)}
                            className={`text-sm rounded-lg py-2 transition-all border ${
                              a.posisi_3d?.frame === frame
                                ? "bg-primary-600 border-primary-400 text-white"
                                : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
                            } ${saving === a.id ? "cursor-wait opacity-60" : ""}`}
                          >
                            {frame}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => setEditId(null)}
                        className="btn-secondary text-sm py-2 w-full"
                      >
                        Batal
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
