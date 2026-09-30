# Changelog

## 2026-09-30 — Five planet mechanics candidate

Added Drifter, Slingshot, Orbiter, Crusher and Repulsor with distinct field rules
and shared preview/live capture-release state. Journey introduces low-skill types
in 1–3, Repulsor at 4, Orbiter at 6 and Crusher at 9. Generated routes and staged
fallbacks are verified with the new rules. Workshop gains a five-option picker,
per-type settings and tap/re-tap planet panels. Values persist with levels; old
custom planets migrate to Slingshot. Added visual field cues and orbit audio.
Local physics/route/UI validation precedes owner import and new exact-SHA CI.

## 2026-09-30 — Local Workshop candidate

Replaced Daily Orbit with a touch level editor and local library. Added arena
fit-to-view dimensions, global/per-planet gravity, launch speed, instant respawn,
time limit, planet style/radius and exit radius. Saved levels retain configuration
and geometry; drafts autosave separately, with bounded undo and confirmed deletion
or draft replacement. Custom play shares authoritative physics and cannot change
normal progression. Local data/physics and three-size browser regression pass;
new Android/CI and physical-phone acceptance await owner upload.

## 2026-09-30 — Space arcade UI polish candidate

Unified menus around a navy orbital backdrop, crisp vector icons, mint flight
controls, violet unlocks and gold rewards. Added labeled dock navigation, clearer
ship ownership/actions, consistent settings and progress surfaces, panel focus
and stable settings scroll. Preserved gifted illustrations, saves, physics and
prices. Support tiers stay disabled with a coming-soon label. Local browser
validation now runs at three portrait phone sizes; new APK/CI awaits upload.

## 2026-09-27 — Portrait comparison correction, pending owner import

Compared Mavyy's five phone captures with the supplied UI mockups. Replaced
inset decorative card/button backgrounds with single full-size surfaces,
reworked challenge label/progress placement, enlarged settings switches,
added pastel ship portrait tiles, and switched the support illustration to
the transparent still cutout. Existing gameplay, progress and payment-free
support behavior remain unchanged. Exact-SHA CI and phone review pending.

## 2026-09-27 — UI image and portrait layout correction

- Restored three empty runtime images from Lyra's original archive and added an all-image integrity check.
- Reworked home, settings, hangar, five ship interior presentation, and support page toward Mavyy's portrait references; kept real saved values and disabled donation tiers.
- Extended phone-size browser smoke to capture every referenced screen and fail on broken images or failed art requests.

## Lyra UI and cosmetic rooms — pending owner import

Replaced the menu presentation with Lyra's optimized art. Added five layered
ship interiors with wall tint, an 11-item stardust decor shop, additive save
fields for owned/placed decor, and a support page featuring Lyra/Yuki art.
The support button is disabled without a payment link. Original texture atlases
and high-resolution images remain outside the APK; 121 optimized WebP assets
ship instead. Flight physics and old progress remain compatible. Local
validation passed; exact-SHA CI and phone acceptance are pending.

## Stronger orbits and feedback — pending owner import

Strengthened near and distant planetary pull using the same authoritative
physics for trajectory preview, live play and route generation. Expanded the
visual gravity rings and exit radius from 22 to 27 units. Added a brief collision
spark and tiny mushroom cloud before the result screen, respecting pause and
reduced-motion timing. Hangar now previews the five ship silhouettes beside
their names using the same shape data as the field. No save schema change.

Built on green imported commit `2e88b300e9ed6e6edb64d60229de7ebdb45b006a`.
New candidate awaits owner upload and exact-SHA CI/phone review.

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
