import { useRef, useState, Suspense } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture, useGLTF, Text, Billboard, Html } from "@react-three/drei";
import * as THREE from "three";

// ── Gunakan path relatif supaya request lewat proxy Vite (bukan direct ke :8000)
// vite.config.js sudah proxy /storage → http://localhost:8000/storage
const toProxyUrl = (path) => {
  if (!path) return null;
  // Jika sudah full URL, ambil path-nya saja
  if (path.startsWith("http")) {
    try {
      return new URL(path).pathname;
    } catch {
      return path;
    }
  }
  return `/storage/${path}`;
};

// ─────────────────────────────────────────────────────────────────────────────
// ImagePlane — muat texture via proxy, TIDAK pakai try/catch di luar hooks
// ─────────────────────────────────────────────────────────────────────────────
function ImagePlane({ url, hovered }) {
  // Tambahkan callback untuk setting crossOrigin
  const texture = useTexture(url, (tex) => {
    tex.crossOrigin = "anonymous";
  });

  if (texture) {
    texture.colorSpace = THREE.SRGBColorSpace;
    // texture.needsUpdate = true; // Hapus ini, tidak perlu di setiap render
  }

  return (
    <mesh position={[0, 0, 0.07]}>
      <planeGeometry args={[2.8, 2]} />
      <meshStandardMaterial
        map={texture}
        emissive={hovered ? "#4c1d95" : "#000000"}
        emissiveIntensity={hovered ? 0.15 : 0}
        toneMapped={false}
      />
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
      <meshStandardMaterial color="#1a0a2e" />
    </mesh>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// GLBModel — render file .glb / .gltf di dalam frame
// ─────────────────────────────────────────────────────────────────────────────
function GLBModel({ url }) {
  const { scene } = useGLTF(url);

  // Gunakan useMemo agar cloning hanya terjadi saat scene berubah
  const cloned = useMemo(() => {
    const c = scene.clone(true);
    // Tambahkan pengaturan shadow jika perlu
    c.traverse((obj) => {
      if (obj.isMesh) obj.castShadow = obj.receiveShadow = true;
    });
    return c;
  }, [scene]);

  // Hitung skala hanya sekali
  const scale = useMemo(() => {
    const box = new THREE.Box3().setFromObject(cloned);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    return maxDim > 0 ? 1.6 / maxDim : 1;
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
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  // Smooth hover glow
  useFrame(() => {
    if (!meshRef.current) return;
    meshRef.current.material.emissiveIntensity = THREE.MathUtils.lerp(
      meshRef.current.material.emissiveIntensity,
      hovered ? 0.45 : 0.1,
      0.08,
    );
  });

  // ── Tentukan URL yang dipakai untuk render ─────────────────────────────────
  const thumbUrl = artwork.thumbnail
    ? toProxyUrl(artwork.thumbnail)
    : artwork.tipe === "image"
      ? toProxyUrl(artwork.file_path)
      : null;

  const glbUrl = artwork.tipe === "3d" ? toProxyUrl(artwork.file_path) : null;

  // ── Konten dalam bingkai sesuai tipe ──────────────────────────────────────
  const renderContent = () => {
    // Kalau ada thumbnail selalu tampilkan thumbnail (berlaku untuk video & 3d juga)
    if (thumbUrl) {
      return (
        <Suspense fallback={<PlaceholderPlane />}>
          <ImagePlane url={thumbUrl} hovered={hovered} />
        </Suspense>
      );
    }

    // 3D model tanpa thumbnail → render GLB langsung
    if (glbUrl) {
      return (
        <Suspense fallback={<PlaceholderPlane label="Memuat 3D..." />}>
          <GLBModel url={glbUrl} />
        </Suspense>
      );
    }

    // Video atau karya tanpa preview
    return <PlaceholderPlane />;
  };

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* ── Bingkai luar ── */}
      <mesh
        ref={meshRef}
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
        castShadow
      >
        <boxGeometry args={[3.2, 2.4, 0.12]} />
        <meshStandardMaterial
          color="#2d1b69"
          emissive="#4c1d95"
          emissiveIntensity={0.1}
          metalness={0.6}
          roughness={0.3}
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

export default function ArtworkFrame(props) {
  return <Frame {...props} />;
}

export function preloadArtwork(url, type) {
  if (type === "3d") useGLTF.preload(url);
  else useTexture.preload(url);
}
