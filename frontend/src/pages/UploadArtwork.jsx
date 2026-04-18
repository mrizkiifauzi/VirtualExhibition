import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import useAuthStore from "../store/authStore";
import api from "../api/axios";
import toast from "react-hot-toast";

export default function UploadArtwork() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [prodis, setProdis] = useState([]);
  const [form, setForm] = useState({
    judul: "",
    deskripsi: "",
    tipe: "image",
    id_prodi: user?.id_prodi || "",
  });
  const [file, setFile] = useState(null);
  const [thumb, setThumb] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [thumbPreview, setThumbPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  // Separate refs for each file input — NO absolute positioning
  const fileInputRef = useRef(null);
  const thumbInputRef = useRef(null);

  useEffect(() => {
    api.get("/program-studi").then(({ data }) => setProdis(data));
  }, []);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const f = e.dataTransfer.files[0];
    if (!f) return;

    setFile(f);

    if (f.type.startsWith("image/")) {
      setFilePreview(URL.createObjectURL(f));
    } else {
      setFilePreview(null);
    }
  };

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    if (f.type.startsWith("image/")) setFilePreview(URL.createObjectURL(f));
    else setFilePreview(null);
  };

  const handleThumb = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setThumb(f);
    setThumbPreview(URL.createObjectURL(f));
  };

  const changeTipe = (t) => {
    setForm({ ...form, tipe: t });
    setFile(null);
    setFilePreview(null);
    // Reset file input value so same file can be re-selected after type switch
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const accept = {
    image: ".jpg,.jpeg,.png",
    video: ".mp4",
    "3d": ".glb,.gltf",
  };
  const tipeIcon = { image: "🖼️", video: "🎬", "3d": "🎲" };

  const submit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error("Pilih file karya terlebih dahulu!");
      return;
    }
    setErrors({});
    setLoading(true);
    setProgress(0);

    const fd = new FormData();
    fd.append("judul", form.judul);
    fd.append("deskripsi", form.deskripsi);
    fd.append("tipe", form.tipe);
    fd.append("id_prodi", form.id_prodi || "");
    fd.append("file", file);
    if (thumb) fd.append("thumbnail", thumb);

    try {
      await api.post("/artworks", fd, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (ev) =>
          setProgress(Math.round((ev.loaded / ev.total) * 100)),
      });
      toast.success("Karya berhasil diupload! Menunggu verifikasi admin.");
      navigate("/dashboard");
    } catch (err) {
      if (err.response?.data?.errors) setErrors(err.response.data.errors);
      else toast.error(err.response?.data?.message || "Gagal upload karya");
      setProgress(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 pt-16">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Upload Karya</h1>
          <p className="text-white/50 mt-1">
            Karya akan diverifikasi admin sebelum ditampilkan
          </p>
        </div>

        <div className="card p-8">
          <form onSubmit={submit} className="space-y-5">
            {/* ── Tipe ── */}
            <div>
              <label className="label">Tipe Karya</label>
              <div className="grid grid-cols-3 gap-3">
                {["image", "video", "3d"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => changeTipe(t)}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      form.tipe === t
                        ? "border-primary-500 bg-primary-900/30 text-white"
                        : "border-white/10 bg-white/5 text-white/50 hover:border-white/30"
                    }`}
                  >
                    <div className="text-2xl mb-1">{tipeIcon[t]}</div>
                    <div className="text-xs font-medium capitalize">
                      {t === "3d" ? "3D Model" : t}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* ── Judul ── */}
            <div>
              <label className="label">Judul Karya</label>
              <input
                value={form.judul}
                onChange={(e) => setForm({ ...form, judul: e.target.value })}
                className="input"
                placeholder="Judul karya Anda"
                required
              />
              {errors.judul && (
                <p className="text-red-400 text-xs mt-1">{errors.judul[0]}</p>
              )}
            </div>

            {/* ── Deskripsi ── */}
            <div>
              <label className="label">Deskripsi</label>
              <textarea
                value={form.deskripsi}
                onChange={(e) =>
                  setForm({ ...form, deskripsi: e.target.value })
                }
                className="input min-h-[100px] resize-none"
                placeholder="Ceritakan tentang karya Anda..."
              />
            </div>

            {/* ── Program Studi ── */}
            <div>
              <label className="label">Program Studi</label>
              <select
                value={form.id_prodi}
                onChange={(e) => setForm({ ...form, id_prodi: e.target.value })}
                className="input"
              >
                <option value="">Pilih Program Studi</option>
                {prodis.map((p) => (
                  <option key={p.id_prodi} value={p.id_prodi}>
                    {p.nama_prodi}
                  </option>
                ))}
              </select>
            </div>

            {/* ── File Upload ──
                  FIXED: input is hidden via ref, NOT via absolute positioning.
                  The dashed dropzone is purely visual — clicking it does NOT
                  trigger file picker. Only the "Pilih File" button triggers it.
            */}
            <div>
              <label className="label">File Karya</label>

              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
                  dragActive
                    ? "border-primary-500 bg-primary-900/30"
                    : "border-white/20"
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={accept[form.tipe]}
                  onChange={handleFile}
                  className="hidden"
                />

                {filePreview ? (
                  <div className="space-y-3">
                    <img
                      src={filePreview}
                      alt="Preview"
                      className="max-h-48 mx-auto rounded-lg"
                    />
                    <p className="text-xs text-white/50">{file?.name}</p>
                  </div>
                ) : file ? (
                  <div>
                    <p className="text-white">{file.name}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <span className="text-4xl">📁</span>
                    <p className="text-white/50">Drag & drop file di sini</p>
                    <p className="text-xs text-white/30">
                      atau klik untuk memilih file
                    </p>
                    <p className="text-xs text-white/30">
                      {accept[form.tipe]} · Max 100MB
                    </p>
                  </div>
                )}

                {/* Button triggers file input via ref */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-4 btn-secondary text-sm py-1.5 px-5"
                >
                  {file ? "Ganti File" : "Pilih File"}
                </button>
              </div>

              {/* Hidden file input — controlled by ref only */}
              <input
                ref={fileInputRef}
                type="file"
                accept={accept[form.tipe]}
                onChange={handleFile}
                className="hidden"
              />

              {errors.file && (
                <p className="text-red-400 text-xs mt-1">{errors.file[0]}</p>
              )}
            </div>

            {/* ── Thumbnail (video / 3d only) ── */}
            {(form.tipe === "video" || form.tipe === "3d") && (
              <div>
                <label className="label">Thumbnail (Opsional)</label>

                {/* Hidden thumbnail input — controlled by ref only */}
                <input
                  ref={thumbInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  onChange={handleThumb}
                  className="hidden"
                />

                <div className="flex items-center gap-4">
                  {thumbPreview && (
                    <img
                      src={thumbPreview}
                      alt="Thumbnail"
                      className="w-20 h-20 object-cover rounded-xl"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => thumbInputRef.current?.click()}
                    className="btn-secondary text-sm py-2 px-4"
                  >
                    {thumb ? "Ganti Thumbnail" : "Pilih Thumbnail"}
                  </button>
                </div>
              </div>
            )}

            {/* ── Upload progress ── */}
            {loading && progress > 0 && (
              <div>
                <div className="flex justify-between text-xs text-white/50 mb-1">
                  <span>Mengupload...</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div
                    className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* ── Info ── */}
            <div className="p-3 bg-blue-900/20 border border-blue-500/20 rounded-xl text-xs text-blue-300">
              📋 Karya Anda akan direview oleh admin sebelum ditampilkan di
              galeri. Proses biasanya 1-2 hari kerja.
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3"
            >
              {loading ? `Mengupload... ${progress}%` : "📤 Upload Karya"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
