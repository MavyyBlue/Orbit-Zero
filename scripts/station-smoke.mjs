import assert from 'node:assert/strict';

export async function stationSmoke(page, viewport) {
  const save = () => page.evaluate(() => JSON.parse(localStorage.getItem('orbit-zero.save.v1')));
  const camera = () => page.locator('#stationViewport').evaluate(el => JSON.parse(el.dataset.camera));
  const open = async () => {
    await page.locator('#stationEntry').click();
    await page.waitForFunction(() => document.getElementById('stationViewport').dataset.renderer === 'ready');
    assert.equal(await page.locator('#stationCanvas').count(), 1);
    assert.equal(await page.locator('#space').isVisible(), false);
  };
  const returned = async () => {
    await page.waitForFunction(() => document.getElementById('stationViewport').dataset.renderer === 'ready');
    assert.equal(await page.locator('#stationCanvas').count(), 1);
  };
  await open(); await page.locator('#stationReset').click();
  assert.equal(await page.locator('.station-buildings').count(), 0, 'no duplicate building button grid');
  assert.ok((await page.locator('#stationCanvas').boundingBox()).height > viewport.height * .6, 'outpost owns most of the screen');
  // World-space contact points on the actual integrated assets. Projection only
  // supplies screen inputs; routing must come from the renderer's real raycast.
  const contacts = await page.evaluate(async () => {
    const THREE = await import('./vendor/three.module.min.js');
    const r = document.getElementById('stationCanvas').getBoundingClientRect();
    const aspect = r.width / r.height, half = Math.max(5.5, 8 / aspect);
    const c = new THREE.OrthographicCamera(-half * aspect, half * aspect, half, -half, .1, 100);
    c.position.set(9, 11, 16); c.lookAt(0, .3, 0); c.updateMatrixWorld();
    return [['engineering_bay', 3.3, 1.34, -2], ['stardust_harvester', -3.8, .7, 3.5], ['astronaut_station', -4.1, 1, -.5], ['martian_garden', 4.1, .6, 1]].map(([id, x, y, z]) => {
      const p = new THREE.Vector3(x, y, z).project(c);
      return { id, x: r.left + (p.x + 1) * r.width / 2, y: r.top + (1 - p.y) * r.height / 2 };
    });
  });
  for (const contact of contacts) {
    await page.touchscreen.tap(contact.x, contact.y); await page.locator('#stationBuildingBack').waitFor();
    const expected = { engineering_bay: 'Engineering Bay', stardust_harvester: 'Stardust Harvester', astronaut_station: 'Astronaut Station', martian_garden: 'Martian Garden' };
    assert.equal(await page.locator('#panelBody h2').innerText(), expected[contact.id], 'the tapped geometry opens its own system');
    assert.equal(await page.locator('#stationCanvas').count(), 0, 'panel exit releases renderer');
    assert.match(await page.locator('#panelBody').innerText(), /later development phase/);
    assert.equal(await page.locator('#panelBody button').count(), 1, 'future systems have no purchase or collection controls');
    await page.locator('#stationBuildingBack').click(); await returned();
  }
  const rect = await page.locator('#stationCanvas').boundingBox(), x = rect.x + rect.width / 2, y = rect.y + rect.height / 2;
  const cdp = await page.context().newCDPSession(page);
  const touch = (type, points) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: points.map(([id, px, py]) => ({ id, x: px, y: py, radiusX: 2, radiusY: 2 })) });
  const before = await camera();
  await touch('touchStart', [[1, x, y]]); await touch('touchMove', [[1, x + 45, y + 18]]); await touch('touchEnd', []);
  assert.notDeepEqual(await camera(), before, 'touch pans camera'); assert.equal(await page.locator('#panel').isVisible(), false, 'drag does not select a building');
  const panned = await camera();
  await touch('touchStart', [[1, x - 25, y], [2, x + 25, y]]);
  await touch('touchMove', [[1, x - 45, y], [2, x + 45, y]]); await touch('touchEnd', []);
  assert.ok((await camera()).zoom > panned.zoom, 'pinch zooms'); assert.equal(await page.locator('#panel').isVisible(), false);
  await touch('touchStart', [[1, x, y]]); await touch('touchCancel', []);
  assert.equal(await page.locator('#panel').isVisible(), false, 'cancel does not select');
  await page.locator('#stationMenu').click(); assert.equal(await page.locator('#stationCanvas').count(), 0);
  const savedCamera = (await save()).station.camera;
  await page.reload(); await open(); assert.deepEqual(await camera(), savedCamera, 'camera persists across reload');
  await page.locator('#stationReset').click();
  // Tap the central landing apron, now part of the unified Hangar/deck.
  await page.touchscreen.tap(rect.x + rect.width * .46, rect.y + rect.height / 2 + rect.width * .055);
  await page.locator('#hangarBack').waitFor(); assert.equal(await page.locator('#stationCanvas').count(), 0);
  assert.equal(await page.locator('[id^="interior-"]').count(), 0);
  await page.evaluate(() => window.orbitBack()); await returned();
  await page.locator('#stationSettings').click(); await page.locator('#settingsBack').click(); await returned();
  await page.locator('#stationWorkshop').click();
  const beforeWorkshop = await save(); await page.evaluate(() => window.orbitBack()); await returned();
  assert.deepEqual(await save(), beforeWorkshop, 'visiting Workshop does not award station resources');
  await page.locator('#stationVoyage').click(); assert.equal(await page.locator('#stationCanvas').count(), 0);
  assert.equal(await page.locator('#aimControls').isVisible(), true);
  await page.locator('#pause').click(); await page.locator('#quit').click();
  assert.equal(await page.locator('#resultHome').innerText(), 'Return to station');
  await page.locator('#retry').click(); assert.equal(await page.locator('#aimControls').isVisible(), true, 'retry starts immediately');
  await page.locator('#pause').click(); await page.locator('#quit').click(); await page.locator('#resultHome').click(); await returned();
  const loss = await page.locator('#stationCanvas').evaluateHandle(canvas => canvas.getContext('webgl2').getExtension('WEBGL_lose_context'));
  await loss.evaluate(extension => extension.loseContext());
  await page.waitForFunction(() => document.getElementById('stationViewport').dataset.renderer === 'lost');
  await loss.evaluate(extension => extension.restoreContext()); await returned(); await loss.dispose();
  await page.locator('#stationAccess').focus(); await page.locator('#stationAccess').selectOption('hangar'); await page.locator('#hangarBack').click(); await returned();
  // Leave before lazy import completes: it must never mount over a new run.
  await page.locator('#stationMenu').click(); await page.evaluate(() => { document.getElementById('stationEntry').click(); document.getElementById('stationVoyage').click(); });
  await page.waitForTimeout(100); assert.equal(await page.locator('#stationCanvas').count(), 0);
  await page.locator('#pause').click(); await page.locator('#quit').click(); await page.locator('#resultHome').click(); await returned();
  await page.screenshot({ path: `build/screenshots/station-${viewport.width}.png` });
  await page.locator('#stationMenu').click();
  // WebGL absence leaves accessible systems and launching functional.
  await page.addInitScript(() => { const get = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function(type, ...args) { return type.startsWith('webgl') ? null : get.call(this, type, ...args); }; });
  await page.reload(); await page.locator('#stationEntry').click();
  await page.waitForFunction(() => document.getElementById('stationViewport').dataset.renderer === 'fallback');
  await page.locator('#stationAccess').focus(); await page.locator('#stationAccess').selectOption('hangar'); await page.locator('#hangarBack').click();
  await page.locator('#stationEndless').click(); assert.equal(await page.locator('#aimControls').isVisible(), true);
  await page.locator('#pause').click(); await page.locator('#quit').click(); await page.locator('#resultHome').click();
  await page.locator('#stationMenu').click(); await cdp.detach();
}
