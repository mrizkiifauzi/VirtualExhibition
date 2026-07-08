import { Component, useRef, useState, useEffect, useMemo, Suspense, memo } from "react";
import { useTexture, useGLTF, Text, Billboard, Html } from "@react-three/drei";
import * as THREE from "three";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error("ArtworkFrame error:", error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || null;
    }
    return this.props.children;
  }
}

// ── Normalize URL aset supaya bisa dimuat dari frontend dev server
//  - public/artworks/* → /artworks/*
//  - storage/artworks/* → /artworks/*
//  - full URL atau path → normalisasi ke pathname saja
const toProxyUrl = (path, type = null) => {
  if (!path) return null;
  let normalized = String(path).trim();

  if (normalized.startsWith("http")) {
    try {
      normalized = new URL(normalized).pathname;
    } catch {
      // gunakan path original jika parsing gagal
    }
  }

  if (normalized.startsWith("/public/")) {
    normalized = normalized.slice(7);
  }
  if (normalized.startsWith("public/")) {
    normalized = normalized.slice(6);
  }
  if (normalized.startsWith("/storage/")) {
    normalized = normalized.slice(8);
  }
  if (normalized.startsWith("storage/")) {
    normalized = normalized.slice(7);
  }

  if (!normalized.includes("/")) {
    if (type === "image") {
      normalized = `artworks/img/${normalized}`;
    } else if (type === "video") {
      normalized = `artworks/video/${normalized}`;
    } else if (type === "3d") {
      normalized = `artworks/files/${normalized}`;
    }
  }

  if (!normalized.startsWith("/")) {
    normalized = `/${normalized}`;
  }

  return encodeURI(normalized);
};

// ─────────────────────────────────────────────────────────────────────────────
// Frame — bingkai utama dengan semua tipe karya
// ─────────────────────────────────────────────────────────────────────────────
function Frame({ artwork, position, rotation, onClick }) {
  const [hovered, setHovered] = useState(false);

  // ── Tentukan URL yang dipakai untuk render ─────────────────────────────────

  const renderContent = () => {
    if (thumbUrl) {
      return <ImagePlane url={thumbUrl} hovered={hovered} />;
    }

    if (videoUrl) {
      return <VideoPlane url={videoUrl} hovered={hovered} />;
    }

    if (glbUrl) {
      return (
        <ErrorBoundary fallback={<PlaceholderPlane label="Gagal memuat 3D" />}>
          <Suspense fallback={<PlaceholderPlane label="Memuat 3D..." />}>
            <GLBModel url={glbUrl} />
          </Suspense>
        </ErrorBoundary>
      );
    }

    return <PlaceholderPlane />;
  };

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* ── Bingkai luar ── */}
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
          document.body.style.cursor = "auto";
        }}
        castShadow={false}
      >
        <boxGeometry args={[3.2, 2.4, 0.12]} />
        <meshStandardMaterial
          color={artwork.tipe === "video" ? "#000000" : "#ffffff"}
          emissive={artwork.tipe === "video" ? "#111111" : "#222222"}
          emissiveIntensity={hovered ? 0.28 : 0.12}
          metalness={artwork.tipe === "video" ? 0.12 : 0.25}
          roughness={artwork.tipe === "video" ? 0.22 : 0.45}
        />
      </mesh>

      <mesh position={[0, 0, 0.05]}>
        <boxGeometry args={[3.0, 2.2, 0.02]} />
        <meshStandardMaterial
          color={artwork.tipe === "video" ? "#050505" : "#ede9fe"}
          metalness={0.1}
          roughness={0.55}
        />
      </mesh>

      {/* ── Konten karya ── */}
      {renderContent()}

      {/* ── Indikator tipe untuk video ── */}
      {artwork.tipe === "video" && !thumbUrl && (
        <Html position={[0, 0, 0.15]} center>
          <div
            style={{
              background: "rgba(0,0,0,0.7)",
              color: "white",
              padding: "4px 8px",
              borderRadius: "6px",
              fontSize: "11px",
              pointerEvents: "none",
            }}
          >
            🎬 Video
          </div>
        </Html>
      )}

      {/* ── Label judul & nama ── */}
      {hovered && (
        <Billboard position={[0, -1.55, 0.15]}>
          <Text
            fontSize={0.17}
            color="white"
            anchorX="center"
            anchorY="middle"
            maxWidth={3}
            font={undefined}
          >
            {artwork.judul}
          </Text>
          <Text
            position={[0, -0.26, 0]}
            fontSize={0.12}
            color="#a78bfa"
            anchorX="center"
            anchorY="middle"
          >
            {artwork.user?.name || ""}
          </Text>
        </Billboard>
      )}

      {/* ── Label judul & nama ── */}
      <Billboard position={[0, -1.55, 0.15]}>
        <Text
          fontSize={0.17}
          color="white"
          anchorX="center"
          anchorY="middle"
          maxWidth={3}
          font={undefined}
        >
          {artwork.judul}
        </Text>
        <Text
          position={[0, -0.26, 0]}
          fontSize={0.12}
          color="#a78bfa"
          anchorX="center"
          anchorY="middle"
        >
          {artwork.user?.name || ""}
        </Text>
      </Billboard>
    </group>
  );
}

const ArtworkFrame = memo(Frame, (prev, next) => {
  const samePosition =
    prev.position[0] === next.position[0] &&
    prev.position[1] === next.position[1] &&
    prev.position[2] === next.position[2];
  return (
    prev.artwork.id === next.artwork.id &&
    prev.artwork.file_path === next.artwork.file_path &&
    prev.artwork.thumbnail === next.artwork.thumbnail &&
    prev.artwork.tipe === next.artwork.tipe &&
    prev.artwork.judul === next.artwork.judul &&
    prev.artwork.status === next.artwork.status &&
    samePosition &&
    prev.rotation === next.rotation
  );
});

export default ArtworkFrame;

export function preloadArtwork(url, type) {
  if (!url) return;
  if (type === "3d") useGLTF.preload(url);
  else useTexture.preload(url);
}
