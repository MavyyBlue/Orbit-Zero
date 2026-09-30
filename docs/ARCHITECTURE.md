# Architecture — 0.1.0 candidate

The expanded owner request authorized a full playable implementation. Astra chose
this small stack to make that pass deliverable, not to replace Yuki as permanent
architecture/game-direction authority. Yuki may revise it after reviewing evidence.

## Implemented boundaries

| Boundary | Current authority |
| --- | --- |
| Physics, collision, prediction | `web/simulation.js`; pure fixed-step `advance` at 120 Hz |
| Encounters | Seeded `encounter` in the simulation module; three to five varied gravity sources, a route search placing obscured stars and gate |
| Run transitions, scoring aggregation, input | `web/game.js`; aim/flight/transit/pause/result states |
| Rendering | Canvas draw functions in `game.js`; never advance physics |
| Menus/accessibility controls | Semantic HTML controls in `web/game.js`, art markup in `web/ui-art.js`, CSS in `style.css` |
| Progress, cosmetics, settings | `web/save.js`, `web/decor.js` and `web/room-model.js`; versioned/sanitized local storage |
| Audio | `web/audio.js`; original Web Audio notes/cues, no media downloads |
| Android | Java Activity, local HTTPS asset origin, bounded haptic bridge |
| Import/build | Owner-created bootstrap workflow; ZIP cannot modify workflows |

Encounter generation searches sampled launch controls using the authoritative
`advance` function, then checks that all three stars and the gate are reached in
order. It chooses pickup and exit positions behind a planet from the launch
point. This guarantees a known gravity route for generated sectors, not unique
solutions or ideal difficulty; balancing remains subject to phone play.

Prediction clones initial flight state and calls the exact same `advance` function
and time step as live flight. No separately approximated ballistic curve. Preview
ends after 2.1 simulated seconds or an earlier terminal event. Planet contact uses
swept segment collision. Gravity is softened at short distance; it is an arcade
model, not a scientific N-body solver. Its broader inverse-square skirt boosts
acceleration at near and far distances, while visual orbit rings suggest reach;
Slingshot and the passive Orbiter attraction have no hard cutoff; other types
have explicit bounded fields. Planet mass and encounter route selection stay in
the same simulation module. Physics does not depend on DOM, audio, or
platform APIs. Fixed-step determinism is tested within the JS runtime; cross-engine
bitwise equality is not claimed.

The crash state stops live physics immediately, renders a brief impact effect,
then opens the result. Pause/background stops that timer. The live Canvas ship derives from `SHIP_OUTLINES` in `web/save.js`; the hangar uses the supplied illustrated portraits.

Rendering caps DPR at 2 and trail length at 110. Long frames cap accumulated wall
time at 100 ms, slowing simulation rather than skipping simulation steps. This
protects preview equivalence but does not constitute device-performance certification.

The Android app has no INTERNET permission and blocks nonlocal WebView requests.
File/content access is disabled. JavaScript can only invoke a bounded vibration
bridge. No account or store SDK. An iOS host is not implemented; the web game is
portable and can later be hosted in WKWebView or moved to another renderer.

Gameplay state is intentionally compact in one orchestrator. Extract run-state
and rendering modules if future work warrants it; do not invent empty systems.

The art is an independent presentation layer: the existing 121 optimized WebP
images and five sets of interior layers remain. `room-layouts.js` retains the
original asset/default catalog; `room-model.js` owns expanded room designs,
cosmetic inventory metadata, footprints, window clearance, mount rules and safe
migration. `room-editor.js` renders/edits documents with a bounded dock and its
own pointer owner. Validation is shared by drag, tap/keyboard movement, previews
and save sanitization. `room-editor.css` orders floor items by position and keeps
perspective furniture upright with contained aspect ratios. Decal sheet cells
are clipped to individual motifs rather than placing a sheet.

Pending previews are separate from ownership/placement. Confirmation constructs
a candidate save, applies the existing one-time price and writes the complete
transaction before updating cosmetic state. Failed writes do not charge or claim
success. Room-only undo never restores stardust/ownership. Surface/lighting edits
save on change; drag saves on valid release. Capture loss/background/resize cancel
unfinished moves. Listeners and observers are removed on exit. Flight orchestration
only opens/exits this UI; simulation and Workshop never read rooms. No added
runtime dependency, backend or external request.

## Save authority and limitations

