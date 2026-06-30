import { Canvas } from "@react-three/fiber";
import { Component, Suspense, useEffect, useMemo, useState } from "react";
import { Environment, Html, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import PlayerControls from "./PlayerControls";
import ArtworkFrame, { preloadArtwork } from "./ArtworkFrame";
import LoadingScreen from "./LoadingScreen";

const roomModelUrl = new URL("../../assets/3d/gallery.glb", import.meta.url)
  .href;

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error("3D scene error:", error);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <mesh>
          <planeGeometry args={[10, 5]} />
          <meshBasicMaterial color="#2d0262" />
        </mesh>
      );
    }
    return this.props.children;
  }
}

function CanvasFallback() {
  return (
    <Html center>
      <LoadingScreen />
    </Html>
  );
}

function RoomScene({ setColliders }) {
  const { scene } = useGLTF(roomModelUrl);

  useEffect(() => {
    const colliderList = [];

    scene.traverse((child) => {
      if (child.name.startsWith("Collider_")) {
        child.visible = false;
        colliderList.push(child);
      }
    });

    console.log("Jumlah collider:", colliderList.length);

    setColliders(colliderList);
  }, [scene, setColliders]);

  return (
    <primitive
      object={scene}
      scale={[1, 1, 1]}
      position={[0, 0, 0]}
      rotation={[0, 0, 0]}
    />
  );
}

export default function VirtualRoom({ artworks, onArtworkClick }) {
  const [colliders, setColliders] = useState([]);
  const visibleArtworks = useMemo(
    () =>
      (artworks || []).filter(
        (artwork) => artwork.status == null || artwork.status === "verified",
      ),
    [artworks],
  );

  const artworkPositions = useMemo(
    () =>
      visibleArtworks.map((artwork, i) => {
        const columns = 4;
        const row = Math.floor(i / columns);
        const col = i % columns;
        const x = (col - (columns - 1) / 2) * 7;
        const z = -4 - row * 8;
        return {
          artwork,
          position: artwork.posisi_3d
            ? [artwork.posisi_3d.x, artwork.posisi_3d.y, artwork.posisi_3d.z]
            : [x, 2, z],
          rotation: artwork.posisi_3d?.rotation || 0,
        };
      }),
    [visibleArtworks],
  );

  useEffect(() => {
    preloadArtwork(roomModelUrl, "3d");
    visibleArtworks.forEach((artwork) => {
      const url = artwork.thumbnail || artwork.file_path;
      const type = artwork.thumbnail ? "image" : artwork.tipe;
      preloadArtwork(url, type);
    });
  }, [visibleArtworks]);

  return (
    <div className="w-full h-full relative">
      <Canvas
        shadows={false}
        dpr={[1, 1]}
        performance={{ min: 0.6, max: 1 }}
        gl={{
          antialias: true,
          powerPreference: "high-performance",
          alpha: false,
        }}
        camera={{ position: [0, 1.6, 5], fov: 75, near: 0.1, far: 100 }}
        style={{ background: "#050010" }}
        onCreated={({ gl }) => {
          gl.setClearColor(new THREE.Color("#050010"));
        }}
      >
        <Suspense fallback={<CanvasFallback />}>
          <ambientLight intensity={0.5} />
          <hemisphereLight
            intensity={0.4}
            skyColor="#d8b4fe"
            groundColor="#18181b"
          />
          <directionalLight
            position={[5, 10, 5]}
            intensity={0.7}
            color="#fafafa"
          />
          <directionalLight
            position={[-5, 8, -5]}
            intensity={0.35}
            color="#a5b4fc"
          />
          <Environment preset="city" />

          <ErrorBoundary>
            <RoomScene setColliders={setColliders} />
          </ErrorBoundary>
          <PlayerControls colliders={colliders} />

          {artworkPositions.map(({ artwork, position, rotation }) => (
            <ErrorBoundary
              key={artwork.id}
              fallback={
                <Html position={position} center>
                  <div className="bg-black/70 text-white rounded-xl border border-white/10 px-3 py-2 text-xs">
                    Karya gagal dimuat
                  </div>
                </Html>
              }
            >
              <ArtworkFrame
                artwork={artwork}
                position={position}
                rotation={rotation}
                onClick={() => onArtworkClick(artwork)}
              />
            </ErrorBoundary>
          ))}
        </Suspense>
      </Canvas>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white/70 text-xs px-4 py-2 rounded-full flex items-center gap-4">
        <span>⌨️ WASD — Gerak</span>
        <span>🖱️ Mouse — Putar kamera</span>
        <span>🖱️ Klik karya — Lihat detail</span>
      </div>
    </div>
  );
}
