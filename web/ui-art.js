import { ROOM_LAYOUTS } from './room-layouts.js';
import { DECOR } from './decor.js';

export const art = path => `art/${path}.webp`;
export const icon = (name, label = '') => `<svg class="ui-icon" viewBox="0 0 24 24" ${label ? `role="img" aria-label="${label}"` : 'aria-hidden="true"'}><use href="art/arcade/icons.svg#${name.replace('icon_', '')}"/></svg>`;
const roomArt = (ship, name) => art(`interiors/${ship.shape}/${name}`);

export function interiorMarkup(ship, room) {
  const layout = ROOM_LAYOUTS[ship.shape];
  const image = (name, cls) => `<img class="${cls}" src="${roomArt(ship, name)}" alt="">`;
  const furnishings = layout.slots.map(slot => {
    const kind = slot.accepts[0], item = DECOR.find(d => d.id === room.slots[kind]);
    const src = item ? art(`shop/${item.file}`) : roomArt(ship, slot.default);
    const label = item ? item.name : `Default ${kind}`;
    return `<button class="room-furn ${kind}" id="room-${kind}" aria-label="${label}. Browse ${kind} decor"><img src="${src}" alt=""></button>`;
  }).join('');
  const decal = DECOR.find(d => d.id === room.slots.decal);
  const decalSrc = decal ? art(`shop/${decal.file}`) : roomArt(ship, ship.shape === 'scout' ? 'decal_stars_default' : 'decal_default');
  const tinted = (name, cls) => `<div class="room-tint ${cls}">${image(name, 'room-base')}<div class="room-color"></div></div>`;
  return `<div class="interior-stage ship-${ship.shape}">
    ${tinted('wall_base', 'wall')}
    ${tinted('ceiling_base', 'ceiling')}
    ${image('floor_base', 'room-floor')}
    <div class="room-window">${image('window_view', 'room-view')}${image('window_frame', 'room-frame')}</div>
    <img class="room-decals" src="${decalSrc}" alt="">
    ${furnishings}
    ${image('lighting_overlay', 'room-lighting')}
  </div>`;
}
