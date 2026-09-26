// Lightweight DOM contract test. Real rendering/touch is separately tested in CI.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { encounter, createFlight, advance } from '../web/simulation.js';

test('complete UI voyage, pause, retry, save restoration data and cosmetic/settings menus', async () => {
  const elements = new Map(), listeners = {}, storage = new Map(); let frame;
  const context = new Proxy({}, { get: (_, k) => k === 'createRadialGradient' ? () => ({ addColorStop() {} }) : () => {}, set: () => true });
  function parse(html) { for (const match of html.matchAll(/<[^>]*\bid="([^"]+)"[^>]*>/g)) { const id = match[1]; if (!elements.has(id)) elements.set(id, new Element(id)); const e = elements.get(id); e.hidden = /\bhidden\b/.test(match[0]); const value = match[0].match(/value="([^"]*)"/); if (value) e.value = value[1]; } }
  class Element {
    constructor(id) { this.id = id; this.hidden = false; this.value = ''; this.textContent = ''; this.classList = { toggle() {} }; }
    set innerHTML(s) { this.html = s; parse(s); }
    get innerHTML() { return this.html || ''; }
    getBoundingClientRect() { return { width: 400, height: 720, left: 0, top: 0 }; }
    getContext() { return context; }
    setPointerCapture() {}
  }
  parse(readFileSync(new URL('../web/index.html', import.meta.url), 'utf8'));
  globalThis.document = { getElementById: id => { assert.ok(elements.has(id), `Missing element ${id}`); return elements.get(id); }, addEventListener: (event, f) => { listeners[event] = f; }, hidden: false };
  globalThis.window = { localStorage: { getItem: k => storage.get(k), setItem: (k, v) => storage.set(k, v) } };
  globalThis.ResizeObserver = class { constructor(f) { this.f = f; } observe() { this.f(); } };
  globalThis.devicePixelRatio = 1;
  globalThis.requestAnimationFrame = f => { frame = f; };
  Object.defineProperty(globalThis, 'crypto', { configurable: true, value: { getRandomValues: a => { a[0] = 57; return a; } } });
  const el = id => elements.get(id), click = id => { assert.equal(typeof el(id)?.onclick, 'function', id); el(id).onclick(); };
  await import('../web/game.js');
  assert.equal(el('home').hidden, false);
  click('help'); assert.match(el('panelBody').innerHTML, /exact same physics/); click('helpBack');
  click('settings'); click('set-sound'); click('set-music'); click('set-haptics'); click('settingsBack');
  click('play'); assert.equal(el('aimControls').hidden, false);
  click('pause'); click('pauseSettings'); click('settingsBack'); click('resume');
  click('aimToggle');
  let time = 0;
  function frames(n) { for (let i = 0; i < n; i++) frame(time += 1000 / 60); }
  for (let sector = 1; sector <= 12; sector++) {
    const w = encounter(57, sector), { angle, power } = w.reference, rad = angle * Math.PI / 180;
    const solution = createFlight({ vx: Math.sin(rad) * power / 100 * 368, vy: -Math.cos(rad) * power / 100 * 368 });
    for (let i = 0; i < 1681 && solution.status === 'flight'; i++) advance(solution, w);
    assert.equal(solution.status, 'gate', `sector ${sector} solvable`);
    assert.equal(solution.collected.length, 3, `sector ${sector} stars reachable`);
    el('angle').value = angle; el('power').value = power; el('angle').oninput(); click('launchButton');
    if (sector === 1) { frames(3); click('pause'); const score = el('score').textContent; frames(300); assert.equal(el('score').textContent, score); click('resume'); }
    frames(Math.ceil((solution.age + 1) * 60));
    if (sector < 12) { assert.equal(el('panel').hidden, true); assert.match(el('sectorLabel').textContent, new RegExp(String(sector + 1).padStart(2, '0'))); }
  }
  assert.match(el('panelBody').innerHTML, /VOYAGE COMPLETE/);
  const saved = JSON.parse(storage.get('orbit-zero.save.v1'));
  assert.equal(saved.victories, 1); assert.equal(saved.gates, 12); assert.equal(saved.runs, 1); assert.ok(saved.best >= 6000);
  click('retry'); assert.equal(el('panel').hidden, true); click('pause'); click('quit'); click('resultHome');
  click('hangar'); assert.match(el('panelBody').innerHTML, /Zero to infinity/); click('hangarBack');
  click('daily'); assert.match(el('sectorLabel').textContent, /DAILY/);
  // Pointer cancellation must not launch.
  const c = el('space'); c.onpointerdown({ clientX: 200, clientY: 574, pointerId: 1 }); c.onpointermove({ clientX: 200, clientY: 670, pointerId: 1 }); c.onpointercancel(); c.onpointerup({ pointerId: 1 });
  assert.equal(el('aimControls').hidden, false);
  document.hidden = true; listeners.visibilitychange(); assert.match(el('panelBody').innerHTML, /Orbit on hold/);
});
