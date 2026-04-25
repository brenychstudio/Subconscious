# Validation Matrix — consciousness

## Desktop Preview
- [x] scene boots correctly
- [x] camera initializes correctly
- [x] keyboard movement works
- [x] mouse look works
- [x] focus/hint shell behaves correctly (desktop baseline)
- [ ] collector action works
- [x] transitions do not break scene state

## Mobile
- [ ] touch navigation works
- [ ] viewport is correct
- [ ] UI overlay is readable
- [ ] no broken orientation behavior
- [ ] performance acceptable
- [ ] media playback stable

## Tablet
- [ ] device orientation behaves correctly
- [ ] no inverted yaw/pitch
- [ ] framing feels correct
- [ ] no stereo/fisheye-like distortion
- [ ] touch + orientation combination is stable

## XR / VR
- [x] XR entry works
- [x] session starts correctly
- [x] locomotion is comfortable (baseline)
- [x] snap turn / movement works
- [ ] interaction targets are fully reachable
- [ ] collector / trigger interactions work
- [x] exit returns cleanly

## Hand Presence
- [x] Quest hand-tracking path detected correctly
- [x] controller fallback no longer dominates when hand-tracking is active
- [x] first-person hands visible in XR
- [x] hands move with user correctly
- [x] hands remain blue/stylized after retacking
- [x] fake forearm extension intentionally removed
- [x] current canonical baseline = tracked hands only
- [ ] final premium hand polish complete
- [ ] advanced ritual hand interactions complete

## Arrival Sky / Environment
- [x] stars visible
- [x] constellations visible
- [x] horizon / ground visible again
- [x] subtle world motion in sky present
- [x] falling stars / comet-like event works
- [ ] no residual flat overlay planes in VR
- [ ] Hall of Arrival fully reads as final premium arrival state

## Audio
- [x] ambient audio starts correctly in desktop
- [x] ambient audio resumes correctly in Quest
- [x] overall loudness improved
- [ ] zone logic fully verified
- [ ] trigger audio behaves correctly
- [x] no broken autoplay edge cases in current baseline

## Triggers / Events
- [x] falling stars / comet-like event works
- [x] constellation reveal prototype works
- [ ] gaze triggers behave correctly in final form
- [ ] one-shot events do not retrigger incorrectly
- [ ] progression logic is stable

## World Runtime
- [x] world runtime boots
- [x] snapshot works
- [x] room advancement works
- [ ] current XR rooms are fully bound to world runtime
- [ ] visitedRoomIds fill through real traversal
- [ ] room role affects runtime behavior everywhere

## Media
- [x] still images / visual surfaces generally load
- [ ] video surfaces behave correctly
- [ ] texture loading is stable in all cases
- [ ] fallback works when media fails

## Performance
- [ ] acceptable FPS on desktop
- [ ] acceptable FPS on Quest
- [ ] no heavy memory spikes
- [ ] resize / re-entry does not degrade performance
- [ ] hand-tracking does not noticeably degrade comfort

## Diagnostics
- [x] failures are visible in logs
- [x] hand source/path issues became diagnosable
- [ ] manifest errors are fully detectable
- [ ] scene failure degrades gracefully

## Current Honest Status
- Project is beyond raw bootstrap.
- Runtime shell exists.
- Major systems are alive, but not final.
- Hall of Arrival is in active authored transition state.
- Hand presence baseline now works and is conceptually cleaner.
- Audio in Quest works again.
- Flat VR overlay issue is reduced but not yet fully closed.
- Project is not yet production-ready.