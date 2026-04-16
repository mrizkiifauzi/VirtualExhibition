import { useState } from 'react'
import api from '../../api/axios'
import useAuthStore from '../../store/authStore'
import LoginModal from '../common/LoginModal'
import toast from 'react-hot-toast'

export default function LikeButton({ artworkId, initialLiked = false, initialCount = 0, size = 'md' }) {
  const { user } = useAuthStore()
  const [liked, setLiked]   = useState(initialLiked)
  const [count, setCount]   = useState(initialCount)
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)

  const sizeClass = size === 'sm' ? 'text-xs gap-1 px-2 py-1' : 'text-sm gap-2 px-3 py-2'

  const handleClick = async () => {
    if (!user) { setShowModal(true); return }
    if (loading) return
    setLoading(true)
    try {
      const { data } = await api.post(`/artworks/${artworkId}/like`)
      setLiked(data.liked)
      setCount(data.likes_count)
    } catch {
      toast.error('Gagal memproses like')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={handleClick}
        disabled={loading}
        className={`flex items-center rounded-lg font-medium transition-all duration-200 ${sizeClass} ${
          liked
            ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30'
            : 'bg-white/10 text-white/70 hover:bg-white/20 border border-white/10'
        } disabled:opacity-50`}
        title={user ? (liked ? 'Hapus like' : 'Like karya ini') : 'Login untuk like'}
      >
        <span className={`transition-transform duration-200 ${liked ? 'scale-110' : ''}`}>
          {liked ? '❤️' : '🤍'}
        </span>
        <span>{count}</span>
      </button>
      {showModal && <LoginModal onClose={() => setShowModal(false)} />}
    </>
  )
}
