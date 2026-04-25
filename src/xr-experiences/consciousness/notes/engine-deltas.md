# Engine Deltas — consciousness

---

## Delta 001
### Date
2026-04-18

### Type
capability

### Area
xr-session

### Problem
Потрібно було стабільно заходити у VR на Meta Quest 3, а не лишатися в browser-like mode без реального XR entry.

### Context
Desktop dev server + Quest 3 + browser entry через локальний / tunnel URL.

### Local Fix
Налаштовано правильний XR entry flow, VR button path, session bootstrap і подальшу перевірку фактичного XR session start.

### Why It Worked
Проблема була не у самій сцені, а в incomplete XR entry flow. Після виправлення session bootstrap проект реально почав заходити у WebXR session.

### Repeat Potential
high

### Promotion Candidate
core-candidate

### Promotion Reason
XR entry / session bootstrap — явно engine-level поведінка, яка повторюватиметься в інших XR-проєктах.

### Affected Files
- src/xr-core/runtime/XRRootThree.jsx

### Follow-up
Винести фінальний session bootstrap pattern у reusable core helper після другого підтвердження в іншому проєкті.

---

## Delta 002
### Date
2026-04-18

### Type
bug

### Area
audio / xr-session

### Problem
У Quest не було чути ambient/audio layer, хоча у browser preview звук працював.

### Context
Desktop preview sound OK, but Quest VR session silent or too quiet.

### Local Fix
Додано sound resume logic на XR session start / VR entry interaction, а також скориговано загальну гучність.

### Why It Worked
У VR autoplay/resume поводиться інакше, ніж у desktop preview. Звук потрібно явно відновлювати на XR interaction boundary.

### Repeat Potential
high

### Promotion Candidate
core-candidate

### Promotion Reason
Audio resume on XR entry — типова engine-level проблема для WebXR runtime.

### Affected Files
- src/xr-core/runtime/XRRootThree.jsx
- src/xr-experiences/consciousness/audio/RitualSoundEngine.js

### Follow-up
Перевірити цей же pattern у ще одному XR-проєкті Whisper.

---

## Delta 003
### Date
2026-04-18

### Type
capability

### Area
input / xr-session / device

### Problem
Потрібно було визначити, чи працює hand-tracking path у Quest, і прибрати неправильний visual fallback.

### Context
У Quest система могла показувати controller path або псевдо-proxy hands замість реального hand-tracking.

### Local Fix
Перевірено input/source path, прибрано неправильний fallback, а runtime переведено на коректний hand-tracking branch.

### Why It Worked
Проблема була в тому, що visual/output path не збігався з реальним input-source path.

### Repeat Potential
high

### Promotion Candidate
core-candidate

### Promotion Reason
Input/source normalization для hand-tracking vs controller path — це engine-level логіка.

### Affected Files
- src/xr-core/runtime/XRRootThree.jsx
- src/xr-core/runtime/hands/createHandPresenceSystem.js
- src/xr-core/runtime/hands/createHandContactReadinessSystem.js

### Follow-up
Звірити цю модель у ще одному Quest-проєкті.

---

## Delta 004
### Date
2026-04-18

### Type
capability

### Area
input / ui-shell / device

### Problem
Потрібно було отримати first-person hand presence замість фейкових proxy visuals, що виглядали примітивно.

### Context
Quest 3, hand-tracking active, але первинні visual proxies виглядали дешево або не були прив’язані правильно до first-person presence.

### Local Fix
Перейшли на real tracked hand mesh, а візуальний шар рук почали стилізувати поверх hand-tracking path.

### Why It Worked
Потрібно було розділити input/state foundation і visual representation, а не намагатися все вирішити одним proxy layer.

### Repeat Potential
medium

### Promotion Candidate
extension-candidate

### Promotion Reason
Сам pattern hand presence reusable, але конкретний visual layer поки ще проектно-специфічний і потребує другого кейсу.

### Affected Files
- src/xr-core/runtime/hands/createHandVisualProxySystem.js
- src/xr-core/runtime/hands/createHandPresenceSystem.js

### Follow-up
Перевірити, чи цей visual approach годиться для іншого більш технічного/не-спiritual XR-кейсу.

---

## Delta 005
### Date
2026-04-18

### Type
workaround

### Area
ui-shell / xr-session

