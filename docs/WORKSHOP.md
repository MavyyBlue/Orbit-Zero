# Workshop — local level creator

Workshop replaces Daily Orbit on the dock. Voyage and Endless now use the five mechanical planet types.

## Build and fly

The starter draft uses a known playable three-planet orbit. Tap **Move**, then
select/drag an object. **Planets +** opens a picker with five types and short summaries. Choose a type,
then tap the field; placement returns to Move. **Star +** adds stars.
**Launch** and **Exit** reposition those points. Tap a planet to open its own collapsible panel; tap that same planet again to
close it. Tune its mechanic, radius, gravity and relevant values (reach, curve,
orbit strength/duration/release, core tightness or repulsion); select the exit to change its radius. Remove selected
planets from their panel, or selected stars from level configuration. Undo remembers up to 30 edits in this session.

The fixed **Level configuration** panel expands/collapses and scrolls internally.
Arena width (300–1200) and length (400–2400) automatically zoom to fit the viewport.
Objects keep proportional positions; radii stay in world units. Global gravity
(0–3×) multiplies individual planet gravity (0–3×). Launch speed (.25–2×) changes
initial velocity. Flight time limit is 5–60 seconds. Instant respawn returns to
aiming after a failure, with a short collision beat; reaching the exit still
shows a completion result. Button aiming supports a full 360-degree launch.
The visible first 2.1 seconds use exactly the live physics. Settings includes an Aim dead zone (0–12 screen pixels, default 2) to ignore
minor finger drift during drag aiming. Movement beyond that distance immediately
adjusts direction and power; release launches. Zero turns the filter off.
Sensitivity stays consistent across arena zoom and launch-speed settings.
This setting does not affect dragging objects in the editor.

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

## Planet values and older levels

See `PLANETS.md` for the mechanics and learning curve. The selected planet panel
shows only controls relevant to its type. Choosing another mechanic resets those
specific controls to defaults; changing gravity/radius leaves them intact. All
values travel with the saved level. A zero gravity multiplier disables forces
and capture, but the planet remains a solid obstacle.

Older saved custom layouts retain their names, geometry and flight settings.
Planets without a mechanical type migrate to Slingshot. Its stronger curved pull
can change an old custom level's solution, so retest or tune those layouts.
Named levels are still distinct from the autosaved draft and normal progress.