Schema 1 saves total best, run/gate/near-miss counts, wins, ship and decor
ownership, stardust, per-ship room documents, settings, and up to 32
daily scores. Nested `roomVersion: 2` adds independent surfaces/lighting/view and identified
placements. Global decor licenses remain separate. Old tint/slots migrate;
invalid or crowded placement becomes stored inventory. Compatibility slots are
derived; positions are authoritative. The outer version-1 key, normal progress
and Workshop key are unchanged.
Rewards are banked at run end.
Process death abandons the current run. Android app backup is disabled. Corrupt
saves recover to defaults; storage failures display a warning. No cloud save.

The support page contains no URL, payment SDK, purchase API or transaction. Its
button is disabled until Mavyy chooses a platform and authorizes a later slice.

## References checked during implementation

- Android local WebView assets: https://developer.android.com/develop/ui/views/layout/webapps/load-local-content
- AGP 8.9 / Gradle 8.11.1 compatibility: https://developer.android.com/build/releases/agp-8-9-0-release-notes
- GitHub token-trigger behavior: https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow

## Local Workshop authority

`workshop.js` owns version-1 level documents, bounded sanitization, conversion
to simulation worlds and the separate `orbit-zero.workshop.v1` library. Normal
progress retains its existing version-1 key and legacy daily history; Daily is
no longer exposed as a playable mode. Custom scores never enter normal rewards.
`workshop-ui.js` owns touch editing, configuration and library interactions.
`game.js` runs custom flights and respawn/result transitions. All custom prediction
and flight call the same `advance`; world start, bounds and duration override only
explicit custom values. Production world-size/time defaults stay unchanged. Encounter mechanics now
follow the staged five-type progression.

Level geometry uses normalized coordinates; resizing preserves relative positions
but radii stay in world units. Global and individual planet multipliers scale the
same authoritative mass. Speed scales initial velocity, not the simulation clock.
Camera zoom fits the full arena and changes with config/aiming panel size; it never
changes physics. A minimum visible ship size is cosmetic; collision radius remains
four world units. Config sliders and selection labels show actual stored values.

The library is local-only, bounded to 30 entries, 12 planets and 24 stars per level.
Draft persistence is separate from named Save. Failed storage writes do not claim
a saved entry or apply a deletion. Overwrites retain IDs; copies receive new IDs.
Unsaved-draft replacement and deletion require in-app confirmation. Spawn/exit
overlap is checked before play; no automatic proof of solvability is promised for
handmade levels. No remote workshop, accounts, sharing or backend is implemented.

## Planet mechanics authority

`planet-rules.js` owns the shared catalog, bounds, force profiles and Orbiter state
transition rules. `advance` invokes those exact rules for flight, preview and
generation's route verification. Orbiter's active index, entry age, direction,
ring radius/speed and visited indices live in the flight snapshot, never in the
level or a rendering clock. Capture changes velocity without teleporting position.
A damped radial/tangential controller holds a short orbit; expiry adds a tangent
boost and prevents recapture by the same planet during that flight. Other planets'
forces/collisions still apply. Pause halts simulation age and lock expiry.

Drifter has a weak tapered finite field; Slingshot has a broad inverse-square
curve with a close lens; Crusher has a steep capped short-range profile; Repulsor
has a bounded linear outward profile. These differ in sign, reach and shape,
not only a scalar. Gravity-zero disables force and capture but keeps collision.

Encounter generation searches with the new mechanics and verifies all three stars
and the gate before returning a world. Late exits can sit on an upper orbital arc
rather than a fixed top strip. A bounded search falls back to a verified template
for its progression stage and body count; all twelve fallback combinations are
tested. Existing world bounds, score/save keys and debug signing remain stable.

## Adjustable drag dead zone

The hold-to-lock experiment was rejected in Mavyy's phone test and removed.
`aim-lock.js` retains its already-owned package path but now contains only the
`AimDeadZone` movement filter and numeric setting sanitizer; no timers or lock
state remain. Settings owns `aimDeadZone` (integer 0–12 CSS pixels, default 2)
in the existing version-1 progress save. Old saves gain that one setting while
all previous progress/cosmetics/settings remain. Zero accepts every pointer
update, preserving the original drag behavior.

During a valid aim, moves within the selected distance of the last accepted
screen point preserve the vector/preview. Crossing the distance immediately
accepts the full current drag position relative to the original touch-down;
slow movement accumulates rather than being discarded forever. No settling
period or timed state transition exists. The original minimum launch pull and
Workshop speed mapping remain. Preview and live flight use the same accepted
vector and authoritative simulation. Button/keyboard aiming and editor object
dragging do not use the filter. Cancellation, capture loss, resize and leaving
aim discard pointer ownership.
