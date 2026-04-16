import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";
import LikeButton from "../interactions/LikeButton";
import RatingStars from "../interactions/RatingStars";
import LoginModal from "../common/LoginModal";
import { useState } from "react";

const API_URL = "http://localhost:8000/storage";

export default function ArtworkPopup({ artwork, onClose }) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [showModal, setShowModal] = useState(false);

  if (!artwork) return null;

  const thumb = artwork.thumbnail
    ? `${API_URL}/${artwork.thumbnail}`
    : artwork.tipe === "image"
      ? `${API_URL}/${artwork.file_path}`
      : null;

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
        <div
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
          onClick={onClose}
        />

        <div className="relative z-50 card max-w-lg w-full max-h-[90vh] overflow-y-auto">
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-all z-10"
          >
            ✕
          </button>

          {/* Image */}
          {thumb && (
            <div className="aspect-video bg-gray-900 overflow-hidden rounded-t-2xl">
              <img
                src={thumb}
                alt={artwork.judul}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-5">
            {/* Title */}
            <h2 className="text-xl font-bold text-white mb-1">
              {artwork.judul}
            </h2>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm text-white/50">oleh</span>
              <span className="text-sm text-primary-400 font-medium">
                {artwork.user?.name}
              </span>
              {artwork.program_studi && (
                <span className="text-xs bg-primary-900/50 text-primary-300 px-2 py-0.5 rounded-full">
                  {artwork.program_studi.nama_prodi}
                </span>
              )}
            </div>

            {artwork.deskripsi && (
              <p className="text-sm text-white/60 mb-4">{artwork.deskripsi}</p>
            )}

            {/* Interactions */}
            <div className="flex items-center gap-4 py-3 border-y border-white/10 mb-4">
              <LikeButton
                artworkId={artwork.id}
                initialLiked={artwork.user_liked}
                initialCount={artwork.likes_count || 0}
              />
              <RatingStars
                artworkId={artwork.id}
                initialRating={artwork.user_rating || 0}
                avgRating={artwork.ratings_avg_nilai || 0}
              />
              <div className="ml-auto flex items-center gap-1 text-sm text-white/50">
                <span>💬</span>
                <span>{artwork.comments_count || 0} komentar</span>
              </div>
            </div>

            {!user && (
              <div className="bg-primary-900/30 border border-primary-500/30 rounded-xl p-3 mb-4 text-center">
                <p className="text-sm text-white/70 mb-2">
                  Login untuk berinteraksi dengan karya ini
                </p>
                <button
                  onClick={() => setShowModal(true)}
                  className="btn-primary text-sm py-1.5"
                >
                  Login untuk Berinteraksi
                </button>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button onClick={onClose} className="btn-secondary flex-1">
                ← Kembali
              </button>
              <button
                onClick={() => {
                  onClose();
                  navigate(`/artworks/${artwork.id}`);
                }}
                className="btn-primary flex-1"
              >
                Lihat Detail
              </button>
            </div>
          </div>
        </div>
      </div>
      {showModal && <LoginModal onClose={() => setShowModal(false)} />}
    </>
  );
}
