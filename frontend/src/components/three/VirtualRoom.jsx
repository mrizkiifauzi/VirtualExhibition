import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { Sky, Stars, Environment } from "@react-three/drei";
import PlayerControls from "./PlayerControls";
import ArtworkFrame from "./ArtworkFrame";
import LoadingScreen from "./LoadingScreen";

function RoomGeometry() {
  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#1a0a2e" roughness={0.8} metalness={0.2} />
      </mesh>

      {/* Ceiling */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 6, 0]}>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#0d0520" />
      </mesh>

      {/* Walls */}
      {/* Front */}
      <mesh position={[0, 3, -25]}>
        <planeGeometry args={[50, 6]} />
        <meshStandardMaterial color="#120830" />
      </mesh>
      {/* Back */}
      <mesh position={[0, 3, 25]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[50, 6]} />
        <meshStandardMaterial color="#120830" />
      </mesh>
      {/* Left */}
      <mesh position={[-25, 3, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[50, 6]} />
        <meshStandardMaterial color="#120830" />
      </mesh>
      {/* Right */}
      <mesh position={[25, 3, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[50, 6]} />
        <meshStandardMaterial color="#120830" />
      </mesh>

      {/* Floor grid lines for depth effect */}
      <gridHelper
        args={[50, 25, "#3b0764", "#1e0a3c"]}
        position={[0, 0.01, 0]}
      />

      {/* Ambient light strips on ceiling */}
      <pointLight position={[0, 5.5, 0]} intensity={0.5} color="#7c3aed" />
      <pointLight position={[-10, 5, -10]} intensity={0.3} color="#4f46e5" />
      <pointLight position={[10, 5, 10]} intensity={0.3} color="#4f46e5" />
      <pointLight position={[-10, 5, 10]} intensity={0.3} color="#6d28d9" />
      <pointLight position={[10, 5, -10]} intensity={0.3} color="#6d28d9" />
    </group>
  );
}

export default function VirtualRoom({ artworks, onArtworkClick }) {
  return (
    <div className="w-full h-full relative">
      <Suspense fallback={<LoadingScreen />}>
        <Canvas
          shadows={false} // Matikan dulu bayangan untuk tes stabilitas
          dpr={[1, 1.5]} // Batasi resolusi agar tidak terlalu berat (jangan pakai [1, 2])
          gl={{
            antialias: true,
            powerPreference: "high-performance",
            preserveDrawingBuffer: true,
          }}
          camera={{ position: [0, 1.6, 5], fov: 75, near: 0.1, far: 100 }} // Perkecil 'far' dari 200 ke 100
          style={{ background: "#050010" }}
        >
          <ambientLight intensity={0.2} />
          <Stars radius={100} depth={50} count={3000} factor={4} fade />

          <RoomGeometry />
          <PlayerControls />

          {artworks &&
            artworks
              .slice(0, 2)
              .map((artwork, i) => (
                <ArtworkFrame
                  key={artwork.id}
                  artwork={artwork}
                  position={
                    artwork.posisi_3d
                      ? [
                          artwork.posisi_3d.x,
                          artwork.posisi_3d.y,
                          artwork.posisi_3d.z,
                        ]
                      : [((i % 5) - 2) * 7, 2, -Math.floor(i / 5) * 8 - 4]
                  }
                  rotation={artwork.posisi_3d?.rotation || 0}
                  onClick={() => onArtworkClick(artwork)}
                />
              ))}
        </Canvas>
      </Suspense>

      {/* Controls hint */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white/70 text-xs px-4 py-2 rounded-full flex items-center gap-4">
        <span>⌨️ WASD — Gerak</span>
        <span>🖱️ Mouse — Putar kamera</span>
        <span>🖱️ Klik karya — Lihat detail</span>
      </div>
    </div>
  );
}
