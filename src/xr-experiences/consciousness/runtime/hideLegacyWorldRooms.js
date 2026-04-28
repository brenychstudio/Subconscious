export function hideLegacyWorldRooms({ roomEntries, keepByRoomId = {} }) {
  const hidden = [];

  if (!Array.isArray(roomEntries)) return hidden;

  roomEntries.forEach((entry) => {
    const roomId = entry?.room?.id;
    const group = entry?.group;
    if (!roomId || !group) return;

    const keepFragments = keepByRoomId[roomId];
    if (!Array.isArray(keepFragments)) return;

    group.traverse((obj) => {
      if (!obj || obj === group) return;

      const name = obj.name || "";
      const keep = keepFragments.some((fragment) => name.includes(fragment));

      if (!keep) {
        obj.visible = false;
        hidden.push(name || `${roomId}:unnamed`);
      }
    });
  });

  return hidden;
}
