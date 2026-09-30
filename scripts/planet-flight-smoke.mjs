import assert from 'node:assert/strict';
export async function planetFlightSmoke(page, viewport) {
  await page.evaluate(() => {
    const d = { version: 1, id: '', name: 'Orbit capture test', width: 400, height: 720, gravity: 1, speed: 1, duration: 10, instantRespawn: false, planets: [{ x: .5, y: .55, radius: 24, gravity: 1, kind: 'orbiter', config: { reach: 85, orbitStrength: 1, orbitTime: 1.6, releaseBoost: 90 } }], stars: [], start: { x: .7, y: .55 }, exit: { x: .1, y: .15, radius: 27 } };
    localStorage.setItem('orbit-zero.workshop.v1', JSON.stringify({ version: 1, levels: [], draft: d }));
  });
  await page.reload(); await page.locator('#workshop').click(); await page.locator('#workshopPlay').click();
  if (!await page.locator('#assist').isVisible()) await page.locator('#aimToggle').click();
  await page.locator('#angle').evaluate(el => { el.value = '0'; el.dispatchEvent(new Event('input', { bubbles: true })); });
  await page.locator('#launchButton').click();
  await page.waitForFunction(() => document.getElementById('toast').textContent === 'ORBIT LOCK');
  await page.screenshot({ path: `build/screenshots/orbit-lock-${viewport.width}.png` });
  await page.locator('#pause').click();
  await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 1800)));
  assert.equal(await page.locator('#resume').isVisible(), true);
  await page.locator('#resume').click();
  await page.waitForFunction(() => document.getElementById('toast').textContent === 'ORBIT RELEASE', null, { timeout: 5000 });
  await page.locator('#pause').click(); await page.locator('#quit').click(); await page.locator('#customHome').click();
}
