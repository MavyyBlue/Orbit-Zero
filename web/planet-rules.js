// Pure mechanics catalog; simulation and Workshop share these defaults and bounds.
export const PLANETS = Object.freeze({
  drifter: { name: 'Drifter', summary: 'Little Nudge', color: 'jade', defaults: { reach: 260 }, controls: [['reach', 'Nudge reach', 100, 350, 10, '']] },
  slingshot: { name: 'Slingshot', summary: 'Curved Pull', color: 'sand', defaults: { bend: 1.8 }, controls: [['bend', 'Curve strength', 1, 3, .1, '×']] },
  orbiter: { name: 'Orbiter', summary: 'Orbit Lock', color: 'violet', defaults: { reach: 85, orbitStrength: 1, orbitTime: 1.6, releaseBoost: 90 }, controls: [['reach', 'Capture reach', 50, 140, 5, ''], ['orbitStrength', 'Orbit strength', .5, 2.5, .1, '×'], ['orbitTime', 'Lock duration', .5, 2.5, .1, 's'], ['releaseBoost', 'Release boost', 30, 180, 5, '']] },
  crusher: { name: 'Crusher', summary: 'Violent Yank', color: 'ember', defaults: { reach: 115, tightness: 2 }, controls: [['reach', 'Yank reach', 60, 180, 5, ''], ['tightness', 'Core tightness', 1, 3, .1, '×']] },
  repulsor: { name: 'Repulsor', summary: 'Push Away', color: 'ice', defaults: { reach: 240, repulsion: 1.4 }, controls: [['reach', 'Push reach', 100, 350, 10, ''], ['repulsion', 'Repulsion', .25, 3, .05, '×']] }
});
export const planetKind = p => Object.hasOwn(PLANETS, p?.kind) ? p.kind : 'slingshot';
export function planetConfig(kind, values = {}) {
  const def = PLANETS[kind] || PLANETS.slingshot, config = {};
  for (const [key, , min, max] of def.controls) config[key] = typeof values[key] === 'number' && Number.isFinite(values[key]) ? Math.max(min, Math.min(max, values[key])) : def.defaults[key];
  return config;
}
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
// Signed radial acceleration: positive toward the center, negative away.
export function radialPull(p, d, base) {
  if (p.mass <= 0) return 0;
  if (!p.kind) return base; // Older raw fixtures keep their original rule.
  const kind = planetKind(p), c = p.config || PLANETS[kind].defaults, range = p.radius + (c.reach || 0);
  if (kind === 'drifter') return d >= range ? 0 : base * .24 * (1 - d / range) ** 2;
  if (kind === 'slingshot') return base * c.bend * (1 + .45 * (p.radius + 45) / Math.max(d, 12));
  if (kind === 'orbiter') return base * .65;
  if (kind === 'crusher') return d >= range ? 0 : Math.min(1500, base * 8 * (1 - d / range) ** 2 * (range / Math.max(d, 12)) ** c.tightness);
  // Repulsor is a bounded linear outward field, rather than negative inverse-square.
  return d >= range ? 0 : -p.mass / 1200 * c.repulsion * (1 - d / range);
}
export function applyOrbit(s, planets) {
  let locked = s.orbit;
  if (locked && (s.age - locked.since >= planets[locked.index].config.orbitTime)) {
    const p = planets[locked.index], dx = s.x - p.x, dy = s.y - p.y, d = Math.max(12, Math.hypot(dx, dy));
    s.vx += -dy / d * locked.direction * p.config.releaseBoost;
    s.vy += dx / d * locked.direction * p.config.releaseBoost;
    s.orbit = null; locked = null; s.events.push('release');
  }
  if (!locked) {
    const candidates = [];
    planets.forEach((p, index) => {
      if (p.kind !== 'orbiter' || p.mass <= 0 || s.orbitVisited.includes(index)) return;
      const dx = s.x - p.x, dy = s.y - p.y, distance = Math.hypot(dx, dy);
      if (distance > p.radius + 12 && distance <= p.radius + p.config.reach) candidates.push({ p, index, dx, dy, distance });
    });
    const hit = candidates.sort((a, b) => a.distance - b.distance)[0];
    if (hit) {
      const { p, index, dx, dy, distance } = hit, direction = dx * s.vy - dy * s.vx < 0 ? -1 : 1;
      const radial = (s.vx * dx + s.vy * dy) / distance;
      const speed = clamp(165 * Math.sqrt(p.mass / 150000) * p.config.orbitStrength, 80, 300);
      // Capture changes velocity, never position; preview does this same state change.
      s.vx = -dy / distance * direction * speed + dx / distance * radial * .12;
      s.vy = dx / distance * direction * speed + dy / distance * radial * .12;
      locked = { index, since: s.age, direction, radius: clamp(distance, p.radius + 28, p.radius + 55), speed };
      s.orbit = locked; s.orbitVisited.push(index); s.events.push('orbit');
    }
  }
  if (!locked) return { ax: 0, ay: 0, index: -1 };
  const p = planets[locked.index], dx = s.x - p.x, dy = s.y - p.y, d = Math.max(12, Math.hypot(dx, dy)), nx = dx / d, ny = dy / d;
  const tangentX = -ny * locked.direction, tangentY = nx * locked.direction;
  const vr = s.vx * nx + s.vy * ny, vt = s.vx * tangentX + s.vy * tangentY;
  const strength = p.config.orbitStrength;
  const radial = -vt * vt / d + (locked.radius - d) * 32 * strength - vr * 11 * strength;
  const tangent = (locked.speed - vt) * 6 * strength;
  return { ax: nx * radial + tangentX * tangent, ay: ny * radial + tangentY * tangent, index: locked.index };
}
