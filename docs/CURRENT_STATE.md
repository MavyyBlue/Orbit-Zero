# Current state — 2026-09-26

- Intended repository: `MavyyBlue/Orbit-Zero`; intended branch: `main`.
- Candidate: **0.1.0 source ZIP**, identified by per-file SHA-256 in
  `.orbit-zero-package.json` and the delivered archive checksum.
- Inspected live `main` at `65972fc3d45aa2bf7712b68e001a5e5465a3e45c` (workflow run #4). Earlier source import succeeded; the newest ZIP revision is not uploaded yet.
- **Certified SHA: none.** Run #4 failed Android lint with two resource API-level errors. The corrected source candidate awaits owner upload and an exact-SHA CI run. A file cannot contain its own future Git commit hash.
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
- Run #4 passed source, JavaScript, importer and real-browser smoke checks; Android debug assembly completed, then lint failed on two theme attributes. The full lint artifact was inspected and both errors were corrected in version-qualified resource XML. This revision has not been run in GitHub CI.
- Final source archive manifest/hash and clean-checkout import were checked at packaging.

## Not validated / limitations

Real phone touch, corrected-resource Android lint/runtime, physical-phone
feel, audio output/haptic output, device performance, upgrade installation and independent
Mio QA remain pending. GitHub run #4 exercised browser rendering and debug assembly for the preceding package; lint did not pass. Local Android SDK/Gradle were unavailable. GitHub CI has **not** run for this corrected package.

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
