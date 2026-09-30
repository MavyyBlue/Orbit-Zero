import { W, H, DT, START, GRAVITY_REACH, encounter, launchVector, createFlight, advance, predict, rng } from './simulation.js';
import { loadSave, writeSave, SKINS, SHIP_OUTLINES, buySkin, roomFor, setRoomColor, buyDecor } from './save.js';
import { DECOR } from './decor.js';
import { art, icon, interiorMarkup } from './ui-art.js';
import { PLANETS } from './planet-rules.js';
import { Workshop } from './workshop-ui.js';
import { Sound } from './audio.js';
import { AimDeadZone } from './aim-lock.js';
const $ = id => document.getElementById(id), canvas = $('space'), ctx = canvas.getContext('2d');
let storage; try { storage = window.localStorage; } catch { storage = null; }
const loaded = loadSave(storage), save = loaded.save, sound = new Sound(save.settings);
let phase = 'home', previous = 'aim', mode = 'voyage', seed = 1, sector = 1, total = 0, shards = 0, nears = 0, gates = 0;
let world = encounter(1), flight = null, vector = null, drag = null, trail = [], particles = [], preview = null;
let clock = 0, accumulator = 0, toastUntil = 0, transition = 0, impactAge = 0, width = 400, height = 720, scale = 1, offsetX = 0, offsetY = 0;
let workshop = null, customLevel = null, editorPointer = null, editorClick = null;
let finished = false, assist = false, bestBefore = 0, settingsOrigin = 'home', activeRoomId = 'ion';
const starRng = rng(9201), stars = Array.from({ length: 95 }, () => ({ x: starRng() * W, y: starRng() * H, r: starRng() * 1.1 + .25, a: starRng() * .45 + .2 }));
function persist() { $('saveWarning').hidden = writeSave(storage, save); }
$('saveWarning').hidden = loaded.available;
function applySettings() { $('app').classList.toggle('contrast', save.settings.contrast); $('app').classList.toggle('reduced', save.settings.reduced); }
applySettings();
function resize() {
  if (drag) { drag = null; vector = null; preview = null; }
  const rect = canvas.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
  width = rect.width; height = rect.height; canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
  const custom = mode === 'custom', ww = custom ? world.width : W, wh = custom ? world.height : H;
  const editorView = phase === 'editor' ? workshop?.viewport(height) : null;
  const top = editorView?.top ?? (custom ? 100 : 0);
  const available = editorView?.height ?? (custom ? Math.max(80, height - top - (phase === 'aim' ? (assist ? 270 : 110) : 30)) : height);
  scale = Math.min((width - (custom ? 24 : 0)) / ww, available / wh); offsetX = (width - ww * scale) / 2; offsetY = top + (available - wh * scale) / 2;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
new ResizeObserver(resize).observe(canvas);
function screens(home = false, panel = false) { $('home').hidden = !home; $('panel').hidden = !panel; $('hud').hidden = home || panel; $('aimControls').hidden = phase !== 'aim'; }
function toast(text) { $('toast').textContent = text; toastUntil = performance.now() + 1600; }
function updateHud() { $('sectorLabel').textContent = mode === 'custom' ? 'CUSTOM · SANDBOX' : `SECTOR ${String(sector).padStart(2, '0')} / ${mode === 'endless' ? '∞' : '12'}`; $('score').textContent = (total + (flight?.score || 0)).toLocaleString(); $('combo').textContent = `×${flight?.combo || 1}`; }
function home() {
  workshop?.hide(); mode = 'voyage'; $('app').setAttribute('data-custom', 'false');
  phase = 'home'; flight = null; drag = null; preview = null; vector = null; particles = []; trail = [];
  world = encounter(319, 2, 'voyage'); $('notice').textContent = ''; $('toast').textContent = '';
  $('homeBest').textContent = save.best.toLocaleString(); screens(true); resize();
}
function openWorkshop() {
  phase = 'editor'; mode = 'custom'; flight = null; vector = null; preview = null; drag = null; trail = []; particles = []; editorPointer = null;
  $('app').setAttribute('data-custom', 'true'); $('notice').textContent = ''; $('toast').textContent = ''; screens(); $('hud').hidden = true;
  workshop ||= new Workshop($('workshopUI'), storage, { onChange: w => { world = w; resize(); }, onResize: resize, onExit: home, onPlay: (w, d) => { world = w; customLevel = d; sound.unlock(); restartCustom(); } });
  workshop.open(); resize();
}
function restartCustom() {
  finished = false; total = 0; shards = 0; nears = 0; gates = 0; sector = 1; flight = null; vector = null; preview = null; drag = null; trail = []; particles = []; accumulator = 0;
  phase = 'aim'; $('notice').textContent = 'CUSTOM ORBIT'; $('toast').textContent = ''; screens(); $('assist').hidden = !assist;
  $('angle').min = '-180'; $('angle').max = '180'; if (assist) aimFromControls(); updateHud(); resize();
}
function customFinish(victory, reason) {
  if (finished) return; finished = true; phase = 'result'; $('notice').textContent = ''; $('toast').textContent = '';
  showPanel(`<span class="eyebrow">CUSTOM ORBIT · SANDBOX</span><h2>${victory ? 'Orbit cleared!' : reason}</h2><div class="statgrid"><div><strong>${flight?.score || 0}</strong><small>Custom score</small></div><div><strong>${flight?.collected.length || 0} / ${world.pickups.length}</strong><small>Stars</small></div></div><p>No stardust or normal records change in Workshop. Keep tuning your line.</p><button class="primary" id="customRetry">Retry level ↗</button><button class="back" id="customEdit">Back to editor</button><button class="back" id="customHome">Return to dock</button>`);
  $('customRetry').onclick = restartCustom; $('customEdit').onclick = openWorkshop; $('customHome').onclick = home;
}
function start(which) {
  workshop?.hide(); $('angle').min = '-75'; $('angle').max = '75'; $('angle').value = Math.max(-75, Math.min(75, Number($('angle').value))); $('app').setAttribute('data-custom', 'false');
  sound.unlock(); mode = which;
  seed = crypto.getRandomValues(new Uint32Array(1))[0];
  sector = 1; total = 0; shards = 0; nears = 0; gates = 0; finished = false; bestBefore = save.best; newSector();
}
function newSector() {
  world = encounter(seed, sector, mode); flight = null; vector = null; preview = null; drag = null; trail = []; particles = []; accumulator = 0;
  phase = 'aim'; $('notice').textContent = world.label; $('toast').textContent = ''; screens();
  $('assist').hidden = !assist; if (assist) aimFromControls(); updateHud(); resize();
}
function launch() {
  if (phase !== 'aim' || !vector) return;
  sound.unlock(); flight = createFlight(vector, world); phase = 'flight'; preview = null; drag = null; accumulator = 0;
  $('notice').textContent = ''; screens(); resize(); sound.cue('launch');
}
function aimFromControls() {
  drag = null;
  const a = Number($('angle').value) * Math.PI / 180, speed = Number($('power').value) / 100 * 368 * (world.speed || 1);
  vector = { vx: Math.sin(a) * speed, vy: -Math.cos(a) * speed }; preview = predict(vector, world);
}
function pause() {
  if (!['aim', 'flight', 'transit', 'impact'].includes(phase)) return;
  previous = phase; phase = 'pause'; drag = null; accumulator = 0;
  showPanel(`<span class="eyebrow">TAKE A BREATH</span><h2>Orbit on hold.</h2><p>Your ship will wait.</p><button class="primary" id="resume">Resume flight ↗</button><button class="back" id="pauseSettings">Settings</button><button class="back" id="quit">End run</button>`);
  $('resume').onclick = resume; $('pauseSettings').onclick = () => settings('pause'); $('quit').onclick = () => finish(false, 'Run ended');
}
function resume() { sound.unlock(); phase = previous; accumulator = 0; if (phase === 'aim' && assist) aimFromControls(); screens(); resize(); }
function showPanel(html, view = '') { $('panel').setAttribute('data-view', view); $('panelBody').innerHTML = html; screens(false, true); $('aimControls').hidden = true; $('panelBody').scrollTop = 0; const heading = $('panelBody').querySelector?.('h2'); heading?.setAttribute?.('tabindex', '-1'); heading?.focus?.({ preventScroll: true }); }
function burst(x, y, color, count = 20) {
  if (save.settings.reduced) return;
  for (let i = 0; i < count; i++) { const a = Math.random() * Math.PI * 2, v = 15 + Math.random() * 85; particles.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: .8, color }); }
}
function finish(victory, reason) {
  if (mode === 'custom') { customFinish(victory, reason); return; }
  if (finished) return; finished = true;
  const score = total + (flight?.score || 0);
  if (flight) { shards += flight.collected.length; nears += flight.near.length; }
  save.runs++; save.gates += gates; save.near += nears; save.shards += shards; if (victory) save.victories++;
  save.best = Math.max(save.best, score);
  persist(); phase = 'result'; $('notice').textContent = ''; $('toast').textContent = '';
  showPanel(`<span class="eyebrow">${victory ? 'VOYAGE COMPLETE' : score > bestBefore ? 'NEW PERSONAL BEST' : 'EVERY ARC TEACHES YOU'}</span><h2>${victory ? 'You found the line.' : reason}</h2><div class="statgrid"><div><strong>${score.toLocaleString()}</strong><small>Score</small></div><div><strong>${gates}</strong><small>Gates reached</small></div><div><strong>${nears}</strong><small>Near misses</small></div><div><strong>+${shards}</strong><small>Stardust</small></div></div><p>${victory ? 'Twelve sectors crossed. A new orbit is always waiting.' : 'A little more pull. A slightly different angle. One more launch.'}</p><button class="primary" id="retry">Launch again ↗</button><button class="back" id="resultHome">Return to dock</button>`);
  $('retry').onclick = () => start(mode); $('resultHome').onclick = home;
}
function settings(from = 'home') {
  settingsOrigin = from; phase = 'settings'; $('notice').textContent = ''; $('toast').textContent = '';
  const labels = { sound: ['Sound effects', 'icon_sound'], music: ['Ambient music', 'icon_music'], haptics: ['Haptic feedback', 'icon_haptic'], reduced: ['Reduce motion', 'icon_motion'], contrast: ['High contrast text', 'icon_contrast'] };
  showPanel(`<div class="settings-page"><div class="settings-heading"><span class="eyebrow">MAKE SPACE YOURS</span><h2>Settings</h2></div><div class="art-list">${Object.entries(labels).map(([k, [label, image]]) => `<button class="setting-row" id="set-${k}" aria-pressed="${save.settings[k]}" aria-label="${label}: ${save.settings[k] ? 'On' : 'Off'}"><span class="setting-icon">${icon(image)}</span><span class="setting-label">${label}</span><span class="setting-toggle" aria-hidden="true"><span></span></span></button>`).join('')}</div><div class="aim-deadzone-setting"><label for="aimDeadZone">Aim dead zone <output id="aimDeadZoneValue">${save.settings.aimDeadZone === 0 ? 'Off' : `${save.settings.aimDeadZone} px`}</output></label><input id="aimDeadZone" type="range" min="0" max="12" step="1" value="${save.settings.aimDeadZone}" aria-describedby="aimDeadZoneHelp"><p id="aimDeadZoneHelp">Ignore small finger movements while aiming. Higher values need more movement to adjust. Set to 0 to turn off.</p></div><div class="help-card"><strong>✧ How to aim</strong><img src="${art('ui/illustrations/illustration_aim')}" alt="A ship and a drag gesture"><p>Drag near the ship, then release to aim</p></div><button class="primary" id="settingsBack">Done</button></div>`, 'settings');
  for (const k of Object.keys(labels)) $(`set-${k}`).onclick = () => { const scroll = $('panelBody').scrollTop; save.settings[k] = !save.settings[k]; persist(); applySettings(); sound.unlock(); settings(from); $('panelBody').scrollTop = scroll; $(`set-${k}`).focus?.({ preventScroll: true }); };
  $('aimDeadZone').oninput = () => { save.settings.aimDeadZone = Number($('aimDeadZone').value); $('aimDeadZoneValue').textContent = save.settings.aimDeadZone === 0 ? 'Off' : `${save.settings.aimDeadZone} px`; $('aimDeadZone').setAttribute('aria-valuetext', $('aimDeadZoneValue').textContent); persist(); };
  $('settingsBack').onclick = () => { if (from === 'pause') { phase = previous; pause(); } else home(); };
}
function shipIcon(style) {
  const points = SHIP_OUTLINES[style.shape].map(([x, y]) => `${x + 16},${y + 17}`).join(' ');
  return `<svg class="ship-icon" viewBox="0 0 32 34" aria-hidden="true"><polygon points="${points}" fill="${style.color}" stroke="#f5fffd" stroke-width="1.3"/><circle cx="16" cy="15" r="2.4" fill="#102339" stroke="#f5fffd" stroke-width=".7"/></svg>`;
}
function hangar() {
  phase = 'hangar';
  const challenges = [
    ['First light', 'Reach your first gate', save.gates, 1, 'icon_trophy'],
    ['Thread the needle', 'Survive 5 near misses', save.near, 5, 'icon_sparkle'],
    ['Wayfarer', 'Reach 25 gates', save.gates, 25, 'icon_ship'],
    ['Zero to infinity', 'Complete a voyage', save.victories, 1, 'icon_infinity']
  ];
  showPanel(`<div class="hangar-page"><div class="hangar-heading"><button class="nav-back" id="hangarBack" aria-label="Back to dock">${icon('icon_back')}</button><h2>Hangar</h2><div class="currency">${icon('icon_sparkle')}<strong>${save.shards}</strong></div></div><p class="fleet-note">Ship styles are cosmetic · all fly the same</p><div class="fleet">${SKINS.map(s => `<div class="ship-card ${save.skin === s.id ? 'equipped' : ''}"><img class="ship-portrait" src="${art('ui/icons/ship_' + s.shape)}" alt="${s.name} artwork"><div class="ship-card-body"><strong>${s.name}</strong><small>${save.skin === s.id ? 'Equipped' : save.owned.includes(s.id) ? 'Owned' : `${s.price} stardust · ${Math.max(0, s.price - save.shards)} more needed`}</small></div><div class="ship-actions"><button class="${save.skin === s.id ? 'selected' : save.owned.includes(s.id) ? '' : 'locked'}" id="skin-${s.id}" ${save.skin === s.id || (!save.owned.includes(s.id) && save.shards < s.price) ? 'disabled' : ''}>${save.skin === s.id ? '✓ Selected' : save.owned.includes(s.id) ? 'Equip' : `${s.price} Unlock`}</button>${save.owned.includes(s.id) ? `<button class="interior-link" id="interior-${s.id}" aria-label="View ${s.name} interior">Interior ↗</button>` : ''}</div></div>`).join('')}</div><button class="decor-link" id="shopFromHangar">${icon('icon_bag')} Decor shop ↗</button><h3>✦ Challenges</h3><div class="challenge-list">${challenges.map(([name, hint, count, target, image]) => { const done = count >= target; return `<div class="challenge-card ${done ? 'complete' : ''}"><span class="challenge-icon">${icon(done ? 'icon_check' : image)}</span><div class="challenge-body"><div class="challenge-heading"><strong>${name}</strong><b>${done ? 'Completed' : `${Math.min(count, target)}/${target}`}</b></div><small>${hint}</small><progress class="challenge-progress" max="${target}" value="${Math.min(count, target)}" aria-label="${name} progress"></progress></div></div>`; }).join('')}</div></div>`, 'hangar');
  for (const s of SKINS) {
    $(`skin-${s.id}`).onclick = () => { if (buySkin(save, s.id)) { persist(); hangar(); } };
    if (save.owned.includes(s.id)) $(`interior-${s.id}`).onclick = () => interior(s.id);
  }
  $('shopFromHangar').onclick = () => decorShop(save.skin); $('hangarBack').onclick = home;
}
function interior(shipId = save.skin) {
  if (!save.owned.includes(shipId)) { hangar(); return; }
  activeRoomId = shipId;
  phase = 'interior'; const ship = SKINS.find(s => s.id === shipId), room = roomFor(save, shipId);
  showPanel(`<div class="interior-page">${interiorMarkup(ship, room)}<div class="interior-bar"><button id="roomBack" aria-label="Back to hangar">${icon('icon_back')}</button><div><small>Orbit Zero</small><strong>${ship.name}</strong></div><label class="color-action" aria-label="Change wall color">${icon('icon_paint')}<input id="roomColor" type="color" value="${room.color}" aria-label="${ship.name} interior wall color"></label><button id="roomShop" aria-label="Decor shop">${icon('icon_bag')}</button></div><p class="interior-hint">☝ Tap furnishings to swap them</p></div>`, 'interior');
  $('panelBody').querySelector('.interior-stage').style.setProperty('--room-color', room.color);
  $('roomColor').oninput = () => { if (setRoomColor(save, shipId, $('roomColor').value)) { persist(); const stage = $('panelBody').querySelector('.interior-stage'); stage.style.setProperty('--room-color', $('roomColor').value); } };
  for (const slot of ['seat', 'console', 'plant', 'lamp']) $(`room-${slot}`).onclick = () => decorShop(shipId, slot);
  $('roomShop').onclick = () => decorShop(shipId); $('roomBack').onclick = hangar;
}
function decorShop(shipId = save.skin, filter = 'all') {
  if (!save.owned.includes(shipId)) { hangar(); return; }
  phase = 'shop'; activeRoomId = shipId;
  const ship = SKINS.find(s => s.id === shipId), room = roomFor(save, shipId);
  const categories = ['all', 'seat', 'console', 'plant', 'lamp', 'decal'];
  showPanel(`<span class="eyebrow">MAKE THIS SHIP YOURS</span><div class="menu-heading"><h2>Decor shop</h2><button class="nav-back" id="shopBack" aria-label="Back to interior">${icon('icon_back')}</button></div><p>For the ${ship.name} · ${save.shards} stardust. One-time purchases; use an item in any owned ship.</p><div class="shop-tabs">${categories.map(k => `<button id="shop-filter-${k}" aria-pressed="${filter === k}">${k === 'all' ? 'All' : k === 'decal' ? 'Decals' : k[0].toUpperCase() + k.slice(1)}</button>`).join('')}</div><div class="shop-list">${DECOR.filter(d => filter === 'all' || d.slot === filter).map(d => `<div class="shop-card"><img src="${art('shop/' + d.file)}" alt="${d.name}"><div><strong>${d.name}</strong><small>${d.slot} · ${save.decorOwned.includes(d.id) ? 'Owned' : `${d.price} stardust`}</small></div><button id="decor-${d.id}" ${!save.decorOwned.includes(d.id) && save.shards < d.price ? 'disabled' : ''}>${room.slots[d.slot] === d.id ? 'Placed' : save.decorOwned.includes(d.id) ? 'Place' : 'Unlock'}</button></div>`).join('')}</div>`);
  for (const k of categories) $(`shop-filter-${k}`).onclick = () => decorShop(shipId, k);
  for (const d of DECOR.filter(d => filter === 'all' || d.slot === filter)) $(`decor-${d.id}`).onclick = () => { if (buyDecor(save, shipId, d.id)) { persist(); decorShop(shipId, filter); } };
  $('shopBack').onclick = () => interior(shipId);
}
function supportInfo() {
  phase = 'supportInfo';
  showPanel(`<span class="eyebrow">ABOUT THIS LITTLE UNIVERSE</span><h2>Made with heart.</h2><p>Orbit Zero is Mavyy’s game. Yuki helped build and shape it, and Lyra made this visual collection. AI tools assisted the creative and development work.</p><p>The game is offline and playable without a donation. The support link has not been set up, so no payment can be made here yet.</p><button class="primary" id="infoBack">Back to support</button><button class="back" id="infoHome">Return to dock</button>`);
  $('infoBack').onclick = support; $('infoHome').onclick = home;
}
function support() {
  phase = 'donate';
  showPanel(`<div class="donate-page"><div class="donate-nav"><button id="supportBack" aria-label="Back to dock">${icon('icon_back')}</button><button id="supportAbout" aria-label="About the creators">${icon('icon_info')}</button></div><div class="donate-hero"><img src="${art('donate/donate_hero')}" alt="Lyra and Yuki waving"></div><span class="donate-status">OPTIONAL SUPPORT · COMING SOON</span><h2>Thank You!</h2><p>Your support helps us keep creating fun content and updates. Every donation means the world to us ★</p><div class="donate-tiers"><button disabled aria-label="One dollar Small Cheer, coming soon">${icon('icon_sparkle')} $1 Small Cheer<small>SOON</small></button><button disabled aria-label="Five dollar Supporter, coming soon">${icon('icon_heart')} $5 Supporter<small>SOON</small></button><button disabled aria-label="Ten dollar Champion, coming soon">${icon('icon_crown')} $10 Champion<small>SOON</small></button></div><p class="donate-note">Donations are voluntary. Payments are not available yet; no link or checkout has been set up. AI tools assisted this game’s art and development.</p></div>`, 'donate');
  $('supportAbout').onclick = supportInfo; $('supportBack').onclick = home;
}
function help() {
  phase = 'help';
  showPanel(`<span class="eyebrow">FLIGHT SCHOOL · 30 SECONDS</span><h2>Let gravity help.</h2><div class="help-card"><img src="${art('ui/illustrations/illustration_aim')}" alt="A ship following a drag arc"><p><b>1. Pull back.</b> Touch near the little ship and drag opposite your intended direction. More pull means more speed.</p></div><p><b>2. Read the line.</b> Adjust direction and power as you drag. Settings lets you tune the aim dead zone to ignore small finger movements. The dotted arc shows only the first 2.1 seconds. It uses the exact same physics as your flight. Beyond the dots, you’re on your own.</p><p><b>3. Release.</b> Collect stars hidden beyond the planets’ direct sightlines by curving around their gravity. Skim a planet and survive to earn a near-miss multiplier. Enter the bright ring to reach the next sector.</p><p>Hit a planet, leave the field, or drift for 14 seconds and the run ends. Voyage has 12 sectors; Endless keeps going. Workshop lets you build and save local custom levels with their own gravity, speed and respawn settings. Custom play earns no stardust or normal records.</p><p><b>Planet field guide:</b> Drifter · Little Nudge. Slingshot · Curved Pull. Orbiter · timed Orbit Lock and tangent release. Crusher · Violent Yank in a tight field. Repulsor · Push Away. Zero-gravity Workshop planets disable forces and capture.</p><p>Keyboard: arrows adjust angle and power, Space launches, Escape pauses. Button aiming is available below the ship.</p><button class="primary" id="helpBack">Got it ↗</button>`);
  $('helpBack').onclick = home;
}
$('play').onclick = () => start('voyage'); $('endless').onclick = () => start('endless'); $('workshop').onclick = openWorkshop;
$('pause').onclick = pause; $('settings').onclick = () => settings(); $('hangar').onclick = hangar; $('help').onclick = help;
$('donate').onclick = support; $('donateInfo').onclick = supportInfo;
$('aimToggle').onclick = () => { drag = null; assist = !assist; $('assist').hidden = !assist; $('aimToggle').textContent = assist ? 'Hide button aiming' : 'Button aiming'; if (assist) aimFromControls(); else { vector = null; preview = null; } resize(); };
$('angle').oninput = $('power').oninput = aimFromControls; $('launchButton').onclick = launch;
function point(e) { const r = canvas.getBoundingClientRect(); return { x: (e.clientX - r.left - offsetX) / scale, y: (e.clientY - r.top - offsetY) / scale }; }
canvas.onpointerdown = e => {
  if (phase === 'editor') { e.preventDefault(); if (editorPointer !== null) return; editorPointer = e.pointerId; canvas.setPointerCapture(e.pointerId); workshop.pointerDown(point(e), scale); return; }
  if (phase !== 'aim' || drag) return; const p = point(e), origin = world.start || START; if (Math.hypot(p.x - origin.x, p.y - origin.y) > (mode === 'custom' ? Math.max(95, 44 / scale) : 95)) return;
  sound.unlock(); drag = { ...p, id: e.pointerId, deadZone: new AimDeadZone(e.clientX, e.clientY) }; canvas.setPointerCapture(e.pointerId); vector = null; preview = null;
};
canvas.onpointermove = e => { if (phase === 'editor' && editorPointer === e.pointerId) { workshop.pointerMove(point(e)); return; } if (!drag || drag.id !== e.pointerId || phase !== 'aim') return; if (!drag.deadZone.move(e.clientX, e.clientY, save.settings.aimDeadZone, !!vector)) return; const p = point(e); vector = launchVector((p.x - drag.x) * (mode === 'custom' ? scale / .55 : 1), (p.y - drag.y) * (mode === 'custom' ? scale / .55 : 1)); if (vector && mode === 'custom') { vector.vx *= world.speed; vector.vy *= world.speed; } preview = vector ? predict(vector, world) : null; };
canvas.onpointerup = e => { if (phase === 'editor' && editorPointer === e.pointerId) { editorClick = { x: e.clientX, y: e.clientY, until: performance.now() + 600 }; editorPointer = null; workshop.pointerUp(); return; } if (!drag || drag.id !== e.pointerId) return; drag = null; launch(); };
canvas.onpointercancel = e => { if (e && (phase === 'editor' ? editorPointer !== e.pointerId : drag?.id !== e.pointerId)) return; if (phase === 'editor') { editorPointer = null; workshop.pointerUp(true); return; } drag = null; vector = null; preview = null; };
canvas.onlostpointercapture = e => { if (drag?.id === e.pointerId || editorPointer === e.pointerId) canvas.onpointercancel(e); };
// A touch ending on the canvas can synthesize a click on a newly opened panel.
// Consume that gesture's click; a fresh UI pointerdown always clears the guard.
document.addEventListener('pointerdown', e => { if (e.target !== canvas) editorClick = null; }, true);
document.addEventListener('click', e => {
  if (editorClick && performance.now() <= editorClick.until && Math.hypot(e.clientX - editorClick.x, e.clientY - editorClick.y) < 4) { e.preventDefault(); e.stopPropagation(); }
  editorClick = null;
}, true);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { if (phase === 'pause') resume(); else pause(); return; }
  if (phase !== 'aim' || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(e.key) || e.target.tagName === 'INPUT') return;
  e.preventDefault(); if (!assist) { assist = true; $('assist').hidden = false; }
  if (e.key === 'ArrowLeft') $('angle').value = +$('angle').value - 3;
  if (e.key === 'ArrowRight') $('angle').value = +$('angle').value + 3;
  if (e.key === 'ArrowUp') $('power').value = +$('power').value + 5;
  if (e.key === 'ArrowDown') $('power').value = +$('power').value - 5;
  aimFromControls(); if (e.key === ' ') launch();
});
window.orbitPause = () => { pause(); sound.suspend(); };
window.orbitBack = () => {
  if (phase === 'home') return false;
  if (phase === 'editor') { if (workshop.libraryOpen) workshop.open(); else home(); }
  else if (phase === 'pause') resume();
  else if (phase === 'settings' && settingsOrigin === 'pause') { phase = previous; pause(); }
  else if (phase === 'shop') interior(activeRoomId);
  else if (phase === 'interior') hangar();
  else if (phase === 'supportInfo') support();
  else if (phase === 'result' && mode === 'custom') openWorkshop();
  else if (['help', 'hangar', 'settings', 'result', 'donate'].includes(phase)) home();
  else pause();
  return true;
};
document.addEventListener('visibilitychange', () => { if (document.hidden) window.orbitPause(); });
function tick(dt) {
  if (phase === 'flight') {
    advance(flight, world); trail.push({ x: flight.x, y: flight.y }); if (trail.length > 110) trail.shift();
    for (const event of flight.events) {
      sound.cue(event);
      if (event === 'orbit') toast('ORBIT LOCK');
      if (event === 'release') { burst(flight.x, flight.y, '#c8abff', 14); toast('ORBIT RELEASE'); }
      if (event === 'pickup') { burst(flight.x, flight.y, '#ffdda5', 10); toast(`STAR +${100 * flight.combo}`); }
      if (event === 'near') { burst(flight.x, flight.y, '#9cf5df', 28); toast(`CLOSE CALL ×${flight.combo}`); }
    }
    updateHud();
    if (flight.status === 'gate') {
      burst(flight.x, flight.y, '#9cf5df', 40); gates++;
      if (mode === 'custom') finish(true, '');
      else if (mode !== 'endless' && sector >= 12) finish(true, '');
      else { total += flight.score; shards += flight.collected.length; nears += flight.near.length; flight = null; phase = 'transit'; transition = .65; toast('GATE CLEARED'); }
    } else if (flight.status === 'crash') {
      impactAge = 0; phase = 'impact'; accumulator = 0;
      burst(flight.x, flight.y, '#ffbd82', 12); toast('BOOP!');
    } else if (flight.status !== 'flight') { if (mode === 'custom' && customLevel.instantRespawn) { restartCustom(); toast('READY AGAIN'); } else finish(false, 'Lost to the quiet.'); }
  } else if (phase === 'impact') {
    impactAge += dt;
    if (impactAge >= (mode === 'custom' && customLevel.instantRespawn ? .18 : save.settings.reduced ? .28 : .78)) { if (mode === 'custom' && customLevel.instantRespawn) { restartCustom(); toast('READY AGAIN'); } else finish(false, 'A beautiful collision.'); }
  } else if (phase === 'transit') { transition -= dt; if (transition <= 0) { sector++; newSector(); } }
}
function circle(x, y, r, fill, stroke, line = 1) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = line; ctx.stroke(); } }
const PLANET_PALETTES = {
  ember: ['#ffc390', '#a45053', '#382340'], ice: ['#f1ffff', '#89c9df', '#335d82'],
  jade: ['#d9f4ae', '#70b69a', '#345f62'], violet: ['#ebd9ff', '#a38acc', '#4c416d'],
  sand: ['#ffe1a3', '#c49461', '#665044']
};
function drawPlanet(p, t) {
  const def = PLANETS[p.kind], colors = PLANET_PALETTES[def?.color || p.type] || PLANET_PALETTES.ember;
  if (def && p.kind !== 'slingshot') {
    const reach = p.radius + p.config.reach;
    ctx.save(); ctx.setLineDash(p.kind === 'orbiter' ? [4, 6] : p.kind === 'drifter' ? [2, 9] : []);
    circle(p.x, p.y, reach, null, colors[1] + (p.kind === 'crusher' ? '65' : '38'));
    ctx.restore();
    if (p.kind === 'orbiter') circle(p.x, p.y, p.radius + 55, null, '#d6b7ff44');
    if (p.kind === 'repulsor' || p.kind === 'crusher') for (let i = 0; i < 4; i++) {
      const a = i * Math.PI / 2 + .4, r = p.radius + (p.kind === 'repulsor' ? p.config.reach * .45 : 18), direction = p.kind === 'repulsor' ? 1 : -1;
      ctx.save(); ctx.translate(p.x + Math.cos(a) * r, p.y + Math.sin(a) * r); ctx.rotate(a); ctx.strokeStyle = colors[0] + '99'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(-4 * direction, -4); ctx.lineTo(3 * direction, 0); ctx.lineTo(-4 * direction, 4); ctx.stroke(); ctx.restore();
    }
  } else {
    circle(p.x, p.y, p.radius + GRAVITY_REACH * .28, null, colors[1] + '2d');
    circle(p.x, p.y, p.radius + GRAVITY_REACH * .44, null, colors[1] + '13');
  }
  const g = ctx.createRadialGradient(p.x - p.radius * .45, p.y - p.radius * .45, 1, p.x, p.y, p.radius);
  g.addColorStop(0, colors[0]); g.addColorStop(.58, colors[1]); g.addColorStop(1, colors[2]);
  circle(p.x, p.y, p.radius, g, colors[0] + '88');
  ctx.save(); ctx.translate(p.x, p.y);
  const appearance = def?.color || p.type;
  if (appearance === 'sand' || appearance === 'jade') {
    ctx.rotate(-.42); ctx.beginPath(); ctx.ellipse(0, 0, p.radius * 1.6, p.radius * .31, 0, 0, Math.PI * 2);
    ctx.strokeStyle = colors[0] + '88'; ctx.lineWidth = appearance === 'sand' ? 3 : 2; ctx.stroke();
  } else if (appearance === 'ice') {
    circle(-p.radius * .13, -p.radius * .18, p.radius * .28, null, '#f4ffff88');
    circle(p.radius * .38, p.radius * .28, p.radius * .14, null, '#f4ffff66');
  } else if (appearance === 'violet') {
    ctx.strokeStyle = '#f0e1ff99'; ctx.lineWidth = 1.5; ctx.beginPath();
    ctx.moveTo(-p.radius * .42, p.radius * .12); ctx.lineTo(0, -p.radius * .6);
    ctx.lineTo(p.radius * .32, p.radius * .3); ctx.stroke();
  } else {
    circle(p.radius * .2, -p.radius * .15, p.radius * .28, '#ffd2a054');
    circle(-p.radius * .32, p.radius * .26, p.radius * .12, '#ffe0b044');
  }
  ctx.restore();
  if (def && scale >= .3) { ctx.fillStyle = colors[0]; ctx.font = `${Math.max(8, 8 / scale)}px system-ui`; ctx.textAlign = 'center'; ctx.fillText(def.name.toUpperCase(), p.x, p.y + p.radius + 13 / scale); }
}
function drawShip(p, velocity, style, t) {
  const angle = velocity ? Math.atan2(velocity.vy, velocity.vx) + Math.PI / 2 : 0;
  ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(angle); if (mode === 'custom') ctx.scale(Math.max(1, .7 / scale), Math.max(1, .7 / scale));
  circle(0, 0, 15, style.color + '17');
  if (velocity && !save.settings.reduced) {
    const tail = 8 + Math.sin(t * .025) * 2;
    ctx.fillStyle = '#ffc27d'; ctx.beginPath(); ctx.moveTo(-2.5, 6); ctx.lineTo(0, tail + 3);
    ctx.lineTo(2.5, 6); ctx.closePath(); ctx.fill();
  }
  const vertices = SHIP_OUTLINES[style.shape] || SHIP_OUTLINES.scout;
  ctx.beginPath(); vertices.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath();
  ctx.fillStyle = style.color; ctx.fill(); ctx.strokeStyle = '#f5fffd'; ctx.lineWidth = 1.1; ctx.stroke();
  circle(0, -2, 2.4, '#102339', '#f5fffd', .6);
  ctx.restore();
}
function drawImpact(p, age) {
  const progress = Math.min(1, age / .78), spread = 5 + 20 * progress;
  ctx.save(); ctx.globalAlpha = 1 - progress * .75;
  circle(p.x, p.y, 4 + 19 * Math.min(1, progress * 3), '#ffe8a8', '#fff5ce', 1.5);
  // A tiny rounded mushroom cap and stem, rising briefly from the impact.
  circle(p.x, p.y - 12 - 10 * progress, spread * .7, '#ffd29a');
  circle(p.x - spread * .6, p.y - 10 - 9 * progress, spread * .48, '#ffad88');
  circle(p.x + spread * .6, p.y - 10 - 9 * progress, spread * .48, '#ffad88');
  circle(p.x, p.y - 2 - 5 * progress, 5 + 5 * progress, '#cf7590');
  for (let i = 0; i < 6; i++) {
    const a = i * Math.PI / 3 + .2, r = 10 + progress * 25;
    circle(p.x + Math.cos(a) * r, p.y + Math.sin(a) * r, 1.6 + (1 - progress) * 1.5, '#fff1bc');
  }
  ctx.restore();
}
function render(t, dt) {
  ctx.clearRect(0, 0, width, height); ctx.fillStyle = '#080e1c'; ctx.fillRect(0, 0, width, height); ctx.save(); ctx.translate(offsetX, offsetY); ctx.scale(scale, scale);
  const backdrop = ctx.createRadialGradient(295, 310, 0, 230, 350, 370); backdrop.addColorStop(0, '#15243b'); backdrop.addColorStop(1, '#080e1c'); ctx.fillStyle = backdrop; ctx.fillRect(0, 0, world.width || W, world.height || H);
  for (const s of stars) { ctx.globalAlpha = s.a; circle(s.x * ((world.width || W) / W), s.y * ((world.height || H) / H), s.r / Math.min(1, scale), '#adc0e5'); } ctx.globalAlpha = 1;
  const displayWorld = world;
  for (const p of displayWorld.planets) drawPlanet(p, t);
  for (const p of displayWorld.hazards) { circle(p.x, p.y, p.radius, '#444157', '#b5a4a4'); ctx.beginPath(); ctx.moveTo(p.x - 4, p.y - 6); ctx.lineTo(p.x + 5, p.y + 5); ctx.strokeStyle = '#80758b'; ctx.stroke(); }
  displayWorld.pickups.forEach((p, i) => { if (flight?.collected.includes(i)) return; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(-Math.PI / 2); ctx.beginPath(); for (let k = 0; k < 10; k++) { const a = k * Math.PI / 5, r = k % 2 ? 3.5 : 8; const x = Math.cos(a) * r, y = Math.sin(a) * r; k ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.closePath(); ctx.fillStyle = '#ffe2a4'; ctx.fill(); ctx.strokeStyle = '#fff6de'; ctx.lineWidth = 1; ctx.stroke(); ctx.restore(); });
  const gate = displayWorld.gate; circle(gate.x, gate.y, gate.radius, '#9cf5df08', '#9cf5df', 2); circle(gate.x, gate.y, gate.radius + 6, null, '#9cf5df22');
  ctx.save(); ctx.translate(gate.x, gate.y); ctx.rotate(save.settings.reduced ? 0 : t * .0004); ctx.strokeStyle = '#eefcf6'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, 0, gate.radius, 0, .45); ctx.arc(0, 0, gate.radius, Math.PI, Math.PI + .45); ctx.stroke(); ctx.restore();
  if (phase !== 'home') { ctx.fillStyle = '#9cf5df'; ctx.font = '8px system-ui'; ctx.textAlign = 'center'; ctx.fillText('EXIT', gate.x, gate.y + 3); }
  const style = SKINS.find(s => s.id === save.skin) || SKINS[0], color = style.color;
  if (!save.settings.reduced && trail.length > 1) { for (let i = 1; i < trail.length; i++) { ctx.globalAlpha = i / trail.length * .6; ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(trail[i - 1].x, trail[i - 1].y); ctx.lineTo(trail[i].x, trail[i].y); ctx.stroke(); } ctx.globalAlpha = 1; }
  if (preview && phase === 'aim') { preview.points.forEach((p, i) => { ctx.globalAlpha = 1 - i / preview.points.length * .75; circle(p.x, p.y, 1.6, '#d7fff5'); }); ctx.globalAlpha = 1; }
  if (phase === 'editor' || phase === 'aim' || phase === 'home' || (flight && phase !== 'impact')) {
    const p = flight || world.start || START;
    drawShip(p, flight || vector, style, t);
    if (phase === 'aim') { circle(p.x, p.y, 25, null, color + '55'); if (vector) { ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - vector.vx / 3.2, p.y - vector.vy / 3.2); ctx.strokeStyle = color + '77'; ctx.setLineDash([3, 5]); ctx.stroke(); ctx.setLineDash([]); } }
  }
  if (flight?.orbit && phase !== 'impact') { const p = displayWorld.planets[flight.orbit.index]; circle(p.x, p.y, flight.orbit.radius, null, '#e7d2ff88', 2); }
  if (phase === 'editor') workshop?.drawOverlay(ctx, scale);
  if (phase === 'impact' && flight) drawImpact(flight, impactAge);
  for (const p of particles) { if (!['pause', 'settings'].includes(phase)) { p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; } ctx.globalAlpha = Math.max(0, p.life); circle(p.x, p.y, 2, p.color); } ctx.globalAlpha = 1; particles = particles.filter(p => p.life > 0); ctx.restore();
}
function frame(t) {
  const dt = Math.min((t - clock) / 1000 || 0, .1); clock = t;
  if (['flight', 'transit', 'impact'].includes(phase)) { accumulator += dt; while (accumulator >= DT) { accumulator -= DT; tick(DT); if (!['flight', 'transit', 'impact'].includes(phase)) { accumulator = 0; break; } } }
  if (t > toastUntil) $('toast').textContent = ''; render(t, dt); requestAnimationFrame(frame);
}
home(); requestAnimationFrame(frame);
