import * as THREE from "three";

export function buildHeroStarLookup(heroStarsGroup) {
  const map = new Map();

  heroStarsGroup?.children?.forEach((sprite) => {
    const id = sprite?.userData?.starId;
    if (id) map.set(id, sprite);
  });

  return map;
}

export function buildVisibleConstellationComponents(lineGroup) {
  const adjacency = new Map();

  lineGroup?.children?.forEach((line) => {
    const fromId = line?.userData?.fromId;
    const toId = line?.userData?.toId;
    const opacity = line?.material?.opacity ?? 0;

    if (!fromId || !toId || opacity <= 0.001) return;

    if (!adjacency.has(fromId)) adjacency.set(fromId, new Set());
    if (!adjacency.has(toId)) adjacency.set(toId, new Set());

    adjacency.get(fromId).add(toId);
    adjacency.get(toId).add(fromId);
  });

  const visited = new Set();
  const components = [];

  adjacency.forEach((_neighbors, startId) => {
    if (visited.has(startId)) return;

    const queue = [startId];
    const starIds = new Set();

    visited.add(startId);

    while (queue.length) {
      const current = queue.shift();
      starIds.add(current);

      adjacency.get(current)?.forEach((neighbor) => {
        if (visited.has(neighbor)) return;
        visited.add(neighbor);
        queue.push(neighbor);
      });
    }

    const edgeCount = lineGroup.children.filter((line) => {
      const fromId = line?.userData?.fromId;
      const toId = line?.userData?.toId;
      return starIds.has(fromId) && starIds.has(toId);
    }).length;

    components.push({
      starIds: Array.from(starIds),
      edgeCount,
    });
  });

  components.sort((a, b) => b.edgeCount - a.edgeCount || b.starIds.length - a.starIds.length);
  return components;
}

export function pickLargestVisibleComponent(lineGroup) {
  return buildVisibleConstellationComponents(lineGroup)[0] ?? null;
}

export function getConstellationWorldCentroid(skySystem, starIds, out = new THREE.Vector3()) {
  const lookup = buildHeroStarLookup(skySystem?.layers?.heroStars);
  const world = new THREE.Vector3();
  const sum = new THREE.Vector3();
  let count = 0;

  starIds.forEach((id) => {
    const sprite = lookup.get(id);
    if (!sprite) return;
    sprite.getWorldPosition(world);
    sum.add(world);
    count += 1;
  });

  if (count === 0) {
    out.set(0, 0, 0);
    return out;
  }

  return out.copy(sum.multiplyScalar(1 / count));
}

export function getConstellationWorldRadius(skySystem, starIds, center) {
  const lookup = buildHeroStarLookup(skySystem?.layers?.heroStars);
  const world = new THREE.Vector3();

  let maxDistance = 0.35;

  starIds.forEach((id) => {
    const sprite = lookup.get(id);
    if (!sprite) return;
    sprite.getWorldPosition(world);
    maxDistance = Math.max(maxDistance, world.distanceTo(center));
  });

  return maxDistance;
}

export function createConstellationCloneGroup(skySystem, starIds) {
  const group = new THREE.Group();
  group.name = "constellation-reveal-clone";

  const allowed = new Set(starIds);
  const center = getConstellationWorldCentroid(skySystem, starIds, new THREE.Vector3());
  const heroLookup = buildHeroStarLookup(skySystem?.layers?.heroStars);

  starIds.forEach((id) => {
    const source = heroLookup.get(id);
    if (!source) return;

    const sprite = source.clone();
    sprite.material = source.material.clone();

    const world = new THREE.Vector3();
    source.getWorldPosition(world);

    sprite.position.copy(world.sub(center));
    sprite.scale.copy(source.scale);
    group.add(sprite);
  });

  skySystem?.layers?.constellationLines?.children?.forEach((line) => {
    const fromId = line?.userData?.fromId;
    const toId = line?.userData?.toId;

    if (!allowed.has(fromId) || !allowed.has(toId)) return;

    const attr = line.geometry?.getAttribute?.("position");
    if (!attr) return;

    const from = new THREE.Vector3(attr.getX(0), attr.getY(0), attr.getZ(0));
    const to = new THREE.Vector3(attr.getX(1), attr.getY(1), attr.getZ(1));

    line.localToWorld(from);
    line.localToWorld(to);

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(
        [
          from.x - center.x, from.y - center.y, from.z - center.z,
          to.x - center.x, to.y - center.y, to.z - center.z,
        ],
        3
      )
    );

    const clone = new THREE.Line(geometry, line.material.clone());
    group.add(clone);
  });

  return { group, center };
}

export function easeInOutCubic(t) {
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
