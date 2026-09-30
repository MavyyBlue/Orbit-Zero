# QA and authority

Mavyy is owner and final product/feel authority. Yuki owns architecture/direction,
Akari implementation, Mio independent QA. Astra's bootstrap/full-game pass is a
candidate handoff. It does not certify itself or replace these roles.

Normal workflow: **Yuki → Akari → Mio → Mavyy phone acceptance → documentation sync**.
Repository contents, exact candidate SHA, test logs and CI evidence outrank chat
memory. A workflow file existing is not a passing run. A passing run is not a
physical-phone playtest or a store-ready release.

## Active scope update: interiors retired

Station Foundation now has four additional Node cases for save migration/bounds
and gesture arbitration. `station-smoke.mjs` is part of the browser entrypoint:
it exercises real touch pan/pinch/cancel, model taps, future-building panels,
camera reload, menu-origin returns, station launches and immediate retry,
resource disposal, context loss/recovery, late-load races and unavailable WebGL.
The browser suite uses SwiftShader where needed; it is not target-device GPU
performance evidence. The candidate passed 56 Node cases, five importer cases
and Chromium journeys at 320×568, 360×640 and 412×915.

Required station phone review: update-install without uninstalling; enter from
the main menu; drag/pinch with real fingers, cancel/background mid-gesture, tap
all four plots, and use accessible buttons/reset/zoom controls. Check small-screen
readability, camera limits/framing after force-stop, Hangar/settings/Workshop Back,
both run modes, direct retry and unchanged preview/planet/dead-zone feel. Check
renderer loss recovery, heat/frame pacing on a low-end WebView, reduced motion,
and memory/startup across repeated hub → run → hub transitions. Building production,
upgrades and technicians must remain unavailable in Foundation.

Ship interiors and the decorating shop are no longer active features. Older
interior acceptance lists below are historical. The active browser suite checks
that Hangar has no Interior/Decor shop entries, then exercises normal menu,
flight, Workshop, planet and aim flows. The normal-run DOM journey now verifies
ship selection/unlocks and retention of legacy room documents/cosmetic ownership
across save writes. Retained room-model/input tests concern archived code and
compatibility, not certification of a current decorating interface. Future 3D
station acceptance follows STATION_PLAN.md.

## Automated coverage

- 144 preview/live equivalence cases with every visible point compared.
- Seed repeatability, bounded drag speed/deadzone, swept collisions.
- Single pickup award, surviving near-miss award, gate/crash/escape/timeout.
- Reachable gravity solutions collecting all three obscured stars and gate for 48
  sampled Voyage worlds, plus planet-count sampling of 30 Endless sectors.
- Gravity-strength checks at near/mid/far distances and exit radius; DOM crash
  flow verifies the result waits for the impact beat and five hangar icons appear.
- Art path/budget checks, old-save decor migration, one-time purchase and equip
  rules, per-ship tint, an interior/shop/support DOM journey and no payment URL.
- Save corruption, version mismatch, sanitization, persistence failures and purchases.
- A lightweight DOM contract test completes a 12-sector voyage and exercises pause,
  settings, retry, achievements, pointer cancellation and background pause.
- ZIP validation, repeat import, workflow preservation, ownership conflicts, hash
  mismatch, symlink/traversal/workflow/Git path rejection.
- Real-browser smoke at 320×568, 360×640 and 412×915 runs locally and in CI; screenshots are
  artifacts, including home, support, interior and shop. This is distinct from
  the DOM contract test.

## Required phone acceptance

1. Install debug APK, reach menu, open help/settings/hangar and scroll to every button.
2. Drag from the ship on the real screen; verify comfortable launch position,
   aim direction, cancel behavior, multi-touch rejection, and prompt restart.
3. Compare visible prediction and live flight; try slow and fast launches.
4. Collect a pickup, survive a near miss, crash, escape, reach a gate and finish a voyage.
   Watch a crash effect complete before the result; confirm the wider gate feels fair.
5. Pause/resume and background/return during flight and between sectors. No unseen motion.
6. Check audible effects/music, haptic toggles, reduced motion, high contrast and button aiming.
7. End a run, change a cosmetic/setting, force-stop and reopen. Verify saved progress.
8. Install the next APK as an update without uninstalling; confirm signing and saves.
9. Test low-end performance/heat, tall/short screens, system insets and Android Back.
10. Judge actual v0.0.2 feel parity. Automated tests cannot certify “one more launch.”
11. Inspect five hangar icon shapes against the in-field ship, including locked styles.
12. Open every home/menu/hangar/settings/help control at 360px width; verify
    readable art, scroll access, text contrast and working Android Back.
