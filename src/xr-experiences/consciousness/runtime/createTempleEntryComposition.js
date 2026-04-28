import * as THREE from "three";
import { templeEntryPreset } from "../presets/templeEntryPreset.js";

function createColumnMaterial(opacity) {
  return new THREE.MeshBasicMaterial({
    color: new THREE.Color("#7ea4ff"),
    transparent: true,
    opacity,
    depthWrite: false,
  });
}

function createRingMaterial(opacity) {
  return new THREE.MeshBasicMaterial({
    color: new THREE.Color("#9eb8ff"),
    transparent: true,
    opacity,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
}

export function createTempleEntryComposition() {
  const root = new THREE.Group();
  root.name = "TempleEntryComposition";

  const chamberAnchor = new THREE.Group();
  chamberAnchor.name = "TempleEntryChamberAnchor";
  chamberAnchor.position.set(
    templeEntryPreset.chamber.position.x,
    templeEntryPreset.chamber.position.y,
    templeEntryPreset.chamber.position.z
  );
  chamberAnchor.scale.setScalar(templeEntryPreset.chamber.scale);
  root.add(chamberAnchor);

  const decorRoot = new THREE.Group();
  decorRoot.name = "TempleEntryDecorRoot";
  root.add(decorRoot);

  const ringMat = createRingMaterial(
    templeEntryPreset.backgroundStructures.ringOpacity
  );

  for (let i = 0; i < templeEntryPreset.floorRings.count; i += 1) {
    const ringRadius =
      templeEntryPreset.floorRings.baseRadius +
      templeEntryPreset.floorRings.gap * i;

    const ring = new THREE.Mesh(
      new THREE.RingGeometry(
        Math.max(0.001, ringRadius - 0.05),
        ringRadius,
        96
      ),
      ringMat.clone()
    );
    ring.name = `TempleEntryFloorRing_${i}`;
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = templeEntryPreset.backgroundStructures.ringLift + i * 0.002;
    decorRoot.add(ring);
  }

  const colMat = createColumnMaterial(
    templeEntryPreset.backgroundStructures.columnOpacity
  );

  for (let i = 0; i < templeEntryPreset.templeField.columnCount; i += 1) {
    const angle = (i / templeEntryPreset.templeField.columnCount) * Math.PI * 2;
    const x = Math.cos(angle) * templeEntryPreset.templeField.radius;
    const z = Math.sin(angle) * templeEntryPreset.templeField.radius;

    const column = new THREE.Mesh(
      new THREE.CylinderGeometry(
        templeEntryPreset.templeField.columnRadiusTop,
        templeEntryPreset.templeField.columnRadiusBottom,
        templeEntryPreset.templeField.columnHeight,
        18,
        1,
        true
      ),
      colMat.clone()
    );

    column.name = `TempleEntryColumn_${i}`;
    column.position.set(x, templeEntryPreset.templeField.columnHeight * 0.5, z);
    column.lookAt(0, templeEntryPreset.templeField.columnHeight * 0.58, 0);
    column.rotation.z += templeEntryPreset.templeField.inwardTilt;
    decorRoot.add(column);
  }

  return {
    root,
    chamberAnchor,
    decorRoot,
    preset: templeEntryPreset,
    dispose() {
      root.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose?.();
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose?.());
          } else {
            obj.material.dispose?.();
          }
        }
      });
      root.removeFromParent();
    },
  };
}
