# Orbit Zero: a home between launches

Status: Station Foundation implemented locally as a candidate; later progression remains phased. Ship interiors are retired.

## Inspection status

Inspected repository: https://github.com/MavyyBlue/Orbit-Zero, default branch `main`, commit `8b840669565b5c908923db140760b470ba7bea95` (2026-09-30 inspection). No `AGENTS.md` was found. Read README, development, architecture, current-state, North Star, roadmap, and QA guidance, then inspected runtime, save, Workshop, Android host, and regression tests.

The inspected baseline uses browser JavaScript, Canvas 2D flight rendering, semantic HTML menus, and an Android WebView shell. It had no 3D renderer. The local Foundation now adds a separate Three.js r170 diorama without moving flight to another engine. The plan builds on those verified boundaries.

Important baseline distinction: `docs/CURRENT_STATE.md` records phone acceptance of the five planets and adjustable aim dead zone at historical commit `b5a2139`, while describing expanded interiors as a candidate. Current `main` contains those expanded interiors at `8b84066`; its documentation still describes their upload as pending. Inspection and passing local tests do not establish phone acceptance or exact-HEAD CI certification. The owner has since retired the ship-interior concept in favor of the 3D station. Preserve accepted flight feel and legacy saved ownership/data; interiors are no longer an implementation requirement. Reconcile candidate status against actual CI/phone evidence before a later release.

Local baseline: `npm run validate` passed syntax checks and all 52 Node tests; all five Python importer tests passed. Initial design inspection did not run browser/device checks. After retiring interiors, `npm run validate` again passed all 52 Node tests, all five Python importer tests passed, and Chromium smoke passed at 320×568, 360×640 and 412×915. Android build/lint and physical-device performance/feel remain unverified. The subsequent retirement removes room-editor entry points and active room styles from the runtime. Physics, planet rules, aim handling, Workshop, save schema, build, and workflow remain unchanged; legacy save fields are retained.

## Product direction

The station is the player's persistent home between runs. This is the committed 3D direction: no ship-cabin rooms, furniture placement, interior decorating shop, or separate navigable ship-interior feature. Hangar is a station garage with visible ships and ship-management controls. Any later ship customization concerns the ship itself and needs its own scope. Runs remain the primary source of excitement and meaningful progress: launch a ship, use planetary gravity, collect Stardust, survive near-misses, and want to launch again. The station makes those accomplishments visible as a small orbital operation that grows over time.

The intended loop is Station → prepare/select ship → launch → existing Orbit Zero run → existing results/reward settlement → Station → improve ships or buildings → launch again. Keep an immediate retry action on results; returning to the station must not become mandatory busywork between every run. Launch remains readily accessible from the station and Hangar.

Use a stylized miniature diorama: a fixed 3/4 orthographic camera, compact lovable 3D structures, clear silhouettes, readable upgrade additions, and a calm orbital backdrop. Model one cohesive outpost after the whole concept image: central Hangar/landing deck, attached Engineering service wing, connected collector platform, habitation/communications tower, and greenhouse garden plot. These are five tappable areas of one structure, not a grid of independent square tiles. Do not introduce free placement, roads, adjacency bonuses, production chains, or city simulation.

## Whole-outpost composition — owner correction

The whole reference image is the composition target, not just a style cue for
one building. The four-square prototype is replaced by `station-outpost.js`:
central enlarged Hangar and landing deck, attached Engineering equipment,
left habitation/communications tower with solar wing, front-left blue-crystal
collector installation, and right greenhouse dome/planting beds. Short armored
links join these areas; gray armor, orange bands, cyan screens and warm lights
unify them. Tiny astronaut figurines are presentation only. Each area has its
own raycast identity, including `martian_garden`. Buildings are entered directly
from the outpost; a compact system selector supports keyboard/screen-reader
access and renderer failure without a duplicate visible button grid.

Garden is a reserved visual plot: decorative plants are not a maturation or
harvest system. No new wallet fields, currencies, transactions, hired crew,
production timers or run modifiers accompany this composition correction.
The camera save format and protected game/Workshop authorities are unchanged.

## Hangar visual reference — 2026-10-01

