import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/common/Navbar'
import api from '../../api/axios'

function StatCard({ icon, label, value, color, to }) {
  const content = (
    <div className={`card p-5 hover:border-white/20 transition-all ${to ? 'cursor-pointer' : ''}`}>
      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl">{icon}</span>
        <span className="text-sm text-white/50">{label}</span>
      </div>
      <p className={`text-3xl font-bold ${color}`}>{value ?? '—'}</p>
    </div>
  )
  return to ? <Link to={to}>{content}</Link> : content
}

export default function AdminPanel() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/dashboard')
      .then(({ data }) => setStats(data))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-gray-950 pt-16">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
          <p className="text-white/50 mt-1">Kelola karya, pengguna, dan ruang pameran 3D</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
          <StatCard icon="🖼️"  label="Total Karya"       value={stats?.total_artworks}  color="text-white"         to="/admin/artworks" />
          <StatCard icon="⏳"  label="Menunggu"          value={stats?.pending}          color="text-yellow-400"    to="/admin/artworks?status=pending" />
          <StatCard icon="✅"  label="Terverifikasi"     value={stats?.verified}         color="text-green-400"     to="/admin/artworks?status=verified" />
          <StatCard icon="❌"  label="Ditolak"           value={stats?.rejected}         color="text-red-400"       to="/admin/artworks?status=rejected" />
          <StatCard icon="👥"  label="Total Pengguna"    value={stats?.total_users}      color="text-blue-400"      to="/admin/users" />
          <StatCard icon="🎓"  label="Mahasiswa"         value={stats?.total_mahasiswa}  color="text-primary-400"   to="/admin/users?role=mahasiswa" />
        </div>

        {/* Quick actions */}
        <h2 className="text-lg font-semibold text-white mb-4">Aksi Cepat</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link to="/admin/artworks?status=pending" className="card p-6 hover:border-yellow-500/40 transition-all group">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-xl">⏳</span>
              </div>
              <span className="font-medium text-white">Verifikasi Karya</span>
            </div>
            <p className="text-sm text-white/50">
              {stats?.pending ?? 0} karya menunggu verifikasi
            </p>
          </Link>

          <Link to="/admin/users" className="card p-6 hover:border-blue-500/40 transition-all group">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-xl">👥</span>
              </div>
              <span className="font-medium text-white">Kelola Pengguna</span>
            </div>
            <p className="text-sm text-white/50">Atur role dan hapus pengguna</p>
          </Link>

          <Link to="/admin/rooms" className="card p-6 hover:border-primary-500/40 transition-all group">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-primary-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-xl">🏛️</span>
              </div>
              <span className="font-medium text-white">Atur Ruang 3D</span>
            </div>
            <p className="text-sm text-white/50">Atur posisi karya di ruang virtual</p>
          </Link>
        </div>
      </div>
    </div>
  )
}
