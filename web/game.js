import { W, H, DT, START, encounter, launchVector, createFlight, advance, predict, dailySeed, rng } from './simulation.js';
import { loadSave, writeSave, SKINS, buySkin } from './save.js';
import { Sound } from './audio.js';
const $ = id => document.getElementById(id), canvas = $('space'), ctx = canvas.getContext('2d');
let storage; try { storage = window.localStorage; } catch { storage = null; }
const loaded = loadSave(storage), save = loaded.save, sound = new Sound(save.settings);
let phase = 'home', previous = 'aim', mode = 'voyage', seed = 1, sector = 1, total = 0, shards = 0, nears = 0, gates = 0;
let world = encounter(1), flight = null, vector = null, drag = null, trail = [], particles = [], preview = null;
let clock = 0, accumulator = 0, toastUntil = 0, transition = 0, width = 400, height = 720, scale = 1, offsetX = 0, offsetY = 0;
let finished = false, assist = false, dailyKey = '', bestBefore = 0, settingsOrigin = 'home';
const starRng = rng(9201), stars = Array.from({ length: 95 }, () => ({ x: starRng() * W, y: starRng() * H, r: starRng() * 1.1 + .25, a: starRng() * .45 + .2 }));
function persist() { $('saveWarning').hidden = writeSave(storage, save); }
$('saveWarning').hidden = loaded.available;
function applySettings() { $('app').classList.toggle('contrast', save.settings.contrast); }
applySettings();
function resize() {
  const rect = canvas.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
  width = rect.width; height = rect.height; canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
  scale = Math.min(width / W, height / H); offsetX = (width - W * scale) / 2; offsetY = (height - H * scale) / 2;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
new ResizeObserver(resize).observe(canvas);
function screens(home = false, panel = false) { $('home').hidden = !home; $('panel').hidden = !panel; $('hud').hidden = home || panel; $('aimControls').hidden = phase !== 'aim'; }
function toast(text) { $('toast').textContent = text; toastUntil = performance.now() + 1600; }
function updateHud() { $('sectorLabel').textContent = `${mode === 'daily' ? 'DAILY' : 'SECTOR'} ${String(sector).padStart(2, '0')} / ${mode === 'endless' ? '∞' : '12'}`; $('score').textContent = (total + (flight?.score || 0)).toLocaleString(); $('combo').textContent = `×${flight?.combo || 1}`; }
function home() {
  phase = 'home'; flight = null; drag = null; preview = null; vector = null; particles = []; trail = [];
  world = encounter(319, 2); $('notice').textContent = ''; $('toast').textContent = '';
  $('homeBest').textContent = save.best.toLocaleString(); screens(true);
}
function start(which) {
  sound.unlock(); mode = which; dailyKey = new Date().toISOString().slice(0, 10);
  seed = which === 'daily' ? dailySeed() : crypto.getRandomValues(new Uint32Array(1))[0];
  sector = 1; total = 0; shards = 0; nears = 0; gates = 0; finished = false; bestBefore = save.best; newSector();
}
function newSector() {
  world = encounter(seed, sector); flight = null; vector = null; preview = null; drag = null; trail = []; particles = []; accumulator = 0;
  phase = 'aim'; $('notice').textContent = world.label; $('toast').textContent = ''; screens();
  $('assist').hidden = !assist; if (assist) aimFromControls(); updateHud();
}
function launch() {
  if (phase !== 'aim' || !vector) return;
  sound.unlock(); flight = createFlight(vector); phase = 'flight'; preview = null; drag = null; accumulator = 0;
  $('notice').textContent = ''; screens(); sound.cue('launch');
}
function aimFromControls() {
  const a = Number($('angle').value) * Math.PI / 180, speed = Number($('power').value) / 100 * 368;
  vector = { vx: Math.sin(a) * speed, vy: -Math.cos(a) * speed }; preview = predict(vector, world);
}
function pause() {
  if (!['aim', 'flight', 'transit'].includes(phase)) return;
  previous = phase; phase = 'pause'; drag = null; accumulator = 0;
  showPanel(`<span class="eyebrow">TAKE A BREATH</span><h2>Orbit on hold.</h2><p>Your probe will wait.</p><button class="primary" id="resume">Resume flight ↗</button><button class="back" id="pauseSettings">Settings</button><button class="back" id="quit">End run</button>`);
  $('resume').onclick = resume; $('pauseSettings').onclick = () => settings('pause'); $('quit').onclick = () => finish(false, 'Run ended');
}
function resume() { sound.unlock(); phase = previous; accumulator = 0; if (phase === 'aim' && assist) aimFromControls(); screens(); }
function showPanel(html) { $('panelBody').innerHTML = html; screens(false, true); $('aimControls').hidden = true; $('panelBody').scrollTop = 0; }
function burst(x, y, color, count = 20) {
  if (save.settings.reduced) return;
  for (let i = 0; i < count; i++) { const a = Math.random() * Math.PI * 2, v = 15 + Math.random() * 85; particles.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: .8, color }); }
}
function finish(victory, reason) {
  if (finished) return; finished = true;
  const score = total + (flight?.score || 0);
  if (flight) { shards += flight.collected.length; nears += flight.near.length; }
  save.runs++; save.gates += gates; save.near += nears; save.shards += shards; if (victory) save.victories++;
  save.best = Math.max(save.best, score);
  if (mode === 'daily') { save.daily[dailyKey] = Math.max(save.daily[dailyKey] || 0, score); const keys = Object.keys(save.daily).sort(); while (keys.length > 32) delete save.daily[keys.shift()]; }
  persist(); phase = 'result'; $('notice').textContent = ''; $('toast').textContent = '';
  showPanel(`<span class="eyebrow">${victory ? 'VOYAGE COMPLETE' : score > bestBefore ? 'NEW PERSONAL BEST' : 'EVERY ARC TEACHES YOU'}</span><h2>${victory ? 'You found the line.' : reason}</h2><div class="statgrid"><div><strong>${score.toLocaleString()}</strong><small>Score</small></div><div><strong>${gates}</strong><small>Gates reached</small></div><div><strong>${nears}</strong><small>Near misses</small></div><div><strong>+${shards}</strong><small>Stardust</small></div></div><p>${victory ? 'Twelve sectors crossed. A new orbit is always waiting.' : 'A little more pull. A slightly different angle. One more launch.'}</p><button class="primary" id="retry">${mode === 'daily' ? 'Retry today’s orbit' : 'Launch again'} ↗</button><button class="back" id="resultHome">Return to dock</button>`);
  $('retry').onclick = () => start(mode); $('resultHome').onclick = home;
}
function settings(from = 'home') {
  settingsOrigin = from;
  phase = 'settings'; $('notice').textContent = ''; $('toast').textContent = '';
  const labels = { sound: 'Sound effects', music: 'Ambient music', haptics: 'Haptic feedback', reduced: 'Reduce motion', contrast: 'High contrast text' };
  showPanel(`<span class="eyebrow">MAKE SPACE YOURS</span><h2>Settings</h2>${Object.entries(labels).map(([k, label]) => `<div class="row"><span>${label}</span><button id="set-${k}" aria-pressed="${save.settings[k]}">${save.settings[k] ? 'On' : 'Off'}</button></div>`).join('')}<p>Drag anywhere near the probe to aim. Button aiming offers sliders and a launch button. No purchases, accounts, or network connection.</p><button class="primary" id="settingsBack">Done</button>`);
  for (const k of Object.keys(labels)) $(`set-${k}`).onclick = () => { save.settings[k] = !save.settings[k]; persist(); applySettings(); sound.unlock(); settings(from); };
  $('settingsBack').onclick = () => { if (from === 'pause') { phase = previous; pause(); } else home(); };
}
function hangar() {
  phase = 'hangar';
  showPanel(`<span class="eyebrow">YOUR LITTLE CORNER OF SPACE</span><h2>Hangar</h2><p>${save.shards} stardust · Cosmetic colors only. Every probe flies identically.</p>${SKINS.map(s => `<div class="row"><span>${s.name}<small>${save.skin === s.id ? 'Equipped' : save.owned.includes(s.id) ? 'Owned' : `${s.price} stardust`}</small></span><button id="skin-${s.id}" ${!save.owned.includes(s.id) && save.shards < s.price ? 'disabled' : ''}>${save.skin === s.id ? 'Selected' : save.owned.includes(s.id) ? 'Equip' : 'Unlock'}</button></div>`).join('')}<h3>Flight log</h3>${[['First light', save.gates >= 1, 'Reach your first gate'], ['Thread the needle', save.near >= 1, 'Survive a near miss'], ['Wayfarer', save.gates >= 25, 'Reach 25 gates'], ['Zero to infinity', save.victories >= 1, 'Complete a voyage']].map(([name, done, hint]) => `<div class="row ${done ? 'badge' : 'dim'}"><span>${done ? '✓' : '○'} ${name}<small>${hint}</small></span></div>`).join('')}<p>${save.runs} runs · ${save.gates} gates · ${save.near} near misses</p><p>Today’s daily best: ${(save.daily[new Date().toISOString().slice(0, 10)] || 0).toLocaleString()}</p><button class="primary" id="hangarBack">Return to dock</button>`);
  for (const s of SKINS) $(`skin-${s.id}`).onclick = () => { if (buySkin(save, s.id)) { persist(); hangar(); } }; $('hangarBack').onclick = home;
}
function help() {
  phase = 'help'; showPanel('<span class="eyebrow">FLIGHT SCHOOL · 30 SECONDS</span><h2>Let gravity help.</h2><p><b>1. Pull back.</b> Touch near the glowing probe and drag opposite your intended direction. More pull means more speed.</p><p><b>2. Read the line.</b> The dotted arc shows only the first 2.1 seconds. It uses the exact same physics as your flight. Beyond the dots, you’re on your own.</p><p><b>3. Release.</b> Collect diamond stardust. Skim a planet and survive to earn a near-miss multiplier. Enter the bright ring to reach the next sector.</p><p>Hit a planet, leave the field, or drift for 14 seconds and the run ends. Voyage and Daily have 12 sectors; Endless keeps going. Daily uses one shared offline UTC-date seed, with no leaderboard.</p><p>Keyboard: arrows adjust angle and power, Space launches, Escape pauses. Button aiming is available below the probe.</p><button class="primary" id="helpBack">Got it ↗</button>'); $('helpBack').onclick = home;
}
$('play').onclick = () => start('voyage'); $('endless').onclick = () => start('endless'); $('daily').onclick = () => start('daily');
$('pause').onclick = pause; $('settings').onclick = () => settings(); $('hangar').onclick = hangar; $('help').onclick = help;
$('aimToggle').onclick = () => { assist = !assist; $('assist').hidden = !assist; $('aimToggle').textContent = assist ? 'Hide button aiming' : 'Button aiming'; if (assist) aimFromControls(); else { vector = null; preview = null; } };
$('angle').oninput = $('power').oninput = aimFromControls; $('launchButton').onclick = launch;
function point(e) { const r = canvas.getBoundingClientRect(); return { x: (e.clientX - r.left - offsetX) / scale, y: (e.clientY - r.top - offsetY) / scale }; }
canvas.onpointerdown = e => {
  if (phase !== 'aim' || drag) return; const p = point(e); if (Math.hypot(p.x - START.x, p.y - START.y) > 95) return;
  sound.unlock(); drag = { ...p, id: e.pointerId }; canvas.setPointerCapture(e.pointerId); vector = null; preview = null;
};
canvas.onpointermove = e => { if (!drag || drag.id !== e.pointerId || phase !== 'aim') return; const p = point(e); vector = launchVector(p.x - drag.x, p.y - drag.y); preview = vector ? predict(vector, world) : null; };
canvas.onpointerup = e => { if (!drag || drag.id !== e.pointerId) return; drag = null; launch(); };
canvas.onpointercancel = () => { drag = null; vector = null; preview = null; };
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
  if (phase === 'pause') resume();
  else if (phase === 'settings' && settingsOrigin === 'pause') { phase = previous; pause(); }
  else if (['help', 'hangar', 'settings', 'result'].includes(phase)) home();
  else pause();
  return true;
};
document.addEventListener('visibilitychange', () => { if (document.hidden) window.orbitPause(); });
function tick(dt) {
  if (phase === 'flight') {
    advance(flight, world); trail.push({ x: flight.x, y: flight.y }); if (trail.length > 110) trail.shift();
    for (const event of flight.events) {
      sound.cue(event);
      if (event === 'pickup') { burst(flight.x, flight.y, '#ffdda5', 10); toast(`STARDUST +${100 * flight.combo}`); }
      if (event === 'near') { burst(flight.x, flight.y, '#9cf5df', 28); toast(`CLOSE CALL ×${flight.combo}`); }
    }
    updateHud();
    if (flight.status === 'gate') {
      burst(flight.x, flight.y, '#9cf5df', 40); gates++;
      if (mode !== 'endless' && sector >= 12) finish(true, '');
      else { total += flight.score; shards += flight.collected.length; nears += flight.near.length; flight = null; phase = 'transit'; transition = .65; toast('GATE CLEARED'); }
    } else if (flight.status !== 'flight') { burst(flight.x, flight.y, '#ff947f'); finish(false, flight.status === 'crash' ? 'A beautiful collision.' : 'Lost to the quiet.'); }
  } else if (phase === 'transit') { transition -= dt; if (transition <= 0) { sector++; newSector(); } }
}
function circle(x, y, r, fill, stroke, line = 1) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = line; ctx.stroke(); } }
function render(t, dt) {
  ctx.clearRect(0, 0, width, height); ctx.fillStyle = '#080e1c'; ctx.fillRect(0, 0, width, height); ctx.save(); ctx.translate(offsetX, offsetY); ctx.scale(scale, scale);
  const backdrop = ctx.createRadialGradient(295, 310, 0, 230, 350, 370); backdrop.addColorStop(0, '#15243b'); backdrop.addColorStop(1, '#080e1c'); ctx.fillStyle = backdrop; ctx.fillRect(0, 0, W, H);
  for (const s of stars) { ctx.globalAlpha = s.a; circle(s.x, s.y, s.r, '#adc0e5'); } ctx.globalAlpha = 1;
  const displayWorld = world;
  for (const p of displayWorld.planets) {
    circle(p.x, p.y, p.radius + 23, null, '#34415455'); circle(p.x, p.y, p.radius + 45, null, '#30405a33');
    const g = ctx.createRadialGradient(p.x - p.radius * .45, p.y - p.radius * .45, 2, p.x, p.y, p.radius); g.addColorStop(0, '#cf937e'); g.addColorStop(.55, '#805f61'); g.addColorStop(1, '#302c40');
    circle(p.x, p.y, p.radius, g, '#dda59477'); ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(-.42); ctx.beginPath(); ctx.ellipse(0, 0, p.radius * 1.7, p.radius * .3, 0, 0, Math.PI * 2); ctx.strokeStyle = '#c6988b66'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
  }
  for (const p of displayWorld.hazards) { circle(p.x, p.y, p.radius, '#444157', '#b5a4a4'); ctx.beginPath(); ctx.moveTo(p.x - 4, p.y - 6); ctx.lineTo(p.x + 5, p.y + 5); ctx.strokeStyle = '#80758b'; ctx.stroke(); }
  displayWorld.pickups.forEach((p, i) => { if (flight?.collected.includes(i)) return; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(Math.PI / 4); ctx.fillStyle = '#f8d6a0'; ctx.fillRect(-4, -4, 8, 8); ctx.strokeStyle = '#f8d6a044'; ctx.strokeRect(-8, -8, 16, 16); ctx.restore(); });
  const gate = displayWorld.gate; circle(gate.x, gate.y, gate.radius, '#9cf5df08', '#9cf5df', 2); circle(gate.x, gate.y, gate.radius + 6, null, '#9cf5df22');
  ctx.save(); ctx.translate(gate.x, gate.y); ctx.rotate(save.settings.reduced ? 0 : t * .0004); ctx.strokeStyle = '#eefcf6'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, 0, gate.radius, 0, .45); ctx.arc(0, 0, gate.radius, Math.PI, Math.PI + .45); ctx.stroke(); ctx.restore();
  if (phase !== 'home') { ctx.fillStyle = '#9cf5df'; ctx.font = '8px system-ui'; ctx.textAlign = 'center'; ctx.fillText('EXIT', gate.x, gate.y + 3); }
  const color = SKINS.find(s => s.id === save.skin).color;
  if (!save.settings.reduced && trail.length > 1) { for (let i = 1; i < trail.length; i++) { ctx.globalAlpha = i / trail.length * .6; ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(trail[i - 1].x, trail[i - 1].y); ctx.lineTo(trail[i].x, trail[i].y); ctx.stroke(); } ctx.globalAlpha = 1; }
  if (preview && phase === 'aim') { preview.points.forEach((p, i) => { ctx.globalAlpha = 1 - i / preview.points.length * .75; circle(p.x, p.y, 1.6, '#d7fff5'); }); ctx.globalAlpha = 1; }
  if (phase === 'aim' || phase === 'home' || flight) {
    const p = flight || START; circle(p.x, p.y, 17, color + '12'); circle(p.x, p.y, 9, color + '25'); circle(p.x, p.y, 4, '#f5fffd', color);
    if (phase === 'aim') { circle(p.x, p.y, 25, null, color + '55'); if (vector) { ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - vector.vx / 3.2, p.y - vector.vy / 3.2); ctx.strokeStyle = color + '77'; ctx.setLineDash([3, 5]); ctx.stroke(); ctx.setLineDash([]); } }
  }
  for (const p of particles) { if (!['pause', 'settings'].includes(phase)) { p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; } ctx.globalAlpha = Math.max(0, p.life); circle(p.x, p.y, 2, p.color); } ctx.globalAlpha = 1; particles = particles.filter(p => p.life > 0); ctx.restore();
}
function frame(t) {
  const dt = Math.min((t - clock) / 1000 || 0, .1); clock = t;
  if (['flight', 'transit'].includes(phase)) { accumulator += dt; while (accumulator >= DT) { accumulator -= DT; tick(DT); if (!['flight', 'transit'].includes(phase)) { accumulator = 0; break; } } }
  if (t > toastUntil) $('toast').textContent = ''; render(t, dt); requestAnimationFrame(frame);
}
home(); requestAnimationFrame(frame);