The owner's follow-up calls for closer concept fidelity, including the space
backdrop. The Hangar now has a wider bay mouth, thick chamfered floating platform,
larger H-marked apron, rim equipment and a small stepped docking extension.
An orthographic camera at a lower 3/4 angle reveals the real bay depth. Common
station walkways connect the separate platforms instead of a solid square board.
The decorative sky combines a locally generated purple-nebula texture, stars,
faceted orange/blue planets and floating rocks. It stays behind the hub and never
uses gameplay planet rules. Its texture/geometry/materials share the renderer's
cleanup lifecycle; there are no external requests, saved sky state or new rewards.

The owner's supplied reference guides the Hangar asset: faceted gray armor,
orange utility bands, cyan screens/beacons, warm amber bay lights, a genuine
open chamfered bay, an octagonal landing-pad marking, rooftop operations pod,
satellite dish, solar cells and small cargo cases. `station-hangar.js` builds
this as actual modular low-poly geometry with locally owned materials; no image
backplate or remote textures are used. One bounded point light provides bay
warmth, without shadows or postprocessing. The apron stays clear for future
active-ship integration. This changes the Hangar presentation, not station
progression, ship prices, saves, controls or flight behavior.

## Foundation candidate behavior

Enter through **Visit your orbital station** on the existing main menu. The main
menu remains the startup destination while the new hub awaits device acceptance.
The unified composition contains five integrated low-poly areas: central Hangar,
Engineering wing, Harvester installation, Astronaut tower and Martian greenhouse.
Hangar opens the existing five-ship garage; the other areas open honest future-system panels.
There is no active passive income, spending, hiring, or modifier catalog.

The camera supports touch drag, two-finger pinch around the gesture center,
mouse drag/wheel, keyboard arrows and +/-/Home, and visible zoom/reset controls.
Buildings use direct taps; a visually hidden system selector appears on keyboard
focus or renderer failure. Camera framing persists in the
existing save as `station: { version: 1, camera: { x, z, zoom } }`; old saves gain
neutral defaults without changing progress, ship/cosmetic ownership, or Workshop.

Launching calls existing Voyage/Endless startup. Runs launched from the station
return there through results; quick retry bypasses the hub. Hangar, settings and
Workshop return to their originating menu. The hub owns a separate WebGL canvas;
flight rendering is suspended during station views, and the hub renderer/listeners
are disposed when leaving. Generation guards prevent delayed loading from mounting
over a run. Backgrounding cancels station gestures and suspends animation. Reduced
motion renders a static hub. Context loss and unavailable WebGL leave building and
launch controls usable. There are no external requests or model downloads.

Candidate checks passed: 56 Node cases, five importer cases and full Chromium
journeys at 320×568, 360×640 and 412×915. Browser software WebGL checks verify
interaction and lifecycle, not Android GPU budgets or phone feel.

The Hangar now has a clear landing apron rather than the former generic parked
ship. Displaying the selected 3D ship belongs to Phase 2; selection still works
through the existing Hangar interface.

## 3D asset art direction — low-poly arcade

The owner requires the eventual 3D assets to retain Orbit Zero's arcade vibe through low-poly designs. Apply this from the first prototype to final buildings, station modules, displayed ships, astronauts, machinery, and plants.

- Use bold silhouettes, chunky simplified geometry, playful miniature proportions, and visible facets where they support the shape.
- Use a cohesive colorful palette with clear accents, simple materials, and restrained lighting. Keep assets readable on small phone screens against the orbital backdrop.
- Give each building a recognizable shape at the normal 3/4 camera distance. Upgrade modules should visibly change its outline, size, or activity rather than depend on tiny surface detail.
- Keep models modular so docking equipment, solar panels, antennas, domes, and other progression additions share the same visual language.
- Evaluate assets in the actual orthographic station view and at normal zoom, alongside the existing arcade UI. Set geometry, material, and texture budgets from the Android renderer spike rather than arbitrary polygon counts.

Low-poly arcade styling is a lasting art requirement, not merely placeholder geometry. The Foundation uses procedural low-poly building prototypes; bespoke production assets remain later work.

## Protected behavior

