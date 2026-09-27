import test from 'node:test';
import assert from 'node:assert/strict';
import { freshSave, parseSave, loadSave, writeSave, buySkin, buyDecor, equipDecor, roomFor, setRoomColor, SKINS } from '../web/save.js';
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

test('old unlocks survive and new silhouettes have distinct styles', () => {
  const old = freshSave(); old.skin = 'violet'; old.owned = ['ion', 'ember', 'violet'];
  const migrated = parseSave(JSON.stringify(old));
  assert.equal(migrated.skin, 'violet'); assert.deepEqual(migrated.owned, old.owned);
  assert.equal(new Set(SKINS.map(s => s.shape)).size, SKINS.length);
  migrated.shards = 180; assert.equal(buySkin(migrated, 'orbit'), true);
  assert.equal(parseSave(JSON.stringify(migrated)).skin, 'orbit');
});
test('decor unlocks once, remains cosmetic, and old saves gain safe rooms', () => {
  const old = JSON.stringify({ version: 1, shards: 400, owned: ['ion', 'ember'], skin: 'ember' });
  const s = parseSave(old);
  assert.deepEqual(s.decorOwned, []); assert.deepEqual(s.rooms, {});
  assert.equal(buyDecor(s, 'flare', 'orb_cushion'), false, 'locked ship has no room');
  assert.equal(buyDecor(s, 'ion', 'hammock'), false, 'insufficient stardust');
  assert.equal(buyDecor(s, 'ion', 'orb_cushion'), true); assert.equal(s.shards, 200);
  assert.equal(buyDecor(s, 'ember', 'orb_cushion'), true); assert.equal(s.shards, 200, 'owned decor is not charged twice');
  assert.equal(roomFor(s, 'ember').slots.seat, 'orb_cushion');
  assert.equal(equipDecor(s, 'ion', 'unowned'), false);
  assert.equal(setRoomColor(s, 'ion', '#4267af'), true);
  assert.equal(setRoomColor(s, 'ion', 'url(evil)'), false);
  const restored = parseSave(JSON.stringify(s));
  assert.deepEqual(restored.decorOwned, ['orb_cushion']);
  assert.equal(restored.rooms.ion.color, '#4267af');
  assert.equal(restored.rooms.ember.slots.seat, 'orb_cushion');
  s.rooms.ion.slots.console = 'orb_cushion'; s.rooms.ion.color = 'red';
  assert.equal(parseSave(JSON.stringify(s)).rooms.ion.slots.console, undefined);
  assert.equal(parseSave(JSON.stringify(s)).rooms.ion.color, SKINS[0].color);
});
