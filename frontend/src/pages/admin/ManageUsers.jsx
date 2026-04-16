import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Navbar from '../../components/common/Navbar'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const ROLES = ['pengunjung', 'mahasiswa', 'admin']
const roleColor = { pengunjung: 'text-white/60', mahasiswa: 'text-primary-400', admin: 'text-red-400' }

export default function ManageUsers() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [users, setUsers]   = useState([])
  const [meta, setMeta]     = useState(null)
  const [loading, setLoading] = useState(true)

  const role   = searchParams.get('role')   || ''
  const search = searchParams.get('search') || ''
  const page   = searchParams.get('page')   || 1

  const load = () => {
    setLoading(true)
    const p = new URLSearchParams()
    if (role)   p.set('role', role)
    if (search) p.set('search', search)
    p.set('page', page)
    api.get(`/admin/users?${p}`)
      .then(({ data }) => { setUsers(data.data || []); setMeta(data.meta || data) })
      .finally(() => setLoading(false))
  }

  useEffect(load, [role, search, page])

  const setParam = (key, val) => {
    const p = new URLSearchParams(searchParams)
    if (val) p.set(key, val); else p.delete(key)
    p.delete('page')
    setSearchParams(p)
  }

  const updateRole = async (id, newRole) => {
    try {
      await api.put(`/admin/users/${id}/role`, { role: newRole })
      setUsers(prev => prev.map(u => u.id_user === id ? { ...u, role: newRole } : u))
      toast.success('Role berhasil diubah!')
    } catch { toast.error('Gagal mengubah role') }
  }

  const deleteUser = async (id, name) => {
    if (!confirm(`Hapus pengguna "${name}"?`)) return
    try {
      await api.delete(`/admin/users/${id}`)
      setUsers(prev => prev.filter(u => u.id_user !== id))
      toast.success('Pengguna dihapus')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menghapus pengguna')
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 pt-16">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/admin" className="text-white/40 hover:text-white text-sm">← Admin Panel</Link>
          <h1 className="text-2xl font-bold text-white">Kelola Pengguna</h1>
        </div>

        {/* Filters */}
        <div className="card p-4 mb-6 flex flex-wrap gap-3 items-center">
          <input
            defaultValue={search}
            placeholder="Cari nama pengguna..."
            className="input text-sm flex-1 min-w-[200px]"
            onKeyDown={e => e.key === 'Enter' && setParam('search', e.target.value)}
          />
          {['', ...ROLES].map(r => (
            <button
              key={r}
              onClick={() => setParam('role', r)}
              className={`text-sm px-4 py-2 rounded-lg transition-all capitalize ${
                role === r
                  ? 'bg-primary-600 text-white'
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              {r || 'Semua'}
            </button>
          ))}
        </div>

        {/* User list */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => <div key={i} className="card h-16 animate-pulse" />)}
          </div>
        ) : users.length === 0 ? (
          <div className="card p-12 text-center">
            <span className="text-4xl mb-3 block">👥</span>
            <p className="text-white/50">Tidak ada pengguna ditemukan</p>
          </div>
        ) : (
          <div className="space-y-3">
            {users.map(u => (
              <div key={u.id_user} className="card p-4 flex items-center gap-4">
                {/* Avatar */}
                <div className="w-12 h-12 bg-primary-600/70 rounded-xl flex items-center justify-center text-lg font-bold text-white shrink-0">
                  {u.name?.charAt(0)?.toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-medium text-white">{u.name}</span>
                    <span className={`text-xs font-medium capitalize ${roleColor[u.role]}`}>({u.role})</span>
                  </div>
                  <p className="text-xs text-white/40">{u.email}</p>
                  <p className="text-xs text-white/30 mt-0.5">
                    {u.nim && <span>NIM: {u.nim} · </span>}
                    {u.program_studi?.nama_prodi && <span>{u.program_studi.nama_prodi} · </span>}
                    {u.artworks_count || 0} karya
                  </p>
                </div>

                {/* Role changer */}
                <select
                  value={u.role}
                  onChange={e => updateRole(u.id_user, e.target.value)}
                  className="input text-sm w-auto min-w-[140px] shrink-0"
                >
                  {ROLES.map(r => (
                    <option key={r} value={r} className="capitalize text-black ">{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                  ))}
                </select>

                {/* Delete */}
                {u.role !== 'admin' && (
                  <button
                    onClick={() => deleteUser(u.id_user, u.name)}
                    className="btn-danger text-xs py-1.5 px-3 shrink-0"
                  >
                    🗑️ Hapus
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {meta?.last_page > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {[...Array(meta.last_page)].map((_, i) => (
              <button
                key={i}
                onClick={() => setParam('page', i + 1)}
                className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                  meta.current_page === i + 1
                    ? 'bg-primary-600 text-white'
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
