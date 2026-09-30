# Current state — 2026-09-27

- Repository: `MavyyBlue/Orbit-Zero`, branch `main`.
- Live HEAD inspected before this correction: `2e5481957b8b72e57097db900f7fe9e41d0a9811` on `main`; it imported the previous portrait UI package. Its ZIP import checksum is `7a5d103febf795b6ab7ab2c14c6ff915a8451e7c0e1f2dcc2c8232beb0978c55`.
- This corrected UI source ZIP awaits owner upload. Its imported Git SHA and exact-SHA CI are unknown. No APK from this revision has been built or played on a phone yet.
- Mavyy is final product authority. Yuki directs architecture, Akari normal implementation, Mio independent QA. This one-shot UI implementation is a candidate for their review, not their certification.

## Implemented in this source revision

Offline Android-first single-player gravity flight, shared authoritative preview/live physics, Voyage/Endless/Daily, three to five planets, route-placed stars and exit, near-miss scoring and instant retry remain intact. Lyra's art now backs the home, menus, hangar, settings, help, five layered ship interiors and stardust decor shop. Five ship and 11 decor items are cosmetic. Per-ship wall color and furniture slots persist in additive version-1 save fields, preserving existing save IDs and progress. A support page displays Lyra/Yuki art and credits Mavyy, Yuki and Lyra; its donation control is disabled and contains no URL/payment flow. Akari and Mio are absent from in-game copy as requested for this pass.

The high-resolution source pack and 30 atlases are not shipped. The app includes 121 optimized WebP images totaling about 5.1 MiB and a repeatable art-preparation script. See `ART_SOURCE.md`. Three zero-byte images in the earlier candidate (`icon_sparkle`, `ship_arrow`, `icon_lock`) were restored in the current live HEAD. This correction removes decorative card/button artwork with large transparent margins that appeared as duplicate, inset controls beneath real text in Mavyy's five phone captures. Hangar ships gain portrait tiles, challenge copy/progress is laid out without overlap, settings toggles are CSS controls, and the support page uses the transparent still image instead of the white-backed animated WebP. The hangar shows actual saved progress and prices rather than the illustrative values in the mockup.

## Validation performed locally

- JavaScript syntax and 20 Node tests passed: full 12-sector UI journey, preview/live equivalence, 48 generated gravity routes, 30 Endless samples, save migration/sanitization, shop ownership/equip, every WebP's header/length, and stylesheet asset references.
- Five Python importer tests passed before packaging; archive manifest, clean baseline import and workflow preservation are verified at packaging.
- All 121 shipped WebP files decode locally. Mavyy's phone captures of the previous APK were compared with the five supplied mockups; they exposed duplicate painted control surfaces, cramped challenge text, small switches, and a white rectangle behind the waving animation.
- Browser screenshots and Android build/lint are authored in the existing workflow but **have not run for this new candidate**. Local Chromium is unavailable.

## Limitations and next bounded task

Phone readability of this correction, scroll access, interior composition, save upgrade installation, APK size and performance remain unverified. Lyra's shipped room layers differ in composition from the supplied Scout mockup, so its full-screen runtime composite is an approximation pending phone screenshot review. The animated donation art remains packaged but is not displayed; the static transparent cutout avoids the white rectangle. The decorative room can be viewed from the hangar; decor is purchased with earned stardust and affects only presentation. The donation tier buttons do not accept money. No iOS host, release signing or store-policy/payment decision exists.

Mavyy replaces `orbit-zero-source.zip` at repository root with the delivered archive. Inspect both bootstrap jobs, the exact imported SHA, browser screenshots and APK artifact. Then Yuki and Mavyy test home/hangar/room/shop/support screens and the unchanged core loop on a phone. Mio independently audits assets, save compatibility and CI; Akari receives any bounded correction. The payment destination is a separate later slice.
