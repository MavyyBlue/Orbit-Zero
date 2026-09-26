# Architecture — 0.1.0 candidate

The expanded owner request authorized a full playable implementation. Astra chose
this small stack to make that pass deliverable, not to replace Yuki as permanent
architecture/game-direction authority. Yuki may revise it after reviewing evidence.

## Implemented boundaries

| Boundary | Current authority |
| --- | --- |
| Physics, collision, prediction | `web/simulation.js`; pure fixed-step `advance` at 120 Hz |
| Encounters | Seeded `encounter` in the simulation module; four template families |
| Run transitions, scoring aggregation, input | `web/game.js`; aim/flight/transit/pause/result states |
| Rendering | Canvas draw functions in `game.js`; never advance physics |
| Menus/accessibility controls | Semantic HTML controls and `style.css` |
| Progress, cosmetics, settings | `web/save.js`; versioned/sanitized local storage |
| Audio | `web/audio.js`; original Web Audio notes/cues, no media downloads |
| Android | Java Activity, local HTTPS asset origin, bounded haptic bridge |
| Import/build | Owner-created bootstrap workflow; ZIP cannot modify workflows |

Prediction clones initial flight state and calls the exact same `advance` function
and time step as live flight. No separately approximated ballistic curve. Preview
ends after 2.1 simulated seconds or an earlier terminal event. Planet contact uses
swept segment collision. Gravity is softened at short distance; it is an arcade
model, not a scientific N-body solver. Physics does not depend on DOM, audio, or
platform APIs. Fixed-step determinism is tested within the JS runtime; cross-engine
bitwise equality is not claimed.

Rendering caps DPR at 2 and trail length at 110. Long frames cap accumulated wall
time at 100 ms, slowing simulation rather than skipping simulation steps. This
protects preview equivalence but does not constitute device-performance certification.

The Android app has no INTERNET permission and blocks nonlocal WebView requests.
File/content access is disabled. JavaScript can only invoke a bounded vibration
bridge. No account or store SDK. An iOS host is not implemented; the web game is
portable and can later be hosted in WKWebView or moved to another renderer.

Gameplay state is intentionally compact in one orchestrator. Extract run-state
and rendering modules if future work warrants it; do not invent empty systems.

## Save authority and limitations

Schema 1 saves total best, run/gate/near-miss counts, wins, cosmetic ownership,
stardust, settings, and up to 32 daily scores. Rewards are banked at run end.
Process death abandons the current run. Android app backup is disabled. Corrupt
saves recover to defaults; storage failures display a warning. No cloud save.

## References checked during implementation

- Android local WebView assets: https://developer.android.com/develop/ui/views/layout/webapps/load-local-content
- AGP 8.9 / Gradle 8.11.1 compatibility: https://developer.android.com/build/releases/agp-8-9-0-release-notes
- GitHub token-trigger behavior: https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow
