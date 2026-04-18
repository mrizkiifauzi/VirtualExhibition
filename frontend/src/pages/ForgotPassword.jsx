import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";

// ── Langkah-langkah UI ────────────────────────────────────────────────────────
// Step 1: User isi form email + nama → klik "Kirim Link"
// Step 2: Tampilkan konfirmasi → arahkan buka Gmail

export default function ForgotPassword() {
  const [form, setForm] = useState({ email: "", name: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handle = useCallback(
    (e) => {
      setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
      // Hapus error field saat user mulai mengetik
      if (errors[e.target.name]) {
        setErrors((prev) => ({ ...prev, [e.target.name]: null }));
      }
    },
    [errors],
  );

  const submit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      await api.post("/forgot-password", {
        email: form.email.trim(),
        name: form.name.trim(),
      });
      setSent(true);
      toast.success("Link reset dikirim! Cek email kamu.");
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors) {
        setErrors(data.errors);
      } else {
        toast.error(data?.message || "Terjadi kesalahan. Coba lagi.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Deteksi provider email untuk tombol "Buka Gmail / Yahoo / dll"
  const emailDomain = form.email.split("@")[1] || "";
  const emailProvider = getEmailProvider(emailDomain);

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-12">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/3 w-64 h-64 bg-violet-600/8 rounded-full blur-3xl" />
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
        </div>

        {/* ── STEP 1: Form verifikasi ── */}
        {!sent ? (
          <>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-primary-600/20 border border-primary-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🔐</span>
              </div>
              <h1 className="text-2xl font-bold text-white mb-1">
                Lupa Password?
              </h1>
              <p className="text-white/50 text-sm">
                Masukkan email dan nama lengkap yang terdaftar.
                <br />
                Kami akan mengirim link reset ke inbox kamu.
              </p>
            </div>

            <div className="card p-8">
              {/* Verifikasi info */}
              <div className="flex gap-3 p-3 bg-amber-900/20 border border-amber-500/25 rounded-xl mb-5">
                <span className="text-lg shrink-0">🛡️</span>
                <p className="text-xs text-amber-300/90 leading-relaxed">
                  Untuk keamanan, kami memverifikasi identitas dengan
                  <strong className="text-amber-200">
                    {" "}
                    email + nama lengkap
                  </strong>{" "}
                  yang terdaftar.
                </p>
              </div>

              <form onSubmit={submit} className="space-y-4">
                {/* Email */}
                <div>
                  <label className="label">Email Terdaftar</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm">
                      ✉️
                    </span>
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handle}
                      className={`input pl-9 ${errors.email ? "border-red-500/60 focus:border-red-500" : ""}`}
                      placeholder="email@contoh.com"
                      autoComplete="email"
                      required
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                      <span>⚠️</span> {errors.email[0]}
                    </p>
                  )}
                </div>

                {/* Nama */}
                <div>
                  <label className="label">Nama Lengkap</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm">
                      👤
                    </span>
                    <input
                      name="name"
                      type="text"
                      value={form.name}
                      onChange={handle}
                      className={`input pl-9 ${errors.name ? "border-red-500/60 focus:border-red-500" : ""}`}
                      placeholder="Nama lengkap sesuai akun"
                      autoComplete="name"
                      required
                    />
                  </div>
                  {errors.name && (
                    <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                      <span>⚠️</span> {errors.name[0]}
                    </p>
                  )}
                  <p className="text-white/30 text-xs mt-1">
                    Contoh: "Budi Santoso" (harus persis seperti nama saat
                    daftar)
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading || !form.email || !form.name}
                  className="btn-primary w-full py-3 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Mengirim...
                    </>
                  ) : (
                    <>📨 Kirim Link Reset</>
                  )}
                </button>
              </form>
            </div>
          </>
        ) : (
          /* ── STEP 2: Konfirmasi terkirim ── */
          <SuccessStep
            email={form.email}
            provider={emailProvider}
            onResend={() => setSent(false)}
          />
        )}

        <p className="text-center text-sm text-white/40 mt-6">
          Ingat password?{" "}
          <Link
            to="/login"
            className="text-primary-400 hover:text-primary-300 font-medium transition-colors"
          >
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  );
}

// ── Komponen konfirmasi sukses ────────────────────────────────────────────────
function SuccessStep({ email, provider, onResend }) {
  return (
    <div className="card p-8 text-center">
      {/* Animated envelope */}
      <div className="relative w-20 h-20 mx-auto mb-6">
        <div className="w-20 h-20 bg-green-500/15 border border-green-500/30 rounded-2xl flex items-center justify-center">
          <span className="text-4xl animate-bounce">📧</span>
        </div>
        <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-xs">
          ✓
        </div>
      </div>

      <h2 className="text-xl font-bold text-white mb-2">Email Terkirim!</h2>
      <p className="text-white/60 text-sm mb-1">
        Link reset password dikirim ke:
      </p>
      <p className="text-primary-400 font-semibold mb-5">{email}</p>

      {/* Step instructions */}
      <div className="space-y-3 mb-6 text-left">
        {[
          { icon: "📬", text: "Buka inbox email kamu" },
          { icon: "🔍", text: "Cari email dari Virtual Exhibition" },
          { icon: "🔗", text: 'Klik tombol "Reset Password Saya"' },
          { icon: "🔑", text: "Buat password baru kamu" },
        ].map(({ icon, text }, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-7 h-7 bg-primary-900/50 border border-primary-500/30 rounded-lg flex items-center justify-center shrink-0 text-sm">
              {icon}
            </div>
            <span className="text-sm text-white/70">{text}</span>
          </div>
        ))}
      </div>

      {/* Open email provider button */}
      {provider && (
        <a
          href={provider.url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary w-full py-3 flex items-center justify-center gap-2 mb-3 no-underline"
        >
          <span>{provider.icon}</span>
          Buka {provider.name}
        </a>
      )}

      {/* Expiry warning */}
      <div className="flex items-center gap-2 p-3 bg-amber-900/15 border border-amber-500/20 rounded-xl mb-4">
        <span className="text-amber-400">⏰</span>
        <p className="text-xs text-amber-300/80">
          Link berlaku <strong className="text-amber-200">60 menit</strong>.
          Jika tidak ada, cek folder{" "}
          <strong className="text-amber-200">Spam/Junk</strong>.
        </p>
      </div>

      {/* Resend */}
      <button
        onClick={onResend}
        className="text-sm text-white/40 hover:text-white/70 transition-colors underline underline-offset-2"
      >
        Tidak menerima email? Kirim ulang
      </button>
    </div>
  );
}

// ── Helper: deteksi email provider ───────────────────────────────────────────
function getEmailProvider(domain) {
  const map = {
    "gmail.com": { name: "Gmail", icon: "📮", url: "https://mail.google.com" },
    "googlemail.com": {
      name: "Gmail",
      icon: "📮",
      url: "https://mail.google.com",
    },
    "yahoo.com": {
      name: "Yahoo Mail",
      icon: "📬",
      url: "https://mail.yahoo.com",
    },
    "yahoo.co.id": {
      name: "Yahoo Mail",
      icon: "📬",
      url: "https://mail.yahoo.com",
    },
    "outlook.com": {
      name: "Outlook",
      icon: "📧",
      url: "https://outlook.live.com",
    },
    "hotmail.com": {
      name: "Outlook",
      icon: "📧",
      url: "https://outlook.live.com",
    },
    "live.com": {
      name: "Outlook",
      icon: "📧",
      url: "https://outlook.live.com",
    },
  };
  return map[domain] || null;
}
