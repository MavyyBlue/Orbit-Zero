# Changelog

## Gravity routes and ship silhouettes — pending owner import

Added three to five varied gravitational planets per sector. Voyage and Daily
progress from three to five across twelve sectors; Endless chooses three, four,
or five per sector. Seeded encounter generation verifies a gravity-driven route
through three planet-obscured collectible stars to an obscured exit. Replaced
pickup diamonds with stars and the probe rendering with five distinct small ship
silhouettes unlocked through earned stardust. Existing cosmetic IDs and save
schema remain compatible. Local tests pass; exact-SHA CI and phone feel await
owner upload.

## 0.1.0 lint correction — 2026-09-26

Moved the API 35 edge-to-edge theme attribute to `values-v35` and removed the
unneeded API 27 navigation-bar attribute from the API 26 base theme. Run #4
identified both errors; run #5 validated the correction at
`25fc1c33ef0c08ddd59d3f77530ce925d5cdf2e2`.

## 0.1.0 candidate — 2026-09-26

First newly authored production candidate after owner expanded the bootstrap scope
into a full playable-game attempt. Added offline gravity flight, shared trajectory
prediction, generated voyage/endless/daily modes, scoring, cosmetic progression,
flight log, local persistence, menus, alternate input, synthesized audio, Android
host/build structure, validation and safe owner-uploaded ZIP ingestion.

No prototype source imported. No historical prototype commits are claimed here.
No remote commit, CI certification, independent QA or phone acceptance yet.
