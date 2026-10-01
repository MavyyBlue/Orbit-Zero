# Roadmap

The owner expanded the initial bootstrap into one full playable-game attempt.
0.1.0 touches multiple phases; implementation does not imply phase certification.

| Phase | Direction | Candidate status |
| --- | --- | --- |
| 0 | Production Foundation and North Star | Live `b5a2139` validated by run #15; dead zone accepted on phone; interior candidate pending upload |
| 1 | Production-quality core flight/physics loop | Shared physics/preview and accepted five-planet feel retained; timed aim lock removed; adjustable dead zone accepted |
| 2 | Encounter generation and run structure | Three-to-five-planet seeded layouts and route-placed stars/gate; Voyage/Endless and local Workshop; staged mechanic routes and verified fallbacks |
| 3 | Scoring, mastery, and progression | Near-miss scoring, five unlockable ship shapes, achievement log implemented |
| 4 | Visual identity and juice | Lyra UI collection integrated; original procedural flight art retained; phone review pending |
| 5 | Sound/music and tactile polish | Original synthesized audio and Android vibration implemented |
| 6 | Content variety and modifiers | Five distinct planet mechanics accepted; expanded room placement/inventory/surfaces/lighting candidate |
| 7 | Menus, saves, accessibility, settings | Art-backed menus, decor saves, alternate controls; Workshop editor/library candidate |
| 8 | Performance/device certification | Pending |
| 9 | Store preparation, monetization decision, launch candidate | Donation page shell only; platform/link and policy decision pending |

**Next task:** Validate the Station Foundation candidate on the target Android
WebView/device and through exact-candidate CI. Next development phase is Hangar:
active 3D ship display and failure-safe ship transactions using existing IDs/prices.
The old interior ZIP is superseded. Preserve accepted physics/dead-zone feel,
progress and Workshop levels. Donation checkout remains a separate later decision.

## Long-term direction: the orbital station

The owner's new direction is a persistent interactive 3D station: a miniature
orbital home where run-earned Stardust visibly improves ships and structures.
It reinforces the gravity-arcade loop and preserves immediate retry, Workshop,
accepted aiming/planet mechanics, shared trajectory authority, and existing saves.
Station Foundation is now implemented locally as a candidate. Later production
and progression features remain planned; release/device checks remain open.

Development order: source/rendering feasibility → Station Foundation → Hangar
integration → Economy / Stardust Harvester → Engineering Bay → Astronaut Station
→ Martian Garden → Visual-Life Pass. Ship interiors and decorating are retired. The four primary systems and reserved Garden share one composition modeled
after the whole reference image. Garden mechanics and further structures arrive
through later modular phases.

See [station architecture and phase gates](STATION_PLAN.md) for the inspected
source integration map, offline 3D constraints, persistence/economy safeguards,
and concrete Foundation scope. Each increment needs its own regression evidence
and applicable physical-phone acceptance before it is called accepted.
