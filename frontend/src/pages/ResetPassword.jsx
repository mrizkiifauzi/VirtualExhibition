import { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [tokenStatus, setTokenStatus] = useState("checking"); // 'checking' | 'valid' | 'invalid'
  const [tokenMessage, setTokenMessage] = useState("");

  const [form, setForm] = useState({ password: "", password_confirmation: "" });
  const [showPass, setShowPass] = useState({ password: false, confirm: false });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // ── Validasi token saat halaman dibuka ──────────────────────────────────────
  useEffect(() => {
    if (!token || !email) {
      setTokenStatus("invalid");
      setTokenMessage(
        "Link tidak valid. Parameter token atau email tidak ditemukan.",
      );
      return;
    }

    api
      .post("/reset-password/check", { token, email })
      .then(({ data }) => {
        if (data.valid) {
          setTokenStatus("valid");
        } else {
          setTokenStatus("invalid");
          setTokenMessage(data.message || "Token tidak valid.");
        }
      })
      .catch(() => {
        setTokenStatus("invalid");
        setTokenMessage("Gagal memvalidasi link. Coba minta link baru.");
      });
  }, [token, email]);

  const handle = useCallback(
    (e) => {
      setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
      if (errors[e.target.name]) {
        setErrors((prev) => ({ ...prev, [e.target.name]: null }));
      }
    },
    [errors],
  );

  // Kekuatan password
  const passwordStrength = getPasswordStrength(form.password);
  const passwordMatch = form.password_confirmation
    ? form.password === form.password_confirmation
    : null;

  const submit = async (e) => {
    e.preventDefault();
    if (passwordMatch === false) {
      setErrors({
        password_confirmation: ["Konfirmasi password tidak cocok."],
      });
      return;
    }
    setErrors({});
    setLoading(true);

    try {
      const { data } = await api.post("/reset-password", {
        token,
        email,
        password: form.password,
        password_confirmation: form.password_confirmation,
      });
      toast.success(data.message || "Password berhasil diubah!");
      setSuccess(true);
      // Auto-redirect ke login setelah 3 detik
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      const d = err.response?.data;
      if (d?.errors) {
        setErrors(d.errors);
      } else {
        toast.error(
          d?.message || "Gagal reset password. Coba minta link baru.",
        );
        // Jika token kedaluwarsa, tandai invalid
        if (err.response?.status === 422) {
          setTokenStatus("invalid");
          setTokenMessage(d?.message || "Token kedaluwarsa.");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Halaman loading validasi token ─────────────────────────────────────────
  if (tokenStatus === "checking") {
    return (
      <CenteredLayout>
        <div className="card p-10 text-center">
          <div className="w-12 h-12 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60 text-sm">
            Memvalidasi link reset password...
          </p>
        </div>
      </CenteredLayout>
    );
  }

  // ── Token tidak valid / kedaluwarsa ────────────────────────────────────────
  if (tokenStatus === "invalid") {
    return (
      <CenteredLayout>
        <div className="card p-8 text-center">
          <div className="w-16 h-16 bg-red-500/15 border border-red-500/30 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <span className="text-3xl">🔗</span>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">
            Link Tidak Valid
          </h2>
          <p className="text-white/50 text-sm mb-6 leading-relaxed">
            {tokenMessage ||
              "Link reset password ini sudah kedaluwarsa atau tidak valid."}
          </p>
          <div className="space-y-3">
            <Link
              to="/forgot-password"
              className="btn-primary w-full block text-center py-3"
            >
              🔄 Minta Link Baru
            </Link>
            <Link
              to="/login"
              className="btn-secondary w-full block text-center py-2.5"
            >
              ← Kembali ke Login
            </Link>
          </div>
        </div>
      </CenteredLayout>
    );
  }

  // ── Reset berhasil ─────────────────────────────────────────────────────────
  if (success) {
    return (
      <CenteredLayout>
        <div className="card p-8 text-center">
          <div className="w-16 h-16 bg-green-500/15 border border-green-500/30 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <span className="text-4xl">✅</span>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">
            Password Berhasil Diubah!
          </h2>
          <p className="text-white/50 text-sm mb-2">
            Password akun <span className="text-primary-400">{email}</span>{" "}
            telah diperbarui.
          </p>
          <p className="text-white/30 text-xs mb-6">
            Mengalihkan ke halaman login dalam 3 detik...
          </p>
          <Link
            to="/login"
            className="btn-primary w-full block text-center py-3"
          >
            Masuk Sekarang →
          </Link>
        </div>
      </CenteredLayout>
    );
  }

  // ── Form ganti password ────────────────────────────────────────────────────
  return (
    <CenteredLayout>
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-primary-600/20 border border-primary-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">🔑</span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-1">
          Buat Password Baru
        </h1>
        <p className="text-white/50 text-sm">
          Untuk akun: <span className="text-primary-400">{email}</span>
        </p>
      </div>

      <div className="card p-8">
        <form onSubmit={submit} className="space-y-5">
          {/* Password baru */}
          <div>
            <label className="label">Password Baru</label>
            <div className="relative">
              <input
                name="password"
                type={showPass.password ? "text" : "password"}
                value={form.password}
                onChange={handle}
                className={`input pr-10 ${errors.password ? "border-red-500/60" : ""}`}
                placeholder="Min. 8 karakter"
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                onClick={() =>
                  setShowPass((p) => ({ ...p, password: !p.password }))
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
              >
                {showPass.password ? "🙈" : "👁️"}
              </button>
            </div>

            {/* Password strength meter */}
            {form.password && (
              <div className="mt-2 space-y-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                        i <= passwordStrength.score
                          ? passwordStrength.color
                          : "bg-white/10"
                      }`}
                    />
                  ))}
                </div>
                <p className={`text-xs ${passwordStrength.textColor}`}>
                  {passwordStrength.label}
                </p>
              </div>
            )}

            {errors.password && (
              <p className="text-red-400 text-xs mt-1">
                ⚠️ {errors.password[0]}
              </p>
            )}
          </div>

          {/* Konfirmasi password */}
          <div>
            <label className="label">Konfirmasi Password Baru</label>
            <div className="relative">
              <input
                name="password_confirmation"
                type={showPass.confirm ? "text" : "password"}
                value={form.password_confirmation}
                onChange={handle}
                className={`input pr-10 ${
                  passwordMatch === false
                    ? "border-red-500/60"
                    : passwordMatch === true
                      ? "border-green-500/60"
                      : ""
                }`}
                placeholder="Ulangi password baru"
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                onClick={() =>
                  setShowPass((p) => ({ ...p, confirm: !p.confirm }))
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
              >
                {showPass.confirm ? "🙈" : "👁️"}
              </button>
            </div>

            {passwordMatch === true && (
              <p className="text-green-400 text-xs mt-1">✓ Password cocok</p>
            )}
            {passwordMatch === false && (
              <p className="text-red-400 text-xs mt-1">
                ⚠️ Password tidak cocok
              </p>
            )}
            {errors.password_confirmation && (
              <p className="text-red-400 text-xs mt-1">
                ⚠️ {errors.password_confirmation[0]}
              </p>
            )}
          </div>

          {/* Rules reminder */}
          <div className="p-3 bg-white/5 rounded-xl text-xs text-white/40 space-y-1">
            <p className={form.password.length >= 8 ? "text-green-400" : ""}>
              {form.password.length >= 8 ? "✓" : "○"} Minimal 8 karakter
            </p>
            <p className={/[A-Z]/.test(form.password) ? "text-green-400" : ""}>
              {/[A-Z]/.test(form.password) ? "✓" : "○"} Mengandung huruf kapital
            </p>
            <p className={/[0-9]/.test(form.password) ? "text-green-400" : ""}>
              {/[0-9]/.test(form.password) ? "✓" : "○"} Mengandung angka
            </p>
          </div>

          <button
            type="submit"
            disabled={
              loading || passwordStrength.score < 2 || passwordMatch === false
            }
            className="btn-primary w-full py-3 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Memproses...
              </>
            ) : (
              "🔐 Simpan Password Baru"
            )}
          </button>
        </form>
      </div>

      <p className="text-center text-sm text-white/40 mt-6">
        <Link
          to="/login"
          className="text-primary-400 hover:text-primary-300 transition-colors"
        >
          ← Kembali ke Login
        </Link>
      </p>
    </CenteredLayout>
  );
}

// ── Layout wrapper ─────────────────────────────────────────────────────────
function CenteredLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl" />
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
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Helper: hitung kekuatan password ──────────────────────────────────────
function getPasswordStrength(password) {
  if (!password) return { score: 0, label: "", color: "", textColor: "" };

  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const levels = [
    {
      score: 1,
      label: "Lemah",
      color: "bg-red-500",
      textColor: "text-red-400",
    },
    {
      score: 2,
      label: "Cukup",
      color: "bg-amber-500",
      textColor: "text-amber-400",
    },
    {
      score: 3,
      label: "Kuat",
      color: "bg-blue-500",
      textColor: "text-blue-400",
    },
    {
      score: 4,
      label: "Sangat Kuat",
      color: "bg-green-500",
      textColor: "text-green-400",
    },
  ];

  return { score, ...(levels[score - 1] || levels[0]) };
}
