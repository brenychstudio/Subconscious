import * as THREE from "three";

export function createStarSpriteTexture({
  size = 128,
  coreAlpha = 1,
  haloAlpha = 0.24,
  outerAlpha = 0.02,
} = {}) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext("2d");
  const half = size * 0.5;

  const gradient = ctx.createRadialGradient(
    half,
    half,
    0,
    half,
    half,
    half
  );

  gradient.addColorStop(0.0, `rgba(255,255,255,${coreAlpha})`);
  gradient.addColorStop(0.10, `rgba(255,255,255,${coreAlpha})`);
  gradient.addColorStop(0.24, `rgba(238,244,255,${coreAlpha * 0.92})`);
  gradient.addColorStop(0.44, `rgba(196,216,255,${haloAlpha})`);
  gradient.addColorStop(0.72, `rgba(104,136,220,${haloAlpha * 0.18})`);
  gradient.addColorStop(1.0, `rgba(0,0,0,${outerAlpha})`);

  ctx.clearRect(0, 0, size, size);
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(half, half, half, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;

  return texture;
}
