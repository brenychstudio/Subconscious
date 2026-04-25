// src/xr-core/runtime/useXRSupport.js
export async function isImmersiveVRSupported() {
  try {
    const xr = typeof navigator !== "undefined" ? navigator.xr : null;
    if (!xr || !xr.isSessionSupported) return false;
    return await xr.isSessionSupported("immersive-vr");
  } catch {
    return false;
  }
}