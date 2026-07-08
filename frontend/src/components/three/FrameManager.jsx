import { useEffect } from "react";
import * as THREE from "three";

const API_URL = "http://localhost:8000";

function buildMediaUrl(path) {
  if (!path) return null;

  const normalized = String(path).trim();
  if (normalized.startsWith("http")) return normalized;

  return `${API_URL}/${normalized.replace(/^\/+/, "")}`;
}

function isVideoArtwork(artwork) {
  const type = `${artwork.tipe || artwork.type || ""}`.toLowerCase();
  const filePath = `${artwork.file_path || artwork.thumbnail || ""}`.toLowerCase();

  return type === "video" || /\.(mp4|webm|ogg|mov)$/i.test(filePath);
}

function padFrame(frame) {
  const frameNumber = Number(frame);
  if (!Number.isFinite(frameNumber)) return String(frame);
  return String(frameNumber).padStart(2, "0");
}

function getFrameObjectName(artwork, frame) {
  const normalizedFrame = padFrame(frame);
  const isVideo = isVideoArtwork(artwork);

  if (isVideo) {
    return [
      `FrameVideo_${normalizedFrame}`,
      `FrameVideo_${frame}`,
      `Frame_${normalizedFrame}`,
    ];
  }

  return [`Frame_${frame}`, `Frame_${normalizedFrame}`];
}

function applyTextureToMaterial(material, texture) {
  if (!material) return;

  if (Array.isArray(material)) {
    material.forEach((entry) => {
      if (entry) {
        entry.map = texture;
        entry.needsUpdate = true;
      }
    });
    return;
  }

  material.map = texture;
  material.needsUpdate = true;
}

export default function FrameManager({ scene, artworks }) {
  useEffect(() => {
    if (!scene) return;

    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");
    const createdVideos = [];

    artworks.forEach((artwork) => {
      if (!artwork.posisi_3d?.frame) return;

      const frameNames = getFrameObjectName(artwork, artwork.posisi_3d.frame);
      const frame = frameNames
        .map((name) => scene.getObjectByName(name))
        .find(Boolean);

      if (!frame) {
        console.log("Tidak ketemu frame:", artwork.posisi_3d.frame, frameNames);
        return;
      }

      const mediaUrl = buildMediaUrl(artwork.thumbnail || artwork.file_path);
      if (!mediaUrl) return;

      if (isVideoArtwork(artwork)) {
        const video = document.createElement("video");
        video.src = mediaUrl;
        video.crossOrigin = "anonymous";
        video.loop = true;
        video.muted = true;
        video.playsInline = true;
        video.autoplay = true;
        video.preload = "auto";

        video.addEventListener("loadeddata", () => {
          video.play().catch(() => {});
        });

        const texture = new THREE.VideoTexture(video);
        texture.flipY = false;
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.needsUpdate = true;

        applyTextureToMaterial(frame.material, texture);
        createdVideos.push(video);
        return;
      }

      const texture = loader.load(
        mediaUrl,
        (loadedTexture) => {
          loadedTexture.flipY = false;
          loadedTexture.colorSpace = THREE.SRGBColorSpace;
          applyTextureToMaterial(frame.material, loadedTexture);
        },
        undefined,
        (err) => {
          console.error("Texture gagal:", err);
        },
      );

      texture.flipY = false;
      applyTextureToMaterial(frame.material, texture);
    });

    return () => {
      createdVideos.forEach((video) => {
        video.pause();
        video.removeAttribute("src");
        video.load();
      });
      createdVideos.length = 0;
    };
  }, [scene, artworks]);

  return null;
}