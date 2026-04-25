# XRCore Usage Contract — V1.1

## Status
XRCore V1.1 is a reusable runtime baseline extracted from WHISPER XR after the first stable production-style experience.

It is **not** a fully universal engine yet.
It is a **working reusable core baseline** for authorial XR scenes with:
- desktop preview
- VR locomotion
- gate cue
- collector panel
- ambient audio crossfade
- interaction UI shell
- environment shell
- texture helpers

## Core vs Experience Boundary

### XRCore owns
- texture helpers
- ambient audio shell
- collector panel shell
- gate cue helper
- locomotion shell
- interaction UI shell
- environment shell
- base scene/runtime wiring patterns

### Experience layer owns
- artwork placement
- sequencing / beats
- gaze progression meaning
- staging curves
- mood color values
- project-specific ambience layers
- finale controller behavior
- collector content / copy specifics
- narrative logic

## Important Principle
**XRCore provides systems.**
**Experience layer provides authored implementation.**

## Current Extracted Helpers
- `src/xr-core/runtime/helpers/xrTextureHelpers.js`
- `src/xr-core/runtime/helpers/createAmbientAudioSystem.js`
- `src/xr-core/runtime/helpers/createCollectorPanel.js`
- `src/xr-core/runtime/helpers/createGateCue.js`
- `src/xr-core/runtime/helpers/createLocomotionShell.js`
- `src/xr-core/runtime/helpers/createEnvironmentShell.js`
- `src/xr-core/runtime/helpers/createInteractionShell.js`

## What is intentionally still NOT in XRCore
- `updateCinematicStaging()`
- beat / journey progression logic
- authored artwork visibility logic
- authored mood tuning values
- Whisper-specific sea souls
- Whisper-specific finale behavior
- Whisper-specific collector semantics
- authored scene dramaturgy

## Safe Development Rules
1. Preserve the working experience.
2. Extract literally first, refactor second.
3. One layer at a time.
4. Validate desktop, VR, finale, collector, and audio after each step.
5. Avoid premature universalization.

## Working Definition
XRCore V1.1 = reusable authored XR runtime baseline.
