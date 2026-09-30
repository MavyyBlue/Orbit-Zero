// Real DOM/touch/viewport test; also called by browser-smoke in CI.
import assert from 'node:assert/strict';
export async function workshopSmoke(page, viewport) {
  await page.locator('#workshop').click();
  await page.locator('#workshopPlay').waitFor();
  assert.equal(await page.locator('#workshopUI').isVisible(), true);
  assert.equal(await page.locator('#hud').isVisible(), false);
  await page.screenshot({ path: `build/screenshots/workshop-${viewport.width}.png` });
  await page.locator('#levelConfig summary').click();
  await page.locator('#levelName').fill('My ice arcade'); await page.locator('#levelName').press('Tab');
  const set = async (id, value) => page.locator('#cfg-' + id).evaluate((el, v) => { el.value = String(v); el.dispatchEvent(new Event('input', { bubbles: true })); }, value);
  await set('width', 700); await set('height', 1200); await set('gravity', 1.7); await set('speed', 1.35); await set('duration', 28);
  await page.locator('#instantRespawn').check();
  await page.locator('#levelConfig').evaluate(el => { el.scrollTop = 0; });
  await page.screenshot({ path: `build/screenshots/workshop-config-${viewport.width}.png` });
  await page.locator('#levelConfig summary').click();
  await page.locator('#tool-planet').click();
  // Viewport fit: the current arena is centered between tools and config.
  const rect = await page.locator('#space').boundingBox();
  const configHeight = await page.locator('#levelConfig').evaluate(el => el.getBoundingClientRect().height);
  const available = rect.height - 140 - 84 - configHeight;
  const scale = Math.min((rect.width - 24) / 700, available / 1200);
  const ox = rect.x + (rect.width - 700 * scale) / 2, oy = rect.y + 140 + (available - 1200 * scale) / 2;
  await page.touchscreen.tap(ox + 700 * .82 * scale, oy + 1200 * .4 * scale);
  await page.locator('#tool-select').click();
  const touch = await page.context().newCDPSession(page);
  const tx = ox + 700 * .82 * scale, ty = oy + 1200 * .4 * scale;
  await touch.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: tx, y: ty }] });
  await touch.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: tx - 15, y: ty + 10 }] });
  await touch.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await touch.detach();
  await page.locator('#levelConfig summary').click();
  await set('planetGravity', 2.2); await set('planetRadius', 31); await page.locator('#planetType').selectOption('ice');
  await page.locator('#levelConfig summary').click();
  await page.locator('#workshopSave').click();
  const key = 'orbit-zero.workshop.v1';
  const saved = await page.evaluate(k => JSON.parse(localStorage.getItem(k)), key);
  assert.equal(saved.levels.length, 1); assert.equal(saved.levels[0].planets.length, 4);
  assert.ok(saved.levels[0].planets[3].x < .82, 'Touch drag moves the placed planet');
  assert.equal(saved.levels[0].planets[3].gravity, 2.2); assert.equal(saved.levels[0].speed, 1.35); assert.equal(saved.levels[0].instantRespawn, true);
  await page.locator('#workshopHome').click(); await page.reload(); await page.locator('#workshop').click();
  await page.locator('#workshopLibrary').click();
  await page.screenshot({ path: `build/screenshots/workshop-library-${viewport.width}.png` });
  await page.locator('[data-load]').click();
  await page.locator('#levelConfig summary').click();
  assert.equal(await page.locator('#cfg-width').inputValue(), '700'); assert.equal(await page.locator('#cfg-speed').inputValue(), '1.35');
  assert.equal(await page.locator('#instantRespawn').isChecked(), true);
  await page.locator('#levelConfig summary').click();
  // Create an unsaved change and prove opening another saved entry asks first.
  await page.locator('#tool-star').click(); await page.mouse.click(ox + 700 * .75 * scale, oy + 1200 * .5 * scale);
  await page.locator('#workshopLibrary').click(); await page.locator('[data-load]').click();
  assert.equal(await page.locator('#confirmOpen').isVisible(), true);
  await page.locator('#confirmOpen').click();
  const progressBefore = await page.evaluate(() => localStorage.getItem('orbit-zero.save.v1'));
  await page.locator('#workshopPlay').click();
  assert.match(await page.locator('#sectorLabel').textContent(), /SANDBOX/);
  if (!await page.locator('#assist').isVisible()) await page.locator('#aimToggle').click();
  // Instant respawn: fire toward the nearest planet from the custom launch point.
  const solution = await page.evaluate(async k => {
    const { levelWorld } = await import('/workshop.js'); const { createFlight, advance } = await import('/simulation.js');
    const w = levelWorld(JSON.parse(localStorage.getItem(k)).draft);
    for (let power = 100; power >= 40; power -= 20) for (let angle = -180; angle < 180; angle += 5) {
      const a = angle * Math.PI / 180, speed = power / 100 * 368 * w.speed;
      const s = createFlight({ vx: Math.sin(a) * speed, vy: -Math.cos(a) * speed }, w);
      for (let i = 0; i < 600 && s.status === 'flight'; i++) advance(s, w);
      if (s.status === 'crash') return { angle, power };
    }
    throw Error('No fast collision test route');
  }, key);
  await page.locator('#angle').evaluate((el, a) => { el.value = String(a); el.dispatchEvent(new Event('input', { bubbles: true })); }, solution.angle);
  await page.locator('#power').evaluate((el, p) => { el.value = String(p); el.dispatchEvent(new Event('input', { bubbles: true })); }, solution.power);
  await page.locator('#launchButton').click();
  await page.locator('#aimControls').waitFor({ state: 'visible', timeout: 12000 });
  assert.equal(await page.locator('#panel').isVisible(), false, 'Instant retry bypasses results');
  await page.locator('#pause').click(); await page.locator('#quit').click(); await page.locator('#customRetry').waitFor();
  assert.equal(await page.evaluate(() => localStorage.getItem('orbit-zero.save.v1')), progressBefore, 'Custom run must not write normal progress');
  await page.locator('#customEdit').click();
  // Delete requires explicit confirmation and survives reopening the library.
  await page.locator('#workshopLibrary').click(); await page.locator('[data-delete]').click();
  assert.equal(await page.locator('.library-card').count(), 1); await page.locator('#confirmDelete').click();
  assert.equal(await page.locator('.library-card').count(), 0);
  await page.locator('#libraryBack').click(); await page.locator('#workshopHome').click();
  await page.evaluate(k => {
    const d = { version: 1, id: '', name: 'Clear test', width: 400, height: 720, gravity: 0, speed: 1, duration: 5, instantRespawn: false, planets: [], stars: [{ x: .5, y: .5 }], start: { x: .5, y: .8 }, exit: { x: .5, y: .2, radius: 27 } };
    localStorage.setItem(k, JSON.stringify({ version: 1, levels: [], draft: d }));
  }, key);
  await page.reload(); await page.locator('#workshop').click(); await page.locator('#workshopPlay').click();
  if (!await page.locator('#assist').isVisible()) await page.locator('#aimToggle').click();
  await page.locator('#angle').evaluate(el => { el.value = '0'; el.dispatchEvent(new Event('input', { bubbles: true })); });
  await page.locator('#power').evaluate(el => { el.value = '100'; el.dispatchEvent(new Event('input', { bubbles: true })); });
  await page.locator('#launchButton').click(); await page.locator('#customRetry').waitFor();
  assert.match(await page.locator('#panelBody').textContent(), /Orbit cleared/);
  assert.equal(await page.evaluate(() => localStorage.getItem('orbit-zero.save.v1')), progressBefore);
  await page.locator('#customRetry').click();
  await page.locator('#angle').evaluate(el => { el.value = '90'; el.dispatchEvent(new Event('input', { bubbles: true })); });
  await page.locator('#launchButton').click(); await page.locator('#customRetry').waitFor();
  assert.match(await page.locator('#panelBody').textContent(), /Lost to the quiet/);
  await page.locator('#customHome').click();
}