13. Open each owned ship's interior. Tint its wall, place and re-place decor,
    then force-stop/reopen to verify the save without losing previous progress.
14. Check shop prices, one-time charges and insufficient-balance disabled states.
    No decor may alter the flight simulation.
15. Open Support. The transparent still art should appear; donation tiers must remain disabled with no external checkout.

Known outstanding work for the interior candidate: independent audit, its own exact-SHA CI/browser run,
phone/performance/device certification, store/release preparation. Read CURRENT_STATE
for what was actually executed locally.

## Workshop regression and acceptance

Automated coverage checks level/config persistence and independent clones, schema
corruption and bounds, library cap/update, gravity scaling, custom world bounds and
time limit, and exact preview/live state equivalence. Real-browser coverage edits
three sizes, places and drags with touch, tunes a selected planet, reloads stored
levels, confirms draft replacement/deletion, exercises instant respawn, completes
and loses a custom flight, and asserts normal progress never changes.

Phone acceptance: build several different-size arenas; move/delete objects; scroll
and collapse the fixed configuration panel; save/reopen multiple named levels and
update one without duplication. Verify custom background pause and Android Back,
instant-respawn aim reset, old progress after an update install, and normal
Voyage/Endless controls. Arbitrary handmade levels may be impossible; completion
checks are manual. Storage quota/failure and extreme zoom need device review.

## Five planet regression

Force tests compare signs, cutoff and near/far ratios, not just multipliers.
Orbiter tests cover no teleport, partial/full orbit, timed release, no recapture,
zero gravity and exact preview/live state through transitions and mixed forces.
All twelve fallback stage/count pairs reach the gate with all stars. A 192-world
Voyage/Endless audit spans eight seeds and twelve sectors. The existing tests
retain obscured stars/gate and a full UI Voyage.

Browser checks cover five picker summaries, type-specific controls, stored type
values, actual touch reclick closing/reopening, compatibility-click suppression,
and capture → pause → resume → release at three phone sizes. Physical acceptance
still needs all five types, high-speed Crusher collisions, gravity-zero obstacles,
old custom-level retuning and preview trust on the target Android WebView.

## Adjustable aim dead zone regression and phone acceptance

Mavyy rejected the timed aim-lock feel after installing its green build. The accepted `b5a2139`
baseline removes settling and lock state. Tests cover immediate threshold
crossing, accumulating slow movements, zero/off behavior, first valid aim,
setting bounds, old-save migration and persistence. Input integration checks
exact accepted preview/first live step, other-finger release/cancel, capture loss
and background pause. Browser touch smoke covers Settings scroll access,
persistence across reload and other toggles, enabled/off behavior and normal
and zoomed Workshop drag aiming at three phone sizes. Custom gestures retain
normal progress, and editor object dragging stays unchanged.

Phone acceptance: use the default 2 px, try 0/off and higher values, then choose
a comfortable value. Aim must respond immediately beyond the chosen threshold
and never change mode after holding still. Check exact release, repeated pulls,
button aiming, background interruption, Workshop zoom/speed and settings after
force-stop. Install over the existing app to retain progress and custom levels.

## Bundled interior regression and acceptance

New local Node tests cover five clear default layouts, stable migration, all
existing licenses/prices, independent rooms, footprint/mount/window rules,
multiple same-category furniture, independent repeated decals, invalid/crowded
saves, and isolation from authoritative prediction. Input contracts exercise
three phone widths, other-pointer rejection, valid/invalid releases, cancellation,
backgrounding, undo, preview/cancel, one-time purchases, quota failure and interactions.

The expanded Chromium suite in `room-smoke.mjs` is wired into the existing
bootstrap browser entrypoint for 320×568, 360×640 and 412×915. It checks five rooms,
44-pixel controls, room size, assets, migration, surfaces/lighting, records/window/
lamp interactions, touch rejection/cancellation, store/undo, preview/confirmation,
insufficient funds, decals, reload and normal-progress/Workshop isolation.
It has NOT run locally: sandbox restrictions block sockets for the server and
Chromium IPC. New browser and Android build/lint must pass after upload.
Baseline run #15 is not evidence for this candidate.

Phone acceptance: update-install without uninstalling. Open all rooms and confirm
comfortable decorating with actual device insets. Drag, use Move anchors, collide
footprints, cancel/background mid-drag, store and undo. Verify free re-placement
and preserved old purchases. Preview/cancel before buying; confirm the displayed
unchanged price once; store/re-place in another ship without spending. Place
several individual decal motifs. Tune each surface, light and view; toggle lamps
and read records. Force-stop/reopen and verify each ship, normal progress and
saved Workshop levels. Test Android Back and unchanged aiming/planet/preview trust.
Independent QA and phone feel acceptance remain pending.
