import assert from 'node:assert/strict';
export async function aimLockSmoke(page, viewport) {
  // Observe the real rendered preview without exposing production debug state.
  await page.evaluate(() => {
    const proto = CanvasRenderingContext2D.prototype, arc = proto.arc, clear = proto.clearRect;
    window.aimDots = [];
    proto.clearRect = function (...args) { window.aimDots = []; return clear.apply(this, args); };
    proto.arc = function (x, y, radius, ...args) { if (radius === 1.6) window.aimDots.push([x, y]); return arc.call(this, x, y, radius, ...args); };
  });
  const touch = await page.context().newCDPSession(page);
  const send = (type, x, y) => touch.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' || type === 'touchCancel' ? [] : [{ x, y }] });
  const dots = async () => { await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))); return page.evaluate(() => window.aimDots); };
  async function exercise(custom = false) {
    if (await page.locator('#assist').isVisible()) await page.locator('#aimToggle').click();
    const r = await page.locator('#space').boundingBox();
    const ww = custom ? 1000 : 400, wh = custom ? 2000 : 720, top = custom ? 100 : 0;
    const available = custom ? Math.max(80, r.height - top - 110) : r.height;
    const scale = Math.min((r.width - (custom ? 24 : 0)) / ww, available / wh);
    const x = r.x + r.width / 2, y = r.y + top + (available - wh * scale) / 2 + (custom ? .6 * wh : 574) * scale;
    await send('touchStart', x, y); await send('touchMove', x, y + 25);
    const initial = await dots(); assert.ok(initial.length, 'moving produces prediction');
    await page.waitForFunction(() => document.getElementById('aimHint').textContent.startsWith('Aim locked'));
    const frozen = await dots(); assert.deepEqual(frozen, initial);
    await send('touchMove', x + 3, y + 28); assert.deepEqual(await dots(), frozen, 'finger drift changes neither angle nor speed');
    await page.screenshot({ path: `build/screenshots/aim-lock-${custom ? 'custom-' : ''}${viewport.width}.png` });
    await send('touchMove', x + 14, y + 35);
    // Slow software rendering may relock before the next DOM observation.
    // A changed exact preview proves intentional movement was accepted.
    const adjusted = await dots(); assert.notDeepEqual(adjusted, frozen, 'intentional move adjusts prediction');
    await page.waitForFunction(() => document.getElementById('aimHint').textContent.startsWith('Aim locked'));
    await send('touchMove', x + 17, y + 38); assert.deepEqual(await dots(), adjusted, 'adjusted aim relocks');
    await send('touchEnd'); assert.equal(await page.locator('#aimControls').isVisible(), false, 'release launches');
    await page.locator('#pause').click(); await page.locator('#quit').click(); await page.locator(custom ? '#customHome' : '#resultHome').click();
  }
  try {
    await page.locator('#play').click(); await exercise();
    // A locked gesture must also be discarded on cancellation/background pause.
    await page.locator('#play').click();
    const r = await page.locator('#space').boundingBox(), scale = Math.min(r.width / 400, r.height / 720);
    const x = r.x + r.width / 2, y = r.y + (r.height - 720 * scale) / 2 + 574 * scale;
    await send('touchStart', x, y); await send('touchMove', x, y + 25);
    await page.waitForFunction(() => document.getElementById('aimHint').textContent.startsWith('Aim locked'));
    await send('touchCancel'); assert.equal(await page.locator('#aimControls').isVisible(), true);
    assert.deepEqual(await dots(), []); assert.doesNotMatch(await page.locator('#aimHint').textContent(), /Aim locked/);
    await send('touchStart', x, y); await send('touchMove', x, y + 25);
    await page.waitForFunction(() => document.getElementById('aimHint').textContent.startsWith('Aim locked'));
    await page.evaluate(() => window.orbitPause()); await send('touchEnd');
    await page.locator('#resume').click(); assert.equal(await page.locator('#aimControls').isVisible(), true);
    assert.doesNotMatch(await page.locator('#aimHint').textContent(), /Aim locked/);
    await page.locator('#pause').click(); await page.locator('#quit').click(); await page.locator('#resultHome').click();
    await page.evaluate(() => {
      const draft = { version: 1, id: '', name: 'Aim zoom test', width: 1000, height: 2000, gravity: 1, speed: 1.7, duration: 60, instantRespawn: false, planets: [], stars: [], start: { x: .5, y: .6 }, exit: { x: .5, y: .1, radius: 27 } };
      const library = JSON.parse(localStorage.getItem('orbit-zero.workshop.v1'));
      library.draft = draft; localStorage.setItem('orbit-zero.workshop.v1', JSON.stringify(library));
    });
    await page.reload();
    // Reload resets the instrumentation; reinstall it before the custom case.
    await page.evaluate(() => {
      const proto = CanvasRenderingContext2D.prototype, arc = proto.arc, clear = proto.clearRect;
      window.aimDots = [];
      proto.clearRect = function (...args) { window.aimDots = []; return clear.apply(this, args); };
      proto.arc = function (x, y, radius, ...args) { if (radius === 1.6) window.aimDots.push([x, y]); return arc.call(this, x, y, radius, ...args); };
    });
    const progress = await page.evaluate(() => localStorage.getItem('orbit-zero.save.v1'));
    await page.locator('#workshop').click(); await page.locator('#workshopPlay').click(); await exercise(true);
    assert.equal(await page.evaluate(() => localStorage.getItem('orbit-zero.save.v1')), progress, 'custom gesture never changes normal saves');
  } finally { await touch.detach(); }
}
