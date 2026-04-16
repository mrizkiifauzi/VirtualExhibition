import { useState, useEffect } from 'react'
import api from '../../api/axios'
import useAuthStore from '../../store/authStore'
import LoginModal from '../common/LoginModal'
import toast from 'react-hot-toast'

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000
  if (diff < 60)    return `${Math.floor(diff)}d lalu`
  if (diff < 3600)  return `${Math.floor(diff/60)} menit lalu`
  if (diff < 86400) return `${Math.floor(diff/3600)} jam lalu`
  return `${Math.floor(diff/86400)} hari lalu`
}

export default function CommentSection({ artworkId }) {
  const { user } = useAuthStore()
  const [comments, setComments] = useState([])
  const [text, setText]         = useState('')
  const [loading, setLoading]   = useState(false)
  const [fetching, setFetching] = useState(true)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    api.get(`/artworks/${artworkId}/comments`)
      .then(({ data }) => setComments(data.data || []))
      .catch(() => {})
      .finally(() => setFetching(false))
  }, [artworkId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) { setShowModal(true); return }
    if (!text.trim()) return
    setLoading(true)
    try {
      const { data } = await api.post(`/artworks/${artworkId}/comment`, { isi: text.trim() })
      setComments(prev => [data.comment, ...prev])
      setText('')
      toast.success('Komentar ditambahkan!')
    } catch {
      toast.error('Gagal menambahkan komentar')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Hapus komentar ini?')) return
    try {
      await api.delete(`/comments/${id}`)
      setComments(prev => prev.filter(c => c.id !== id))
      toast.success('Komentar dihapus')
    } catch {
      toast.error('Gagal menghapus komentar')
    }
  }

  return (
    <>
      <div className="space-y-4">
        <h3 className="font-semibold text-white">Komentar ({comments.length})</h3>

        {/* Input */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            onClick={() => { if (!user) setShowModal(true) }}
            placeholder={user ? 'Tulis komentar...' : 'Login untuk berkomentar...'}
            className="input flex-1 text-sm"
            readOnly={!user}
          />
          <button
            type="submit"
            disabled={loading || !text.trim()}
            className="btn-primary px-4 py-2 text-sm"
          >
            {loading ? '...' : 'Kirim'}
          </button>
        </form>

        {/* List */}
        {fetching ? (
          <div className="text-white/40 text-sm text-center py-4">Memuat komentar...</div>
        ) : comments.length === 0 ? (
          <div className="text-white/40 text-sm text-center py-6">Belum ada komentar. Jadilah yang pertama!</div>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {comments.map(c => (
              <div key={c.id} className="flex gap-3 group">
                <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                  {c.user?.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 bg-white/5 rounded-xl px-3 py-2">
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-medium text-white">{c.user?.name || 'Anonim'}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-white/30">{timeAgo(c.created_at)}</span>
                      {(user?.id_user === c.id_user || user?.role === 'admin') && (
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="text-red-400 opacity-0 group-hover:opacity-100 text-xs transition-opacity"
                        >
                          Hapus
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-white/70 mt-1">{c.isi}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {showModal && <LoginModal onClose={() => setShowModal(false)} />}
    </>
  )
}
