# Current state — 2026-09-30

Repository: `MavyyBlue/Orbit-Zero`, branch `main`.
Live baseline: `831ed742ce7a5bd6d82ba5985e95ba581df8db4e`.
Baseline bootstrap run #12 succeeded:
https://github.com/MavyyBlue/Orbit-Zero/actions/runs/36673236721.
This five-planet revision is a source ZIP candidate awaiting owner upload.
Its imported SHA, Android build/lint and exact-SHA CI remain pending;
no independent Mio certification is claimed.

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

33 Node tests and five Python importer tests pass. Physics checks cover signs,
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
New Android build/lint, physical-phone acceptance, screen-reader review and
upgrade-install validation await upload. Browser checks do not certify device
performance or gameplay difficulty. Verified launches prove generated worlds
solvable, not that every route is intuitive or equally forgiving.

## Next bounded slice

Mavyy replaces repository-root `orbit-zero-source.zip`; the existing bootstrap
imports it and builds the APK. No replacement workflow is needed.
Yuki then records the imported SHA and run, and reviews all five mechanics on a
phone: preview accuracy, Orbiter capture/release and pause, Crusher risk, Repulsor
push, Workshop repeated taps/dragging/scrolling, saved settings after force-stop,
and old progress after update. Tune readability and difficulty from that evidence
before expanding content. Akari receives specific corrections; Mio independently
audits the same candidate. Donation setup remains a separate future decision.
