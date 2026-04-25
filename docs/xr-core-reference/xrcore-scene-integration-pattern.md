# XRCore Scene Integration Pattern — V1.1

## Goal
Define how a new XR scene should be built on top of XRCore V1.1 without breaking the boundary between core systems and authored experience behavior.

## Recommended Structure

### Core layer
Reusable systems live in:
`src/xr-core/runtime/helpers/`

### Experience layer
Authored scene logic stays in the experience runtime and related experience files.

## Integration Pattern
1. Create or reuse runtime host.
2. Attach XRCore helpers.
3. Keep authored scene logic local.
4. Add optional finale controller only if needed.

## Minimal Runtime Contract
A new scene runtime should provide at least:
- `scene`
- `camera`
- `renderer`
- `rig`
- `floor`
- `sharePathForId(pid)`
- `absShareUrlForId(pid)`
- authored update methods
- authored sequencing state

## Guardrails
Do not:
- universalize too early
- move authored staging into core
- move finale into core unless reused multiple times
- rewrite environment values during extraction
- combine multiple major extraction/refactor steps at once

Do:
- extract literally first
- validate after each step
- keep authored logic local
- treat XRCore as a baseline, not as a finished universal engine
