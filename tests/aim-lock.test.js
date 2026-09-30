import test from 'node:test';
import assert from 'node:assert/strict';
import { AimLock } from '../web/aim-lock.js';

test('settles only a valid aim and tolerates small touch noise', () => {
  const lock = new AimLock(100, 100, 0);
  assert.equal(lock.settle(1000, false), false);
  assert.equal(lock.move(100, 160, 1000, false), true);
  assert.equal(lock.move(101, 160, 1100, true), true);
  assert.equal(lock.settle(1349, true), false);
  assert.equal(lock.settle(1350, true), true);
  assert.equal(lock.move(104, 164, 1400, true), false);
  assert.equal(lock.move(101, 168, 1450, true), false);
  assert.equal(lock.locked, true);
});

test('deliberate movement unlocks, adjusts and can settle repeatedly', () => {
  const lock = new AimLock(0, 0, 0);
  lock.move(0, 60, 20, false);
  assert.equal(lock.settle(370, true), true);
  assert.equal(lock.move(9, 60, 400, true), true);
  assert.equal(lock.locked, false);
  assert.equal(lock.move(15, 80, 450, true), true);
  assert.equal(lock.settle(799, true), false);
  assert.equal(lock.settle(800, true), true);
  assert.equal(lock.move(15, 83, 900, true), false);
  assert.equal(lock.move(15, 89, 1000, true), true);
  assert.equal(lock.settle(1350, true), true);
});

test('slow continuous motion does not settle; unlock distance is cumulative', () => {
  const lock = new AimLock(0, 0, 0);
  for (let i = 1; i <= 30; i++) {
    assert.equal(lock.move(i, 0, i * 50, true), true);
    assert.equal(lock.locked, false);
  }
  assert.equal(lock.settle(1850, true), true);
  for (let i = 1; i <= 8; i++) assert.equal(lock.move(30 + i, 0, 1900 + i * 50, true), false);
  assert.equal(lock.move(39, 0, 2400, true), true);
});

test('event arriving after a quiet hold locks even before the next frame', () => {
  const lock = new AimLock(0, 0, 0);
  lock.move(20, 60, 10, false);
  assert.equal(lock.move(21, 60, 360, true), false);
  assert.equal(lock.locked, true);
});
