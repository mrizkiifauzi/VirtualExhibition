import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import ArtworkCard from "../components/artwork/ArtworkCard";
import api from "../api/axios";

export default function Gallery() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [artworks, setArtworks] = useState([]);
  const [prodis, setProdis] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);

  const search = searchParams.get("search") || "";
  const id_prodi = searchParams.get("id_prodi") || "";
  const tipe = searchParams.get("tipe") || "";
  const tahun = searchParams.get("tahun") || "";
  const page = searchParams.get("page") || 1;

  useEffect(() => {
    api.get("/program-studi").then(({ data }) => setProdis(data));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (id_prodi) params.set("id_prodi", id_prodi);
    if (tipe) params.set("tipe", tipe);
    if (tahun) params.set("tahun", tahun);
    params.set("page", page);
    params.set("per_page", 12);

    api
      .get(`/artworks?${params}`)
      .then(({ data }) => {
        setArtworks(data.data || []);
        setMeta(data.meta || data);
      })
      .finally(() => setLoading(false));
  }, [search, id_prodi, tipe, tahun, page]);

  const setParam = (key, val) => {
    const p = new URLSearchParams(searchParams);
    if (val) p.set(key, val);
    else p.delete(key);
    p.delete("page");
    setSearchParams(p);
  };

  return (
    <div className="min-h-screen bg-gray-950 pt-16">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Header */} 
        <div className="mb-8">
           <h1 className="text-3xl font-bold text-white">Galeri Karya</h1>   {" "}
          <p className="text-white/50 mt-1">
            Temukan karya-karya inspiratif dari mahasiswa kami
          </p>
           
        </div>
        {/* Filters */} 
        <div className="card p-4 mb-8">
           
          <div className="flex flex-wrap gap-3 items-center">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
               
              <input
                type="text"
                placeholder="Cari judul karya..."
                defaultValue={search}
                className="input text-sm"
                onKeyDown={(e) =>
                  e.key === "Enter" && setParam("search", e.target.value)
                }
                onChange={(e) => !e.target.value && setParam("search", "")}
              />
            </div>
            {/* Prodi filter */}
            <select
              value={id_prodi}
              onChange={(e) => setParam("id_prodi", e.target.value)}
              className="input text-sm w-auto min-w-[180px]"
            >
              <option value="" className="text-black">
                Semua Jurusan
              </option>
              {prodis.map((p) => (
                <option
                  key={p.id_prodi}
                  value={p.id_prodi}
                  className="text-black"
                >
                  {p.nama_prodi}
                </option>
              ))}
            </select>
            {/* Type filter */}
            <select
              value={tipe}
              onChange={(e) => setParam("tipe", e.target.value)}
              className="input text-sm w-auto"
            >
              <option value="" className="text-black">
                Semua Tipe
              </option>
              <option value="image" className="text-black">
                🖼️ Gambar
              </option>
              <option value="video" className="text-black">
                🎬 Video
              </option>
              <option value="3d" className="text-black">
                🎲 3D Model
              </option>
            </select>
            {/* Year filter */}
            {/* <select
              value={tahun}
              onChange={(e) => setParam("tahun", e.target.value)}
              className="input text-sm w-auto min-w-[120px]"
            >
              <option value="" className="text-black">
                Semua Tahun
              </option>
              {Array.from(
                { length: new Date().getFullYear() - 2019 },
                (_, i) => 2020 + i,
              )
                .reverse()
                .map((year) => (
                  <option key={year} value={year} className="text-black">
                    {year}
                  </option>
                ))}
            </select> */}
            {/* Reset */}
            {(search || id_prodi || tipe || tahun) && (
              <button
                onClick={() => setSearchParams({})}
                className="btn-secondary text-sm py-2"
              >
                Reset Filter
              </button>
            )}
          </div>
        </div>
        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="card aspect-[4/3] animate-pulse" />
            ))}
          </div>
        ) : artworks.length === 0 ? (
          <div className="text-center py-20">
            <span className="text-5xl mb-4 block">🔍</span>
            <p className="text-white/50">
              {tahun
                ? "Karya tidak ditemukan di tahun tersebut"
                : "Tidak ada karya yang ditemukan"}
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-white/40 mb-4">
              {meta?.total || artworks.length} karya ditemukan
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {artworks.map((a) => (
                <ArtworkCard key={a.id} artwork={a} />
              ))}
            </div>
            {/* Pagination */}
            {meta?.last_page > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                {[...Array(meta.last_page)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setParam("page", i + 1)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                      meta.current_page === i + 1
                        ? "bg-primary-600 text-white"
                        : "bg-white/10 text-white/60 hover:bg-white/20"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