### Problem
У VR поверх сцени висів постійний напівпрозорий flat overlay / plane, що заважав сприйняттю простору.

### Context
Quest VR mode. У desktop цей overlay був допустимий, у VR — руйнував depth/presence.

### Local Fix
Почали цілеспрямовано вимикати flat overlay logic у VR path і розділяти desktop overlay behavior від XR behavior.

### Why It Worked
Desktop-oriented flat UI planes не можна автоматично переносити в XR. У VR це має або ховатися, або жити окремим XR-native способом.

### Repeat Potential
high

### Promotion Candidate
core-candidate

### Promotion Reason
XR overlay suppression / platform guard — повторювана engine-level поведінка.

### Affected Files
- src/xr-core/runtime/XRRootThree.jsx
- src/xr-experiences/consciousness/constellations/createConstellationLoreOverlay.js

### Follow-up
Звести всі flat UI / prompt / overlay cases в єдиний XR suppression rule set.

---

## Delta 006
### Date
2026-04-18

### Type
capability

### Area
environment / runtime / device

### Problem
Потрібно було перетворити небо Hall of Arrival з cheap proto-look у authored world-scale arrival sky.

### Context
Початкові спроби давали:
- square-like particles
- погано читані сузір’я
- обрізання горизонтом
- room-object feel замість world-scale sky layer

### Local Fix
Було запущено окремий напрям CELESTIAL-ARCH з виділенням dedicated sky-layer, зоряного поля, сузір’їв, horizon logic і atmosphere behavior.

### Why It Worked
Небо потрібно мислити не як локальний object у room-space, а як окремий environmental layer.

### Repeat Potential
medium

### Promotion Candidate
preset-candidate

### Promotion Reason
Сам принцип reusable, але конкретна реалізація arrival sky поки більше схожа на scene/environment preset, ніж на universal engine core.

### Affected Files
- src/xr-core/runtime/XRRootThree.jsx
- src/xr-experiences/consciousness/sky/ArrivalCelestialSkySystem.js
- src/xr-experiences/consciousness/sky/createStarSpriteTexture.js
- src/xr-experiences/consciousness/sky/arrivalSkyCatalog.js
- src/xr-experiences/consciousness/sky/arrivalSkyPresets.js

### Follow-up
Перевірити, чи такий atmospheric sky-layer повторюється в іншому XR-світі.

---

## Delta 007
### Date
2026-04-18

### Type
observation

### Area
device / input / performance

### Problem
Hand-tracking і visual hand mesh можуть деградувати або частково перебудовуватися під час руху, ретрекінгу або зміни стану.

### Context
У процесі тестування руки могли з часом втрачати потрібний матеріал і повертатися до сірих default-like materials.

### Local Fix
Visual styling довелося не просто застосувати один раз, а забезпечити повторне застосування при появі нових submesh/hand states.

### Why It Worked
Quest hand mesh path не варто вважати абсолютно статичним. Runtime повинен бути готовим до повторної стилізації.

### Repeat Potential
medium

### Promotion Candidate
extension-candidate

### Promotion Reason
Це важлива знахідка для reusable hand renderer, але потрібно підтвердження в іншому XR-проєкті.

### Affected Files
- src/xr-core/runtime/hands/createHandVisualProxySystem.js

### Follow-up
Перевірити цей edge case в іншому проєкті з hand-tracking.

---

## Delta 008
### Date
2026-04-18

### Type
capability

### Area
triggers / ui-shell / authored interaction

### Problem
Було потрібно перевірити gaze/focus-driven constellation reveal interaction як authored mechanic, а не просто UI-click behavior.

### Context
Desktop + VR thought process. Reveal по сузір’ю мав виглядати кінематографічно, а не різко й примітивно.

### Local Fix
Зроблено окремі спроби focus/reveal flow з prompt state, reveal logic, lore panel behavior і movement of constellation slice.

### Why It Worked
Це дало proof, що authored focus-driven interaction grammar може працювати, але поточна форма ще не фінальна.

### Repeat Potential
low

### Promotion Candidate
local-only

### Promotion Reason
Сама reveal-choreography поки дуже scene-specific і пов’язана з міфологією цього світу.

### Affected Files
- src/xr-experiences/consciousness/constellations/...
- src/xr-core/runtime/XRRootThree.jsx

