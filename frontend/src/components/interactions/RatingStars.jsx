import { useState } from 'react'
import api from '../../api/axios'
import useAuthStore from '../../store/authStore'
import LoginModal from '../common/LoginModal'
import toast from 'react-hot-toast'

export default function RatingStars({ artworkId, initialRating = 0, avgRating = 0, size = 'md' }) {
  const { user } = useAuthStore()
  const [userRating, setUserRating] = useState(initialRating)
  const [avg, setAvg]               = useState(avgRating)
  const [hover, setHover]           = useState(0)
  const [loading, setLoading]       = useState(false)
  const [showModal, setShowModal]   = useState(false)

  const starSize = size === 'sm' ? 'text-lg' : 'text-2xl'

  const handleRate = async (val) => {
    if (!user) { setShowModal(true); return }
    if (loading) return
    setLoading(true)
    try {
      const { data } = await api.post(`/artworks/${artworkId}/rating`, { nilai: val })
      setUserRating(data.user_rating)
      setAvg(data.ratings_avg)
      toast.success('Rating berhasil disimpan!')
    } catch {
      toast.error('Gagal menyimpan rating')
    } finally {
      setLoading(false)
    }
  }

  const display = hover || userRating

  return (
    <>
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => handleRate(star)}
              onMouseEnter={() => user && setHover(star)}
              onMouseLeave={() => setHover(0)}
              disabled={loading}
              className={`${starSize} transition-all duration-100 disabled:cursor-default ${
                user ? 'cursor-pointer hover:scale-110' : 'cursor-pointer'
              }`}
              title={user ? `Beri rating ${star}` : 'Login untuk rating'}
            >
              {star <= display ? '⭐' : '☆'}
            </button>
          ))}
        </div>
        {avg > 0 && (
          <span className="text-xs text-white/50">
            Rata-rata: <span className="text-yellow-400 font-medium">{Number(avg).toFixed(1)}</span>
          </span>
        )}
      </div>
      {showModal && <LoginModal onClose={() => setShowModal(false)} />}
    </>
  )
}
