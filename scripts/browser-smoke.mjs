// Run after installing pinned Playwright; CI saves real phone-sized screenshots.
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdirSync } from 'node:fs';
const browser = await chromium.launch({ headless: true });
mkdirSync('build/screenshots', { recursive: true });
try {
  for (const viewport of [{ width: 360, height: 640 }, { width: 412, height: 915 }]) {
    const context = await browser.newContext({ viewport, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
    const page = await context.newPage(), errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('http://127.0.0.1:8080');
    await page.locator('#play').waitFor();
    await page.screenshot({ path: `build/screenshots/home-${viewport.width}.png` });
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
    assert.deepEqual(errors, [], `Browser errors at ${viewport.width}px`);
    await context.close();
  }
  console.log('Browser smoke: PASS at 360×640 and 412×915');
} finally { await browser.close(); }
