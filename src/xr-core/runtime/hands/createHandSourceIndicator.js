import * as THREE from "three";

function makeCanvas(width, height) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

function drawPanel(ctx, width, height, snapshot) {
  ctx.clearRect(0, 0, width, height);

  ctx.fillStyle = "rgba(8,12,20,0.78)";
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "rgba(200,220,255,0.18)";
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, width - 2, height - 2);

  ctx.fillStyle = "rgba(240,246,255,0.96)";
  ctx.font = "700 34px Inter, Arial";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText("HAND PATH", 28, 18);

  const left = snapshot?.left?.source ?? "none";
  const right = snapshot?.right?.source ?? "none";
  const presenting = snapshot?.presenting ? "XR ON" : "XR OFF";

  const colorFor = (value) => {
    if (value === "hand-tracking") return "rgba(190,255,205,0.95)";
    if (value === "none") return "rgba(255,210,210,0.95)";
    return "rgba(255,225,170,0.95)";
  };

  ctx.font = "600 24px Inter, Arial";
  ctx.fillStyle = "rgba(200,216,242,0.92)";
  ctx.fillText(`STATE  ${presenting}`, 28, 68);

  ctx.fillStyle = colorFor(left);
  ctx.fillText(`L  ${left}`, 28, 106);

  ctx.fillStyle = colorFor(right);
  ctx.fillText(`R  ${right}`, 28, 140);

  ctx.fillStyle = "rgba(170,190,220,0.86)";
  ctx.font = "400 18px Inter, Arial";
  ctx.fillText("fallback visuals hidden", 28, 180);
}

export function createHandSourceIndicator({ camera }) {
  const canvas = makeCanvas(512, 224);
  const ctx = canvas.getContext("2d");

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    opacity: 0.0,
    depthWrite: false,
    toneMapped: false,
  });

  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(0.34, 0.15),
    material
  );

  mesh.position.set(-0.22, -0.16, -0.58);
  mesh.renderOrder = 120;
  mesh.visible = false;

  camera.add(mesh);

  function update(snapshot) {
    const visible = Boolean(snapshot?.presenting);
    mesh.visible = visible;
    material.opacity = visible ? 0.94 : 0;

    if (!visible) return;

    drawPanel(ctx, canvas.width, canvas.height, snapshot);
    texture.needsUpdate = true;
  }

  function dispose() {
    try { mesh.removeFromParent(); } catch {}
    try { mesh.geometry.dispose(); } catch {}
    try { material.map.dispose(); } catch {}
    try { material.dispose(); } catch {}
  }

  return {
    mesh,
    update,
    dispose,
  };
}
