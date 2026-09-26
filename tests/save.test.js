import test from 'node:test';
import assert from 'node:assert/strict';
import { freshSave, parseSave, loadSave, writeSave, buySkin } from '../web/save.js';
test('missing, corrupt and future saves fall back without throwing', () => {
  for (const raw of [null, '', '{broken', '{}', '{"version":99}', 'null']) assert.deepEqual(parseSave(raw), freshSave());
});
test('save roundtrip and sanitization', () => {
  const s = freshSave(); s.best = 3200; s.shards = 50; s.settings.sound = false;
  assert.deepEqual(parseSave(JSON.stringify(s)), s);
  s.best = -90; s.runs = 'bad'; s.skin = 'unknown'; s.settings.music = 'yes';
  const clean = parseSave(JSON.stringify(s)); assert.equal(clean.best, 0); assert.equal(clean.runs, 0); assert.equal(clean.skin, 'ion'); assert.equal(clean.settings.music, true);
});
test('cosmetic purchase cannot overdraw or charge twice', () => {
  const s = freshSave(); assert.equal(buySkin(s, 'ember'), false); assert.equal(buySkin(s, 'made-up'), false);
  s.shards = 40; assert.equal(buySkin(s, 'ember'), true); assert.equal(s.shards, 5); assert.equal(buySkin(s, 'ember'), true); assert.equal(s.shards, 5);
});
test('storage errors are explicit; saves persist through reload', () => {
  const blocked = { getItem() { throw Error(); }, setItem() { throw Error(); } };
  assert.equal(loadSave(blocked).available, false); assert.equal(writeSave(blocked, freshSave()), false);
  const map = new Map(), storage = { getItem: k => map.get(k), setItem: (k, v) => map.set(k, v) };
  const s = freshSave(); s.gates = 9; assert.ok(writeSave(storage, s)); assert.equal(loadSave(storage).save.gates, 9);
});
