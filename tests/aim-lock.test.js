import test from 'node:test';
import assert from 'node:assert/strict';
import { AimDeadZone, normalizeAimDeadZone } from '../web/aim-lock.js';
test('dead zone ignores small moves and accepts movement beyond threshold immediately', () => {
  const d = new AimDeadZone(100, 100);
  assert.equal(d.move(100, 160, 2, false), true);
  assert.equal(d.move(101, 160, 2, true), false);
  assert.equal(d.move(102, 160, 2, true), false);
  assert.equal(d.move(103, 160, 2, true), true);
  assert.equal(d.move(103, 161, 2, true), false);
});
test('slow movement accumulates relative to last accepted point', () => {
  const d = new AimDeadZone(0, 0);
  for (let i = 1; i <= 12; i++) assert.equal(d.move(i, 0, 2, true), i % 3 === 0);
});
test('zero restores all pointer updates and no-aim gestures retain existing launch deadzone', () => {
  const d = new AimDeadZone(0, 0);
  assert.equal(d.move(.1, 0, 0, true), true);
  assert.equal(d.move(.2, 0, 0, true), true);
  assert.equal(d.move(.3, 0, 12, false), true);
});
test('dead-zone setting has safe default, integer values and bounded range', () => {
  for (const v of [undefined, null, true, '4', NaN, Infinity]) assert.equal(normalizeAimDeadZone(v), 2);
  assert.equal(normalizeAimDeadZone(-2), 0); assert.equal(normalizeAimDeadZone(99), 12);
  assert.equal(normalizeAimDeadZone(3.7), 4);
});