- Preserve accepted gravity, integration, planetary effects, launch behavior, collisions, near-misses, run pacing, and input feel.
- Preserve the existing authority for trajectory prediction. Station code must never implement its own trajectory approximation or gravity model.
- Preserve Workshop functionality and access until its actual responsibilities are inspected and a deliberate integration is specified.
- Preserve existing ship ownership, selection, unlock rules, balances, settings, records, and saves.
- Ship upgrades and balance changes separately from station presentation. Foundation and Hangar should introduce no gameplay modifiers.
- Keep station production and animation out of the run simulation and frame budget.

## Verified integration map

File links are relative to the repository's `docs` directory in the repository copy of this plan.

| Area | Current source authority | Station integration decision |
| --- | --- | --- |
| Navigation | [game.js](../web/game.js): `phase`, `home`, `screens`, `showPanel`, `window.orbitBack`, `window.orbitPause`; [index.html](../web/index.html) owns screen roots. | Add `station` as a non-run phase and a dedicated root. Extend screen visibility and Back/lifecycle handling explicitly; do not overload `home` or `editor`. Preserve existing menu IDs and routes initially. |
| Launch/run | `game.js`: `start(which)` → `newSector()` → aim → `launch()` → `createFlight(vector, world)`; `tick` → gate/transit/impact → `finish`. | Station launch calls the existing `start('voyage'/'endless')`. Do not create a second run controller. Keep result `retry` calling `start(mode)` directly. |
| Physics | [simulation.js](../web/simulation.js): `DT = 1/120`, `launchVector`, `createFlight`, `advance`, seeded `encounter`; [planet-rules.js](../web/planet-rules.js): force profiles and Orbiter transitions. | No changes for Foundation, Hangar, or Harvester. Station must not become a simulation world or import planet rules to animate buildings. |
| Preview | `predict(vector, world)` creates the same flight state and calls `advance` at the same timestep as live flight; preview duration is 2.1 seconds. | Preserve this authority. Any later modifier must reach preview, flight, and relevant route checks through consistent inputs. |
| Workshop | [workshop.js](../web/workshop.js): `levelWorld`, normalized level documents, `orbit-zero.workshop.v1`; [workshop-ui.js](../web/workshop-ui.js) owns editor input; `game.js` runs custom flights. | Workshop is a level creator, not a ship upgrade service. Keep it reachable and separate. `customFinish` must continue to award no Stardust/normal records. Station Engineering modifiers default off for custom levels. |
| Ships | [save.js](../web/save.js): five `SKINS`, stable ownership IDs, `buySkin`; `game.js`: `hangar`. Legacy [room-model.js](../web/room-model.js) remains for save compatibility. | Hangar already supports selection, unlocks and challenges. Reuse those operations in the 3D station garage. Interior/decor-shop routes are removed; archived room source is not a future station dependency. Ship styles currently fly identically. |
| Economy | `save.shards` is the existing Stardust wallet. `tick` accumulates collected stars between sectors; `finish` banks the final sector and completed-sector stars once behind `finished`. Near-miss multipliers change score, not Stardust. | Use `shards`, not a second `stardust` balance. Initially preserve one Stardust per collected star, ship IDs and prices (0/35/70/120/180), cosmetic prices, and custom-run exclusion. |
| Persistence | `save.js`: `SAVE_KEY = 'orbit-zero.save.v1'`, `freshSave`, allowlist-based `parseSave`, `writeSave`; outer schema 1, nested `roomVersion: 2`. Single local profile, no cloud; current run is abandoned on process death. | Add a nested station version and sanitizer to this same save. Adding fields only to `freshSave` is insufficient: `parseSave` must explicitly retain them. Keep Workshop's separate key unchanged. |
| Transactions | `RoomEditor.commit` clones the current full save, applies purchase/placement, writes, then updates in-memory state. In contrast, Hangar `buySkin(save)` and run `finish` mutate the live object before `persist()`, which only displays failure. | Use the retired room editor's candidate-write pattern as a reference for new station commands, without loading or rebuilding its UI. Make ship purchase failure-safe in Phase 2. Do not claim all existing writes are transactional or alter reward policy silently. |
| Rendering/input | `game.js` permanently obtains a 2D context from `#space`; shared Canvas input branches only for aim/editor; `frame` renders even in menus. | Use a distinct station WebGL canvas. Never request WebGL from the existing flight canvas. Gate flight rendering during station view while leaving fixed-step run behavior unchanged. Station owns separate multi-pointer gestures. |
| Android/offline | [MainActivity.java](../app/src/main/java/com/orbitzero/game/MainActivity.java) hosts local HTTPS assets, rejects nonlocal requests, calls `orbitPause`/`orbitBack`; [app/build.gradle](../app/build.gradle) packages `web` as assets. CSP in `index.html` has `connect-src 'none'`. | Bundle all 3D code/assets locally; no CDN/backend. Native shell changes are unnecessary initially. Model loaders using fetch require a deliberate same-origin-only CSP adjustment; procedural geometry avoids that dependency in Phase 1. |
| Regression | [tests](../tests) cover simulation/prediction, planets, generated routes, normal/custom flow, dead zone, saves, rooms, and input; [browser-smoke.mjs](../scripts/browser-smoke.mjs) runs phone-size journeys. | Existing 52 Node + five importer cases form a passing local baseline. Add focused station contracts and real WebGL/touch/browser checks when implementing; preserve current suites. |

