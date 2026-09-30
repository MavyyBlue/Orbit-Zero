import { DECOR } from './decor.js';
import { DEFAULT_AIM_DEAD_ZONE, normalizeAimDeadZone } from './aim-lock.js';
export const SAVE_KEY = 'orbit-zero.save.v1';
export const freshSave = () => ({ version: 1, best: 0, runs: 0, gates: 0, near: 0, shards: 0, victories: 0, skin: 'ion', owned: ['ion'], decorOwned: [], rooms: {}, daily: {}, settings: { sound: true, music: true, haptics: true, reduced: false, contrast: false, aimDeadZone: DEFAULT_AIM_DEAD_ZONE } });
const bounded = v => Number.isSafeInteger(v) && v >= 0 ? Math.min(v, 1000000000) : 0;
export function parseSave(raw) {
  const s = freshSave();
  try {
    const v = JSON.parse(raw);
    if (!v || v.version !== 1) return s;
    for (const k of ['best', 'runs', 'gates', 'near', 'shards', 'victories']) s[k] = bounded(v[k]);
    s.owned = ['ion', ...SKINS.map(ship => ship.id).filter(k => k !== 'ion' && Array.isArray(v.owned) && v.owned.includes(k))];
    if (s.owned.includes(v.skin)) s.skin = v.skin;
    s.decorOwned = DECOR.filter(item => Array.isArray(v.decorOwned) && v.decorOwned.includes(item.id)).map(item => item.id);
    for (const ship of SKINS) {
      const room = v.rooms?.[ship.id];
      if (!room || typeof room !== 'object') continue;
      const color = /^#[0-9a-fA-F]{6}$/.test(room.color) ? room.color : ship.color;
      const slots = {};
      for (const slot of ['seat', 'console', 'plant', 'lamp', 'decal']) {
        const item = DECOR.find(d => d.id === room.slots?.[slot] && d.slot === slot);
        if (item && s.decorOwned.includes(item.id)) slots[slot] = item.id;
      }
      s.rooms[ship.id] = { color, slots };
    }
    for (const k of Object.keys(s.settings)) if (typeof s.settings[k] === 'boolean' && typeof v.settings?.[k] === 'boolean') s.settings[k] = v.settings[k];
    s.settings.aimDeadZone = normalizeAimDeadZone(v.settings?.aimDeadZone);
    if (v.daily && typeof v.daily === 'object') for (const [k, val] of Object.entries(v.daily).slice(-32)) if (/^\d{4}-\d{2}-\d{2}$/.test(k)) s.daily[k] = bounded(val);
  } catch { /* Corrupt or missing saves fall back to defaults. */ }
  return s;
}
export function loadSave(storage) { try { return { save: parseSave(storage.getItem(SAVE_KEY)), available: true }; } catch { return { save: freshSave(), available: false }; } }
export function writeSave(storage, save) { try { storage.setItem(SAVE_KEY, JSON.stringify(save)); return true; } catch { return false; } }
// Existing IDs and prices stay stable so previous unlocks and saves survive.
export const SKINS = [
  { id: 'ion', name: 'Scout', color: '#8ff4e0', shape: 'scout', price: 0 },
  { id: 'ember', name: 'Arrow', color: '#ff987d', shape: 'arrow', price: 35 },
  { id: 'violet', name: 'Manta', color: '#c5a6ff', shape: 'manta', price: 70 },
  { id: 'flare', name: 'Needle', color: '#ffe0a0', shape: 'needle', price: 120 },
  { id: 'orbit', name: 'Starling', color: '#93bbff', shape: 'starling', price: 180 }
];
export const SHIP_OUTLINES = {
  scout: [[0, -12], [4, -4], [10, 4], [8, 7], [3, 5], [0, 9], [-3, 5], [-8, 7], [-10, 4], [-4, -4]],
  arrow: [[0, -14], [4, -5], [7, 9], [0, 5], [-7, 9], [-4, -5]],
  manta: [[0, -11], [4, -4], [12, -1], [13, 6], [4, 4], [0, 9], [-4, 4], [-13, 6], [-12, -1], [-4, -4]],
  needle: [[0, -15], [3, -6], [4, 8], [0, 5], [-4, 8], [-3, -6]],
  starling: [[0, -12], [3, -7], [9, -9], [7, -1], [11, 7], [3, 4], [0, 9], [-3, 4], [-11, 7], [-7, -1], [-9, -9], [-3, -7]]
};
export function buySkin(save, id) {
  const skin = SKINS.find(s => s.id === id);
  if (!skin) return false;
  if (!save.owned.includes(id)) {
    if (save.shards < skin.price) return false;
    save.shards -= skin.price; save.owned.push(id);
  }
  save.skin = id; return true;
}
export function roomFor(save, shipId) {
  const ship = SKINS.find(s => s.id === shipId) || SKINS[0];
  save.rooms ||= {};
  return save.rooms[ship.id] ||= { color: ship.color, slots: {} };
}
export function setRoomColor(save, shipId, color) {
  if (!save.owned.includes(shipId) || !/^#[0-9a-fA-F]{6}$/.test(color)) return false;
  roomFor(save, shipId).color = color; return true;
}
export function equipDecor(save, shipId, itemId) {
  const item = DECOR.find(d => d.id === itemId);
  if (!item || !save.owned.includes(shipId) || !save.decorOwned.includes(itemId)) return false;
  roomFor(save, shipId).slots[item.slot] = itemId; return true;
}
export function buyDecor(save, shipId, itemId) {
  const item = DECOR.find(d => d.id === itemId);
  if (!item || !save.owned.includes(shipId)) return false;
  if (!save.decorOwned.includes(itemId)) {
    if (save.shards < item.price) return false;
    save.shards -= item.price; save.decorOwned.push(itemId);
  }
  return equipDecor(save, shipId, itemId);
}
