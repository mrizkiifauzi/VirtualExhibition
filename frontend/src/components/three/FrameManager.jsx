import { useEffect } from "react";
import * as THREE from "three";

const API_URL = "http://localhost:8000";

export default function FrameManager({ scene, artworks }) {

    useEffect(() => {

        if (!scene) return;

        const loader = new THREE.TextureLoader();
        loader.setCrossOrigin("anonymous");

        artworks.forEach((artwork) => {

            if (!artwork.posisi_3d?.frame) return;

            const frame = scene.getObjectByName(
                `Frame_${artwork.posisi_3d.frame}`
            );

            if (!frame) {
                console.log("Tidak ketemu:", artwork.posisi_3d.frame);
                return;
            }

            console.log("Ketemu:", frame.name);

            console.log("Artwork:", artwork);

const imageUrl = `${API_URL}/${artwork.thumbnail || artwork.file_path}`;

console.log("Image URL:", imageUrl);

console.log("Load texture:", imageUrl);

const texture = loader.load(
    imageUrl,
    (texture) => {

        console.log("Texture berhasil:", artwork.judul);

        texture.flipY = false;
        texture.colorSpace = THREE.SRGBColorSpace;

        frame.material.map = texture;
        frame.material.needsUpdate = true;

    },
    undefined,
    (err) => {
        console.error("Texture gagal:", err);
    }
);

            texture.flipY = false;

            frame.material.map = texture;
            frame.material.needsUpdate = true;

        });

    }, [scene, artworks]);

    return null;
}