### Follow-up
Пізніше відокремити reusable interaction hooks від local reveal choreography.

---

## Delta 009
### Date
2026-04-18

### Type
capability

### Area
triggers / environment / authored interaction

### Problem
Потрібно було додати падаючі зірки / кометні траєкторії як atmospheric world event без screensaver-feel.

### Context
Перші реалізації були або занадто різкими, або занадто рідкісними, або засвічували весь екран.

### Local Fix
Параметри події були доведені до м’якшого, видимого, але не агресивного стану.

### Why It Worked
Такі події мають бути secondary atmospheric events, а не foreground spectacle.

### Repeat Potential
medium

### Promotion Candidate
preset-candidate

### Promotion Reason
Сама подія не engine-core, але підхід до atmospheric event tuning може стати reusable preset pattern.

### Affected Files
- src/xr-core/runtime/XRRootThree.jsx
- related local atmospheric helpers

### Follow-up
Подивитись, чи цей же патерн працює в інших cosmic / contemplative scenes.

---

## Delta 010
### Date
2026-04-18

### Type
capability

### Area
runtime / world-state / architecture

### Problem
Потрібно було перейти від набору окремих XR-ефектів до world-runtime з room roles, portals, artifacts, voice seed profiles і traversal state.

### Context
Було підтверджено роботу `window.__WHISPER_WORLD__.snapshot()` та room advancement.

### Local Fix
Побудовано первинний world runtime foundation як single source of truth для traversal/world state.

### Why It Worked
Проєкт перестає бути набором окремих демо-модулів і стає authored world system.

### Repeat Potential
high

### Promotion Candidate
core-candidate

### Promotion Reason
World runtime / room traversal state model потенційно є фундаментальною частиною Whisper XR engine.

### Affected Files
- src/xr-experiences/consciousness/world/...
- src/xr-core/runtime/XRRootThree.jsx

### Follow-up
Довести WORLD-01B: зв’язати поточні XR rooms із world runtime без паралельного існування state systems.

---

## Delta 011
### Date
2026-04-18

### Type
capability

### Area
input / device / xr-session

### Problem
Потрібно було довести Quest hand-tracking path до стабільного first-person presence, а не лишати controller-like fallback або proxy-behavior.

### Context
Meta Quest 3, WebXR session, spiritual-art world runtime, локальне тестування в реальному headset.

### Local Fix
Hand-tracking path був перевірений і стабілізований окремо від visual fallback. Руки почали коректно відображатися від першої особи і рухатися разом з користувачем.

### Why It Worked
Проблема була не лише у візуалі, а в розведенні source path і visual representation. Після нормалізації hand source runtime почав поводитися передбачувано.

### Repeat Potential
high

### Promotion Candidate
core-candidate

### Promotion Reason
Hand-tracking source normalization для Quest / WebXR — це повторювана engine-level задача.

### Affected Files
- src/xr-core/runtime/XRRootThree.jsx
- src/xr-core/runtime/hands/createHandPresenceSystem.js
- src/xr-core/runtime/hands/createHandContactReadinessSystem.js

### Follow-up
Перевірити той самий hand-tracking path у ще одному Whisper XR-проєкті.

---

## Delta 012
### Date
2026-04-18

### Type
observation

### Area
input / ui-shell / device

### Problem
Спроба побудувати fake forearms / extended arms поверх Quest hand mesh давала прототипний, ляльковий і недостовірний результат.

### Context
Після кількох ітерацій visual hand layer у VR руки з продовженням виглядали гірше, ніж чисті first-person кисті.

### Local Fix
Було прийнято локальне authored-рішення: залишити тільки tracked кисті як canonical baseline, без імітації повних рук до ліктя/плеча.

### Why It Worked
Для цього типу світу якісні tracked кисті читаються дорожче і чистіше, ніж фейкові довгі руки без повного avatar/IK milestone.

### Repeat Potential
medium

### Promotion Candidate
preset-candidate

### Promotion Reason
Це не абсолютне engine-rule, а радше сильний UX/visual preset guideline для contemplative XR scenes.

### Affected Files
- src/xr-core/runtime/hands/createHandVisualProxySystem.js

### Follow-up
Повернутися до full avatar / IK only as separate future milestone, not as quick polish.

