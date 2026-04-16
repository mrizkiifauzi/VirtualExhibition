import { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import toast from 'react-hot-toast'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [form, setForm]     = useState({ password: '', password_confirmation: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const token = searchParams.get('token') || ''
  const email = searchParams.get('email') || ''

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)
    try {
      await api.post('/reset-password', { ...form, token, email })
      toast.success('Password berhasil diubah! Silakan login.')
      navigate('/login')
    } catch (err) {
      if (err.response?.data?.errors) setErrors(err.response.data.errors)
      else toast.error(err.response?.data?.message || 'Gagal reset password')
    } finally {
      setLoading(false)
    }
  }

  if (!token || !email) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="text-center">
          <span className="text-5xl mb-4 block">⚠️</span>
          <h2 className="text-xl font-bold text-white mb-2">Link Tidak Valid</h2>
          <p className="text-white/50 mb-6">Link reset password tidak valid atau sudah kedaluwarsa.</p>
          <Link to="/forgot-password" className="btn-primary">Minta Link Baru</Link>
        </div>
      </div>
    )
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
          <h1 className="text-2xl font-bold text-white mt-6 mb-1">Buat Password Baru</h1>
          <p className="text-white/50 text-sm">Untuk akun: <span className="text-primary-400">{email}</span></p>
        </div>

        <div className="card p-8">
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="label">Password Baru</label>
              <input
                name="password" type="password" value={form.password} onChange={handle}
                className="input" placeholder="Min. 8 karakter" required
              />
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password[0]}</p>}
            </div>

            <div>
              <label className="label">Konfirmasi Password Baru</label>
              <input
                name="password_confirmation" type="password" value={form.password_confirmation} onChange={handle}
                className="input" placeholder="Ulangi password baru" required
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading ? 'Memproses...' : 'Simpan Password Baru'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