Do not reorganize the existing game merely to match this proposal. Remaining Foundation acceptance work is Android WebView/physical-device performance and feel validation, plus exact-candidate CI evidence.

## Concrete first implementation scope

Foundation modules now implemented (progression transactions remain later work):

- `web/station-catalog.js`: five stable area definitions, composition coordinates, feature keys, and visual-tier definitions. No simulation or DOM dependencies.
- `web/station-model.js`: nested version-1 state with a bounded cosmetic camera. Building tiers and producers are not persisted or active yet. Pure logic, independent of scene objects.
- `web/station-view.js`, `web/station-input.js`, `web/station-ui.js` and `web/station.css`: isolated orthographic 3D scene, camera/gesture ownership, lazy import, selection, and lifecycle cleanup. Callbacks such as `onBuilding` and `onLaunch` connect to the existing orchestrator. Lazy-load on station entry; dispose/pause resources on exit and visibility loss.
- `web/progression.js` in Phase 2/3: focused candidate-save transactions over the existing save/storage, not a second wallet/store. Commands are synchronous, validate the latest live state, persist a complete candidate, then apply committed fields while retaining the shared save object's identity used by the orchestrator and `Sound`. Legacy room fields pass through unchanged.

Phase 1 changes to existing files: add the hub root/style in `index.html`; add the station default/normalizer calls to `freshSave`/`parseSave`; add entry/exit, `screens` visibility, origin-aware panel return, rendering gates, and lifecycle cases in `game.js`. Keep `simulation.js`, `planet-rules.js`, Workshop model/editor, legacy save-normalization model, Android bridge, signing, and workflow unchanged. Extend tests and source-package checks as appropriate.

Use the existing panel interfaces for buildings. Station → Hangar ship management → station is the garage route. No Interior or decorating route is retained or planned. Introduce explicit non-run navigation origin (`home` or `station`) for Hangar/settings/Workshop exits rather than hardwiring every Back callback to `home`. Do not repurpose `settingsOrigin`, which already distinguishes pause settings from menu settings. Once accepted, normal results' Return to dock can route to station; Workshop's Back to editor and quick retry retain their current behavior.

Foundation renderer: a locally bundled pinned Three.js r170 module (691,648 bytes plus its MIT license), orthographic camera, simple low-poly procedural modules, modest lighting, no postprocessing, no native engine migration. Vendored code should live under packaged `web` paths and include its license. The syntax checker now includes `web/vendor`; source-package verification covers the bundled dependency. CSP and the offline native shell remain unchanged. A renderer load/context failure offers accessible building/menu controls and launch so it never blocks the arcade game. Test context loss/restoration and rapid enter/exit; prevent a late lazy-load completion from mounting into a running game. This fallback preserves access, but is not evidence that the requested 3D presentation has passed its acceptance gate.

## Proposed boundaries

Separate station presentation, persistent progression, and run simulation. Use the project's existing patterns rather than creating a new framework.

```text
Station scene / camera / building selection
                 |
                 v
Station feature interfaces ─── existing ship selection/unlock rules
                 |
                 v
Progression commands ─── existing wallet + save authority
                 |
                 v
Launch adapter → immutable resolved run configuration
                         |
                         +→ existing authoritative trajectory preview
                         +→ existing authoritative run simulation

Existing results → existing reward settlement → persistent progression
```

