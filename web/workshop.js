// Versioned, local-only custom levels. Geometry is normalized so resizing is reversible.
import { PLANETS, planetKind, planetConfig } from './planet-rules.js';
import { encounter, W, H, START } from './simulation.js';
export const WORKSHOP_KEY = 'orbit-zero.workshop.v1';
export const MAX_LEVELS = 30;
export const LIMITS = Object.freeze({ width: [300, 1200], height: [400, 2400], gravity: [0, 3], speed: [.25, 2], duration: [5, 60], radius: [16, 70] });
export const PLANET_TYPES = ['ember', 'ice', 'jade', 'violet', 'sand'];
const clamp = (v, lo, hi, fallback) => typeof v === 'number' && Number.isFinite(v) ? Math.max(lo, Math.min(hi, v)) : fallback;
const number = (v, key, fallback) => clamp(v, ...LIMITS[key], fallback);
const point = (p, fallback) => ({ x: clamp(p?.x, .04, .96, fallback.x), y: clamp(p?.y, .04, .96, fallback.y) });
export const cloneLevel = value => JSON.parse(JSON.stringify(value));
export function sanitizeLevel(raw) {
  if (!raw || raw.version !== 1 || !Array.isArray(raw.planets) || !Array.isArray(raw.stars)) return null;
  const planets = raw.planets.slice(0, 12).map((p, i) => ({ ...point(p, { x: .5, y: .3 + i * .03 }), radius: number(p?.radius, 'radius', 24), gravity: number(p?.gravity, 'gravity', 1), type: PLANET_TYPES.includes(p?.type) ? p.type : PLANETS[planetKind(p)].color, kind: planetKind(p), config: planetConfig(planetKind(p), p?.config) }));
  return { version: 1, id: typeof raw.id === 'string' && /^[a-zA-Z0-9_-]{1,64}$/.test(raw.id) ? raw.id : '', name: typeof raw.name === 'string' ? raw.name.replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 40) || 'Untitled orbit' : 'Untitled orbit',
    width: Math.round(number(raw.width, 'width', W)), height: Math.round(number(raw.height, 'height', H)),
    gravity: number(raw.gravity, 'gravity', 1), speed: number(raw.speed, 'speed', 1), duration: number(raw.duration, 'duration', 20), instantRespawn: raw.instantRespawn === true,
    start: point(raw.start, { x: .5, y: .8 }), exit: { ...point(raw.exit, { x: .5, y: .15 }), radius: clamp(raw.exit?.radius, 20, 60, 27) },
    planets, stars: raw.stars.slice(0, 24).map(p => point(p, { x: .5, y: .4 })) };
}
export function starterLevel() {
  const w = encounter(57, 1);
  return sanitizeLevel({ version: 1, name: 'My first orbit', width: W, height: H, start: { x: START.x / W, y: START.y / H }, exit: { x: w.gate.x / W, y: w.gate.y / H, radius: w.gate.radius }, planets: w.planets.map(p => ({ x: p.x / W, y: p.y / H, radius: p.radius, gravity: p.mass / 150000, type: p.type, kind: p.kind, config: p.config })), stars: w.pickups.map(p => ({ x: p.x / W, y: p.y / H })), gravity: 1, speed: 1, duration: 20, instantRespawn: false });
}
export function levelWorld(raw) {
  const d = sanitizeLevel(raw);
  if (!d) throw new Error('Invalid custom level');
  const xy = p => ({ x: p.x * d.width, y: p.y * d.height });
  return { width: d.width, height: d.height, minY: 0, maxAge: d.duration, speed: d.speed, start: xy(d.start),
    planets: d.planets.map(p => ({ ...xy(p), radius: p.radius, mass: 150000 * p.gravity * d.gravity, type: p.type, kind: p.kind, config: { ...p.config } })),
    pickups: d.stars.map(p => ({ ...xy(p), radius: 9 })), gate: { ...xy(d.exit), radius: d.exit.radius }, hazards: [], label: d.name, sector: 1 };
}
export function playability(raw) {
  const w = levelWorld(raw), issues = [];
  if (w.planets.some(p => Math.hypot(p.x - w.start.x, p.y - w.start.y) <= p.radius + 4)) issues.push('Move the launch point clear of a planet.');
  if (w.planets.some(p => Math.hypot(p.x - w.gate.x, p.y - w.gate.y) <= p.radius + w.gate.radius)) issues.push('Move the exit ring clear of the planets.');
  if (Math.hypot(w.start.x - w.gate.x, w.start.y - w.gate.y) <= w.gate.radius + 4) issues.push('Move the exit farther from the launch point.');
  return issues;
}
export function parseWorkshop(raw) {
  let v; try { v = JSON.parse(raw); } catch { /* Defaults below. */ }
  const levels = [], ids = new Set();
  if (v?.version === 1 && Array.isArray(v.levels)) for (const rawLevel of v.levels.slice(0, MAX_LEVELS)) {
    const d = sanitizeLevel(rawLevel);
    if (d?.id && !ids.has(d.id)) { levels.push(d); ids.add(d.id); }
  }
  const draft = v?.version === 1 ? sanitizeLevel(v.draft) : null;
  if (draft && !ids.has(draft.id)) draft.id = '';
  return { version: 1, levels, draft: draft || starterLevel() };
}
export function saveLevel(library, raw, id) {
  const d = sanitizeLevel(raw);
  if (!d || !/^[a-zA-Z0-9_-]{1,64}$/.test(id)) return { error: 'Invalid level.' };
  const index = library.levels.findIndex(l => l.id === id);
  if (index < 0 && library.levels.length >= MAX_LEVELS) return { error: 'Library full (30 levels). Delete a level or update an existing one.' };
  d.id = id;
  const next = cloneLevel(library);
  if (index < 0) next.levels.push(d); else next.levels[index] = d;
  next.draft = cloneLevel(d);
  return { library: next, level: cloneLevel(d) };
}
export function loadWorkshop(storage) {
  try { return { library: parseWorkshop(storage.getItem(WORKSHOP_KEY)), available: true }; }
  catch { return { library: parseWorkshop(null), available: false }; }
}
export function writeWorkshop(storage, library) {
  try { storage.setItem(WORKSHOP_KEY, JSON.stringify(library)); return true; } catch { return false; }
}
