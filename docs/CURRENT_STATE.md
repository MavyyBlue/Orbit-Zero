# Current state — 2026-09-26

- Repository: `MavyyBlue/Orbit-Zero`; branch: `main`.
- Last inspected live HEAD and green baseline: `25fc1c33ef0c08ddd59d3f77530ce925d5cdf2e2`.
- GitHub Actions run #5 (`36264754513`) succeeded on that exact imported SHA: source and validate jobs, browser smoke, Android debug build and lint. The downloadable debug APK belongs to that baseline.
- This document is in a **new source-ZIP revision pending owner upload**. The new candidate is identified by its package manifest and archive hash; its eventual imported Git SHA cannot be known from inside the ZIP. CI has not run against this revision.
- Phase 0 foundation and broader playable implementation exist. No gameplay phase is independently certified by Mio or accepted as final architecture by Yuki.

## Actually exists in this revision

Portable offline Canvas/JS game; pure fixed-step simulation shared with trajectory prediction; Voyage, Endless and Daily; three to five seeded gravitational planets per sector with five visual types; three collectible stars and an exit placed along a verified gravitational route and obscured from a straight launch sightline. Twelve-sector Voyage/Daily progress from three through four to five planets; Endless samples three to five each sector. Near-miss scoring, five unlockable small ship silhouettes with identical physics, four badges, local save/settings, synthesized effects and music, touch/button/keyboard aiming, pause/restart/ending/menu flows. Java Android host with local assets and bounded vibration. Build configuration, public development signing key, Node/Python/browser checks, packaging/import scripts and owner-installed workflow. No substantial code or gameplay from other projects was imported.

## Validation performed

- For this revision: JavaScript syntax and 16 Node tests passed, including a twelve-sector voyage, 48 sampled generated worlds with complete gravity routes, 30 Endless planet-count samples, 144 preview/live equivalence cases, and old-save compatibility. Five Python importer tests passed.
- A narrow-screen Canvas render of a three-planet field was visually inspected locally.
- For the previous, green baseline only: run #5 executed browser smoke and Android debug build/lint at `25fc1c33ef0c08ddd59d3f77530ce925d5cdf2e2`.
- The final archive's manifest, excluded content and clean-import behavior are checked at packaging.

## Not validated / known limits

The new revision still requires owner ZIP upload and an exact-SHA GitHub run. Real-phone touch/feel, difficulty balance, performance on low-end devices, audio/haptics, upgrade installation and independent Mio audit remain open. Local Android SDK/Gradle and a browser runner are unavailable here. Reachability tests demonstrate a known solution for sampled worlds; they do not prove that all seeds are equally enjoyable or that every star is mandatory to exit. Every earned star is banked as stardust when the run ends, including crashes; five ship styles are cosmetic and have no physics advantage.

This is a playable candidate, not a polished/store-certified release. No v0.0.2 source was imported; the owner's described feel reference guided it. Runs do not checkpoint across process death. Daily scores are local and use UTC. Cross-engine bitwise determinism, iOS host, release signing and store preparation remain open. Monetization remains undecided.

## Next bounded task

Owner uploads the delivered archive to repository root as `orbit-zero-source.zip`. Inspect bootstrap run summary, imported candidate SHA, source/validate jobs and debug APK for that SHA. If green, Yuki leads a phone-feel/difficulty review of the three-to-five planet route and star/ship unlock economy; Akari addresses its first bounded correction and Mio independently audits evidence and regression. Preserve the public debug signing identity and app data during update installation.
