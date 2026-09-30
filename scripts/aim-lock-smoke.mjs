// Filename retained for safe replacement of the previously imported package.
import assert from 'node:assert/strict';
export async function deadZoneSmoke(page, viewport) {
  const set = value => page.locator('#aimDeadZone').evaluate((el, v) => { el.value = String(v); el.dispatchEvent(new Event('input', { bubbles: true })); }, value);
  await page.locator('#settings').click();
  assert.equal(await page.locator('#aimDeadZone').inputValue(), '2');
  await page.locator('#aimDeadZone').scrollIntoViewIfNeeded();
  await set(4); assert.equal(await page.locator('#aimDeadZoneValue').textContent(), '4 px');
  await page.screenshot({ path: `build/screenshots/aim-deadzone-setting-${viewport.width}.png` });
  await page.locator('#set-contrast').click(); assert.equal(await page.locator('#aimDeadZone').inputValue(), '4');
  await page.locator('#settingsBack').click(); await page.reload();
  await page.locator('#settings').click(); assert.equal(await page.locator('#aimDeadZone').inputValue(), '4');
  await page.locator('#settingsBack').click();
  async function observe() {
    await page.evaluate(() => {
      const proto = CanvasRenderingContext2D.prototype, arc = proto.arc, clear = proto.clearRect;
      window.aimDots = [];
      proto.clearRect = function (...args) { window.aimDots = []; return clear.apply(this, args); };
      proto.arc = function (x, y, radius, ...args) { if (radius === 1.6) window.aimDots.push([x, y]); return arc.call(this, x, y, radius, ...args); };
    });
  }
  await observe();
  const touch = await page.context().newCDPSession(page);
  const send = (type, x, y) => touch.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' || type === 'touchCancel' ? [] : [{ x, y }] });
  const dots = async () => { await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)))); return page.evaluate(() => window.aimDots); };
  async function exercise(custom = false, off = false) {
    if (await page.locator('#assist').isVisible()) await page.locator('#aimToggle').click();
    const r = await page.locator('#space').boundingBox();
    const ww = custom ? 1000 : 400, wh = custom ? 2000 : 720, top = custom ? 100 : 0;
    const available = custom ? Math.max(80, r.height - top - 110) : r.height;
    const scale = Math.min((r.width - (custom ? 24 : 0)) / ww, available / wh);
    const x = r.x + r.width / 2, y = r.y + top + (available - wh * scale) / 2 + (custom ? .6 * wh : 574) * scale;
    await send('touchStart', x, y); await send('touchMove', x, y + 25);
    const initial = await dots(); assert.ok(initial.length, 'moving produces prediction');
    await page.evaluate(() => new Promise(r => setTimeout(r, 450)));
    assert.doesNotMatch(await page.locator('#aimHint').textContent(), /lock/i);
    await send('touchMove', x + 1, y + 26);
    if (off) assert.notDeepEqual(await dots(), initial, 'zero restores small adjustments');
    else assert.deepEqual(await dots(), initial, 'chosen dead zone filters drift at any zoom');
    await send('touchMove', x + 6, y + 31);
    const adjusted = await dots(); assert.notDeepEqual(adjusted, initial, 'movement beyond dead zone adjusts without a timer');
    await send('touchEnd'); assert.equal(await page.locator('#aimControls').isVisible(), false, 'release launches');
    await page.locator('#pause').click(); await page.locator('#quit').click(); await page.locator(custom ? '#customHome' : '#resultHome').click();
  }
  try {
    await page.locator('#play').click(); await exercise();
    await page.evaluate(() => {
      const draft = { version: 1, id: '', name: 'Aim zoom test', width: 1000, height: 2000, gravity: 1, speed: 1.7, duration: 60, instantRespawn: false, planets: [], stars: [], start: { x: .5, y: .6 }, exit: { x: .5, y: .1, radius: 27 } };
      const library = JSON.parse(localStorage.getItem('orbit-zero.workshop.v1'));
      library.draft = draft; localStorage.setItem('orbit-zero.workshop.v1', JSON.stringify(library));
    });
    await page.reload(); await observe();
    const progress = await page.evaluate(() => localStorage.getItem('orbit-zero.save.v1'));
    await page.locator('#workshop').click(); await page.locator('#workshopPlay').click(); await exercise(true);
    assert.equal(await page.evaluate(() => localStorage.getItem('orbit-zero.save.v1')), progress, 'custom gesture preserves normal saves');
    await page.locator('#settings').click(); await set(0); await page.locator('#settingsBack').click();
    await page.reload(); await observe(); await page.locator('#settings').click();
    assert.equal(await page.locator('#aimDeadZone').inputValue(), '0'); assert.equal(await page.locator('#aimDeadZoneValue').textContent(), 'Off');
    await page.locator('#settingsBack').click(); await page.locator('#play').click(); await exercise(false, true);
  } finally { await touch.detach(); }
}