**Station presentation:** loads/unloads the hub scene, renders state, controls the camera, selects buildings, and opens feature interfaces. It reads progression but cannot award currency, change physics, or write save fields directly. Decorative workers and machinery have no economic authority.

**Building catalog:** stable building IDs and definitions for feature routing, fixed plot, progression tiers, unlock requirements, and visual variants. Start with `hangar`, `engineering_bay`, `stardust_harvester`, and `astronaut_station`. Runtime instances reference catalog IDs; they do not persist meshes or engine objects. A new building adds a definition, feature handler, visual assets, and any necessary versioned state without changing the hub controller.

**Progression operations:** explicit commands for select ship, purchase, upgrade, collect, hire, and assign. Reuse existing authorities where present. Each operation checks current ownership/unlocks, affordability, limits, and input validity before committing. UI state is never the source of eligibility. A failed operation leaves balances and progression unchanged.

**Launch adapter:** initially just calls `start(mode)`; ship selection remains `save.skin`, currently a cosmetic rendering choice rather than a physics configuration. Do not add a speculative run-configuration framework for Foundation. Later, approved gameplay modifiers require one immutable resolved configuration used by preview and gameplay. Do not modify a live run when station state changes. Existing preview and simulation share their solver; preserve that rather than replacing either implementation.

**Lifecycle isolation:** station gestures never reach gameplay controls; gameplay inputs never pan the station. Suspend or unload hub rendering during a run according to measured device constraints. Station production derives from persisted elapsed time, not continued hub execution in the background.

## Hub interaction

One-finger drag pans across a bounded station plane; two-finger pinch changes orthographic camera size within limits. Keep camera orientation fixed initially. Use screen-to-plane mapping for pan and, where practical, zoom toward the pinch focus. Provide a reset-view action and mouse equivalents for development/desktop targets.

Building taps use generous selection targets and visible feedback. Recognize a tap only if movement stays below a tuned threshold. A drag or pinch must never open a building when fingers lift. UI overlays consume their own gestures; opening a panel cancels scene interaction. Back closes the active building panel before leaving the hub. Avoid relying on tiny 3D labels or color alone for discoverability.

Launch is a persistent, easy-to-reach action. The diorama should invite exploration without adding friction to starting a run. Save camera framing only if that fits current save conventions; it is cosmetic and separate from progression.

## Four initial buildings

| Building | First functional version | Visible progression direction |
| --- | --- | --- |
| Hangar | Show owned ships, select active ship, use existing unlock/purchase operations. Use a 3D garage/ship display with accessible management controls; no ship-cabin interior. | Docking pad, bay modules, service equipment, lights, selected ship display. |
| Engineering Bay | Introduce a small, bounded upgrade catalog after economic foundations are stable. | Additional laboratory modules, antennas, power units, animated equipment. |
| Stardust Harvester | One capped producer, manual collection, then rate/capacity upgrades. | Collector size, solar panels, storage tanks, activity/fill indicators. |
| Astronaut Station | Simple hiring and one clear assignment, initially Harvester collection. | Habitation modules, airlock lights, a few visible technicians. |

Foundation shows the four primary systems and a reserved Garden within one composition, with clear availability states. Unimplemented systems should have honest informational panels rather than functioning purchase buttons or promises of immediate rewards. Availability and unlock order should be set after inspecting current progression; do not add arbitrary gates now.

Each functional building tier should have at least one legible visual change. Derive appearance from persisted tier and unlock state, so reopening the game reconstructs the same station. Reserve attachment points for panels, antennas, greenhouse domes, docking gear, and lights. Separate cosmetic animation from progression state.

## Economy and persistence

Use existing Stardust (`save.shards`) as the initial shared currency. Runs should remain the primary meaningful earning activity. Start with explicit purchase costs, a single balance display, capped production, and few upgrades. Do not add a premium currency, crafting chain, technician wages, upkeep, or obligatory check-in schedule. Balance against collected stars, not the much larger score numbers. A fully collected twelve-sector Voyage yields 36 Stardust under current rules; this is an upper example, not a measured typical run. Preserve ship prices while balancing new station costs and passive rates. Retired room purchases are preserved as historical ownership, not converted into building tiers or refunded automatically.

