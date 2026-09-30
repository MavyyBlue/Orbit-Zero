# Current state — 2026-09-30

Repository: `MavyyBlue/Orbit-Zero`, branch `main`.
Live baseline inspected: `ffb9abd679e71ccadbc67e38666a430b65db13b2`.
GitHub bootstrap run #11 succeeded: https://github.com/MavyyBlue/Orbit-Zero/actions/runs/36665061316.
This Workshop revision is a source ZIP candidate awaiting owner upload;
its final imported SHA, Android build/lint and exact-SHA CI are pending.
No certification by Mio is claimed.

## What exists

Offline Android-first gravity flight, shared preview/live simulation, Voyage,
Endless modes and local Workshop, 3–5 planets, route stars, near-misses, quick retry,
five cosmetic ships, local progress, five layered interiors and an 11-item
decor shop. This revision replaces Daily Orbit with a custom editor/library and custom play.
Voyage/Endless generation, normal scoring, prices, save IDs and signing stay stable.
Shared physics now accepts optional custom start, arena bounds and duration;
production defaults are unchanged. Legacy daily history remains in old saves.

The menus now use a navy starfield, consistent mint controls, violet unlocks,
gold rewards, original SVG icons, labeled dock navigation, framed ship portraits,
clear ownership/selection states, readable progress cards, and uniform settings.
Panel headings receive focus; changing a setting preserves scroll and focus.
High contrast and reduced motion remain available. Gifted ship, room and support
illustrations remain intact. All 121 WebP assets are retained; two small vector
assets supply the new backdrop and icon set. No flattened mockup is used as UI.

Support tiers remain disabled and explicitly say coming soon. There is no
payment URL, checkout or SDK. In-game credits remain Mavyy, Yuki and Lyra.

## Workshop candidate

The fixed collapsible configuration widget sets arena width/length, global gravity,
launch speed, flight limit and instant respawn. Touch tools move/add planets and
stars, launch and exit; selected planets have individual gravity, radius and style,
and the exit radius is adjustable. Camera zoom fits the arena dynamically. Named
Save and a 30-slot local library retain complete level geometry and settings.
Autosaved draft, undo, update/copy, confirmed delete and draft replacement exist.
The version-1 Workshop key is separate from normal progress; custom play awards
no stardust, achievements or normal records. Preview/live use the same advance.

## Validation

JavaScript syntax and the existing simulation, route, save, shop, asset and UI
flow tests pass locally, as do five Python importer tests. Real Chromium browser
smoke covers 320×568, 360×640 and 412×915: home touch controls, settings persistence,
hangar, tinting, shop, disabled support tiers, aiming, pause and retry. Workshop
checks cover touch placement/dragging, config persistence after reload, library
replacement/delete confirmation, crash respawn, custom completion/failure and
unchanged normal progress. Visible
images decode, art requests succeed and no page errors occur. Screenshots were
reviewed for home, hangar, settings, support, interior, shop and results.
Packaging validates archive integrity, manifest hashes, clean baseline import
and preservation of the existing workflow. New Android build/lint, physical
phone play, screen-reader navigation and upgrade-install testing remain pending.

## Limitations and next slice

Handmade levels are not automatically certified solvable. Bounds are 300–1200
width, 400–2400 length, 12 planets and 24 stars; extreme zoom and mobile storage
quota need phone review. No online sharing or import/export is implemented.
The layered room artwork still differs from the original Scout mockup; this is
its actual supplied runtime composition. Original unused images are retained for
safe importer compatibility. There is no iOS host or store release configuration.

Mavyy uploads the replacement `orbit-zero-source.zip` at repository root. The
existing bootstrap workflow imports it and builds the APK. Yuki's next bounded
task is to review that exact imported SHA and APK on a phone: Workshop touch placement/dragging, dynamic fit, scrolling configuration, multiple
named levels, force-stop/reload, custom respawn, old progress after update and an
unchanged normal flight/retry session. Record screenshots and acceptance before further
UI or gameplay work. Mio can independently audit this evidence; Akari receives
any specific correction. Donation setup remains a separate future decision.
