# Current state — 2026-09-26

- Intended repository: `MavyyBlue/Orbit-Zero`; intended branch: `main`.
- Candidate: **0.1.0 source ZIP**, identified by per-file SHA-256 in
  `.orbit-zero-package.json` and the delivered archive checksum.
- **Live HEAD/branch/tree: not verified.** The connector returned 404 and no accessible
  installations. Nothing was pushed from this environment. Do not substitute a remembered SHA.
- **Certified SHA: none. Imported candidate SHA: pending owner upload.** The bootstrap
  summary and APK evidence will record the exact imported commit. A file cannot contain
  its own future Git commit hash. Replace this pending entry during a later evidence-backed sync.
- Phase 0 foundation authored; broader playable implementation authorized by owner.
  No phases are independently certified.

## Actually exists

Portable offline Canvas/JS game; pure fixed-step simulation and shared prediction;
three run modes; four encounter families; pickups and near-miss combo scoring;
three cosmetic colors and four badges; local saves/settings; synthesized effects and
music; touch, button and keyboard aiming; pause/restart/ending/menu flows.
Java Android host with local assets, bounded vibration and offline request isolation.
Build config, public development signing key, Node/Python tests, browser smoke script,
packaging/import scripts, hygiene and project docs. Separate owner-installed workflow.
No substantial code from another project was imported.

## Validation actually performed here

- JavaScript syntax and **14 Node tests passed** (including full voyage UI logic).
- **5 Python importer tests passed**.
- Generated-sector reachability: 48 sampled worlds passed.
- Preview equivalence: 144 seeded/sector cases passed.
- Workflow YAML parsed and all embedded shell scripts passed `bash -n`.
- Final source archive manifest/hash and clean-checkout import were checked at packaging.

## Not validated / limitations

Real browser rendering and touch, Android compilation/lint/runtime, physical-phone
feel, audio output/haptic output, device performance, upgrade installation and independent
Mio QA remain pending. Browser download failed; Android SDK/Gradle were not available
locally and the Gradle download probe timed out. GitHub CI has **not** run for this package.

This is a compact complete playable candidate, not a polished/store-certified game.
No v0.0.2 source was available; only the owner's described feel reference was used.
Current runs are not checkpointed across process death. Daily uses UTC and local-only
scores. Cross-engine bitwise determinism is not claimed. iOS host, broad content/modifiers,
release signing and store preparation remain open. Target SDK 35 is a build baseline,
not a claim of current store eligibility.

## Next bounded task

After owner installation/upload, inspect the successful bootstrap summary and exact
imported candidate tree. If CI fails, correct only that concrete failure first. Then
Yuki leads a real-phone feel review against v0.0.2, with Mio's independent source/CI
audit. Keep the public debug signing identity and existing app data during updates.
