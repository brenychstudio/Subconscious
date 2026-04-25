# Universalization Review — consciousness

## Review Stage
Milestone review — early authored world foundation
Status: not final
Recommendation at this stage: wait for second project / partial extraction only

## 1. What Repeated
Що вже зараз виглядає як повторювана XR/engine зона, а не просто локальна сцена:

- XR entry/session bootstrap sensitivity
- Quest-specific hand-tracking vs controller path issues
- audio resume/autoplay issues on XR entry
- flat desktop-oriented overlay behavior breaking VR presence
- need for clear world runtime single source of truth
- need for world-scale environment behavior instead of local gimmick backgrounds
- need for platform guards between desktop and XR behavior

## 2. What Feels Reusable
Що вже зараз має відчуття reusable:

- XR session bootstrap pattern
- hand source normalization pattern
- first-person hand presence integration pattern
- VR overlay suppression rule
- audio resume on VR entry
- room/world runtime state model
- world-scale environmental layer thinking
- registry-driven world architecture
- atmospheric event tuning as preset logic
- Quest validation workflow

## 3. What Should Stay Local
Що не треба тягнути назад у core зараз:

- конкретна міфологія Hall of Arrival
- значення сузір’їв у цьому світі
- авторська ритміка spiritual pacing
- constellation reveal choreography
- symbolic narrative of portals
- конкретний lore text / reveal UI
- authored semantics of this consciousness world

## 4. Promotion Candidates

### Core
- XR session bootstrap guards
- audio resume on XR entry
- hand-tracking / controller source normalization
- world runtime single-source-of-truth pattern
- VR overlay suppression / platform guards
- diagnostic helpers for XR source state

### Presets
- arrival sky preset logic
- atmospheric falling-star event profile
- hand material profile (ghost blue hands)
- movement / comfort profile
- audio mood profile

### Extension Points
- hand response hook layer
- constellation interaction hook
- authored reveal hook
- portal-specific ritual interaction adapters
- environment response hooks

### Local Only
- Hall of Arrival dramaturgy
- constellation mythology / lore
- exact portal symbolism
- spiritual-art pacing
- local reveal choreography
- project-specific visual metaphors

## 5. Risks
Що ще неясно або нестабільно і не варто переносити зарано:

- current sky implementation is still evolving
- hand visuals are workable but not yet final premium polish
- some overlay/plane behavior in VR may still exist in local runtime
- world runtime is alive but not yet fully bound to all actual room transitions
- reveal interactions are not yet stable enough to generalize
- too-early promotion could pull scene-specific logic into core

## 6. Recommendation
wait for second project

## 7. Practical Extraction Rule For This Project
Після завершення наступного великого етапу:
1. оновити engine-deltas.md
2. відмітити validation-matrix.md
3. переглянути, що з кандидатів справді повторилось
4. лише після цього піднімати щось у `src/xr-core/`

## 8. Current Canonical Position
consciousness = strong authored proof-case on top of Whisper XR Core V1.1

Not a source to “promote all code from”.
A source to extract:
- repeated XR issues
- repeated fixes
- repeated runtime helpers
- repeated device adapters
- repeated environment/input/audio patterns