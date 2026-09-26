export const SAVE_KEY = 'orbit-zero.save.v1';
export const freshSave = () => ({ version: 1, best: 0, runs: 0, gates: 0, near: 0, shards: 0, victories: 0, skin: 'ion', owned: ['ion'], daily: {}, settings: { sound: true, music: true, haptics: true, reduced: false, contrast: false } });
const bounded = v => Number.isSafeInteger(v) && v >= 0 ? Math.min(v, 1000000000) : 0;
export function parseSave(raw) {
  const s = freshSave();
  try {
    const v = JSON.parse(raw);
    if (!v || v.version !== 1) return s;
    for (const k of ['best', 'runs', 'gates', 'near', 'shards', 'victories']) s[k] = bounded(v[k]);
    s.owned = ['ion', ...['ember', 'violet'].filter(k => v.owned?.includes(k))];
    if (s.owned.includes(v.skin)) s.skin = v.skin;
    for (const k of Object.keys(s.settings)) if (typeof v.settings?.[k] === 'boolean') s.settings[k] = v.settings[k];
    if (v.daily && typeof v.daily === 'object') for (const [k, val] of Object.entries(v.daily).slice(-32)) if (/^\d{4}-\d{2}-\d{2}$/.test(k)) s.daily[k] = bounded(val);
  } catch { /* Corrupt or missing saves fall back to defaults. */ }
  return s;
}
export function loadSave(storage) { try { return { save: parseSave(storage.getItem(SAVE_KEY)), available: true }; } catch { return { save: freshSave(), available: false }; } }
export function writeSave(storage, save) { try { storage.setItem(SAVE_KEY, JSON.stringify(save)); return true; } catch { return false; } }
export const SKINS = [{ id: 'ion', name: 'Ion', color: '#8ff4e0', price: 0 }, { id: 'ember', name: 'Ember', color: '#ff987d', price: 35 }, { id: 'violet', name: 'Violet', color: '#c5a6ff', price: 70 }];
export function buySkin(save, id) {
  const skin = SKINS.find(s => s.id === id);
  if (!skin) return false;
  if (!save.owned.includes(id)) {
    if (save.shards < skin.price) return false;
    save.shards -= skin.price; save.owned.push(id);
  }
  save.skin = id; return true;
}
