# Current state — 2026-09-30

Repository: `MavyyBlue/Orbit-Zero`, branch `main`.
Confirmed imported five-planet baseline: `c6f7940433cea0c7910cb500fe45c9ab40302927`.
Bootstrap run #13 succeeded:
https://github.com/MavyyBlue/Orbit-Zero/actions/runs/36680968975.
Although the run's event SHA is the ZIP-upload commit `fda49f746b2307b833c2d189fe147c2031cfac37`,
its validate job checked out and tested the imported SHA above. Logs confirm 33
Node tests, five importer tests, browser smoke, Android debug build and lint.
Mavyy accepted that update on a real phone and called it the most addictive yet.
That is gameplay acceptance, not independent QA or broad device certification.
The prior `831ed742` / run #12 baseline is superseded.

This pass adds hold-to-lock drag aiming and syncs the baseline evidence.
It is a new source ZIP candidate; its imported SHA and new CI/build remain
pending owner upload. No independent Mio certification is claimed.

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
The new aim-lock candidate needs its own imported SHA, Android build/lint and
phone acceptance. Screen-reader review, upgrade-install checks and broader device
performance remain outstanding. Verified launches prove generated worlds solvable,
not that every route is intuitive or equally forgiving.

## Hold-to-lock aiming candidate

38 Node tests and five Python importer tests pass locally, including exact
locked-preview and first live-step equivalence, repeated relocking, continuous
movement, wrong-pointer handling, capture loss and background pause. Real
Chromium touch smoke also passes at 320×568, 360×640 and 412×915, covering
normal and zoomed Workshop lock/drift/unlock/relock/release, cancellation, pause
and normal-save isolation. Local browser: Chromium 153 software headless; the
unchanged bootstrap retains its pinned Playwright browser installation for CI.

The existing drag direction, power mapping and simulation remain unchanged while
adjusting. After 350 ms of stillness within a 2 CSS-pixel settling region, a valid
aim locks its exact vector and preview. Movement within 8 CSS pixels of the lock
point is ignored; crossing that distance unlocks and resumes the existing drag
mapping from the original touch-down point. Holding still can relock any number
of times. Releasing launches the last accepted vector, locked or unlocked; a
short/deadzone gesture has no aim and never locks or launches. There is no
extra tap, hold-to-launch timer or permanent lock.

An inline aim hint identifies the lock. Thresholds use screen pixels, independent
of arena zoom. Workshop speed still scales the launch vector normally. Cancel,
lost pointer capture and resize abandon the gesture. Pause abandons the gesture
and lock; its existing resume behavior retains the last preview for subsequent
adjustment or button aiming. Only the owning pointer can move/release/cancel it.
Button/keyboard controls keep their existing behavior and clear any active drag.

## Next bounded slice

Mavyy replaces repository-root `orbit-zero-source.zip`; the existing bootstrap
imports it and builds the APK. No replacement workflow is needed. Record that
new imported SHA/run after upload; never label run #13 as validation of aim lock.
Phone-test normal quick pulls, still hold, tiny drift, deliberate unlock, repeated
relock and release. Check Workshop zoom/speed, pointer interruption/background,
and old progress and levels after update-installing without uninstalling.
Preserve the accepted five-planet feel; adjust lock thresholds from phone feedback
before expanding this slice. Donations remain disabled and offline play remains.
