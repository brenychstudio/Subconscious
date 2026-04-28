import * as THREE from "three";
import { templeSanctuaryPreset } from "../presets/templeSanctuaryPreset.js";

function disposeMaterial(material) {
  if (!material) return;
  if (Array.isArray(material)) {
    material.forEach((m) => m?.dispose?.());
    return;
  }
  material.dispose?.();
}

function makeTempleMaterial({
  color = "#8ea9ff",
  opacity = 0.16,
  emissive = "#6587ea",
  emissiveIntensity = 0.14,
} = {}) {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    transparent: true,
    opacity,
    roughness: 0.94,
    metalness: 0.04,
    emissive: new THREE.Color(emissive),
    emissiveIntensity,
    depthWrite: false,
  });
}

function makeBasicGlow({ color = "#a7c2ff", opacity = 0.08 } = {}) {
  return new THREE.MeshBasicMaterial({
    color: new THREE.Color(color),
    transparent: true,
    opacity,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
}

function createRing(radius, opacity) {
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(Math.max(0.001, radius - 0.06), radius, 96),
    makeBasicGlow({ opacity })
  );
  ring.rotation.x = -Math.PI / 2;
  return ring;
}

function createPylon(width, depth, height, opacity) {
  const group = new THREE.Group();

  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(width * 0.62, width * 0.76, height * 0.055, 12),
    makeTempleMaterial({
      opacity: opacity * 0.72,
      emissiveIntensity: 0.045,
    })
  );
  base.position.y = height * 0.027;
  group.add(base);

  const lowerSleeve = new THREE.Mesh(
    new THREE.CylinderGeometry(width * 0.34, width * 0.42, height * 0.16, 12),
    makeTempleMaterial({
      opacity: opacity * 0.52,
      emissiveIntensity: 0.055,
    })
  );
  lowerSleeve.position.y = height * 0.105;
  group.add(lowerSleeve);

  const shaft = new THREE.Mesh(
    new THREE.CylinderGeometry(width * 0.115, width * 0.19, height * 0.78, 12),
    makeTempleMaterial({
      opacity: opacity * 0.82,
      emissiveIntensity: 0.085,
    })
  );
  shaft.position.y = height * 0.47;
  group.add(shaft);

  const innerSpine = new THREE.Mesh(
    new THREE.CylinderGeometry(width * 0.026, width * 0.026, height * 0.64, 8),
    makeBasicGlow({
      opacity: opacity * 0.34,
    })
  );
  innerSpine.position.y = height * 0.47;
  group.add(innerSpine);

  const crown = new THREE.Mesh(
    new THREE.CylinderGeometry(width * 0.18, width * 0.22, height * 0.055, 12),
    makeTempleMaterial({
      opacity: opacity * 0.42,
      emissiveIntensity: 0.055,
    })
  );
  crown.position.y = height * 0.855;
  group.add(crown);

  const tip = new THREE.Mesh(
    new THREE.ConeGeometry(width * 0.24, height * 0.105, 12),
    makeTempleMaterial({
      opacity: opacity * 0.58,
      emissiveIntensity: 0.08,
    })
  );
  tip.position.y = height * 0.935;
  group.add(tip);

  return group;
}

function createRearGate(preset) {
  const root = new THREE.Group();
  root.name = "TempleSanctuaryRearGate";

  const left = createPylon(
    preset.pillarWidth,
    preset.pillarDepth,
    preset.height,
    preset.opacity
  );
  left.position.set(-preset.width * 0.5, 0, preset.z);
  root.add(left);

  const right = createPylon(
    preset.pillarWidth,
    preset.pillarDepth,
    preset.height,
    preset.opacity
  );
  right.position.set(preset.width * 0.5, 0, preset.z);
  root.add(right);

  const lintel = new THREE.Mesh(
    new THREE.BoxGeometry(
      preset.width + preset.pillarWidth * 0.55,
      preset.lintelHeight,
      preset.pillarDepth * 0.82
    ),
    makeTempleMaterial({
      opacity: preset.opacity + 0.03,
      emissiveIntensity: 0.1,
    })
  );
  lintel.position.set(0, preset.height - preset.lintelHeight * 0.55, preset.z);
  root.add(lintel);

  const innerFrameLeft = new THREE.Mesh(
    new THREE.BoxGeometry(
      preset.pillarWidth * 0.46,
      preset.innerHeight,
      preset.pillarDepth * 0.25
    ),
    makeBasicGlow({ opacity: preset.opacity * 0.5 })
  );
  innerFrameLeft.position.set(
    -preset.innerWidth * 0.5,
    preset.innerHeight * 0.5,
    preset.z + 0.01
  );
  root.add(innerFrameLeft);

  const innerFrameRight = innerFrameLeft.clone();
  innerFrameRight.position.x = preset.innerWidth * 0.5;
  root.add(innerFrameRight);

  const innerLintel = new THREE.Mesh(
    new THREE.BoxGeometry(
      preset.innerWidth,
      preset.lintelHeight * 0.56,
      preset.pillarDepth * 0.18
    ),
    makeBasicGlow({ opacity: preset.opacity * 0.45 })
  );
  innerLintel.position.set(0, preset.innerHeight, preset.z + 0.01);
  root.add(innerLintel);

  return root;
}

