import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import useAuthStore from "../store/authStore";
import toast from "react-hot-toast";

export default function Register() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [prodis, setProdis] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    role: "pengunjung",
    nim: "",
    id_prodi: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/program-studi").then(({ data }) => setProdis(data));
  }, []);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      const { data } = await api.post("/register", form);
      setAuth(data.user, data.token);
      toast.success("Registrasi berhasil!");
      navigate("/");
    } catch (err) {
      if (err.response?.data?.errors) setErrors(err.response.data.errors);
      else toast.error(err.response?.data?.message || "Registrasi gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-10">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white font-bold">
              VE
            </div>
            <span className="text-xl font-bold text-white">
              Virtual Exhibition
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-white mt-6 mb-1">
            Buat Akun Baru
          </h1>
          <p className="text-white/50 text-sm">
            Bergabunglah dengan komunitas kami
          </p>
        </div>

        {/* Back link */}
        <p className="text-left text-sm text-white/50 mt-5 mb-4">
          <Link
            to="/"
            className="text-primary-400 hover:text-primary-300 font-medium"
          >
            {" "}
            ← Kembali
          </Link>
        </p>

        <div className="card p-8">
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="label">Nama Lengkap</label>
              <input
                name="name"
                value={form.name}
                onChange={handle}
                className="input"
                placeholder="Nama lengkap"
                required
              />
              {errors.name && (
                <p className="text-red-400 text-xs mt-1">{errors.name[0]}</p>
              )}
            </div>

            <div>
              <label className="label">Email</label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handle}
                className="input"
                placeholder="email@contoh.com"
                required
              />
              {errors.email && (
                <p className="text-red-400 text-xs mt-1">{errors.email[0]}</p>
              )}
            </div>

            <div>
              <label className="label">Daftar Sebagai</label>
              <select
                name="role"
                value={form.role}
                onChange={handle}
                className="input"
              >
                <option value="pengunjung" className="text-black">
                  Pengunjung
                </option>
                <option value="mahasiswa" className="text-black">
                  Mahasiswa
                </option>
              </select>
            </div>

            {form.role === "mahasiswa" && (
              <>
                <div>
                  <label className="label">NIM</label>
                  <input
                    name="nim"
                    value={form.nim}
                    onChange={handle}
                    className="input"
                    placeholder="Nomor Induk Mahasiswa"
                  />
                  {errors.nim && (
                    <p className="text-red-400 text-xs mt-1">{errors.nim[0]}</p>
                  )}
                </div>
                <div>
                  <label className="label">Program Studi</label>
                  <select
                    name="id_prodi"
                    value={form.id_prodi}
                    onChange={handle}
                    className="input"
                  >
                    <option value="" className="text-black ">
                      - Pilih Program Studi -
                    </option>
                    {prodis.map((p) => (
                      <option
                        className="text-black"
                        key={p.id_prodi}
                        value={p.id_prodi}
                      >
                        {p.nama_prodi} ({p.jenjang})
                      </option>
                    ))}
                  </select>
                  {errors.id_prodi && (
                    <p className="text-red-400 text-xs mt-1">
                      {errors.id_prodi[0]}
                    </p>
                  )}
                </div>
              </>
            )}

            <div>
              <label className="label">Password</label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handle}
                className="input"
                placeholder="Min. 8 karakter"
                required
              />
              {errors.password && (
                <p className="text-red-400 text-xs mt-1">
                  {errors.password[0]}
                </p>
              )}
            </div>

            <div>
              <label className="label">Konfirmasi Password</label>
              <input
                name="password_confirmation"
                type="password"
                value={form.password_confirmation}
                onChange={handle}
                className="input"
                placeholder="Ulangi password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3"
            >
              {loading ? "Memproses..." : "Daftar Sekarang"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-white/50 mt-6">
          Sudah punya akun?{" "}
          <Link
            to="/login"
            className="text-primary-400 hover:text-primary-300 font-medium"
          >
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  );
}
