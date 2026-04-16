export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-gray-950 flex flex-col items-center justify-center z-50">
      <div className="relative mb-8">
        <div className="w-20 h-20 border-4 border-primary-600/30 border-t-primary-500 rounded-full animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl">🖼️</span>
        </div>
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">Virtual Exhibition</h2>
      <p className="text-white/50 text-sm animate-pulse">Memuat ruang galeri 3D...</p>
      <div className="mt-8 flex gap-2">
        {[0,1,2].map(i => (
          <div
            key={i}
            className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  )
}
