import test from 'node:test';
import assert from 'node:assert/strict';
import { PLANETS, planetConfig, radialPull } from '../web/planet-rules.js';
import { DT, advance, createFlight, predict, gravityAcceleration, encounter, verifiedFallback } from '../web/simulation.js';
import { sanitizeLevel, starterLevel, levelWorld, saveLevel, parseWorkshop } from '../web/workshop.js';
const body = kind => ({ x: 200, y: 400, radius: 25, mass: 150000, kind, config: planetConfig(kind), type: PLANETS[kind].color });
const pull = (kind, d) => radialPull(body(kind), d, gravityAcceleration(150000, d));
const world = kind => ({ width: 800, height: 1000, minY: 0, maxAge: 14, start: { x: 280, y: 400 }, planets: [body(kind)], pickups: [], hazards: [], gate: { x: 750, y: 100, radius: 27 } });

test('five profiles have distinct signs, reach and near/far behavior', () => {
  assert.ok(pull('drifter', 80) > 0 && pull('drifter', 80) < pull('slingshot', 80) / 10);
  assert.equal(pull('drifter', 400), 0); assert.ok(pull('slingshot', 400) > 0);
  assert.ok(pull('crusher', 60) > pull('slingshot', 60) * 5); assert.equal(pull('crusher', 180), 0);
  assert.ok(pull('repulsor', 80) < 0); assert.equal(pull('repulsor', 400), 0);
  assert.notEqual(pull('drifter', 80) / pull('drifter', 150), pull('slingshot', 80) / pull('slingshot', 150));
  for (const kind of Object.keys(PLANETS)) assert.equal(radialPull({ ...body(kind), mass: 0 }, 60, 0), 0);
});

test('Orbiter captures without teleporting, circles safely, releases and cannot recapture', () => {
  const w = world('orbiter'), s = createFlight({ vx: 0, vy: -150 }, w); let capture = 0, release = 0, angleTravel = 0, prior = Math.atan2(s.y - 400, s.x - 200);
  for (let i = 0; i < 270 && s.status === 'flight'; i++) {
    const before = { x: s.x, y: s.y }; advance(s, w);
    if (s.events.includes('orbit')) { capture++; assert.ok(Math.hypot(s.x - before.x, s.y - before.y) < 3); }
    if (s.events.includes('release')) release++;
    const angle = Math.atan2(s.y - 400, s.x - 200), delta = Math.atan2(Math.sin(angle - prior), Math.cos(angle - prior)); if (s.orbit) { angleTravel += Math.abs(delta); assert.ok(Math.hypot(s.x - 200, s.y - 400) > 40); } prior = angle;
  }
  assert.equal(capture, 1); assert.equal(release, 1); assert.ok(angleTravel > Math.PI); assert.equal(s.orbit, null); assert.deepEqual(s.orbitVisited, [0]);
});

test('longer stronger Orbiter settings can complete a full orbit before release', () => {
  const w = world('orbiter'); w.planets[0].config.orbitStrength = 1.8; w.planets[0].config.orbitTime = 2.5;
  const s = createFlight({ vx: 0, vy: -150 }, w); let travel = 0, prior = 0;
  for (let i = 0; i < 310; i++) { advance(s, w); const angle = Math.atan2(s.y - 400, s.x - 200); if (s.orbit) travel += Math.abs(Math.atan2(Math.sin(angle - prior), Math.cos(angle - prior))); prior = angle; }
  assert.ok(travel > 2 * Math.PI); assert.equal(s.status, 'flight'); assert.equal(s.orbit, null);
});

test('preview exactly matches live state including capture, release and mixed forces', () => {
  for (const kind of Object.keys(PLANETS)) for (const seconds of [.8, 2.1, 4]) {
    const w = world(kind); w.planets.push({ ...body('repulsor'), x: 490, y: 500 }); const copy = JSON.stringify(w);
    const v = { vx: 0, vy: -150 }, prediction = predict(v, w, seconds), live = createFlight(v, w);
    for (let i = 0; i < Math.floor(seconds / DT) && live.status === 'flight'; i++) advance(live, w);
    assert.deepEqual(prediction.state, live); assert.equal(JSON.stringify(w), copy);
  }
});

test('zero mass disables orbit capture and Repulsor pushes away rather than pulling', () => {
  const w = world('orbiter'); w.planets[0].mass = 0; const s = createFlight({ vx: 0, vy: -150 }, w); advance(s, w); assert.equal(s.orbit, null); assert.equal(s.vy, -150);
  const repel = world('repulsor'), r = createFlight({ vx: 0, vy: 0 }, repel); advance(r, repel); assert.ok(r.vx > 0);
});

test('Workshop saves mechanic-specific controls and migrates older planets safely', () => {
  const d = starterLevel(); delete d.planets[0].kind; delete d.planets[0].config;
  const old = sanitizeLevel(d); assert.equal(old.planets[0].kind, 'slingshot'); assert.equal(old.planets[0].config.bend, 1.8);
  d.planets = Object.keys(PLANETS).map(kind => ({ x: .5, y: .5, radius: 24, gravity: 1.7, kind, config: { ...planetConfig(kind), orbitTime: 2.2, repulsion: 2.4 } }));
  const result = saveLevel(parseWorkshop(null), d, 'typed');
  const loaded = parseWorkshop(JSON.stringify(result.library)); assert.deepEqual(loaded.levels[0], result.level);
  assert.equal(loaded.levels[0].planets[2].config.orbitTime, 2.2); assert.equal(loaded.levels[0].planets[4].config.repulsion, 2.4);
  assert.equal(levelWorld(loaded.levels[0]).planets[2].config.orbitTime, 2.2);
  assert.deepEqual(planetConfig('orbiter', { reach: Infinity, orbitTime: -99, orbitStrength: 99 }), { reach: 85, orbitStrength: 2.5, orbitTime: .5, releaseBoost: 90 });
});

test('Journey ramps mechanics and every fallback has a complete gravity-dependent route', () => {
  const seen = new Set();
  for (let sector = 1; sector <= 12; sector++) {
    const w = encounter(57, sector); for (const p of w.planets) { seen.add(p.kind); if (sector <= 3) assert.ok(['drifter', 'slingshot'].includes(p.kind)); if (sector < 6) assert.notEqual(p.kind, 'orbiter'); if (sector < 9) assert.notEqual(p.kind, 'crusher'); }
  }
  assert.deepEqual([...seen].sort(), Object.keys(PLANETS).sort());
  for (const sector of [2, 4, 7, 10]) for (const count of [3, 4, 5]) {
    const { planets, route } = verifiedFallback(sector, count), w = { planets, pickups: route.pickups, gate: route.gate, hazards: [] }, a = route.route.angle * Math.PI / 180, speed = route.route.power / 100 * 368;
    const s = createFlight({ vx: Math.sin(a) * speed, vy: -Math.cos(a) * speed });
    for (let i = 0; i < 1681 && s.status === 'flight'; i++) advance(s, w);
    assert.equal(s.status, 'gate', `fallback ${sector}/${count}`); assert.equal(s.collected.length, 3);
  }
});
