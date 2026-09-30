# Retired ship interiors — historical reference

The owner retired this concept in favor of the interactive 3D orbital station.
The active Hangar has no Interior or Decor shop entry, and the room editor/styles
are not loaded by the application. The controls below describe the former system,
not a current feature. Legacy room documents, cosmetic ownership, model validation,
and source assets are retained for save compatibility; no refund, deletion, or
conversion into station upgrades is performed. See [STATION_PLAN.md](STATION_PLAN.md).

Interiors are cosmetic, offline and separate from flight and Workshop.
Open Hangar, then an owned ship's Interior. Each ship saves its own room.

## Decorate

Tap **Decorate**, select an item, then drag it. Green anchors and a footprint
show its mount; red feedback explains invalid positions. Release in a valid
position to save. Invalid release returns to the last valid position. Floor
furniture needs floor space; wall/ceiling items use their own anchors. Windows
and other artwork stay clear.

**Move** lets you tap an anchor instead of dragging. **Store** returns the selected
item to Owned inventory. **Undo** reverses up to 30 room edits in this visit;
purchases stay owned with no refund. **Done** leaves Decorate mode.
Keyboard selection and arrows also move items. Android Back/Escape first closes
a preview or customization panel, then returns to Hangar.

Perspective furniture stays upright: no rotation/flipping. Individual decal
motifs are the artwork-supported variants.

## Inventory and purchases

The bottom **Furniture** panel has separate **Owned** and **Shop** tabs.
Owned includes default furniture and purchased licenses, even when stored.
Different items of a category can coexist when they fit; each furniture item
can appear once per ship. Decals can repeat as individual motifs, up to the
room's total 48-placement limit.

A license works in any owned ship. Storing/moving/re-placing is free.
Shop prices are unchanged. Select an item to preview it in-room, adjust its
position, then explicitly confirm **Buy · price**. Cancel spends nothing.
Insufficient funds disable confirmation but allow inspection. Purchase and
placement save together; failed persistence changes neither room nor balance.
Make room by storing/moving items if no placement fits. Selecting owned furniture
already in the room selects it for rearrangement.

## Surfaces, lighting and interactions

**Surfaces** offers independent wall, ceiling and floor colors, with Original,
Smooth and Panels finishes. These finishes are included and free.
**Lighting** controls free color and brightness from 0–100%. Adjustments preview
while moving and save when the control changes.

Outside Decorate mode, tap lamps to toggle, consoles to read normal flight
records, and windows to choose Home orbit, Violet nebula, Ringed world or Deep
space. Views use shipped artwork and local CSS without downloads.

## Older saves and acceptance

The progress key is retained. Nested room-version 2 stores positions,
individual decal IDs/motifs, surfaces, lighting, lamp state and view. Legacy wall
tint survives; equipped items migrate to safe positions where they fit.
Items that cannot fit stay owned in storage. Compatibility slots derive from
placements and no longer determine placement.

Update-install without uninstalling to preserve progress and Workshop levels.
This candidate needs its own green CI/browser/Android run and Mavyy phone
acceptance. Local Node contracts do not certify rendered mobile touch UX.
