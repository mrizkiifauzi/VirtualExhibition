import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/common/Navbar'
import VirtualRoom from '../components/three/VirtualRoom'
import ArtworkPopup from '../components/three/ArtworkPopup'
import ArtworkCard from '../components/artwork/ArtworkCard'
import LoadingScreen from '../components/three/LoadingScreen'
import api from '../api/axios'

function useIsMobile() {
  const [mobile, setMobile] = useState(window.innerWidth < 768)
  useEffect(() => {
    const h = () => setMobile(window.innerWidth < 768)
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])
  return mobile
}

export default function Exhibition() {
  const isMobile = useIsMobile()
  const [artworks, setArtworks] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading]   = useState(true)
  const [entered, setEntered]   = useState(false)

  useEffect(() => {
    api.get('/artworks?per_page=50')
      .then(({ data }) => setArtworks(data.data || []))
      .finally(() => setLoading(false))
  }, [])

  // Mobile fallback
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-950 pt-16">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="card p-6 mb-8 text-center">
            <span className="text-4xl mb-3 block">📱</span>
            <h2 className="text-xl font-bold text-white mb-2">Galeri Mode Mobile</h2>
            <p className="text-white/50 text-sm">Pameran 3D tersedia di desktop. Di bawah ini tampilan galeri untuk perangkat mobile.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {artworks.map(a => <ArtworkCard key={a.id} artwork={a} />)}
          </div>
        </div>
      </div>
    )
  }

  // Desktop entry screen
  if (!entered) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center relative overflow-hidden">
        <Navbar />
        {/* Background animation */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-primary-400 rounded-full opacity-60 animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top:  `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
              }}
            />
          ))}
        </div>

        <div className="relative text-center px-4 max-w-lg">
          <div className="w-24 h-24 bg-primary-600/20 border-2 border-primary-500/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-5xl">🏛️</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">Pameran Virtual 3D</h1>
          <p className="text-white/60 mb-4">Jelajahi galeri imersif dengan kontrol WASD. Klik karya untuk melihat detail dan berinteraksi.</p>

          <div className="card p-4 mb-8 text-left text-sm text-white/50 space-y-2">
            <div className="flex items-center gap-2"><kbd className="bg-white/10 px-2 py-0.5 rounded text-xs font-mono">W A S D</kbd> Bergerak</div>
            <div className="flex items-center gap-2"><span className="text-base">🖱️</span> Drag mouse untuk memutar kamera</div>
            <div className="flex items-center gap-2"><span className="text-base">🖱️</span> Klik karya untuk melihat detail</div>
            <div className="flex items-center gap-2"><kbd className="bg-white/10 px-2 py-0.5 rounded text-xs font-mono">Shift</kbd> Lari lebih cepat</div>
          </div>

          <button
            onClick={() => setEntered(true)}
            disabled={loading}
            className="btn-primary px-10 py-3 text-base w-full"
          >
            {loading ? 'Memuat karya...' : '🚀 Masuk ke Pameran'}
          </button>
          <Link to="/gallery" className="block mt-4 text-sm text-white/40 hover:text-white/70 transition-colors">
            Atau lihat galeri biasa →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-gray-950">
      {/* Exit button */}
      <div className="absolute top-4 left-4 z-30 flex gap-2">
        <button
          onClick={() => setEntered(false)}
          className="bg-black/60 backdrop-blur-sm text-white text-sm px-4 py-2 rounded-xl border border-white/20 hover:bg-white/20 transition-all"
        >
          ← Keluar
        </button>
        <Link
          to="/gallery"
          className="bg-black/60 backdrop-blur-sm text-white text-sm px-4 py-2 rounded-xl border border-white/20 hover:bg-white/20 transition-all"
        >
          🖼️ Galeri
        </Link>
      </div>

      {/* Artwork count */}
      <div className="absolute top-4 right-4 z-30 bg-black/60 backdrop-blur-sm text-white/70 text-xs px-3 py-2 rounded-xl border border-white/10">
        {artworks.length} karya dipamerkan
      </div>

      <VirtualRoom artworks={artworks} onArtworkClick={setSelected} />
      {selected && <ArtworkPopup artwork={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
