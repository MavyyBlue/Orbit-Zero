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
export function encounter(seed, sector = 1) {
  const r = rng((seed ^ Math.imul(sector, 2654435761)) >>> 0);
  const mirror = r() < .5 ? 1 : -1;
  const kind = (sector - 1) % 4;
  const planets = [{ x: 200 + mirror * (54 + r() * 18), y: 335 + r() * 30, radius: 25 + r() * 7, mass: 105000 + Math.min(sector, 12) * 2200 }];
  if (kind === 1 || kind === 3) planets.push({ x: 200 - mirror * 107, y: 218, radius: 19, mass: 65000 });
  const gate = { x: 200 - mirror * (35 + r() * 42), y: 97, radius: 31 };
  const pickups = [{ x: 200 - mirror * 25, y: 450, radius: 9 }, { x: 200 - mirror * 39, y: 300, radius: 9 }, { x: gate.x + mirror * 12, y: 172, radius: 9 }];
  return { planets, pickups, gate, sector, label: ['PERIAPSIS', 'BINARY TIDE', 'DUST CORRIDOR', 'DOUBLE SLING'][kind],
    hazards: kind === 2 ? [{ x: 80, y: 258, radius: 13 }, { x: 321, y: 192, radius: 14 }] : [] };
}
export function launchVector(dx, dy) {
  const d = Math.hypot(dx, dy), length = Math.min(115, d);
  if (d < 10) return null;
  return { vx: -dx / d * length * 3.2, vy: -dy / d * length * 3.2 };
}
export function createFlight(v) {
  return { ...START, ...v, age: 0, status: 'flight', collected: [], near: [], close: [], score: 0, combo: 1, events: [] };
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
  let ax = 0, ay = 0;
  for (const p of world.planets) {
    const dx = p.x - s.x, dy = p.y - s.y, d2 = Math.max(dx * dx + dy * dy, 144);
    const f = p.mass / (d2 * Math.sqrt(d2)); ax += dx * f; ay += dy * f;
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
  } else if (s.x < -20 || s.x > W + 20 || s.y < 65 || s.y > H + 20 || s.age >= 14) {
    s.status = 'lost'; s.events.push('lost');
  }
  return s;
}
export function predict(vector, world, seconds = 2.1) {
  const s = createFlight(vector), points = [{ x: s.x, y: s.y }];
  for (let i = 0; i < Math.floor(seconds / DT) && s.status === 'flight'; i++) {
    advance(s, world);
    if (i % 3 === 2 || s.status !== 'flight') points.push({ x: s.x, y: s.y });
  }
  return { points, state: s };
}
