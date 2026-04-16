import { useNavigate } from 'react-router-dom'

export default function LoginModal({ onClose }) {
  const navigate = useNavigate()
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative card p-8 max-w-sm w-full text-center z-10 animate-fadeIn">
        <div className="w-16 h-16 bg-primary-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">🔒</span>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Login Diperlukan</h3>
        <p className="text-white/60 text-sm mb-6">
          Silakan login terlebih dahulu untuk dapat memberikan like, rating, dan komentar pada karya.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">Batal</button>
          <button
            onClick={() => { onClose(); navigate('/login') }}
            className="btn-primary flex-1"
          >
            Login Sekarang
          </button>
        </div>
        <p className="mt-4 text-xs text-white/40">
          Belum punya akun?{' '}
          <button onClick={() => { onClose(); navigate('/register') }} className="text-primary-400 hover:underline">
            Daftar di sini
          </button>
        </p>
      </div>
    </div>
  )
}
