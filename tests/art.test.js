import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, statSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { SKINS } from '../web/save.js';
import { DECOR } from '../web/decor.js';
import { ROOM_LAYOUTS } from '../web/room-layouts.js';
const root = fileURLToPath(new URL('../web/art/', import.meta.url));
const has = path => existsSync(`${root}${path}.webp`);
test('all referenced UI, ship, interior, shop and support art is shipped within mobile budget', () => {
  for (const path of ['ui/backgrounds/bg_home', 'ui/buttons/btn_primary_bg', 'ui/buttons/btn_secondary_bg',
    'ui/cards/card_ship_bg', 'ui/cards/card_item_bg', 'ui/buttons/toggle_on', 'ui/buttons/toggle_off',
    'ui/icons/icon_trophy', 'ui/icons/icon_infinity', 'ui/icons/icon_calendar_star', 'ui/icons/icon_ship',
    'ui/icons/icon_gear', 'ui/icons/icon_help', 'ui/icons/icon_sparkle', 'ui/icons/icon_bag', 'ui/icons/icon_info',
    'donate/lyra_yuki_wave', 'donate/donate_hero', 'donate/donate_button', 'donate/info_button']) assert.ok(has(path), path);
  for (const ship of SKINS) {
    assert.ok(has(`ui/icons/ship_${ship.shape}`));
    const room = ROOM_LAYOUTS[ship.shape]; assert.equal(room.ship, ship.shape);
    for (const file of ['wall_base', 'ceiling_base', 'floor_base', 'window_frame', 'window_view', 'lighting_overlay',
      ship.shape === 'scout' ? 'decal_stars_default' : 'decal_default', ...room.slots.map(slot => slot.default)])
      assert.ok(has(`interiors/${ship.shape}/${file}`), `${ship.shape}/${file}`);
  }
  for (const item of DECOR) assert.ok(has(`shop/${item.file}`), item.id);
  const bytes = (dir) => readdirSync(dir, { withFileTypes: true }).reduce((n, e) => n + (e.isDirectory() ? bytes(`${dir}/${e.name}`) : statSync(`${dir}/${e.name}`).size), 0);
  assert.ok(bytes(root) < 10 * 1024 * 1024, 'runtime art remains below 10 MiB');
  assert.equal(existsSync(`${root}atlases`), false, 'large source atlases are not bundled');
  const css = readFileSync(new URL('../web/room-layouts.css', import.meta.url), 'utf8');
  for (const match of css.matchAll(/url\("art\/([^"\)]+)"\)/g)) assert.ok(existsSync(`${root}${match[1]}`), match[1]);
});
