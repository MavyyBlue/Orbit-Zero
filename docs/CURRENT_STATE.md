# Current state — 2026-09-26

- Repository: `MavyyBlue/Orbit-Zero`; branch: `main`.
- Inspected live HEAD: `2e88b300e9ed6e6edb64d60229de7ebdb45b006a`.
- GitHub Actions run #6 (`36266272282`) succeeded: source and validate jobs on the imported previous package, including browser smoke and Android build/lint. The APK artifact belongs to that earlier commit.
- This document is part of a **new source-ZIP revision pending owner upload**. Its eventual imported Git SHA is unknown until upload; exact-SHA CI and phone validation have not run for it.
- The playable game is an implementation candidate. Yuki remains architecture/game-direction authority, Akari normal implementation owner, Mio independent QA, and Mavyy final product authority.

## This candidate contains

Offline single-player Canvas/JS gravity flight with shared authoritative prediction; Android Java host; twelve-sector Voyage/Daily and Endless; three to five seeded planets per sector with varied visuals and three gravity-routed collectible stars; near-miss scoring; five cosmetic ship shapes purchased with earned stardust; local saves/settings; synthesized sound, music and bounded haptics. This revision strengthens gravity near and farther from planets, broadens its visual rings, enlarges the exit radius from 22 to 27 units, delays the result while a small collision spark/mushroom cloud plays, and shows actual ship silhouettes in the hangar. Save schema and signing identity are unchanged. No code or gameplay from other projects was imported.

## Validation here

- JavaScript syntax and 17 Node tests passed: full twelve-sector UI journey, 48 sampled gravity routes, 30 Endless sector samples, 144 preview/live equivalence cases, hangar icons, delayed crash result, gravity strength and gate radius, save compatibility.
- Five Python importer tests passed. An additional 240 seeded sectors solved with all three stars; no route fallback observed in that sample.
- The package manifest, archive checksum, clean import over current HEAD and workflow preservation are checked when packaging.
- Run #6 validates the *previous* imported state, not these changes.

## Open validation and limits

New ZIP upload and exact imported-SHA GitHub CI are required before an APK from this revision exists. Physical-phone gravity feel, exit generosity, collision animation, hangar readability, low-end device performance, audio/haptics, update installation and independent Mio audit remain pending. Generated routes have a known tested solution for sampled worlds; unique solutions, uniform difficulty and mandatory star collection are not proven. There is no hard boundary to gravity; the broad rings are a visual cue and pull decays with distance. Runs do not checkpoint through process death. Daily scores are local UTC. iOS host, release signing and store work remain open; monetization undecided.

## Next bounded task

Mavyy uploads this archive as `orbit-zero-source.zip` at repository root, replacing the prior archive. Verify both jobs of its bootstrap run and record the actual imported SHA and APK artifact. Then Yuki leads a phone-feel review of gravity reach/strength, exit width, collision timing and five hangar icons; Akari addresses one bounded correction and Mio independently audits that exact candidate. Preserve app data and the public development signing key when updating the debug APK.