Proposed persisted station information is deliberately small: schema version, stable building instance/type IDs, tier/unlock state, purchased upgrade levels, producer accumulation and time anchor, and later technician assignments. Existing ship and wallet state retain their current authority. For a fixed initial layout, persist plot changes only when customization actually exists.

Migrate older saves additively: retain every existing field and initialize station defaults without charging currency, duplicating ships, granting run rewards, or resetting progress. Validate migration against representative old saves and ensure applying it again is harmless. Follow the repository's recovery/backup strategy; do not invent a separate competing save file without a demonstrated need.

Reward settlement must credit a completed run exactly once. The current `finished` guard prevents duplicate settlement within the session, and process death does not resume a run. Preserve that for Foundation; do not invent a persistent run receipt journal without resumable-run requirements. Current failed reward writes leave the session balance updated but not durable; document this limitation and decide any retry handling in the economy phase without re-running `finish` or losing/doubling subsequent purchases. A collection transfers producer storage to the wallet and clears storage in one `writeSave` candidate; a purchase debits currency and grants its result together. Failed new station commands make no in-memory change and do not claim success.

Retain `shards` as a bounded nonnegative integer (the existing parser caps at 1,000,000,000). Producer fractions/remainders belong in bounded station state. Respect wallet headroom during collection: transfer only what fits and retain untransferred storage rather than dropping it or exceeding the parser's cap. No timer should write a stale whole-save snapshot over ship purchases, settings or run rewards. Settle producers synchronously from the current save on lifecycle/commands; visual timers only display calculated values.

For the first Harvester, settle elapsed production on load, collection, and before rate/capacity upgrades:

`elapsed = clamp(now - lastSettledTime, 0, configuredOfflineLimit)`

`stored = min(capacity, stored + rate * elapsed)`

Settle using the old rate before applying an upgrade; persist the new anchor and resulting storage together. Preserve fractional production or a remainder so frequent checks do not lose income. Never decrease an anchor on clock rollback. Capacity saturation discards excess rather than banking invisible production. Choose and disclose the offline cap after balancing against real run earnings.

Local timestamps support a casual offline economy but cannot prevent deliberate clock manipulation. There is no backend or trusted time/cloud save in this repository; do not introduce one solely for this foundation. Cover rollback, large forward jumps, resume, reload, repeated collection, and full storage explicitly.

## Engineering and physics safeguards

Begin with economy-side upgrades such as a modest Stardust bonus; calculate those in reward settlement without changing orbit simulation. A collection-radius upgrade changes gameplay and therefore needs separate testing for item acquisition and readability even if gravity is unchanged.

Launch characteristics, defenses, recovery systems, and ship-specific physics modifiers remain later proposals. Each needs a defined ceiling, feel evaluation, and tests against the accepted solver. Predictable launch changes must be represented in the same inputs used for trajectory preview, including drag/button paths. Generated sectors are currently verified with baseline launch controls: a modifier must retain neutral launch choices or have its effective controls verified against the generated route. Collection radius must use a separate pickup-specific parameter, never enlarge `PROBE_RADIUS`, which also controls collisions and near-misses. Dynamic recovery effects need explicit preview semantics; do not show a guaranteed path that ignores them. Preserve timestep, gravity equations, planet effects, and collision rules unless separately authorized as a gameplay change. Workshop opts out of permanent run modifiers and reward bonuses, retaining its explicit custom controls.

No generic `physicsMultiplier` interface or station-driven force updates. Prefer a small allowlist of named, bounded modifiers with neutral defaults that reproduce existing behavior.

## Development phases and exit gates

### Phase 0 — Source audit and baseline

Source audit and automated baseline completed at the SHA above. The desktop Chromium renderer spike is complete. Reconcile current candidate CI/phone status and validate the renderer on the target Android WebView/device before treating Foundation as accepted. Use existing regression cases for launches, planet behavior, trajectory agreement, near-misses, restart, Workshop, and save loading. Exit when the renderer fits offline packaging/device budgets and Phase 1's concrete file-level scope is ready.

### Phase 1 — Station Foundation

Build a separate hub destination with one reference-led outpost, four primary system areas and a reserved greenhouse garden, orthographic camera, drag/pinch, tap selection, simple feature panels, and launch/return navigation. Use a staged entry point while validating the hub; retain existing home access until the transition is verified. Add only the minimal additive save state needed for this phase. No production, spending, hiring, or gameplay modifiers.

