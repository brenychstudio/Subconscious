# XRCore V1.1 Package

This package is a **clean portable snapshot** of the current XRCore baseline extracted from WHISPER XR.

## What is included
### Engine-ready core
- `src/xr-core/content/*`
- `src/xr-core/runtime/helpers/*`
- `src/xr-core/runtime/XRExperienceHost.jsx`
- `src/xr-core/runtime/useXRSupport.js`

### Reference-only files
These are included as templates, not as fully generic engine files:
- `reference/whisper/XRRootThree.jsx`
- `reference/whisper/WhisperFinaleController.js`
- `reference/whisper/buildWhisperManifest.js`

## Important
`XRRootThree.jsx` is still **Whisper-biased authored runtime**, not a fully generic engine runtime.
Use it as a **reference host** when building the next scene, not as drop-in universal core.

## Recommended use
1. Copy `src/xr-core/` into the new project.
2. Build a new experience runtime based on the Whisper reference.
3. Reuse helpers from `src/xr-core/runtime/helpers/`.
4. Keep scene-specific staging / finale / mood logic outside core.

## Next recommended step
Build one more small XR scene on top of this package before attempting deeper universalization or mobile / gyro adaptation.
