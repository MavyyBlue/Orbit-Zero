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
| Progress, cosmetics, settings | `web/save.js` plus `web/decor.js`; versioned/sanitized local storage |
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
the field has no hard cutoff. Planet mass and encounter route selection stay in
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

The art is an independent presentation layer: 121 screen-sized WebP images
derived from Lyra's supplied originals, including five sets of 11 interior
layers. `room-layouts.js` contains normalized positions from the supplied specs.
The room view composes wall/ceiling tint, floor, window, decals, furnishings
and lighting in HTML/CSS. Shop equipment changes only saved cosmetic IDs and
does not enter `simulation.js`. The home/menu uses art backgrounds with real
HTML text and buttons. Source atlases are not loaded in the WebView.

## Save authority and limitations

Schema 1 saves total best, run/gate/near-miss counts, wins, ship and decor
ownership, stardust, per-ship room tint/equipped slots, settings, and up to 32
daily scores. The new fields are additive and old saves default safely.
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
explicit custom values. Production defaults and generation remain unchanged.

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
