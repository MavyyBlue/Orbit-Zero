# Current state — 2026-09-30

Repository: `MavyyBlue/Orbit-Zero`, branch `main`.
Current live baseline: `4547952ec24f17d24d3cd166d1cab79399a3cd70`.
Bootstrap run #14 succeeded:
https://github.com/MavyyBlue/Orbit-Zero/actions/runs/36752141785.
Its validate job checked out that exact imported SHA and passed 38 Node tests,
five importer tests, browser smoke, Android debug build and lint.
Mavyy rejected the hold-to-lock player feel in the real-phone test and requested
its removal. Green CI did not constitute gameplay acceptance.

The previously accepted five-planet feel remains the reference: `c6f7940433cea0c7910cb500fe45c9ab40302927`,
green in run #13 (36680968975). Preserve that physics and continuous aiming.
This new replacement removes timed aim lock and adds an adjustable dead zone.
Its imported SHA, new CI/Android build and phone acceptance await owner upload;
no independent Mio certification or broad device certification is claimed.

## What exists

Offline Android-first gravity flight, Voyage and Endless, local Workshop/library,
3–5 planets in generated levels, three route stars, near-misses and quick retry.
Five cosmetic ships, progress, layered interiors and decor shop remain.
Normal progress keys, cosmetic prices and Android signing are retained.
Donation tiers stay disabled with no URL, checkout or SDK. In-game credits remain
Mavyy, Yuki and Lyra; there is no online service or iOS host.

Drifter, Slingshot, Orbiter, Crusher and Repulsor now have distinct force or
capture/release behavior. Preview and flight call the same fixed-step simulation,
including flight-owned orbit timers and capture history. See `PLANETS.md`.
Journey/Voyage introduces Repulsor at 4, Orbiter at 6 and Crusher at 9.
Generated worlds retain an actual winning launch through all three stars and
exit; fallback worlds use the same verification rather than an assumed route.

Workshop Planets + expands a five-type picker. Placing/selecting a planet opens
its own collapsible controls; tapping that same planet closes/reopens them.
The editor fits the arena above its docked configuration panels. Named levels,
drafts and library entries retain each planet's type and bounded settings.
The existing version-1 Workshop key is retained. Older custom planets become
Slingshots; their layouts survive but their gravity may need retuning.
Custom play still awards no normal progress or stardust. Arbitrary handmade
levels are not certified solvable.

## Validation

The five-planet baseline passed 33 Node tests and five Python importer tests. Physics checks cover signs,
cutoffs, capture without teleportation, partial/full orbits, timed release,
zero gravity and exact preview/live state equivalence. All 12 fallback tier/count
combinations and an additional 192 mixed-mechanic Voyage/Endless reference routes
reach the gate after collecting all three stars.

Real Chromium touch smoke passes at 320×568, 360×640 and 412×915. It covers all
five editor control sets, same-planet open/close/reopen, save/reload, library
confirmation, custom respawn and normal-save isolation. An actual custom flight
captures and releases; pausing does not consume orbit time. Existing menu,
settings, art loading, shop and flight smoke also pass without page errors.

Archive integrity, manifest hashes and a clean baseline import are checked before
delivery. Workflows are excluded from the ZIP; the existing bootstrap is retained.
The new dead-zone candidate needs its own imported SHA, Android build/lint and
phone acceptance. Screen-reader review, upgrade-install checks and broader device
performance remain outstanding. Verified launches prove generated worlds solvable,
not that every route is intuitive or equally forgiving.

## Adjustable aim dead zone candidate

39 Node tests and five Python importer tests pass locally. Real Chromium touch
smoke passes at 320×568, 360×640 and 412×915, including slider scroll access,
reload/toggle persistence, enabled/off filtering, release and zoomed Workshop
normal-save isolation. Input tests compare the exact accepted preview and first
live step and cover pointer ownership/cancellation/backgrounding. The source
archive is checked for hashes, repeat import and workflow/signing preservation.
New Android build/lint, imported-SHA CI and physical feel await owner upload.

Settings includes Aim dead zone: 0–12 CSS screen pixels, integer step 1,
default 2. Zero disables movement filtering. No timer, still-hold lock, unlock
mode or lock cue remains. A valid aim ignores pointer moves within the selected
distance of the last accepted screen point; movement beyond it immediately
accepts the full current drag position using the existing direction/power mapping.
Small moves accumulate from the accepted point, so slow adjustment still works.
Release launches the exact last accepted vector and its authoritative preview.
The original minimum launch pull remains unchanged.

The numeric preference is additive in `orbit-zero.save.v1`. Old saves gain the
default, corrupt values are bounded/defaulted, and changes persist from Settings
without rerendering the panel or resetting scroll. Workshop zoom uses the same
screen-pixel threshold and its existing speed multiplier. Editor object dragging
and button/keyboard aiming are unchanged. Gesture cancellation/ownership handling
remains, and pause abandons the gesture without launching.

## Next bounded slice

Mavyy replaces repository-root `orbit-zero-source.zip`; the existing bootstrap
imports it and builds the APK. No replacement workflow is needed. Record the
new imported SHA/run after upload; run #14 validates only the rejected aim-lock
baseline. Phone-test quick/slow adjustment at 0, 2 and higher settings, immediate
response after a still hold, release, Workshop zoom and preference retention
after force-stop. Update-install without uninstalling to retain old progress and
levels. Donations stay disabled; offline/single-player scope remains.
