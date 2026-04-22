import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import Navbar from '../components/common/Navbar'
import LikeButton from '../components/interactions/LikeButton'
import RatingStars from '../components/interactions/RatingStars'
import CommentSection from '../components/interactions/CommentSection'
import api from '../api/axios'

const API_URL = 'http://localhost:8000'

export default function ArtworkDetail() {
  const { id } = useParams()
  const [artwork, setArtwork] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    api.get(`/artworks/${id}`)
      .then(({ data }) => setArtwork(data))
      .catch(() => setError('Karya tidak ditemukan'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="min-h-screen bg-gray-950 pt-16 flex items-center justify-center">
      <Navbar /><div className="text-white/50">Memuat...</div>
    </div>
  )

  if (error || !artwork) return (
    <div className="min-h-screen bg-gray-950 pt-16 flex flex-col items-center justify-center gap-4">
      <Navbar />
      <span className="text-5xl">🔍</span>
      <p className="text-white/50">{error || 'Karya tidak ditemukan'}</p>
      <Link to="/gallery" className="btn-primary">← Kembali ke Galeri</Link>
    </div>
  )

  const fileUrl  = `${API_URL}/${artwork.file_path}`
  const thumbUrl = artwork.thumbnail ? `${API_URL}/${artwork.thumbnail}` : fileUrl

  return (
    <div className="min-h-screen bg-gray-950 pt-16">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-white/40 mb-8">
          <Link to="/" className="hover:text-white/70">Beranda</Link>
          <span>/</span>
          <Link to="/gallery" className="hover:text-white/70">Galeri</Link>
          <span>/</span>
          <span className="text-white/70 truncate max-w-xs">{artwork.judul}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Media viewer */}
            <div className="card overflow-hidden rounded-2xl bg-gray-900 aspect-video">
              {artwork.tipe === 'image' && (
                <img src={fileUrl} alt={artwork.judul} className="w-full h-full object-contain" />
              )}
              {artwork.tipe === 'video' && (
                <video src={fileUrl} controls className="w-full h-full" />
              )}
              {artwork.tipe === '3d' && (
                <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                  <span className="text-5xl">🎲</span>
                  <p className="text-white/50 text-sm">Model 3D — Buka di pameran virtual</p>
                  <Link to="/exhibition" className="btn-primary text-sm">Lihat di Pameran 3D</Link>
                </div>
              )}
            </div>

            {/* Comments */}
            <div className="card p-6">
              <CommentSection artworkId={artwork.id} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Info card */}
            <div className="card p-5">
              <h1 className="text-2xl font-bold text-white mb-2">{artwork.judul}</h1>

              {/* Author */}
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/10">
                <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center font-bold">
                  {artwork.user?.name?.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{artwork.user?.name}</p>
                  {artwork.user?.nim && <p className="text-xs text-white/40">NIM: {artwork.user.nim}</p>}
                </div>
              </div>

              {artwork.program_studi && (
                <div className="mb-3">
                  <span className="text-xs text-white/40">Program Studi</span>
                  <p className="text-sm text-primary-400 font-medium">{artwork.program_studi.nama_prodi}</p>
                </div>
              )}

              <div className="mb-4">
                <span className="text-xs text-white/40">Tipe Karya</span>
                <p className="text-sm text-white capitalize">{artwork.tipe}</p>
              </div>

              {artwork.deskripsi && (
                <div className="mb-4">
                  <span className="text-xs text-white/40">Deskripsi</span>
                  <p className="text-sm text-white/70 mt-1 leading-relaxed">{artwork.deskripsi}</p>
                </div>
              )}

              <div className="text-xs text-white/30">
                Diupload {new Date(artwork.created_at).toLocaleDateString('id-ID', { year:'numeric', month:'long', day:'numeric' })}
              </div>
            </div>

            {/* Interactions */}
            <div className="card p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white/70">Interaksi</h3>
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/50">Like</span>
                <LikeButton
                  artworkId={artwork.id}
                  initialLiked={artwork.user_liked}
                  initialCount={artwork.likes_count || 0}
                />
              </div>
              <div className="flex items-start justify-between">
                <span className="text-sm text-white/50 mt-1">Rating</span>
                <RatingStars
                  artworkId={artwork.id}
                  initialRating={artwork.user_rating || 0}
                  avgRating={artwork.ratings_avg_nilai || 0}
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/50">Komentar</span>
                <span className="text-white">{artwork.comments_count || 0}</span>
              </div>
            </div>

            {/* Navigation */}
            <Link to="/gallery" className="btn-secondary w-full text-center block">← Kembali ke Galeri</Link>
            <Link to="/exhibition" className="btn-primary  w-full text-center block">🏛️ Lihat di Pameran 3D</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
