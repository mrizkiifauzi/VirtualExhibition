import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import useAuthStore from "../store/authStore";
import toast from "react-hot-toast";
import Navbar from "../components/common/Navbar";

export default function Login() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      const { data } = await api.post("/login", form);
      setAuth(data.user, data.token);
      toast.success(`Selamat datang, ${data.user.name}!`);
      if (data.user.role === "admin") navigate("/admin");
      else navigate("/");
    } catch (err) {
      if (err.response?.data?.errors) setErrors(err.response.data.errors);
      else toast.error(err.response?.data?.message || "Login gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
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
            Masuk ke Akun
          </h1>
          <p className="text-white/50 text-sm">Selamat datang kembali!</p>
        </div>

        {/* Back link */}
        <p className="text-left text-sm text-white/50 mt-5 mb-4">
          <Link
            to="/"
            className="text-primary-400 hover:text-primary-300 font-medium"
          >
            ← Kembali
          </Link>
        </p>

        <div className="card p-8">
          <form onSubmit={submit} className="space-y-4">
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
              <label className="label">Password</label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handle}
                className="input "
                placeholder="••••••••"
                required
              />
              {errors.password && (
                <p className="text-red-400 text-xs mt-1">
                  {errors.password[0]}
                </p>
              )}
            </div>

            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-sm text-primary-400 hover:text-primary-300"
              >
                Lupa password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3"
            >
              {loading ? "Memproses..." : "Masuk"}
            </button>
          </form>

          {/* Divider */}
          {/* <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-900 text-white/50">atau</span>
            </div>
          </div> */}

          {/* Google Login Button */}
          {/* <button
            type="button"
            className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white hover:bg-gray-50 text-gray-900 font-medium rounded-lg border border-gray-300 transition-all duration-200"
            onClick={() =>
              toast.info("Fitur login Google sedang dalam pengembangan")
            }
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Masuk dengan Google
          </button> */}

          {/* Demo accounts */}
          <div className="mt-5 p-3 bg-primary-900/20 border border-primary-500/20 rounded-xl text-xs text-white/50 space-y-1">
            <p className="font-medium text-primary-400 mb-2">Akun Demo:</p>
            <p>Admin: admin@exhibition.id / admin123</p>
            <p>Mahasiswa: mahasiswa@exhibition.id / password123</p>
            <p>Pengunjung: pengunjung@exhibition.id / password123</p>
          </div>
        </div>

        <p className="text-center text-sm text-white/50 mt-6">
          Belum punya akun?{" "}
          <Link
            to="/register"
            className="text-primary-400 hover:text-primary-300 font-medium"
          >
            Daftar sekarang
          </Link>
        </p>
      </div>
    </div>
  );
}
