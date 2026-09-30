# Lyra art source and runtime preparation

Mavyy authorized Lyra's Orbit Zero UI collection for this candidate. The archived originals are outside the repository; the Android app ships only optimized art derived from them. No other project's gameplay or UI implementation was copied.

| Archive | SHA-256 | Contents |
| --- | --- | --- |
| `orbit-zero-assets-full.zip` | `55b8aa37fe2f604e1b2ce4ba561dc4e263e376b551582280d7904edb6b9a3d4c` | 51 UI PNGs, 55 interior layers, 11 shop PNGs, 30 source atlases, specs |
| `orbit-zero-donate-assets.zip` | `a5053a558db4a5568cb255093562aff12bff7c3aeb4e36343eaf4aab9f278010` | Support buttons, hero art, mockup, waving animation, spec |

The six original full-pack parts were assembled in `aa` through `af` order; both ZIPs passed CRC inspection. `web/room-layouts.js` transcribes all five slot definitions from the supplied interior specs. The shipped art under `web/art/` contains 117 optimized primary images and four support images, about 5.1 MiB total. All 30 atlases and the high-resolution duplicates are excluded. Large originals could consume roughly 1.36 GiB decoded if every atlas were loaded together; the runtime loads images for active menus. Interior/shop assets are now archived and are not requested by the active Hangar.

To regenerate the derived art from the two original archives:

```sh
python3 -m pip install Pillow
python3 scripts/prepare_art.py /path/to/orbit-zero-assets-full.zip /path/to/orbit-zero-donate-assets.zip
npm run validate
```

The script bounds image dimensions and encodes WebP. The neon-green donation hero and waving frames receive a technical color-key conversion. Reduced-motion mode shows the still hero. Source PSD/vector masters were not supplied, and no full-screen donate mockup is displayed as a flattened UI; text and buttons are native HTML so they can scale and remain accessible.

The art-based ship portraits are distinct from the compact silhouette used during flight. The hangar displays the illustrated portrait; the compact flight shape remains unchanged. Ship physics are identical. A phone review should judge icon consistency, small-screen readability, Hangar readability and animation memory. Ship interiors are retired in favor of the 3D station.

## 2026-09-30 vector presentation assets

`web/art/arcade/icons.svg` is an original 21-symbol vector icon set.
`web/art/arcade/space.svg` is an original lightweight orbital starfield.
These are authored SVG geometry, with no external references or embedded scripts.
Menus use these consistent scalable icons in place of mixed raster controls;
Lyra's original WebP files remain in the package unchanged. Portraits, room
furnishings and the transparent support still remain visible artwork.
The white-backed support animation is retained but not displayed.
