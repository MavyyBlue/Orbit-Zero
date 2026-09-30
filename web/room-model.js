import { DECOR } from './decor.js';
import { ROOM_LAYOUTS } from './room-layouts.js';

// Cosmetic coordinates only. Flight never reads this module or a room document.
export const ROOM_DESIGNS = {
  scout: { name: 'The quiet cabin', note: 'Mint panels · a round lookout · room to unwind', window: [.50, .31, .36, .27], wall: '#79b8ab', floor: '#304962', ceiling: '#d0dbcb', defaults: [[.24,.86],[.71,.51],[.80,.89],[.23,.15]] },
  arrow: { name: 'The racing lounge', note: 'Coral ribs · a wide cockpit · an open central aisle', window: [.50,.28,.50,.21], wall: '#b97570', floor: '#4c4052', ceiling: '#e1c9b2', defaults: [[.25,.87],[.73,.62],[.79,.89],[.12,.15]] },
  manta: { name: 'The floating library', note: 'Lavender alcoves · a panoramic view · a garden canopy', window: [.50,.29,.56,.18], wall: '#9d8cba', floor: '#4c456d', ceiling: '#d4c7de', defaults: [[.29,.90],[.77,.88],[.87,.16],[.12,.15]] },
  needle: { name: 'The observatory', note: 'Brass trim · a tall lookout · twin work bays', window: [.50,.30,.13,.36], wall: '#758d9c', floor: '#333d51', ceiling: '#d8ccb3', defaults: [[.24,.91],[.78,.75],[.77,.94],[.23,.66]] },
  starling: { name: 'The star salon', note: 'Blue arches · a star portal · a generous chart deck', window: [.50,.30,.35,.29], wall: '#769fc5', floor: '#303b65', ceiling: '#c6d3e8', defaults: [[.24,.88],[.74,.73],[.80,.94],[.19,.15]] }
};
export const VIEWS = ['home', 'nebula', 'rings', 'deep'];
export const FINISHES = ['original', 'smooth', 'panels'];
export const validColor = value => typeof value === 'string' && /^#[0-9a-fA-F]{6}$/.test(value);
const bound = (v, lo, hi, fallback) => typeof v === 'number' && Number.isFinite(v) ? Math.max(lo, Math.min(hi, v)) : fallback;
export function roomCatalog(ship) {
  const slots = ROOM_LAYOUTS[ship.shape].slots;
  const mount = kind => kind === 'lamp' ? (ship.shape === 'needle' ? 'floor' : 'ceiling') : kind === 'plant' && ship.shape === 'manta' ? 'ceiling' : kind === 'console' && ['scout','arrow'].includes(ship.shape) ? 'wall' : 'floor';
  const dimensions = { seat: [.26,.22,.12], console: [.26,.20,.10], plant: [.16,.19,.07], lamp: [.16,.21,.07], decal: [.08,.07,.01] };
  const sized = item => {
    const [w,h,depth] = item.slot === 'seat' && ship.shape === 'manta' && item.builtin ? [.32,.20,.12] : dimensions[item.slot];
    return { ...item, w: item.id === 'hammock' ? .32 : item.mount === 'ceiling' ? .14 : w, h: item.id === 'hammock' ? .18 : item.mount === 'ceiling' ? .18 : h, depth };
  };
  return [
    ...slots.map(slot => { const kind = slot.accepts[0]; return sized({ id: `base-${kind}`, name: `${ship.name} ${kind}`, slot: kind, mount: mount(kind), file: `interiors/${ship.shape}/${slot.default}`, builtin: true, price: 0 }); }),
    sized({ id: 'base-stars', name: 'Cabin stars', slot: 'decal', mount: 'wall', builtin: true, price: 0 }),
    ...DECOR.map(item => sized({ ...item, file: `shop/${item.file}`, mount: item.slot === 'decal' || item.id === 'brass_dials' ? 'wall' : item.slot === 'lamp' ? 'ceiling' : 'floor' }))
  ];
}
export function itemFor(ship, id) { return roomCatalog(ship).find(item => item.id === id); }
export function availableItem(ship, owned, id) { const item = itemFor(ship, id); return item && (item.builtin || owned.includes(id)) ? item : null; }
const overlaps = (a,b,gap = .012) => a.left < b.right + gap && a.right > b.left - gap && a.top < b.bottom + gap && a.bottom > b.top - gap;
export function spriteBox(item, p) { return { left: p.x-item.w/2, right: p.x+item.w/2, top: p.y-item.h, bottom: p.y }; }
export function footprint(item, p) { return { left: p.x-item.w*.43, right: p.x+item.w*.43, top: p.y-item.depth, bottom: p.y }; }
export function placementFeedback(ship, room, itemId, point, ignoreId) {
  const item = itemFor(ship, itemId);
  if (!item || !Number.isFinite(point?.x) || !Number.isFinite(point?.y)) return 'Choose a position in the room.';
  const box = spriteBox(item, point);
  if (box.left < .035 || box.right > .965 || box.top < .035 || box.bottom > .965) return 'Keep the whole item inside the room.';
  if (item.mount === 'floor' && (point.y < .63 || point.y > .95)) return 'This item needs a floor footprint.';
  if (item.mount === 'ceiling' && (point.y < .25 || point.y > .39)) return 'Choose a ceiling anchor.';
  if (item.mount === 'wall' && (point.y < .22 || point.y > .66)) return 'Choose a wall anchor.';
  const [x,y,w,h] = ROOM_DESIGNS[ship.shape].window;
  const window = { left:x-w/2, right:x+w/2, top:y-h/2, bottom:y+h/2 };
  if (overlaps(box, window, .015)) return 'Leave the window clear.';
  for (const p of room.placements) {
    if (p.id === ignoreId) continue;
    const other = itemFor(ship,p.item); if (!other) continue;
    if (item.mount === 'floor' && other.mount === 'floor' && overlaps(footprint(item,point), footprint(other,p))) return 'That footprint is occupied.';
    if (overlaps(box, spriteBox(other,p))) return 'Give each furnishing and decal a little space.';
  }
  return '';
}
export function anchorsFor(item) {
  const points = [];
  const ys = item.mount === 'floor' ? [.65,.70,.75,.80,.85,.90,.95] : item.mount === 'ceiling' ? [.26,.32,.38] : [.24,.30,.36,.42,.48,.54,.60,.66];
  for (const y of ys) { points.push({x:.12,y},{x:.88,y}); for (let x=.15;x<=.851;x+=.05) points.push({x:Number(x.toFixed(2)),y}); }
  return points;
}
export function findPosition(ship, room, itemId, preferred, ignoreId) {
  const item = itemFor(ship,itemId); if (!item) return null;
  if (preferred && !placementFeedback(ship,room,itemId,preferred,ignoreId)) return preferred;
  return anchorsFor(item).sort((a,b) => preferred ? Math.hypot(a.x-preferred.x,a.y-preferred.y)-Math.hypot(b.x-preferred.x,b.y-preferred.y) : b.y-a.y).find(p => !placementFeedback(ship,room,itemId,p,ignoreId)) || null;
}
export function defaultRoom(ship) {
  const design = ROOM_DESIGNS[ship.shape];
  const room = { roomVersion:2, color:ship.color, slots:{}, finishes: { wall:{color:ship.color,style:'original'}, ceiling:{color:design.ceiling,style:'original'}, floor:{color:design.floor,style:'original'} }, lighting:{color:'#ffe4b0',brightness:75}, view:'home', placements:[] };
  for (const [i,kind] of ['seat','console','plant','lamp'].entries()) {
    const item = `base-${kind}`, [x,y] = design.defaults[i];
    const meta = itemFor(ship,item); const preferred = {x,y:meta.mount === 'ceiling' ? y+meta.h : y};
    const p = findPosition(ship,room,item,preferred); if (p) room.placements.push({id:item,item,...p,variant:0,on:true});
  }
  for (const [i,x] of [.14,.86].entries()) {
    const p = findPosition(ship,room,'base-stars',{x,y:.48}); if(p)room.placements.push({id:`star-${i}`,item:'base-stars',...p,variant:i,on:true});
  }
  return room;
}
export function syncLegacySlots(ship, room) {
  room.color = room.finishes.wall.color; room.slots = {};
  for (const p of room.placements) { const item = itemFor(ship,p.item); if(item && !item.builtin)room.slots[item.slot]=item.id; }
  return room;
}
export function normalizeRoom(ship, raw, owned) {
  const room = defaultRoom(ship);
  if (!raw || typeof raw !== 'object') return room;
  room.color = validColor(raw.color) ? raw.color : ship.color; room.finishes.wall.color=room.color;
  if (raw.roomVersion !== 2) {
    for (const [slot,id] of Object.entries(raw.slots || {})) {
      const item = itemFor(ship,id); if(!item || item.slot !== slot || !owned.includes(id))continue;
      room.placements=room.placements.filter(p=>itemFor(ship,p.item).slot!==slot);
      const p=findPosition(ship,room,id);if(p)room.placements.push({id:`legacy-${id}`,item:id,...p,variant:0,on:true});
    }
    return syncLegacySlots(ship,room);
  }
  for(const part of ['wall','ceiling','floor']){
    const finish=raw.finishes?.[part];
    if(validColor(finish?.color))room.finishes[part].color=finish.color;
    if(FINISHES.includes(finish?.style))room.finishes[part].style=finish.style;
  }
  room.lighting={color: validColor(raw.lighting?.color)?raw.lighting.color:'#ffe4b0',brightness:Math.round(bound(raw.lighting?.brightness,0,100,75))};
  room.view=VIEWS.includes(raw.view)?raw.view:'home';room.placements=[];
  const ids=new Set(),furniture=new Set();
  for(const rawP of (Array.isArray(raw.placements)?raw.placements:[]).slice(0,48)){
    const item=availableItem(ship,owned,rawP?.item);if(!item || ids.has(rawP.id) || (item.slot!=='decal'&&furniture.has(item.id)))continue;
    const id=typeof rawP.id==='string'&&/^[a-zA-Z0-9_-]{1,60}$/.test(rawP.id)?rawP.id:`restored-${room.placements.length}`;
    const point=findPosition(ship,room,item.id,{x:bound(rawP.x,.04,.96,.5),y:bound(rawP.y,.04,.96,.8)});
    // Invalid or crowded placements become stored inventory; ownership never disappears.
    if(!point)continue;
    room.placements.push({id,item:item.id,...point,variant:Math.round(bound(rawP.variant,0,11,0)),on:rawP.on!==false});ids.add(id);furniture.add(item.id);
  }
  return syncLegacySlots(ship,room);
}
export function placeItem(ship, room, owned, itemId, point, id, variant=0) {
  const item=availableItem(ship,owned,itemId);if(!item || room.placements.length>=48)return false;
  const existing=room.placements.find(p=>p.id===id);
  if(existing && existing.item!==itemId)return false;
  if(item.slot!=='decal'&&room.placements.some(p=>p.item===itemId&&p.id!==id))return false;
  if(placementFeedback(ship,room,itemId,point,id))return false;
  if(existing)Object.assign(existing,point);else room.placements.push({id,item:itemId,...point,variant:Math.max(0,Math.min(11,Math.round(variant))),on:true});
  syncLegacySlots(ship,room);return true;
}
