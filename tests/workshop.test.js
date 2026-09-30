import test from 'node:test';
import assert from 'node:assert/strict';
import { WORKSHOP_KEY, starterLevel, sanitizeLevel, levelWorld, playability, parseWorkshop, saveLevel, loadWorkshop, writeWorkshop } from '../web/workshop.js';
import { DT, predict, createFlight, advance } from '../web/simulation.js';

test('custom level round trip preserves geometry and every configuration independently', () => {
  const raw = starterLevel(); Object.assign(raw, { name: 'Long ice orbit', width: 850, height: 1800, gravity: 1.8, speed: .75, duration: 36, instantRespawn: true }); raw.planets[0].gravity = 2.1;
  const result = saveLevel(parseWorkshop(null), raw, 'level_test');
  const storage = new Map(); const api = { getItem: k => storage.get(k), setItem: (k, v) => storage.set(k, v) };
  assert.equal(writeWorkshop(api, result.library), true);
  assert.equal(storage.has('orbit-zero.save.v1'), false);
  const loaded = loadWorkshop(api).library;
  assert.deepEqual(loaded.levels[0], result.level);
  assert.deepEqual(loaded.draft, result.level);
  loaded.draft.planets[0].gravity = 0; assert.equal(loaded.levels[0].planets[0].gravity, 2.1);
  assert.equal(JSON.parse(storage.get(WORKSHOP_KEY)).levels[0].instantRespawn, true);
});

test('sanitization bounds objects, numbers, names, duplicates and malformed storage', () => {
  const raw = starterLevel(); Object.assign(raw, { width: Infinity, height: -1, gravity: NaN, speed: 100, duration: -12, id: '../evil', name: 'a\u0000b' });
  raw.planets = Array(50).fill({ x: Infinity, y: -99, radius: 1e9, gravity: -100 }); raw.stars = Array(90).fill({});
  const d = sanitizeLevel(raw);
  assert.equal(d.width, 400); assert.equal(d.height, 400); assert.equal(d.gravity, 1); assert.equal(d.speed, 2); assert.equal(d.duration, 5); assert.equal(d.id, ''); assert.equal(d.name, 'ab');
  assert.equal(d.planets.length, 12); assert.equal(d.stars.length, 24); assert.equal(d.planets[0].radius, 70); assert.equal(d.planets[0].gravity, 0);
  assert.equal(sanitizeLevel({ version: 99 }), null);
  assert.equal(parseWorkshop('{bad').levels.length, 0);
  const named = saveLevel(parseWorkshop(null), starterLevel(), 'same').level;
  assert.equal(parseWorkshop(JSON.stringify({ version: 1, levels: [named, named] })).levels.length, 1);
  assert.equal(writeWorkshop({ setItem() { throw Error('quota'); } }, {}), false);
});

test('30-level cap allows updating an existing entry without aliasing or duplication', () => {
  let lib = parseWorkshop(null);
  for (let i = 0; i < 30; i++) lib = saveLevel(lib, starterLevel(), 'level_' + i).library;
  assert.match(saveLevel(lib, starterLevel(), 'overflow').error, /full/);
  const draft = starterLevel(); draft.speed = 1.6;
  const next = saveLevel(lib, draft, 'level_4');
  assert.equal(next.library.levels.length, 30); assert.equal(next.level.speed, 1.6); assert.equal(lib.levels[4].speed, 1);
});

test('resizing preserves normalized positions and multiplies only custom gravity', () => {
  const d = starterLevel(), w = levelWorld(d); d.width *= 2; d.height *= 2; d.gravity = 2; d.planets[0].gravity *= 1.5;
  const resized = levelWorld(d);
  assert.equal(resized.start.x, w.start.x * 2); assert.equal(resized.start.y, w.start.y * 2);
  assert.equal(resized.planets[0].mass, w.planets[0].mass * 3); assert.equal(resized.planets[1].mass, w.planets[1].mass * 2);
  assert.deepEqual(playability(starterLevel()), []);
  d.start = { ...d.planets[0] }; assert.match(playability(d)[0], /launch point/);
});

test('preview and live custom simulation agree through terminal events at multiple tunings', () => {
  for (const [width, height, gravity, speed] of [[300, 400, 0, .25], [400, 720, 1, 1], [1200, 2400, 3, 2]]) {
    const d = starterLevel(); Object.assign(d, { width, height, gravity, speed });
    const world = levelWorld(d), vector = { vx: 40 * speed, vy: -230 * speed }, prediction = predict(vector, world, 6), live = createFlight(vector, world);
    for (let i = 0; i < Math.floor(6 / DT) && live.status === 'flight'; i++) advance(live, world);
    assert.deepEqual(prediction.state, live);
    assert.equal(prediction.points[0].x, world.start.x);
  }
});

test('custom arena boundaries, start position and time limit replace production defaults', () => {
  const d = starterLevel(); Object.assign(d, { width: 1200, height: 2400, duration: 5, gravity: 0, planets: [], stars: [], start: { x: .8, y: .8 }, exit: { x: .1, y: .1, radius: 27 } });
  const w = levelWorld(d), flight = createFlight({ vx: 0, vy: 0 }, w);
  assert.equal(flight.x, 960); assert.equal(flight.y, 1920);
  for (let i = 0; i < 610; i++) advance(flight, w);
  assert.equal(flight.status, 'lost'); assert.ok(flight.age >= 5 && flight.age < 5.02);
});
