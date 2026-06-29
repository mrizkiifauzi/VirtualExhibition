import { Link } from "react-router-dom";
import { useState } from "react";
import React from "react";
import LikeButton from "../interactions/LikeButton";

const API_URL = "http://localhost:8000"; // Sesuaikan dengan URL backend

function ArtworkCard({ artwork, priority = false }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const thumb = artwork.thumbnail
    ? `${API_URL}/${artwork.thumbnail}`
    : artwork.tipe === "image"
      ? `${API_URL}/${artwork.file_path}`
      : null;

  const loadingStrategy = priority ? "eager" : "lazy";
  const fetchPriority = priority ? "high" : "auto";

  const typeIcon = { image: "🖼️", video: "🎬" };

  return (
    <div className="overflow-hidden transition-all duration-300 card group hover:border-primary-500/50 hover:shadow-lg hover:shadow-primary-900/20">
      {/* Thumbnail */}
      <div className="relative aspect-[4/3] bg-gray-900 overflow-hidden">
        {/* Skeleton */}
        {!loaded && (
          <div className="absolute inset-0 animate-pulse bg-white/5" />
        )}

        {thumb && !error ? (
          <img
            src={thumb}
            alt={artwork.judul}
            loading={loadingStrategy}
            fetchPriority={fetchPriority}
            decoding="async"
            width="400"
            height="300"
            onLoad={() => setLoaded(true)}
            onError={() => setError(true)}
            className={`w-full h-full object-cover transition-all duration-500 
              ${loaded ? "opacity-100 scale-100" : "opacity-0 scale-105"} 
              group-hover:scale-105`}
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            <span className="text-5xl opacity-30">
              {typeIcon[artwork.tipe]}
            </span>
          </div>
        )}

        {/* Type badge */}
        <span className="absolute px-2 py-1 text-xs text-white rounded-full top-2 right-2 bg-black/60 backdrop-blur-sm">
          {typeIcon[artwork.tipe]} {artwork.tipe.toUpperCase()}
        </span>
      </div>

      {/* Info */}
      <div className="p-4">
        <Link to={`/artworks/${artwork.id}`}>
          <h3 className="mb-1 font-semibold text-white transition-colors group-hover:text-primary-400 line-clamp-1">
            {artwork.judul}
          </h3>
        </Link>

        <p className="mb-1 text-xs text-white/50">{artwork.user?.name}</p>

        {artwork.program_studi && (
          <p className="mb-3 text-xs text-primary-400/70">
            {artwork.program_studi.nama_prodi}
          </p>
        )}

        {artwork.deskripsi && (
          <p className="mb-3 text-sm text-white/50 line-clamp-2">
            {artwork.deskripsi}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <LikeButton
            artworkId={artwork.id}
            initialLiked={artwork.user_liked || false}
            initialCount={artwork.likes_count || 0}
            size="sm"
          />

          <div className="flex items-center gap-1 text-xs text-white/50">
            <span>⭐</span>
            <span>
              {artwork.ratings_avg_nilai
                ? Number(artwork.ratings_avg_nilai).toFixed(1)
                : "—"}
            </span>
          </div>

          <div className="flex items-center gap-1 text-xs text-white/50">
            <span>💬</span>
            <span>{artwork.comments_count || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// 🔥 penting: cegah re-render
export default React.memo(ArtworkCard);
