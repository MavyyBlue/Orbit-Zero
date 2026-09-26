import test from 'node:test';
import assert from 'node:assert/strict';
import { DT, START, encounter, createFlight, advance, predict, launchVector, dailySeed } from '../web/simulation.js';
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
test('sampled generated sectors each have a reachable gate using legal controls', () => {
  for (const seed of [1, 57, 90210, dailySeed(new Date('2026-09-26'))]) for (let sector = 1; sector <= 12; sector++) {
    const w = encounter(seed, sector); let solved = false;
    for (let angle = -40; angle <= 40 && !solved; angle += 2) for (const speed of [220, 280, 340, 368]) {
      const a = angle * Math.PI / 180, s = createFlight({ vx: Math.sin(a) * speed, vy: -Math.cos(a) * speed });
      for (let i = 0; i < 1681 && s.status === 'flight'; i++) advance(s, w);
      if (s.status === 'gate') { solved = true; break; }
    }
    assert.ok(solved, `Unsolved seed ${seed} sector ${sector}`);
  }
});
