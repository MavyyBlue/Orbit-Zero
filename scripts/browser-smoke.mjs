// Run after installing pinned Playwright; CI saves real phone-sized screenshots.
import { chromium } from 'playwright';
import { planetFlightSmoke } from './planet-flight-smoke.mjs';
import { workshopSmoke } from './workshop-smoke.mjs';
import assert from 'node:assert/strict';
import { mkdirSync } from 'node:fs';
const browser = await chromium.launch({ headless: true, executablePath: process.env.ORBIT_BROWSER_EXECUTABLE || undefined });
mkdirSync('build/screenshots', { recursive: true });
try {
  for (const viewport of [{ width: 320, height: 568 }, { width: 360, height: 640 }, { width: 412, height: 915 }]) {
    const context = await browser.newContext({ viewport, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
    const page = await context.newPage(), errors = [], failedAssets = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => { if (response.status() >= 400 && response.url().includes('/art/')) failedAssets.push(`${response.status()} ${response.url()}`); });
    const artLoaded = async () => {
      await page.locator('img:visible').evaluateAll(async images => { await Promise.all(images.map(image => image.decode().catch(() => {}))); });
      const broken = await page.locator('img:visible').evaluateAll(images => images.filter(image => !image.complete || image.naturalWidth === 0).map(image => image.src));
      assert.deepEqual(broken, [], `Broken images at ${viewport.width}px`);
      assert.deepEqual(failedAssets, [], `Failed art requests at ${viewport.width}px`);
    };
    await page.goto(process.env.ORBIT_BROWSER_URL || 'http://127.0.0.1:8080');
    await page.locator('#play').waitFor();
    await artLoaded();
    for (const id of ['play', 'hangar', 'settings', 'help']) {
      const box = await page.locator('#' + id).boundingBox();
      assert.ok(box && box.width >= 44 && box.height >= 44 && box.y >= 0 && box.y + box.height <= viewport.height, `Reachable home control ${id} at ${viewport.width}px`);
    }
    assert.equal(await page.locator('#home').evaluate(el => el.scrollWidth <= el.clientWidth + 1), true);
    await page.screenshot({ path: `build/screenshots/home-${viewport.width}.png` });
    await page.locator('#donate').click();
    await page.locator('.donate-tiers button').first().waitFor();
    assert.equal(await page.locator('.donate-tiers button:disabled').count(), 3);
    await artLoaded();
    await page.screenshot({ path: `build/screenshots/support-${viewport.width}.png` });
    await page.locator('#supportAbout').click();
    assert.equal(await page.locator('#panelBody').getByText('AI tools assisted', { exact: false }).count(), 1);
    await page.locator('#infoHome').click();
    await page.locator('#settings').click();
    await artLoaded();
    await page.screenshot({ path: `build/screenshots/settings-${viewport.width}.png` });
    await page.locator('#settingsBack').click();
    await page.locator('#hangar').click();
    await artLoaded();
    await page.screenshot({ path: `build/screenshots/hangar-${viewport.width}.png` });
    await page.locator('#interior-ion').click();
    await page.locator('#room-seat').waitFor();
    await page.locator('#roomColor').evaluate(el => { el.value = '#4267af'; el.dispatchEvent(new Event('input', { bubbles: true })); });
    assert.equal(await page.locator('.interior-stage').evaluate(el => getComputedStyle(el).getPropertyValue('--room-color').trim()), '#4267af');
    assert.equal(await page.locator('.interior-stage').evaluate(el => el.scrollWidth <= el.clientWidth + 1), true);
    await artLoaded();
    await page.screenshot({ path: `build/screenshots/interior-${viewport.width}.png` });
    await page.locator('#roomShop').click();
    await page.locator('#shop-filter-decal').click();
    await artLoaded();
    await page.screenshot({ path: `build/screenshots/shop-${viewport.width}.png` });
    await page.locator('#shopBack').click(); await page.locator('#roomBack').click(); await page.locator('#hangarBack').click();
    await page.locator('#settings').click();
    await page.locator('#set-sound').click(); await page.locator('#set-music').click(); await page.locator('#set-haptics').click();
    await page.locator('#settingsBack').click(); await page.reload(); await page.locator('#settings').click();
    assert.equal(await page.locator('#set-sound').getAttribute('aria-pressed'), 'false');
    await page.locator('#settingsBack').click(); await page.locator('#play').click();
    await page.locator('#pause').click(); await page.locator('#resume').click();
    await page.locator('#aimToggle').click();
    await page.locator('#angle').evaluate(el => { el.value = '0'; el.dispatchEvent(new Event('input', { bubbles: true })); });
    await page.locator('#power').evaluate(el => { el.value = '100'; el.dispatchEvent(new Event('input', { bubbles: true })); });
    await page.screenshot({ path: `build/screenshots/aim-${viewport.width}.png` });
    await page.locator('#launchButton').click();
    await page.locator('#pause').click(); await page.locator('#quit').click();
    await page.locator('#retry').waitFor(); await page.screenshot({ path: `build/screenshots/result-${viewport.width}.png` });
    await page.locator('#retry').click(); assert.equal(await page.locator('#aimControls').isVisible(), true);
    await page.locator('#pause').click(); await page.locator('#quit').click(); await page.locator('#resultHome').click();
    await page.locator('#hangar').click(); await page.locator('#hangarBack').click();
    await page.locator('#help').click(); await page.locator('#helpBack').click();
    await workshopSmoke(page, viewport);
    await planetFlightSmoke(page, viewport);
    await artLoaded();
    assert.deepEqual(errors, [], `Browser errors at ${viewport.width}px`);
    await context.close();
  }
  console.log('Browser smoke: PASS at 320×568, 360×640 and 412×915');
} finally { await browser.close(); }
