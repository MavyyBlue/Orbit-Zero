import { PLANETS, planetConfig, radialPull, applyOrbit } from './planet-rules.js';
// Pure, fixed-step simulation. Both prediction and play call advance().
export const W = 400, H = 720, DT = 1 / 120;
export const START = Object.freeze({ x: 200, y: 574 });
export const PROBE_RADIUS = 4;
export function rng(seed) {
  let n = seed >>> 0;
  return () => { n += 0x6D2B79F5; let t = n; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
export function dailySeed(date = new Date()) {
  const key = date.toISOString().slice(0, 10);
  return [...key].reduce((a, c) => Math.imul(a ^ c.charCodeAt(0), 16777619) >>> 0, 2166136261);
}
// Stronger close pull plus a broad outer skirt; used by both play and prediction.
export const GRAVITY_REACH = 250;
export function gravityAcceleration(mass, distance) {
  const d = Math.max(12, distance);
  return mass / (d * d) * (1.25 + .9 * d / (d + GRAVITY_REACH / 2));
}
const cache = new Map(), fallbackCache = new Map();
export function planetPool(sector) {
  return sector <= 3 ? ['drifter', 'slingshot'] : sector <= 5 ? ['drifter', 'slingshot', 'repulsor'] : sector <= 8 ? ['drifter', 'slingshot', 'orbiter', 'repulsor'] : ['drifter', 'slingshot', 'orbiter', 'crusher', 'repulsor'];
}

export function planetCount(seed, sector, mode = 'voyage') {
  if (mode === 'endless') return 3 + Math.floor(rng((seed ^ Math.imul(sector, 0x45d9f3b)) >>> 0)() * 3);
  return Math.min(5, 3 + Math.floor((Math.max(1, sector) - 1) / 4));
}
function obscured(target, planets, radius) {
  const dx = target.x - START.x, dy = target.y - START.y, d2 = dx * dx + dy * dy;
  return planets.some(p => {
    const t = ((p.x - START.x) * dx + (p.y - START.y) * dy) / d2;
    if (t <= .08 || t >= .95) return false;
    const closest = Math.hypot(START.x + t * dx - p.x, START.y + t * dy - p.y);
    // The entire target circle sits behind a solid planet, including ship clearance.
    return closest < p.radius + PROBE_RADIUS - (radius + PROBE_RADIUS) * t - 3;
  });
}
function mechanicFor(sector, index, random) {
  const pool = planetPool(sector);
  const kind = index === 0 ? 'slingshot' : index === 1 ? (sector >= 9 ? 'slingshot' : 'drifter') : sector >= 9 ? ['orbiter', 'crusher', 'repulsor'][index - 2] : sector >= 6 && index === 2 ? 'orbiter' : sector >= 4 && index === 2 ? 'repulsor' : pool[Math.floor(random() * pool.length)];
  return { kind, type: PLANETS[kind].color, config: planetConfig(kind) };
}
function layout(seed, sector, count, attempt) {
  const r = rng((seed ^ Math.imul(sector, 0x9e3779b1) ^ Math.imul(attempt, 0x85ebca6b)) >>> 0);
  const mirror = r() < .5 ? 1 : -1;
  const xs = [205, 165, 235, 188, 215];
  const ys = { 3: [445, 325, 205], 4: [460, 355, 250, 145], 5: [475, 387, 300, 213, 160] }[count];
  return ys.map((y, i) => ({
    x: 200 + mirror * ((sector >= 9 && i >= 2 ? [290, 85, 90][i - 2] : xs[i]) - 200) + (r() - .5) * 12,
    y: y + (r() - .5) * 10,
    radius: 20 + r() * 6,
    mass: 120000 + r() * 55000,
    ...mechanicFor(sector, i, r)
  }));
}
function routeFor(planets, count) {
  const corridor = { planets, pickups: [], hazards: [], gate: { x: -10000, y: -10000, radius: 1 } };
  const targets = count === 3 ? [410, 300, 185] : count === 4 ? [435, 325, 215] : [445, 330, 220];
  for (const power of [30, 20, 40, 50, 60, 70, 80, 90, 100]) {
    for (let angle = -45; angle <= 45; angle += 3) {
      const rad = angle * Math.PI / 180, speed = power / 100 * 368;
      const velocity = { vx: Math.sin(rad) * speed, vy: -Math.cos(rad) * speed };
      const s = createFlight(velocity), points = [];
      for (let i = 0; i < 1681 && s.status === 'flight'; i++) {
        advance(s, corridor);
        if (i % 5 === 0 && s.y < 475 && s.y > 82) points.push({ x: s.x, y: s.y });
      }
      const gatePoint = points.findLast(p => p.y > 90 && p.y < (planets.some(q => q.kind === 'orbiter' || q.kind === 'crusher') ? 245 : 120) && p.x > 45 && p.x < 355 &&
        obscured(p, planets, 27) && planets.every(q => Math.hypot(q.x - p.x, q.y - p.y) > q.radius + 31));
      if (!gatePoint) continue;
      const pickups = [];
      for (const target of targets) {
        const choices = points.filter(p => Math.abs(p.y - target) < 45 && p.x > 25 && p.x < 375 &&
          obscured(p, planets, 9) && planets.every(q => Math.hypot(q.x - p.x, q.y - p.y) > q.radius + 18));
        if (!choices.length) break;
        const p = choices.reduce((a, b) => Math.abs(a.y - target) < Math.abs(b.y - target) ? a : b);
        pickups.push({ ...p, radius: 9 });
      }
      if (pickups.length !== targets.length) continue;
      const gate = { ...gatePoint, radius: 27 };
      const world = { planets, pickups, gate, hazards: [] };
      // Reject paths whose gate triggers before the stars can all be collected.
      const check = createFlight(velocity);
      for (let i = 0; i < 1681 && check.status === 'flight'; i++) advance(check, world);
      if (check.status === 'gate' && check.collected.length === pickups.length) {
        return { pickups, gate, route: { angle, power } };
      }
    }
  }
  return null;
}
export function verifiedFallback(sector, count) {
  if (![3, 4, 5].includes(count)) throw new RangeError('Unsupported planet count');
  const stage = sector <= 3 ? 2 : sector <= 5 ? 4 : sector <= 8 ? 7 : 10;
  const fallbackKey = `${stage}:${count}`;
  let fallback = fallbackCache.get(fallbackKey);
  if (!fallback) {
    for (const fixedSeed of [57, 1, 7, 42, 319]) {
      for (let attempt = 0; attempt < 4 && !fallback; attempt++) {
        const bodies = layout(fixedSeed, stage, count, attempt), solution = routeFor(bodies, count);
        if (solution) fallback = { planets: bodies, route: solution };
      }
      if (fallback) break;
    }
    if (!fallback) throw new Error('No reachable gravity route for encounter');
    fallbackCache.set(fallbackKey, fallback);
  }
  return fallback;
}
export function encounter(seed, sector = 1, mode = 'voyage') {
  const key = `${seed >>> 0}:${sector}:${mode}`;
  if (cache.has(key)) return cache.get(key);
  const count = planetCount(seed, sector, mode);
  let planets, route;
  for (let attempt = 0; attempt < 8 && !route; attempt++) {
    planets = layout(seed, sector, count, attempt);
    route = routeFor(planets, count);
  }
  if (!route) {
    // Fixed, validated layout as a deterministic last resort, never a blind exit.
    const fallback = verifiedFallback(sector, count);
    planets = fallback.planets; route = fallback.route;
  }
  const world = { planets, pickups: route.pickups, gate: route.gate, hazards: [], sector,
    label: (sector === 1 ? 'DRIFTER + SLINGSHOT' : sector === 4 ? 'REPULSOR · PUSH AWAY' : sector === 6 ? 'ORBITER · ORBIT LOCK' : sector === 9 ? 'CRUSHER · VIOLENT YANK' : '') || ['TIDAL TURN', 'BINARY ARC', 'GRAVITY THREAD', 'FAR ORBIT'][((sector - 1) % 4 + 4) % 4],
    reference: route.route };
  cache.set(key, world);
  if (cache.size > 24) cache.delete(cache.keys().next().value);
  return world;
}
export function launchVector(dx, dy) {
  const d = Math.hypot(dx, dy), length = Math.min(115, d);
  if (d < 10) return null;
  return { vx: -dx / d * length * 3.2, vy: -dy / d * length * 3.2 };
}
export function createFlight(v, world) {
  return { ...(world?.start || START), ...v, age: 0, status: 'flight', collected: [], near: [], close: [], score: 0, combo: 1, events: [], orbit: null, orbitVisited: [] };
}
function segmentDistance(ax, ay, bx, by, x, y) {
  const dx = bx - ax, dy = by - ay;
  const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy || 1)));
  return Math.hypot(ax + dx * t - x, ay + dy * t - y);
}
export function advance(s, world, dt = DT) {
  s.events = [];
  if (s.status !== 'flight') return s;
  const ox = s.x, oy = s.y;
  const orbit = applyOrbit(s, world.planets);
  let ax = orbit.ax, ay = orbit.ay;
  for (const [index, p] of world.planets.entries()) {
    if (index === orbit.index) continue;
    const dx = p.x - s.x, dy = p.y - s.y, d = Math.max(Math.hypot(dx, dy), 12);
    const f = radialPull(p, d, gravityAcceleration(p.mass, d)) / d; ax += dx * f; ay += dy * f;
  }
  s.vx += ax * dt; s.vy += ay * dt; s.x += s.vx * dt; s.y += s.vy * dt; s.age += dt;
  if (![s.x, s.y, s.vx, s.vy].every(Number.isFinite)) { s.status = 'lost'; return s; }
  for (const p of [...world.planets, ...world.hazards]) {
    if (segmentDistance(ox, oy, s.x, s.y, p.x, p.y) <= p.radius + PROBE_RADIUS) { s.status = 'crash'; s.events.push('crash'); return s; }
  }
  world.planets.forEach((p, i) => {
    const d = Math.hypot(s.x - p.x, s.y - p.y) - p.radius - PROBE_RADIUS;
    if (d < 22 && !s.near.includes(i)) s.close[i] = true;
    // Reward surviving the exit from the near-miss band, once per body.
    if (s.close[i] && d >= 22 && !s.near.includes(i)) {
      s.near.push(i); s.combo++; s.score += 250 * s.combo; s.events.push('near');
    }
  });
  world.pickups.forEach((p, i) => {
    if (!s.collected.includes(i) && segmentDistance(ox, oy, s.x, s.y, p.x, p.y) <= p.radius + PROBE_RADIUS) {
      s.collected.push(i); s.score += 100 * s.combo; s.events.push('pickup');
    }
  });
  if (segmentDistance(ox, oy, s.x, s.y, world.gate.x, world.gate.y) <= world.gate.radius) {
    s.score += 500 * s.combo; s.status = 'gate'; s.events.push('gate');
  } else if (s.x < -20 || s.x > (world.width ?? W) + 20 || s.y < (world.minY ?? 65) || s.y > (world.height ?? H) + 20 || s.age >= (world.maxAge ?? 14)) {
    s.status = 'lost'; s.events.push('lost');
  }
  return s;
}
export function predict(vector, world, seconds = 2.1) {
  const s = createFlight(vector, world), points = [{ x: s.x, y: s.y }];
  for (let i = 0; i < Math.floor(seconds / DT) && s.status === 'flight'; i++) {
    advance(s, world);
    if (i % 3 === 2 || s.status !== 'flight') points.push({ x: s.x, y: s.y });
  }
  return { points, state: s };
}
