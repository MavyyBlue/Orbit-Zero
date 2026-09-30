# Current state — 2026-09-30

Repository: `MavyyBlue/Orbit-Zero`, branch `main`.
Live HEAD verified before implementation:
`b5a2139337b0aa0d10de4ca1efc27eea52727410`.
Latest successful Actions run is #15:
https://github.com/MavyyBlue/Orbit-Zero/actions/runs/36755407244.
Its validate log explicitly checks out that imported SHA and passes 39 Node
tests, five importer tests, three-size browser smoke, Android build and lint.
The trigger SHA is the preceding upload commit; the validated source is the
imported SHA above.

Mavyy accepted the five mechanical planets and adjustable Aim dead zone in
physical-phone testing. The replacement is already uploaded and green; prior
pending-upload documentation was stale. Preserve its feel: 0–12 CSS screen
pixels, default 2, zero disables filtering. Rejected timed hold-to-lock remains
removed. This acceptance does not imply broad device or independent certification.

## Bundled hangar-interior candidate — pending upload

Five expanded layouts: Scout cabin, Arrow racing lounge, Manta floating library,
Needle observatory and Starling salon. Smaller, separated furnishings and a
compact Furniture/Surfaces/Lighting dock keep the room visible.

Explicit Decorate mode includes drag placement, Move anchors, Store, room-only
Undo and Done. Floor footprints, projected-art clearance and wall/ceiling mounts
protect furniture, decals and windows. Depth follows floor position. Perspective
furniture stays upright with its original aspect ratio; individual decal motifs
are the supported variants. Pointer ownership, cancellation, capture loss,
resize and backgrounding abandon unfinished moves.

Owned inventory is separate from placement. Existing licenses and prices remain;
use a license in any owned ship. Storing/rearranging is free. Shop selection
previews in-room with price/balance; explicit Buy confirmation is required.
Purchase plus placement saves atomically. Failed writes leave ownership, balance
and room unchanged. Undo never refunds or removes purchases.

Wall, ceiling and floor each have independent color and included finishes.
Lighting has color/brightness. Decals are individually placed motifs, with
repeat use of owned licenses. Lamps toggle, consoles show actual normal flight
records and windows offer four offline views. Each ship saves its own room.

The existing `orbit-zero.save.v1` key and progress schema remain. Nested rooms
gain `roomVersion: 2`. Legacy tint/equipped slots migrate; invalid or crowded
placements return to Owned storage without erasing purchases. Defaults are also
storable. Workshop documents and its version-1 key are unchanged. Interiors
never enter flight physics.

## Candidate validation and limits

Executed locally: syntax checks, 52 Node cases and five Python importer cases.
New coverage includes stable migration, atomic purchases, independent surfaces,
interactions, valid/invalid moves, other pointers, cancellation, backgrounding,
undo and cosmetic/flight isolation. Room input fixtures cover 320, 360 and 412
pixel widths; these are DOM contracts, not rendered browser acceptance.
Existing mechanics, winning routes, preview/live, accepted aiming, Voyage and
Workshop regressions pass.

ZIP CRC/integrity, complete manifest hashes, and clean/repeated imports against
the exact live baseline are checked before delivery. Existing owned source paths
remain. All workflow files are excluded; bootstrap and signing bytes are retained.
Gameplay/Workshop/Android sources are compared with the baseline.

Local Chromium could not execute: the sandbox denies socket creation, including
Chromium IPC and the HTTP test server. The expanded real-browser suite is included
in `scripts/room-smoke.mjs` and invoked by the unchanged bootstrap's
`browser-smoke.mjs` at 320×568, 360×640 and 412×915. It must pass after upload;
no candidate local browser pass or screenshots are claimed. Gradle/Android SDK
are absent here, so new Android build/lint await CI.

Run #15 proves the baseline, not this interior update. This ZIP awaits its own
imported SHA, CI/browser/Android results and Mavyy phone acceptance. Independent
review, screen-reader review, update-install and wider device/performance checks
remain outstanding.

## Preserved game and next step

Offline single-player Voyage/Endless, five distinct planet mechanics,
authoritative shared preview/live physics and verified generated winning routes
remain. Workshop retains planet-specific controls, saved settings and normal-save
isolation. Progress, cosmetic prices, signing and accepted aiming stay stable.
Donations remain disabled with no payment link, checkout or SDK. No backend.

Replace only repository-root `orbit-zero-source.zip`; keep the existing bootstrap.
Verify the new exact imported SHA and green CI, then update-install without
uninstalling. Phone-test all five rooms, crowded placement, inventory,
purchase/cancel, decals, surfaces/lighting, force-stop, Android Back and unchanged
accepted flight feel. See `INTERIORS.md` and `QA.md`.
