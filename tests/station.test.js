import test from 'node:test';
import assert from 'node:assert/strict';
import { StationGesture } from '../web/station-input.js';
import { defaultStationCamera, normalizeStation } from '../web/station-model.js';
import { parseSave, freshSave, writeSave, loadSave } from '../web/save.js';

test('station migration preserves old progress and clamps cosmetic state without granting currency', () => {
  const legacy = { version: 1, shards: 77, best: 2100, owned: ['ion', 'ember'], skin: 'ember', decorOwned: ['orb_cushion'], settings: { aimDeadZone: 0, sound: false } };
  const save = parseSave(JSON.stringify(legacy));
  assert.deepEqual(save.station, { version: 1, camera: defaultStationCamera() });
  assert.equal(save.shards, 77); assert.equal(save.skin, 'ember'); assert.equal(save.best, 2100);
  assert.deepEqual(save.decorOwned, legacy.decorOwned); assert.equal(save.settings.aimDeadZone, 0); assert.equal(save.settings.sound, false);
  save.station.camera = { x: 3, z: -2, zoom: 1.4 };
  const map = new Map(), storage = { getItem: k => map.get(k), setItem: (k, v) => map.set(k, v) };
  assert.ok(writeSave(storage, save)); assert.deepEqual(loadSave(storage).save, parseSave(JSON.stringify(save)));
  assert.deepEqual(parseSave(JSON.stringify(loadSave(storage).save)), loadSave(storage).save, 'migration is stable');
  assert.deepEqual(normalizeStation({ version: 1, camera: { x: 99, z: -99, zoom: 99 } }).camera, { x: 4, z: -4, zoom: 1.8 });
  assert.deepEqual(normalizeStation({ version: 1, camera: { x: NaN, z: '2', zoom: Infinity } }).camera, defaultStationCamera());
  assert.deepEqual(normalizeStation({ version: 999 }), freshSave().station);
});
function fixture() {
  const taps = [], pans = [], zooms = [];
  const gesture = new StationGesture({ onPan: (...v) => pans.push(v), onZoom: (...v) => zooms.push(v), onTap: (...v) => taps.push(v) });
  return { gesture, taps, pans, zooms };
}
test('station taps open systems while drags, distant releases and other-finger releases do not', () => {
  const { gesture: g, taps, pans } = fixture();
  g.down(1, 20, 30); g.move(1, 22, 32); g.up(99, 22, 32); assert.equal(taps.length, 0);
  g.up(1, 22, 32); assert.deepEqual(taps, [[22, 32]]); assert.equal(pans.length, 0);
  g.down(1, 20, 30); g.move(1, 42, 30); g.move(1, 20, 30); g.up(1, 20, 30);
  assert.equal(taps.length, 1); assert.equal(pans.length, 2, 'returning to origin still counts as a drag');
  g.down(1, 20, 30); g.up(1, 100, 30); assert.equal(taps.length, 1);
});
test('pinch tracks scale and center while suppressing taps after either finger lifts', () => {
  const { gesture: g, taps, zooms } = fixture();
  g.down(1, 0, 0); g.down(2, 100, 0); g.move(2, 150, 0);
  assert.deepEqual(zooms[0], [1.5, 75, 0]); g.up(1, 0, 0); g.up(2, 150, 0); assert.equal(taps.length, 0);
  g.down(1, 0, 0); g.down(2, 0, 0); g.move(2, 20, 0); assert.ok(zooms.every(([factor]) => Number.isFinite(factor)));
  g.cancel(); g.up(2, 20, 0); assert.equal(taps.length, 0);
});
test('cancelled gestures cannot select a building and fresh gestures work afterward', () => {
  const { gesture: g, taps } = fixture();
  g.down(1, 50, 50); g.up(1, 50, 50, true); assert.equal(taps.length, 0);
  g.down(1, 50, 50); g.cancel(); g.up(1, 50, 50); assert.equal(taps.length, 0);
  g.down(1, 50, 50); g.up(1, 50, 50); assert.equal(taps.length, 1);
});