export function createTempleSanctuary() {
  const preset = templeSanctuaryPreset;

  const root = new THREE.Group();
  root.name = "TempleSanctuaryRoot";

  const decorRoot = new THREE.Group();
  decorRoot.name = "TempleSanctuaryDecorRoot";
  root.add(decorRoot);

  const altarRoot = new THREE.Group();
  altarRoot.name = "TempleSanctuaryAltarRoot";
  altarRoot.position.set(
    preset.chamber.position.x,
    preset.chamber.position.y,
    preset.chamber.position.z
  );
  root.add(altarRoot);

  const altarDisc = new THREE.Mesh(
    new THREE.CylinderGeometry(
      preset.altar.radius,
      preset.altar.radius * 1.08,
      preset.altar.height,
      64
    ),
    makeTempleMaterial({
      opacity: 0.11,
      emissiveIntensity: 0.06,
    })
  );
  altarDisc.position.set(0, preset.altar.height * 0.5, 0);
  altarRoot.add(altarDisc);

  preset.floorRings.radii.forEach((radius, index) => {
    const ring = createRing(radius, Math.max(0.03, preset.floorRings.opacity - index * 0.025));
    ring.position.y = 0.01 + index * 0.002;
    decorRoot.add(ring);
  });

  for (let i = 0; i < preset.processionalRows.count; i += 1) {
    const z = preset.processionalRows.zStart - i * preset.processionalRows.zGap;
    const height =
      preset.processionalRows.baseHeight -
      i * preset.processionalRows.heightFalloff;

    const left = createPylon(
      preset.processionalRows.width,
      preset.processionalRows.depth,
      height,
      preset.processionalRows.opacity
    );
    left.position.set(preset.processionalRows.leftX, 0, z);
    left.rotation.z = 0.012;
    decorRoot.add(left);

    const right = createPylon(
      preset.processionalRows.width,
      preset.processionalRows.depth,
      height,
      preset.processionalRows.opacity
    );
    right.position.set(preset.processionalRows.rightX, 0, z);
    right.rotation.z = -0.012;
    decorRoot.add(right);
  }

  if (preset.sideSentinels.enabled) {
    preset.sideSentinels.positions.forEach((item) => {
      const sentinel = createPylon(
        preset.sideSentinels.width,
        preset.sideSentinels.depth,
        item.h,
        preset.sideSentinels.opacity
      );
      sentinel.position.set(item.x, 0, item.z);
      sentinel.rotation.z = item.x < 0 ? 0.01 : -0.01;
      decorRoot.add(sentinel);
    });
  }

  const rearGate = createRearGate(preset.rearGate);
  decorRoot.add(rearGate);

  const chamberAnchor = new THREE.Group();
  chamberAnchor.name = "TempleSanctuaryChamberAnchor";
  chamberAnchor.position.set(
    0,
    preset.altar.height + preset.chamber.offsetY,
    0
  );
  altarRoot.add(chamberAnchor);

  const chamberLight = new THREE.PointLight(
    new THREE.Color("#b7ccff"),
    preset.chamber.lightIntensity,
    preset.chamber.lightDistance,
    2
  );
  chamberLight.position.set(0, preset.altar.height + 1.2, 0);
  root.add(chamberLight);

  const callRing = new THREE.Mesh(
    new THREE.TorusGeometry(
      preset.callLight.ringRadius,
      0.018,
      12,
      120
    ),
    makeBasicGlow({ opacity: preset.callLight.ringOpacity })
  );
  callRing.position.set(0, preset.altar.height + 1.02, -0.38);
  decorRoot.add(callRing);

  const rearGlow = new THREE.Mesh(
    new THREE.CircleGeometry(preset.chamber.auraRadius, 64),
    makeBasicGlow({ opacity: preset.callLight.rearGlowOpacity })
  );
  rearGlow.position.set(0, preset.altar.height + 1.0, -0.52);
  decorRoot.add(rearGlow);

  let t = 0;

  return {
    root,
    altarRoot,
    chamberAnchor,
    update(deltaSeconds = 0) {
      t += deltaSeconds;
      chamberAnchor.rotation.y += deltaSeconds * preset.chamber.spinSpeed;
      callRing.material.opacity =
        preset.callLight.ringOpacity + Math.sin(t * 0.72) * 0.015;
      rearGlow.material.opacity =
        preset.callLight.rearGlowOpacity + Math.sin(t * 0.55) * 0.01;
      chamberLight.intensity =
        preset.chamber.lightIntensity + Math.sin(t * 0.8) * 0.06;
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
