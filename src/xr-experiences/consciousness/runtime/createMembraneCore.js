import * as THREE from "three";
import { sanctuaryExtractionPreset } from "../presets/sanctuaryExtractionPreset.js";

function disposeMaterial(material) {
  if (!material) return;
  if (Array.isArray(material)) {
    material.forEach((m) => m?.dispose?.());
    return;
  }
  material.dispose?.();
}

function createWireSphere(radius, color, opacity, detail = 4) {
  const mesh = new THREE.Mesh(
    new THREE.IcosahedronGeometry(radius, detail),
    new THREE.MeshBasicMaterial({
      color: new THREE.Color(color),
      wireframe: true,
      transparent: true,
      opacity,
      depthWrite: false,
    })
  );
  return mesh;
}

function createFloorRing(radius, opacity) {
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(Math.max(0.001, radius - 0.06), radius, 96),
    new THREE.MeshBasicMaterial({
      color: new THREE.Color("#93b0ff"),
      transparent: true,
      opacity,
      depthWrite: false,
      side: THREE.DoubleSide,
    })
  );
  ring.rotation.x = -Math.PI / 2;
  return ring;
}

export function createMembraneCore() {
  const preset = sanctuaryExtractionPreset;
  const root = new THREE.Group();
  root.name = "SanctuaryMembraneCore";

  const coreRoot = new THREE.Group();
  coreRoot.name = "SanctuaryMembraneCoreRoot";
  coreRoot.position.y = preset.core.y;
  root.add(coreRoot);

  const innerSphere = createWireSphere(
    preset.core.innerRadius,
    "#e6eeff",
    preset.core.innerOpacity,
    4
  );
  innerSphere.name = "SanctuaryMembraneInnerSphere";
  coreRoot.add(innerSphere);

  const outerField = createWireSphere(
    preset.core.outerRadius,
    "#84a7ff",
    preset.core.outerOpacity,
    3
  );
  outerField.name = "SanctuaryMembraneOuterField";
  coreRoot.add(outerField);

  const altarRing = createFloorRing(
    preset.altar.ringRadius,
    preset.altar.ringOpacity
  );
  altarRing.name = "SanctuaryMembraneAltarRing";
  root.add(altarRing);

  const haloRing = createFloorRing(
    preset.altar.haloRadius,
    preset.altar.haloOpacity
  );
  haloRing.name = "SanctuaryMembraneHaloRing";
  haloRing.position.y = 0.002;
  root.add(haloRing);

  const pointLight = new THREE.PointLight(
    new THREE.Color(preset.light.color),
    preset.light.intensity,
    preset.light.distance,
    preset.light.decay
  );
  pointLight.name = "SanctuaryMembranePointLight";
  pointLight.position.set(0, preset.core.y, 0);
  root.add(pointLight);

  let t = 0;

  return {
    root,
    update(deltaSeconds = 0) {
      t += deltaSeconds;

      coreRoot.rotation.y += deltaSeconds * preset.core.spinSpeed;
      outerField.rotation.y -= deltaSeconds * preset.core.spinSpeed * 0.45;

      const pulse =
        1 +
        Math.sin(t * preset.core.pulseSpeed) * preset.core.pulseAmplitude;

      innerSphere.scale.setScalar(pulse);
      outerField.material.opacity =
        preset.core.outerOpacity + Math.sin(t * 0.7) * 0.015;
      pointLight.intensity =
        preset.light.intensity + Math.sin(t * 0.9) * 0.08;
    },
    dispose() {
      root.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose?.();
        if (obj.material) disposeMaterial(obj.material);
      });
      root.removeFromParent();
    },
  };
}
