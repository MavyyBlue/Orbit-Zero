# Workshop — local level creator

Workshop replaces Daily Orbit on the dock. Voyage and Endless remain unchanged.

## Build and fly

The starter draft uses a known playable three-planet orbit. Tap **Move**, then
select/drag an object. **Planet +** and **Star +** place new objects on the field.
**Launch** and **Exit** reposition those points. Select a planet to change its
style, radius and gravity; select the exit to change its radius. Remove selected
planets/stars from configuration. Undo remembers up to 30 edits in this session.

The fixed **Level configuration** panel expands/collapses and scrolls internally.
Arena width (300–1200) and length (400–2400) automatically zoom to fit the viewport.
Objects keep proportional positions; radii stay in world units. Global gravity
(0–3×) multiplies individual planet gravity (0–3×). Launch speed (.25–2×) changes
initial velocity. Flight time limit is 5–60 seconds. Instant respawn returns to
aiming after a failure, with a short collision beat; reaching the exit still
shows a completion result. Button aiming supports a full 360-degree launch.
The visible first 2.1 seconds use exactly the live physics.

Up to 12 planets and 24 stars are allowed. Move launch/exit away from planets
before Test fly; overlapping start/exit blocks play with a message. The editor
does not prove arbitrary layouts solvable. Stars are optional; the exit clears
a custom level. Custom play changes no normal records, stardust or achievements.

## Save and library

Name your level and tap **Save**. It saves the complete geometry and configuration
as one local level. Editing a saved level then Save updates the same entry.
The top bag button opens **Level library**, where each level can be edited,
played or deleted after confirmation. Save current draft as a new level makes
an independent copy. Up to 30 named entries are stored. Opening a saved level
while a draft is unsaved asks before replacing it. New similarly warns first.

Draft changes autosave locally separately from named entries. They survive a
restart when storage is available. The header reports session-only storage and
Save reports failure if persistence is unavailable. There is no cloud sync,
online workshop, file exchange or account. Clearing app data or uninstalling
removes this library. Install updates without uninstalling to preserve it.
