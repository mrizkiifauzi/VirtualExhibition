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
// ImagePlane — muat texture via proxy, TIDAK pakai try/catch di luar hooks
// ─────────────────────────────────────────────────────────────────────────────
function ImagePlane({ url }) {
  const texture = useTexture(url, (loader) => {
    loader.crossOrigin = "anonymous";
  });

  useEffect(() => {
    if (!texture) return;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = true;

    return () => {
      if (texture.dispose) texture.dispose();
    };
  }, [texture]);

  return (
    <mesh position={[0, 0, 0.07]}>
      <planeGeometry args={[2.8, 2]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Fallback plane saat tidak ada texture / loading
// ─────────────────────────────────────────────────────────────────────────────
function PlaceholderPlane({ label }) {
  return (
    <mesh position={[0, 0, 0.07]}>
      <planeGeometry args={[2.8, 2]} />
      <meshBasicMaterial color="#1a0a2e" toneMapped={false} />
    </mesh>
  );
}

function VideoPlane({ url, hovered }) {
  const videoRef = useRef(null);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    if (!videoRef.current) {
      const element = document.createElement("video");
      element.crossOrigin = "anonymous";
      element.muted = true;
      element.loop = true;
      element.playsInline = true;
      element.autoplay = false;
      element.preload = "metadata";
      element.style.display = "none";
      element.setAttribute("muted", "true");
      element.setAttribute("playsinline", "true");
      element.oncanplay = () => setVideoReady(true);
      videoRef.current = element;
    }

    const video = videoRef.current;
    if (video.src !== url) {
      video.src = url;
      setVideoReady(false);
    }

    return () => {
      if (video.pause) video.pause();
    };
  }, [url]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (hovered && videoReady) {
      video.play().catch(() => {});
    } else {
      if (video.pause) video.pause();
    }
  }, [hovered, videoReady]);

  const texture = useMemo(() => {
    if (!hovered || !videoReady || !videoRef.current) return null;
    const videoTexture = new THREE.VideoTexture(videoRef.current);
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;
    videoTexture.format = THREE.RGBAFormat;
    videoTexture.needsUpdate = true;
    return videoTexture;
  }, [hovered, videoReady]);

  useEffect(() => {
    return () => {
      if (texture) texture.dispose();
    };
  }, [texture]);

  if (!hovered || !texture) {
    return <PlaceholderPlane label="Hover untuk memuat video" />;
  }

  return (
    <mesh position={[0, 0, 0.07]}>
      <planeGeometry args={[2.8, 2]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// GLBModel — render file .glb / .gltf di dalam frame
// ─────────────────────────────────────────────────────────────────────────────
function GLBModel({ url }) {
  const { scene } = useGLTF(url);

  const cloned = useMemo(() => {
    const c = scene.clone(true);
    c.traverse((obj) => {
      if (obj.isMesh) obj.castShadow = obj.receiveShadow = true;
    });
    return c;
  }, [scene]);

  const { scale, center } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(cloned);
    const size = new THREE.Vector3();
    const centerVec = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(centerVec);
    const maxDim = Math.max(size.x, size.y, size.z);
    return {
      scale: maxDim > 0 ? 1.6 / maxDim : 1,
      center: centerVec,
    };
  }, [cloned]);

  return (
    <group position={[0, 0, 0.3]}>
      <primitive
        object={cloned}
        scale={scale}
        position={[-center.x * scale, -center.y * scale, -center.z * scale]}
      />
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Frame — bingkai utama dengan semua tipe karya
// ─────────────────────────────────────────────────────────────────────────────
function Frame({ artwork, position, rotation, onClick }) {
  const [hovered, setHovered] = useState(false);

  // ── Tentukan URL yang dipakai untuk render ─────────────────────────────────
  const thumbUrl = artwork.thumbnail
    ? toProxyUrl(artwork.thumbnail)
    : artwork.tipe === "image"
      ? toProxyUrl(artwork.file_path)
      : null;

  const glbUrl = artwork.tipe === "3d" ? toProxyUrl(artwork.file_path) : null;
  const videoUrl =
    artwork.tipe === "video" ? toProxyUrl(artwork.file_path) : null;

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

      {/* ── Spotlight ── */}
      {/* <spotLight
        position={[0, 3, 1.5]}
        intensity={hovered ? 2.5 : 1}
        angle={0.45}
        penumbra={0.6}
        color="#a78bfa"
        castShadow={false}
      /> */}

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