Exit: station → launch → results → station works; quick retry works; old saves and Workshop remain usable; taps and gestures do not interfere; hub resources do not harm run performance; representative devices meet the existing frame budget. A 3D feasibility failure is resolved here before feature work.

### Phase 2 — Hangar

Connect owned ships, active selection, and verified unlock/purchase services. Reuse current ship data and `buySkin` rules instead of making a second ship registry. Present the selected ship at the 3D Hangar with ownership, selection and unlock controls. Do not build ship-cabin interiors or decorating. Defer any exterior ship customization to a separately scoped phase.

Exit: selection persists and determines the launched ship; preview and run use the same selection; all existing ownership and unlock rules hold; purchases are durable and do not duplicate on repeated input or reload; unrelated Workshop functionality remains accessible.

### Phase 3 — Economy / Stardust Harvester

Confirm one wallet and one result-settlement path. Add one producer with capped storage, manual collection, visible fill/activity feedback, and a small set of rate/capacity tiers with visual additions. Tune earnings against observed typical runs; passive income is supplemental. Introduce no crew yet.

Exit: rewards, purchases, and collection conserve balances across interruption/reload; no duplicate payout; offline and clock-edge cases are specified and verified; full storage and upgrade costs are understandable; visible changes survive save/reload.

### Phase 4 — Engineering Bay

Add a small upgrade catalog, starting with reward-side progression. Add any gameplay-affecting modifier individually after its shared launch/preview integration and balance are demonstrated. Do not enable every suggested modifier at once.

Exit: neutral upgrade levels match accepted behavior; all enabled modifiers obey their caps; trajectory and live behavior agree where prediction applies; saves preserve purchased levels; the gravity loop still feels reliable and immediate.

### Phase 5 — Astronaut Station

Add simple hire and assignment interactions, initially one technician role for Harvester collection. Technicians are persistent assignments, not simulated AI workers that must remain onscreen to function. Avoid schedules, fatigue, wages, pathfinding dependencies, and complex traits. Visible astronauts represent assigned work.

Exit: manual and automated collection cannot claim the same production twice; offline automation is defined and capped; if no separate automation throughput is introduced, offline automatic earnings are bounded by rate × permitted elapsed time with fractional remainder preserved, while unassigned storage remains capacity-limited; assignment changes settle the old state first; decorative worker counts do not affect earnings.

### Phase 6 — Martian Garden

Add the Garden through the building catalog and feature routing. Begin with a small number of plant slots, persisted maturation timestamps, clear ready-to-harvest states, and one simple harvest outcome. Prefer Stardust or a narrowly justified progression reward; add a new material only if it creates a clear decision existing currency cannot express. Reuse time settlement and technician assignment patterns.

Exit: adding the building requires no rewrite of the hub controller; maturation survives resume/reload; harvesting is atomic and cannot repeat; garden management stays optional and lightweight.

### Phase 7 — Visual-Life Pass

Expand modular tier silhouettes, gentle lighting, machinery, docking activity, tiny workers, plant movement, and restrained ambient sound. Keep the small readability and activity cues introduced in earlier phases; this phase adds richness rather than postponing all visible progression until the end. Use pooled/bounded actors, reduced-motion support, and measured graphics quality levels where supported.

Exit: the station feels pleasant when idle; upgrades are recognizable at normal zoom; background activity communicates identity without demanding attention; target-device performance and gameplay startup remain acceptable.

## Scope decisions

The current implementation is Phase 1 alone, with routing to existing Hangar controls. The first useful progression release is Foundation + Hangar + Harvester, followed by Engineering and Astronauts as separate increments. The architecture supports four primary systems plus the reserved Garden within one connected outpost; their functionality arrives in the requested order. The greenhouse, plants and tiny astronauts are decorative now. Garden production and crew functionality remain later releases.

Concrete new costs, production rates, offline limits, upgrade caps, and final art follow measured play/device evidence. The local Three.js renderer is implemented and packaged; target Android performance remains unverified. Foundation has no production economy, station purchases, hiring, building upgrades, or gameplay modifiers. Those features remain future phases.

The station succeeds if returning from a good run reveals a small, understandable improvement to the player's home, and the next launch remains effortless.