---

## Delta 013
### Date
2026-04-18

### Type
workaround

### Area
device / runtime / ui-shell

### Problem
Після ретрекінгу або руху hand mesh міг частково перебудовуватися, і руки поверталися до сірих default-like materials.

### Context
Quest 3 hand-tracking during real movement in scene.

### Local Fix
Visual styling рук довелося робити не одноразовим, а готовим до повторного застосування при rebind / retacking / mesh rebuild.

### Why It Worked
XR hand mesh не можна вважати абсолютно статичним. Runtime має бути готовим перевизначати material state повторно.

### Repeat Potential
medium

### Promotion Candidate
extension-candidate

### Promotion Reason
Це корисна reusable hand-renderer finding, але її ще добре підтвердити в іншому XR-кейсі.

### Affected Files
- src/xr-core/runtime/hands/createHandVisualProxySystem.js

### Follow-up
Перевірити, чи повторюється той самий edge case в іншому hand-tracking проєкті.

---

## Delta 014
### Date
2026-04-18

### Type
bug

### Area
audio / xr-session / device

### Problem
У Quest звук або не стартував, або був надто тихим, хоча у desktop/browser preview аудіо працювало.

### Context
Meta Quest 3, WebXR session entry.

### Local Fix
Було повернуто audio resume logic на VR entry / XR session boundary, а також підкручено гучність до комфортного рівня.

### Why It Worked
У VR audio потрібно відновлювати в user-gesture / XR-entry context. Desktop behavior не можна переносити 1:1.

### Repeat Potential
high

### Promotion Candidate
core-candidate

### Promotion Reason
Audio resume / loudness recovery on XR entry — повторювана engine-level задача.

### Affected Files
- src/xr-core/runtime/XRRootThree.jsx
- src/xr-experiences/consciousness/audio/RitualSoundEngine.js

### Follow-up
Перевірити той самий audio bootstrap pattern у другому XR-проєкті.

---

## Delta 015
### Date
2026-04-18

### Type
limitation

### Area
ui-shell / environment / xr-session

### Problem
У VR усе ще може з’являтися flat translucent overlay / plane поверх сцени, що руйнує spatial presence.

### Context
Hall of Arrival / Quest VR. В desktop частина overlay logic прийнятна, у VR — ні.

### Local Fix
Частина flat overlay behavior already була приглушена, але проблема ще не вважається повністю закритою. Потрібен окремий clean XR-only suppression pass для всіх plane-based overlays.

### Why It Worked
Поточні часткові suppressions уже зменшили проблему, але не закрили всі джерела flat planes у runtime.

### Repeat Potential
high

### Promotion Candidate
core-candidate

### Promotion Reason
XR platform guard для flat overlays — типова engine-level задача, яку краще вирішувати централізовано.

### Affected Files
- src/xr-core/runtime/XRRootThree.jsx
- src/xr-experiences/consciousness/constellations/createConstellationLoreOverlay.js
- local arrival / transition field logic

### Follow-up
Зробити окремий audit усіх plane-based overlays у VR path і закрити їх централізовано.

---

## Delta 016
### Date
2026-04-18

### Type
capability

### Area
environment / authored interaction / runtime

### Problem
Hall of Arrival потрібно було перевести з cheap proto-look у більш живий authored arrival state: зоряне небо, сузір’я, horizon presence, falling stars, subtle motion.

### Context
Ітеративна розробка Hall of Arrival у desktop preview і Quest.

### Local Fix
Було побудовано окремий sky direction, додано sky system, falling stars/comet-like events, повільний рух неба і повернуто горизонт / ground sense.

### Why It Worked
Arrival state почав читатися не як debug room з ефектами, а як окремий environmental threshold.

### Repeat Potential
medium

### Promotion Candidate
preset-candidate

### Promotion Reason
Конкретний Hall of Arrival — local authored environment, але сам pattern world-scale sky preset може бути reusable.

### Affected Files
- src/xr-core/runtime/XRRootThree.jsx
- src/xr-experiences/consciousness/sky/ArrivalCelestialSkySystem.js
- src/xr-experiences/consciousness/sky/createArrivalFallingStarsSystem.js
- related sky helpers

### Follow-up
Пізніше відокремити reusable sky/environment presets від local Hall of Arrival dramaturgy.