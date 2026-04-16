import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Navbar from '../../components/common/Navbar'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const API_URL = 'http://localhost:8000/storage'

function StatusBadge({ status }) {
  const map   = { pending: 'badge-pending', verified: 'badge-verified', rejected: 'badge-rejected' }
  const label = { pending: '⏳ Menunggu', verified: '✅ Terverifikasi', rejected: '❌ Ditolak' }
  return <span className={map[status]}>{label[status]}</span>
}

export default function ManageArtworks() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [artworks, setArtworks] = useState([])
  const [meta, setMeta]         = useState(null)
  const [loading, setLoading]   = useState(true)

  const status = searchParams.get('status') || ''
  const search = searchParams.get('search') || ''
  const page   = searchParams.get('page')   || 1

  const load = () => {
    setLoading(true)
    const p = new URLSearchParams()
    if (status) p.set('status', status)
    if (search) p.set('search', search)
    p.set('page', page)
    api.get(`/admin/artworks?${p}`)
      .then(({ data }) => { setArtworks(data.data || []); setMeta(data.meta || data) })
      .finally(() => setLoading(false))
  }

  useEffect(load, [status, search, page])

  const setParam = (key, val) => {
    const p = new URLSearchParams(searchParams)
    if (val) p.set(key, val); else p.delete(key)
    p.delete('page')
    setSearchParams(p)
  }

  const verify = async (id) => {
    try {
      await api.put(`/admin/artworks/${id}/verify`)
      toast.success('Karya berhasil diverifikasi!')
      setArtworks(prev => prev.map(a => a.id === id ? { ...a, status: 'verified' } : a))
    } catch { toast.error('Gagal memverifikasi') }
  }

  const reject = async (id) => {
    if (!confirm('Tolak karya ini?')) return
    try {
      await api.put(`/admin/artworks/${id}/reject`)
      toast.success('Karya ditolak')
      setArtworks(prev => prev.map(a => a.id === id ? { ...a, status: 'rejected' } : a))
    } catch { toast.error('Gagal menolak karya') }
  }

  const deleteArtwork = async (id) => {
    if (!confirm('Hapus karya ini permanen?')) return
    try {
      await api.delete(`/admin/artworks/${id}`)
      toast.success('Karya dihapus')
      setArtworks(prev => prev.filter(a => a.id !== id))
    } catch { toast.error('Gagal menghapus karya') }
  }

  return (
    <div className="min-h-screen bg-gray-950 pt-16">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/admin" className="text-white/40 hover:text-white text-sm">← Admin Panel</Link>
          <h1 className="text-2xl font-bold text-white">Kelola Karya</h1>
        </div>

        {/* Filters */}
        <div className="card p-4 mb-6 flex flex-wrap gap-3 items-center">
          <input
            defaultValue={search}
            placeholder="Cari judul..."
            className="input text-sm flex-1 min-w-[200px]"
            onKeyDown={e => e.key === 'Enter' && setParam('search', e.target.value)}
          />

          {['', 'pending', 'verified', 'rejected'].map(s => (
            <button
              key={s}
              onClick={() => setParam('status', s)}
              className={`text-sm px-4 py-2 rounded-lg transition-all ${
                status === s
                  ? 'bg-primary-600 text-white'
                  : 'bg-white/10 text-white/60 hover:bg-white/20'
              }`}
            >
              {s === '' ? 'Semua' : s === 'pending' ? '⏳ Menunggu' : s === 'verified' ? '✅ Terverifikasi' : '❌ Ditolak'}
            </button>
          ))}
        </div>

        {/* Table */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="card h-16 animate-pulse" />)}
          </div>
        ) : artworks.length === 0 ? (
          <div className="card p-12 text-center">
            <span className="text-4xl mb-3 block">📭</span>
            <p className="text-white/50">Tidak ada karya</p>
          </div>
        ) : (
          <div className="space-y-3">
            {artworks.map(a => (
              <div key={a.id} className="card p-4 flex items-center gap-4">
                {/* Thumbnail */}
                <div className="w-16 h-16 bg-gray-900 rounded-xl overflow-hidden shrink-0">
                  {(a.thumbnail || a.tipe === 'image') ? (
                    <img
                      src={`${API_URL}/${a.thumbnail || a.file_path}`}
                      alt={a.judul}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">
                      {a.tipe === 'video' ? '🎬' : '🎲'}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-medium text-white truncate max-w-[200px]">{a.judul}</span>
                    <StatusBadge status={a.status} />
                    <span className="text-xs bg-white/10 text-white/50 px-2 py-0.5 rounded-full capitalize">{a.tipe}</span>
                  </div>
                  <p className="text-xs text-white/40">
                    oleh <span className="text-white/60">{a.user?.name}</span>
                    {a.program_studi && <> · {a.program_studi.nama_prodi}</>}
                    {' · '}❤️ {a.likes_count || 0} · ⭐ {a.ratings_avg_nilai ? Number(a.ratings_avg_nilai).toFixed(1) : '—'} · 💬 {a.comments_count || 0}
                  </p>
                  <p className="text-xs text-white/30 mt-0.5">
                    {new Date(a.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                  <Link to={`/artworks/${a.id}`} target="_blank" className="btn-secondary text-xs py-1.5 px-3">
                    👁️ Lihat
                  </Link>
                  {a.status !== 'verified' && (
                    <button onClick={() => verify(a.id)} className="bg-green-600 hover:bg-green-700 text-white text-xs py-1.5 px-3 rounded-lg transition-all">
                      ✅ Verifikasi
                    </button>
                  )}
                  {a.status !== 'rejected' && (
                    <button onClick={() => reject(a.id)} className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs py-1.5 px-3 rounded-lg transition-all">
                      ❌ Tolak
                    </button>
                  )}
                  <button onClick={() => deleteArtwork(a.id)} className="btn-danger text-xs py-1.5 px-3">
                    🗑️ Hapus
                  </button>
                </div>
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
