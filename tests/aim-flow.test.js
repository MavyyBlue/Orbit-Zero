import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { encounter, launchVector, predict, createFlight, advance, DT } from '../web/simulation.js';

test('real input locks exact preview and launches frozen velocity; cancellation and pointer ownership are safe', async () => {
  const elements = new Map(); let frame, time = 0, dots = [], translation, ship;
  const context = new Proxy({}, { get: (_, k) => {
    if (k === 'createRadialGradient') return () => ({ addColorStop() {} });
    if (k === 'clearRect') return () => { dots = []; };
    if (k === 'translate') return (x, y) => { translation = { x, y }; };
    if (k === 'arc') return (x, y, radius) => { if (radius === 1.6) dots.push({ x, y }); if (x === 0 && y === 0 && radius === 15) ship = translation; };
    return () => {};
  }, set: () => true });
  function parse(html) { for (const m of html.matchAll(/<[^>]*\bid="([^"]+)"[^>]*>/g)) if (!elements.has(m[1])) elements.set(m[1], new Element()); }
  class Element {
    constructor() { this.value = '75'; this.classList = { toggle() {} }; this.style = { setProperty() {} }; }
    setAttribute() {} querySelector() { return { setAttribute() {}, focus() {} }; }
    set innerHTML(s) { parse(s); } getBoundingClientRect() { return { width: 400, height: 720, left: 0, top: 0 }; }
    getContext() { return context; } setPointerCapture() {}
  }
  parse(readFileSync(new URL('../web/index.html', import.meta.url), 'utf8'));
  globalThis.document = { getElementById: id => elements.get(id), addEventListener() {} };
  globalThis.window = { localStorage: { getItem() { return null; }, setItem() {} } };
  globalThis.ResizeObserver = class { constructor(f) { this.f = f; } observe() { this.f(); } };
  globalThis.devicePixelRatio = 1; globalThis.requestAnimationFrame = f => { frame = f; };
  Object.defineProperty(globalThis, 'performance', { configurable: true, value: { now: () => time } });
  Object.defineProperty(globalThis, 'crypto', { configurable: true, value: { getRandomValues: a => { a[0] = 57; return a; } } });
  await import('../web/game.js');
  const el = id => elements.get(id), c = el('space');
  const pointer = (x, y, id = 1) => ({ clientX: x, clientY: y, pointerId: id });
  const draw = t => { time = t; frame(time); };
  el('play').onclick(); c.onpointerdown(pointer(200, 574));
  time = 10; c.onpointermove(pointer(200, 634)); draw(20);
  const original = predict(launchVector(0, 60), encounter(57)).points;
  assert.deepEqual(dots, original);
  draw(360); assert.match(el('aimHint').textContent, /^Aim locked/);
  time = 370; c.onpointermove(pointer(203, 638)); draw(380); assert.deepEqual(dots, original);
  c.onpointercancel(pointer(0, 0, 2)); c.onpointerup(pointer(0, 0, 2));
  assert.equal(el('aimControls').hidden, false, 'other fingers do not cancel or launch');
  time = 400; c.onpointermove(pointer(214, 650)); draw(410);
  const adjusted = predict(launchVector(14, 76), encounter(57)).points;
  assert.deepEqual(dots, adjusted); assert.doesNotMatch(el('aimHint').textContent, /^Aim locked/);
  draw(750); assert.match(el('aimHint').textContent, /^Aim locked/);
  time = 760; c.onpointermove(pointer(217, 653)); draw(770); assert.deepEqual(dots, adjusted);
  c.onpointerup(pointer(217, 653)); assert.equal(el('aimControls').hidden, true);
  const expected = createFlight(launchVector(14, 76), encounter(57)); advance(expected, encounter(57));
  draw(770 + DT * 1000 + .001);
  assert.deepEqual(ship, { x: expected.x, y: expected.y }, 'live flight starts with exact frozen angle and power');
  el('pause').onclick(); el('quit').onclick(); el('retry').onclick();
  time = 1000; c.onpointerdown(pointer(200, 574)); c.onpointermove(pointer(200, 634)); draw(1350);
  assert.match(el('aimHint').textContent, /^Aim locked/);
  c.onlostpointercapture(pointer(200, 634)); c.onpointerup(pointer(200, 634)); draw(1360);
  assert.equal(el('aimControls').hidden, false); assert.deepEqual(dots, []);
  time = 1400; c.onpointerdown(pointer(200, 574)); c.onpointermove(pointer(200, 634)); draw(1750);
  window.orbitPause(); c.onpointerup(pointer(200, 634)); el('resume').onclick();
  assert.equal(el('aimControls').hidden, false); assert.doesNotMatch(el('aimHint').textContent, /^Aim locked/);
});
