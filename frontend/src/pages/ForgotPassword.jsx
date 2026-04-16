import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import toast from 'react-hot-toast'

export default function ForgotPassword() {
  const [form, setForm]     = useState({ email: '', name: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [sent, setSent]     = useState(false)

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)
    try {
      await api.post('/forgot-password', form)
      setSent(true)
      toast.success('Link reset dikirim ke email Anda!')
    } catch (err) {
      if (err.response?.data?.errors) setErrors(err.response.data.errors)
      else toast.error(err.response?.data?.message || 'Gagal mengirim link reset')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white font-bold">VE</div>
            <span className="text-xl font-bold text-white">Virtual Exhibition</span>
          </Link>
          <h1 className="text-2xl font-bold text-white mt-6 mb-1">Lupa Password</h1>
          <p className="text-white/50 text-sm">Masukkan email dan nama untuk verifikasi</p>
        </div>

        {/* Back link */}
        <p className="text-left text-sm text-white/50 mt-5 mb-4">
         <Link to="/Login" className="text-primary-400 hover:text-primary-300 font-medium"> ← Kembali</Link>
        </p>

        <div className="card p-8">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📧</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Email Terkirim!</h3>
              <p className="text-white/60 text-sm mb-6">
                Link reset password telah dikirim ke <span className="text-primary-400">{form.email}</span>.
                Periksa inbox atau folder spam Anda.
              </p>
              <p className="text-xs text-white/30 mb-6">Link berlaku selama 1 jam.</p>
              <Link to="/login" className="btn-primary w-full block text-center py-2.5">
                Kembali ke Login
              </Link>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div className="p-3 bg-amber-900/20 border border-amber-500/30 rounded-xl text-xs text-amber-300 mb-2">
                Verifikasi menggunakan <strong>email</strong> dan <strong>nama lengkap</strong> yang terdaftar.
              </div>

              <div>
                <label className="label">Email Terdaftar</label>
                <input
                  name="email" type="email" value={form.email} onChange={handle}
                  className="input" placeholder="email@contoh.com" required
                />
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email[0]}</p>}
              </div>

              <div>
                <label className="label">Nama Lengkap</label>
                <input
                  name="name" value={form.name} onChange={handle}
                  className="input" placeholder="Nama lengkap sesuai data akun" required
                />
                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name[0]}</p>}
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                {loading ? 'Mengirim...' : 'Kirim Link Reset'}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-white/50 mt-6">
          Ingat password?{' '}
          <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">Masuk di sini</Link>
        </p>
      </div>
    </div>
  )
}
