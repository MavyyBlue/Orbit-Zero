# Current state — 2026-09-26

- Repository: `MavyyBlue/Orbit-Zero`, branch `main`.
- Live HEAD inspected before this source revision: `bb4c3daff88308182b77a1aab67d193051286185`.
- GitHub Actions run #7 (`36278746288`) succeeded with source and validate jobs for that **previous** candidate.
- This art/UI source ZIP awaits owner upload; its imported Git SHA and exact-SHA CI are unknown. No APK from this revision has been built or played on a phone yet.
- Mavyy is final product authority. Yuki directs architecture, Akari normal implementation, Mio independent QA. This one-shot UI implementation is a candidate for their review, not their certification.

## Implemented in this source revision

Offline Android-first single-player gravity flight, shared authoritative preview/live physics, Voyage/Endless/Daily, three to five planets, route-placed stars and exit, near-miss scoring and instant retry remain intact. Lyra's art now backs the home, menus, hangar, settings, help, five layered ship interiors and stardust decor shop. Five ship and 11 decor items are cosmetic. Per-ship wall color and furniture slots persist in additive version-1 save fields, preserving existing save IDs and progress. A support page displays Lyra/Yuki art and credits Mavyy, Yuki and Lyra; its donation control is disabled and contains no URL/payment flow. Akari and Mio are absent from in-game copy as requested for this pass.

The high-resolution source pack and 30 atlases are not shipped. The app includes 121 optimized WebP images totaling about 5.1 MiB and a repeatable art-preparation script. See `ART_SOURCE.md`.

## Validation performed locally

- JavaScript syntax and 19 Node tests passed: full 12-sector UI journey, preview/live equivalence, 48 generated gravity routes, 30 Endless samples, save migration/sanitization, shop ownership/equip, and asset references/size.
- Five Python importer tests passed before packaging; archive manifest, clean baseline import and workflow preservation are verified at packaging.
- Lyra's original archives passed CRC checks; all 147 source PNGs decoded. Sample art was visually inspected. The technical WebP hero cutout and home background were viewed.
- Browser screenshots and Android build/lint are authored in the existing workflow but **have not run for this new candidate**. Local Chromium is unavailable.

## Limitations and next bounded task

Phone readability, scroll access, interior composition, 120-frame support animation memory, save upgrade installation, APK size and performance remain unverified. The decorative room can be viewed from the hangar; decor is purchased with earned stardust and affects only presentation. The donation button does not accept money. No iOS host, release signing or store-policy/payment decision exists.

Mavyy uploads the delivered archive as `orbit-zero-source.zip` at repository root. Inspect both bootstrap jobs, the exact imported SHA, browser screenshots and APK artifact. Then Yuki and Mavyy test home/hangar/room/shop/support screens and the unchanged core loop on a phone. Mio independently audits assets, save compatibility and CI; Akari receives any bounded correction. The payment destination is a separate later slice.
