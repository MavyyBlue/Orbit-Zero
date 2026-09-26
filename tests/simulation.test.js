import test from 'node:test';
import assert from 'node:assert/strict';
import { DT, START, encounter, planetCount, gravityAcceleration, createFlight, advance, predict, launchVector, dailySeed } from '../web/simulation.js';
const empty = () => ({ planets: [], hazards: [], pickups: [], gate: { x: 200, y: 97, radius: 31 } });
test('preview equals authoritative live flight for every displayed sample', () => {
  for (let seed = 1; seed <= 12; seed++) for (let sector = 1; sector <= 12; sector++) {
    const world = encounter(seed, sector), v = { vx: (seed - 6) * 15, vy: -290 }, result = predict(v, world), live = createFlight(v);
    const points = [{ x: live.x, y: live.y }];
    for (let i = 0; i < Math.floor(2.1 / DT) && live.status === 'flight'; i++) { advance(live, world); if (i % 3 === 2 || live.status !== 'flight') points.push({ x: live.x, y: live.y }); }
    assert.deepEqual(result.points, points); assert.deepEqual(result.state, live);
  }
});
test('generator repeats identical encounters and does not mutate inputs', () => {
  const w = encounter(90210, 4), copy = JSON.stringify(w); assert.deepEqual(w, encounter(90210, 4));
  predict({ vx: 10, vy: -280 }, w); assert.equal(JSON.stringify(w), copy); assert.notDeepEqual(w, encounter(90211, 4));
});
test('drag deadzone and maximum launch speed', () => {
  assert.equal(launchVector(1, 1), null); const v = launchVector(1000, 1000); assert.ok(Math.abs(Math.hypot(v.vx, v.vy) - 368) < 1e-9); assert.ok(v.vx < 0 && v.vy < 0);
});
test('gravity is stronger close up and remains stronger farther out; exit is wider', () => {
  const mass = 150000;
  for (const distance of [70, 180, 350]) assert.ok(gravityAcceleration(mass, distance) > mass / (distance * distance) * 1.4);
  assert.ok(gravityAcceleration(mass, 70) > gravityAcceleration(mass, 180));
  assert.equal(encounter(57, 1).gate.radius, 27);
});
test('swept collisions prevent tunneling and terminate before rewards', () => {
  const w = empty(); w.planets = [{ x: 200, y: 500, radius: 20, mass: 0 }]; w.pickups = [{ x: 200, y: 500, radius: 9 }];
  const s = createFlight({ vx: 0, vy: -20000 }); advance(s, w); assert.equal(s.status, 'crash'); assert.equal(s.score, 0);
});
test('pickup can only score once', () => {
  const w = empty(); w.pickups = [{ ...START, radius: 9 }]; const s = createFlight({ vx: 0, vy: 0 });
  for (let i = 0; i < 10; i++) advance(s, w); assert.equal(s.score, 100); assert.deepEqual(s.collected, [0]);
});
test('near miss rewards survival on exit, only once', () => {
  const w = empty(); w.planets = [{ x: 238, y: 500, radius: 25, mass: 0 }];
  const s = createFlight({ vx: 0, vy: -180 });
  for (let i = 0; i < 120; i++) advance(s, w);
  assert.deepEqual(s.near, [0]); assert.equal(s.combo, 2); assert.equal(s.score, 500);
  for (let i = 0; i < 50; i++) advance(s, w); assert.equal(s.near.length, 1);
});
test('gate, boundary and timeout are terminal', () => {
  let s = createFlight({ vx: 0, vy: -350 }); for (let i = 0; i < 300; i++) advance(s, empty()); assert.equal(s.status, 'gate'); assert.equal(s.score, 500);
  const snapshot = JSON.stringify({ ...s, events: [] }); advance(s, empty()); assert.equal(JSON.stringify(s), snapshot);
  s = createFlight({ vx: 1000, vy: 0 }); for (let i = 0; i < 60; i++) advance(s, empty()); assert.equal(s.status, 'lost');
  s = createFlight({ vx: 0, vy: 0 }); for (let i = 0; i < 1800; i++) advance(s, empty()); assert.equal(s.status, 'lost');
});
test('daily seed uses UTC day', () => {
  assert.equal(dailySeed(new Date('2026-09-26T00:00:00Z')), dailySeed(new Date('2026-09-26T23:59:59Z')));
  assert.notEqual(dailySeed(new Date('2026-09-26T00:00:00Z')), dailySeed(new Date('2026-09-27T00:00:00Z')));
});
function blockedFromLaunch(target, planets, radius) {
  const dx = target.x - START.x, dy = target.y - START.y, d2 = dx * dx + dy * dy;
  return planets.some(p => {
    const t = ((p.x - START.x) * dx + (p.y - START.y) * dy) / d2;
    return t > .08 && t < .95 && Math.hypot(START.x + dx * t - p.x, START.y + dy * t - p.y) + (radius + 4) * t + 3 < p.radius + 4;
  });
}
test('gravity routes place every star and exit beyond direct sight, and can collect all', () => {
  const seeds = [1, 57, 90210, dailySeed(new Date('2026-09-26'))];
  for (const seed of seeds) for (let sector = 1; sector <= 12; sector++) {
    const w = encounter(seed, sector);
    assert.equal(w.planets.length, 3 + Math.floor((sector - 1) / 4));
    assert.equal(w.pickups.length, 3);
    assert.ok(w.planets.every(p => p.mass > 0 && p.type));
    for (const p of [...w.pickups, w.gate]) assert.ok(blockedFromLaunch(p, w.planets, p.radius), `Direct line exposed: ${seed}/${sector}`);
    const { angle, power } = w.reference, a = angle * Math.PI / 180;
    const v = { vx: Math.sin(a) * power / 100 * 368, vy: -Math.cos(a) * power / 100 * 368 };
    const s = createFlight(v);
    for (let i = 0; i < 1681 && s.status === 'flight'; i++) advance(s, w);
    assert.equal(s.status, 'gate', `Unsolved seed ${seed} sector ${sector}`);
    assert.equal(s.collected.length, 3, `Unreachable stars ${seed}/${sector}`);
    const noGravity = { ...w, planets: w.planets.map(p => ({ ...p, mass: 0 })) }, straight = createFlight(v);
    for (let i = 0; i < 1681 && straight.status === 'flight'; i++) advance(straight, noGravity);
    assert.notEqual(straight.status, 'gate', `Gravity did not matter ${seed}/${sector}`);
  }
});
test('endless independently chooses three through five planets, with reachable gravity routes', () => {
  const seen = new Set();
  for (let sector = 1; sector <= 30; sector++) {
    const w = encounter(57, sector, 'endless'), count = planetCount(57, sector, 'endless');
    assert.equal(w.planets.length, count); seen.add(count);
    const { angle, power } = w.reference, a = angle * Math.PI / 180;
    const s = createFlight({ vx: Math.sin(a) * power / 100 * 368, vy: -Math.cos(a) * power / 100 * 368 });
    for (let i = 0; i < 1681 && s.status === 'flight'; i++) advance(s, w);
    assert.equal(s.status, 'gate'); assert.equal(s.collected.length, 3);
  }
  assert.deepEqual([...seen].sort(), [3, 4, 5]);
});
