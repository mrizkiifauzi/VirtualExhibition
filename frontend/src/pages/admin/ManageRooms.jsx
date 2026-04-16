import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/common/Navbar'
import api from '../../api/axios'
import toast from 'react-hot-toast'

const API_URL = 'http://localhost:8000/storage'

// Preset positions for the virtual room
const PRESETS = [
  { label: 'Dinding Depan Kiri',   x: -10, y: 2, z: -24, rotation: 0 },
  { label: 'Dinding Depan Tengah', x:   0, y: 2, z: -24, rotation: 0 },
  { label: 'Dinding Depan Kanan',  x:  10, y: 2, z: -24, rotation: 0 },
  { label: 'Dinding Kiri Depan',   x: -24, y: 2, z: -10, rotation: 1.57 },
  { label: 'Dinding Kiri Tengah',  x: -24, y: 2, z:   0, rotation: 1.57 },
  { label: 'Dinding Kiri Belakang',x: -24, y: 2, z:  10, rotation: 1.57 },
  { label: 'Dinding Kanan Depan',  x:  24, y: 2, z: -10, rotation: -1.57 },
  { label: 'Dinding Kanan Tengah', x:  24, y: 2, z:   0, rotation: -1.57 },
  { label: 'Dinding Kanan Belakang',x: 24, y: 2, z:  10, rotation: -1.57 },
  { label: 'Dinding Belakang Kiri',x: -10, y: 2, z:  24, rotation: 3.14 },
  { label: 'Dinding Belakang Tengah',x:  0, y: 2, z: 24, rotation: 3.14 },
  { label: 'Dinding Belakang Kanan',x: 10, y: 2, z: 24, rotation: 3.14 },
]

export default function ManageRooms() {
  const [artworks, setArtworks]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [saving, setSaving]       = useState(null)
  const [editId, setEditId]       = useState(null)
  const [posForm, setPosForm]     = useState({ x: 0, y: 2, z: 0, rotation: 0 })

  useEffect(() => {
    api.get('/admin/artworks?status=verified&per_page=50')
      .then(({ data }) => setArtworks(data.data || []))
      .finally(() => setLoading(false))
  }, [])

  const openEdit = (a) => {
    setEditId(a.id)
    setPosForm(a.posisi_3d || { x: 0, y: 2, z: 0, rotation: 0 })
  }

  const applyPreset = (preset) => {
    setPosForm({ x: preset.x, y: preset.y, z: preset.z, rotation: preset.rotation })
  }

  const savePosition = async (id) => {
    setSaving(id)
    try {
      await api.put(`/admin/artworks/${id}/position`, { posisi_3d: posForm })
      setArtworks(prev => prev.map(a => a.id === id ? { ...a, posisi_3d: { ...posForm } } : a))
      toast.success('Posisi berhasil disimpan!')
      setEditId(null)
    } catch {
      toast.error('Gagal menyimpan posisi')
    } finally {
      setSaving(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 pt-16">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/admin" className="text-white/40 hover:text-white text-sm">← Admin Panel</Link>
          <h1 className="text-2xl font-bold text-white">Atur Ruang 3D</h1>
        </div>

        {/* Info */}
        <div className="card p-4 mb-6 flex gap-3 bg-blue-900/20 border-blue-500/30">
          <span className="text-xl shrink-0">ℹ️</span>
          <div className="text-sm text-blue-300">
            <p className="font-medium mb-1">Cara mengatur posisi karya di ruang 3D:</p>
            <p className="text-blue-300/70">Hanya karya yang sudah <strong>diverifikasi</strong> yang bisa diatur posisinya. Gunakan preset dinding atau atur koordinat manual. Koordinat: X (kiri-kanan), Y (tinggi, default=2), Z (depan-belakang). Ruang berukuran -25 hingga 25.</p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="card h-20 animate-pulse" />)}
          </div>
        ) : artworks.length === 0 ? (
          <div className="card p-12 text-center">
            <span className="text-4xl mb-3 block">🏛️</span>
            <p className="text-white/50 mb-2">Belum ada karya terverifikasi</p>
            <Link to="/admin/artworks?status=pending" className="btn-primary text-sm">Verifikasi Karya</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {artworks.map(a => (
              <div key={a.id} className="card overflow-hidden">
                {/* Artwork row */}
                <div className="p-4 flex items-center gap-4">
                  {/* Thumbnail */}
                  <div className="w-14 h-14 bg-gray-900 rounded-xl overflow-hidden shrink-0">
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
                    <p className="font-medium text-white truncate">{a.judul}</p>
                    <p className="text-xs text-white/40">{a.user?.name} · {a.program_studi?.nama_prodi}</p>
                    {a.posisi_3d ? (
                      <p className="text-xs text-green-400 mt-0.5">
                        📍 X:{a.posisi_3d.x} Y:{a.posisi_3d.y} Z:{a.posisi_3d.z} R:{a.posisi_3d.rotation}
                      </p>
                    ) : (
                      <p className="text-xs text-yellow-400/70 mt-0.5">⚠️ Belum ada posisi — akan diauto oleh sistem</p>
                    )}
                  </div>

                  {/* Toggle edit */}
                  <button
                    onClick={() => editId === a.id ? setEditId(null) : openEdit(a)}
                    className={`text-sm px-4 py-2 rounded-lg transition-all ${
                      editId === a.id
                        ? 'bg-white/20 text-white'
                        : 'btn-secondary'
                    }`}
                  >
                    {editId === a.id ? 'Tutup' : '📐 Atur Posisi'}
                  </button>
                </div>

                {/* Position editor */}
                {editId === a.id && (
                  <div className="border-t border-white/10 p-5 bg-white/[0.02]">
                    {/* Presets */}
                    <p className="text-xs font-medium text-white/50 mb-3">Preset Dinding:</p>
                    <div className="flex flex-wrap gap-2 mb-5">
                      {PRESETS.map(p => (
                        <button
                          key={p.label}
                          onClick={() => applyPreset(p)}
                          className="text-xs bg-white/10 hover:bg-primary-900/50 hover:text-primary-300 text-white/60 px-3 py-1.5 rounded-lg transition-all border border-transparent hover:border-primary-500/30"
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>

                    {/* Manual input */}
                    <p className="text-xs font-medium text-white/50 mb-3">Koordinat Manual:</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                      {[
                        { key: 'x', label: 'X (kiri/kanan)', min: -25, max: 25 },
                        { key: 'y', label: 'Y (tinggi)',      min: 0,   max: 5  },
                        { key: 'z', label: 'Z (depan/belakang)', min: -25, max: 25 },
                        { key: 'rotation', label: 'Rotasi (radian)', min: -3.14, max: 3.14, step: 0.01 },
                      ].map(({ key, label, min, max, step = 1 }) => (
                        <div key={key}>
                          <label className="label">{label}</label>
                          <input
                            type="number"
                            value={posForm[key]}
                            min={min} max={max} step={step}
                            onChange={e => setPosForm({ ...posForm, [key]: parseFloat(e.target.value) || 0 })}
                            className="input text-sm"
                          />
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-3">
                      <button onClick={() => setEditId(null)} className="btn-secondary text-sm flex-1 py-2">
                        Batal
                      </button>
                      <button
                        onClick={() => savePosition(a.id)}
                        disabled={saving === a.id}
                        className="btn-primary text-sm flex-1 py-2"
                      >
                        {saving === a.id ? 'Menyimpan...' : '💾 Simpan Posisi'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
