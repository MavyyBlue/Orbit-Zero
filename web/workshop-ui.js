import { cloneLevel, levelWorld, loadWorkshop, writeWorkshop, saveLevel, starterLevel, MAX_LEVELS, playability } from './workshop.js';
import { PLANETS, planetConfig } from './planet-rules.js';
import { icon } from './ui-art.js';
const escape = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const names = { select: 'Move', planet: 'Planets', star: 'Star', start: 'Launch', exit: 'Exit' };
export class Workshop {
  constructor(root, storage, callbacks) {
    this.root = root; this.storage = storage; this.callbacks = callbacks;
    const loaded = loadWorkshop(storage); this.library = loaded.library; this.available = loaded.available;
    this.draft = cloneLevel(this.library.draft); this.tool = 'select'; this.selection = null; this.expanded = false; this.history = []; this.status = ''; this.drag = null; this.libraryOpen = false; this.pickerOpen = false; this.planetOpen = false; this.placingKind = 'slingshot';
  }
  $(id) { return this.root.querySelector('#' + id); }
  open() { this.root.hidden = false; this.libraryOpen = false; this.drawUI(); this.changed(false); }
  hide() { this.root.hidden = true; this.drag = null; }
  dirty() { const saved = this.library.levels.find(l => l.id === this.draft.id); return !saved || JSON.stringify(saved) !== JSON.stringify(this.draft); }
  stash() { this.library.draft = cloneLevel(this.draft); this.available = writeWorkshop(this.storage, this.library); }
  snapshot() { this.history.push(cloneLevel(this.draft)); if (this.history.length > 30) this.history.shift(); }
  changed(persist = true) {
    if (persist) this.stash();
    this.callbacks.onChange(levelWorld(this.draft));
    if (this.$('workshopState')) this.$('workshopState').textContent = this.available ? (this.dirty() ? 'Draft · autosaved locally' : 'Saved level') : 'Session only · saving unavailable';
    if (this.$('workshopStatus')) this.$('workshopStatus').textContent = this.status;
  }
  selected() { const s = this.selection; return s?.kind === 'planet' ? this.draft.planets[s.index] : s?.kind === 'star' ? this.draft.stars[s.index] : s ? this.draft[s.kind] : null; }
  drawUI() {
    this.root.innerHTML = `<div class="workshop-top"><button id="workshopHome" aria-label="Back to dock">${icon('back')}</button><div><strong>Workshop</strong><small id="workshopState"></small></div><button id="workshopLibrary" aria-label="Open custom level library">${icon('bag')}</button></div><div class="workshop-tools" role="group" aria-label="Placement tools">${Object.entries(names).map(([id, label]) => `<button id="tool-${id}" aria-pressed="${this.tool === id}" ${id === 'planet' ? `aria-expanded="${this.pickerOpen}" aria-controls="planetPicker"` : ''}>${label}${id === 'planet' ? ' +' : id === 'star' ? ' +' : ''}</button>`).join('')}<button id="workshopUndo" ${this.history.length ? '' : 'disabled'}>Undo</button></div><div class="workshop-guide" id="workshopStatus" role="status"></div><details class="workshop-config" id="levelConfig" ${this.expanded ? 'open' : ''}><summary>Level configuration <span>⌃</span></summary><div class="workshop-fields"><label class="level-name">Level name<input id="levelName" maxlength="40" value="${escape(this.draft.name)}"></label>${this.range('width', 'Arena width', 300, 1200, 50, '')}${this.range('height', 'Arena length', 400, 2400, 50, '')}${this.range('gravity', 'All planet gravity', 0, 3, .1, '×')}${this.range('speed', 'Launch speed', .25, 2, .05, '×')}${this.range('duration', 'Flight time limit', 5, 60, 1, 's')}<label class="respawn-row" for="instantRespawn"><span>Instant respawn<small>Return to aiming after a crash or escape</small></span><input type="checkbox" id="instantRespawn" ${this.draft.instantRespawn ? 'checked' : ''}></label>${this.selection?.kind !== 'planet' ? this.objectFields() : ''}<p class="workshop-tip">Tap a tool, then the field. Use Move to select and drag objects. Resizing fits the whole arena and keeps relative positions. Each mechanic has its own reach and behavior. Up to 12 planets and 24 stars. Custom scores earn no stardust.</p></div></details>${this.pickerMarkup()}${this.planetOpen && this.selection?.kind === 'planet' ? this.planetMarkup() : ''}<div class="workshop-bottom"><button id="workshopNew">New</button><button id="workshopSave">Save</button><button id="workshopPlay" class="primary">Test fly ↗</button></div>`;
    this.$('workshopHome').onclick = () => { this.stash(); this.callbacks.onExit(); };
    this.$('workshopLibrary').onclick = () => this.showLibrary();
    this.$('workshopNew').onclick = () => this.confirmNew();
    this.$('workshopSave').onclick = () => this.save();
    this.$('workshopPlay').onclick = () => this.play();
    this.$('workshopUndo').onclick = () => { this.draft = this.history.pop(); this.selection = null; this.drawUI(); this.changed(); };
    for (const tool of Object.keys(names)) this.$('tool-' + tool).onclick = () => { if (tool === 'planet') { this.pickerOpen = !this.pickerOpen; this.planetOpen = false; this.drawUI(); return; } this.pickerOpen = false; this.planetOpen = false; this.tool = tool; this.status = tool === 'select' ? 'Tap an object to select it; drag to move.' : `Tap the field to ${tool === 'start' || tool === 'exit' ? 'move' : 'add'} ${names[tool].toLowerCase()}.`; this.drawUI(); this.changed(false); };
    this.$('levelConfig').ontoggle = e => { if (!e.currentTarget.isConnected) return; this.expanded = e.currentTarget.open; if (this.expanded && this.planetOpen) { this.planetOpen = false; this.drawUI(); } this.callbacks.onResize(); };
    for (const kind of Object.keys(PLANETS)) if (this.$('choose-' + kind)) this.$('choose-' + kind).onclick = () => { this.placingKind = kind; this.tool = 'planet'; this.pickerOpen = false; this.status = `${PLANETS[kind].name} · tap the field to place it.`; this.drawUI(); };
    if (this.$('closePicker')) this.$('closePicker').onclick = () => { this.pickerOpen = false; this.drawUI(); };
    if (this.$('planetPopup')) this.$('planetPopup').ontoggle = e => { if (!e.currentTarget.isConnected) return; if (!e.currentTarget.open) { this.planetOpen = false; this.drawUI(); } this.callbacks.onResize(); };
    this.$('levelName').onchange = () => { this.snapshot(); this.draft.name = this.$('levelName').value.trim() || 'Untitled orbit'; this.changed(); };
    for (const key of ['width', 'height', 'gravity', 'speed', 'duration']) this.bindRange(key, this.draft);
    this.$('instantRespawn').onchange = () => { this.snapshot(); this.draft.instantRespawn = this.$('instantRespawn').checked; this.changed(); };
    const selected = this.selected();
    if (this.planetOpen && this.selection?.kind === 'planet') {
      this.bindRange('planetGravity', selected, 'gravity'); this.bindRange('planetRadius', selected, 'radius');
      for (const [key] of PLANETS[selected.kind].controls) this.bindRange('mechanic-' + key, selected.config, key);
      this.$('planetKind').onchange = () => { this.snapshot(); selected.kind = this.$('planetKind').value; selected.type = PLANETS[selected.kind].color; selected.config = planetConfig(selected.kind); this.drawUI(); this.changed(); };
    }
    if (this.selection?.kind === 'exit') this.bindRange('exitRadius', selected, 'radius');
    if (this.$('removeObject')) this.$('removeObject').onclick = () => { this.snapshot(); const s = this.selection; this.draft[s.kind === 'planet' ? 'planets' : 'stars'].splice(s.index, 1); this.selection = null; this.drawUI(); this.changed(); };
    this.changed(false);
  }
  range(key, label, min, max, step, unit, value = this.draft[key]) { return `<label class="config-range" for="cfg-${key}"><span>${label}<output id="out-${key}">${Math.round(value * 100) / 100}${unit}</output></span><input id="cfg-${key}" type="range" min="${min}" max="${max}" step="${step}" value="${value}" data-unit="${unit}"></label>`; }
  bindRange(id, target, key = id) {
    const input = this.$('cfg-' + id);
    input.onpointerdown = () => this.snapshot();
    input.onkeydown = () => this.snapshot();
    input.oninput = () => { target[key] = Number(input.value); this.$('out-' + id).textContent = input.value + input.dataset.unit; this.changed(); };
  }
  pickerMarkup() {
    if (!this.pickerOpen) return '';
    return `<div class="planet-picker" id="planetPicker" role="group" aria-label="Planet options"><div><strong>Choose a planet</strong><button id="closePicker" aria-label="Close planet options">×</button></div>${Object.entries(PLANETS).map(([kind, def]) => `<button id="choose-${kind}"><strong>${def.name}</strong><span>${def.summary}</span></button>`).join('')}</div>`;
  }
  planetMarkup() {
    const p = this.selected(), def = PLANETS[p.kind];
    return `<details class="planet-popup workshop-config" id="planetPopup" open><summary>${def.name} · ${def.summary}<span aria-label="Collapse planet configuration">⌄</span></summary><div class="workshop-fields"><label>Planet mechanic<select id="planetKind">${Object.entries(PLANETS).map(([kind, d]) => `<option value="${kind}" ${p.kind === kind ? 'selected' : ''}>${d.name} — ${d.summary}</option>`).join('')}</select></label>${this.range('planetGravity', 'Gravity multiplier', 0, 3, .1, '×', p.gravity)}${this.range('planetRadius', 'Planet radius', 16, 70, 1, '', p.radius)}${def.controls.map(([key, label, min, max, step, unit]) => this.range('mechanic-' + key, label, min, max, step, unit, p.config[key])).join('')}<button id="removeObject" class="danger">Remove this planet</button><p class="workshop-tip">Tap this planet again to close. Zero gravity disables its forces and capture. Changing mechanic resets its specific values.</p></div></details>`;
  }
  objectFields() {
    const s = this.selection, p = this.selected();
    if (!s || !p) return '<div class="object-settings">Tap a planet to open its own controls; tap again to close.</div>';
    return `<div class="object-settings"><strong>Selected ${s.kind === 'start' ? 'launch point' : s.kind}${s.index !== undefined ? ' ' + (s.index + 1) : ''}</strong>${s.kind === 'exit' ? this.range('exitRadius', 'Exit radius', 20, 60, 1, '', p.radius) : ''}${s.kind === 'planet' || s.kind === 'star' ? '<button id="removeObject" class="danger">Remove selected object</button>' : ''}</div>`;
  }
  pointerDown(p, scale) {
    if (this.libraryOpen) return;
    const d = this.draft, xy = q => ({ x: q.x * d.width, y: q.y * d.height });
    if (p.x < 0 || p.y < 0 || p.x > d.width || p.y > d.height) return;
    if (this.tool !== 'select') {
      const q = { x: Math.max(.04, Math.min(.96, p.x / d.width)), y: Math.max(.04, Math.min(.96, p.y / d.height)) };
      if ((this.tool === 'planet' && d.planets.length >= 12) || (this.tool === 'star' && d.stars.length >= 24)) { this.status = 'Limit reached: 12 planets / 24 stars.'; this.changed(false); return; }
      this.snapshot();
      if (this.tool === 'planet') { const kind = this.placingKind; d.planets.push({ ...q, radius: 24, gravity: 1, kind, type: PLANETS[kind].color, config: planetConfig(kind) }); this.selection = { kind: 'planet', index: d.planets.length - 1 }; this.tool = 'select'; this.planetOpen = true; this.expanded = false; }
      else if (this.tool === 'star') { d.stars.push(q); this.selection = { kind: 'star', index: d.stars.length - 1 }; }
      else { Object.assign(d[this.tool], q); this.selection = { kind: this.tool }; }
      this.status = 'Placed. Use Move to drag it, or configure below.'; this.drawUI(); this.changed(); return;
    }
    const objects = [{ kind: 'start', p: d.start, radius: 15 }, { kind: 'exit', p: d.exit, radius: d.exit.radius }, ...d.stars.map((q, index) => ({ kind: 'star', index, p: q, radius: 9 })), ...d.planets.map((q, index) => ({ kind: 'planet', index, p: q, radius: q.radius }))];
    const hit = objects.map(o => ({ ...o, distance: Math.hypot(xy(o.p).x - p.x, xy(o.p).y - p.y) })).filter(o => o.distance <= Math.max(o.radius + 8, 22 / scale)).sort((a, b) => a.distance - b.distance)[0];
    const same = hit?.kind === 'planet' && this.selection?.kind === 'planet' && hit.index === this.selection.index;
    this.selection = hit ? { kind: hit.kind, index: hit.index } : null;
    if (hit) { this.snapshot(); this.drag = { x: p.x, y: p.y, original: { ...hit.p }, scale, same, wasOpen: this.planetOpen, moved: false }; this.changed(false); }
    else { this.planetOpen = false; this.drawUI(); }
  }
  pointerMove(p) {
    const q = this.selected(); if (!this.drag || !q) return;
    if (Math.hypot(p.x - this.drag.x, p.y - this.drag.y) * this.drag.scale > 6) this.drag.moved = true;
    q.x = Math.max(.04, Math.min(.96, this.drag.original.x + (p.x - this.drag.x) / this.draft.width));
    q.y = Math.max(.04, Math.min(.96, this.drag.original.y + (p.y - this.drag.y) / this.draft.height));
    this.changed(false);
  }
  pointerUp(cancel = false) {
    if (!this.drag) return;
    if (cancel) { this.draft = this.history.pop(); this.selection = null; this.planetOpen = false; }
    else if (this.selection?.kind === 'planet') { this.planetOpen = !(this.drag.same && this.drag.wasOpen && !this.drag.moved); if (this.planetOpen) this.expanded = false; }
    else this.planetOpen = false;
    this.drag = null; this.drawUI(); this.changed();
  }
  save(asCopy = false) {
    this.$('levelName')?.blur();
    const id = !asCopy && this.draft.id ? this.draft.id : 'level_' + crypto.getRandomValues(new Uint32Array(2)).join('_');
    const result = saveLevel(this.library, this.draft, id);
    if (result.error) { this.status = result.error; this.changed(false); return; }
    if (!writeWorkshop(this.storage, result.library)) { this.available = false; this.status = 'Could not save. Free device storage and try again. Draft stays in this session.'; this.changed(false); return; }
    this.library = result.library; this.draft = result.level; this.available = true; this.status = 'Level and all configuration saved locally.'; this.drawUI();
  }
  play() {
    this.$('levelName')?.blur(); this.stash();
    const issues = playability(this.draft);
    if (issues.length) { this.status = issues[0]; this.changed(false); return; }
    this.hide(); this.callbacks.onPlay(levelWorld(this.draft), cloneLevel(this.draft));
  }
  confirmNew() {
    if (!this.dirty()) { this.newLevel(); return; }
    this.showLibrary('Start a new draft? Save the current draft first if you want to keep it.', true);
  }
  newLevel() { this.draft = starterLevel(); this.history = []; this.selection = null; this.status = 'New draft. Move the starter objects or add your own.'; this.open(); this.stash(); }
  showLibrary(message = '', newPrompt = false, deleting = '', opening = '', playAfter = false) {
    this.stash(); this.libraryOpen = true;
    this.root.innerHTML = `<div class="workshop-library"><div class="menu-heading"><div><span class="eyebrow">YOUR LOCAL UNIVERSE</span><h2>Level library</h2></div><button id="libraryBack" aria-label="Back to editor">${icon('back')}</button></div><p>Saved layouts include arena size, gravity, launch speed, respawn and time limit. ${this.library.levels.length}/${MAX_LEVELS} slots. Stored only on this device.</p>${message ? `<div class="library-message" role="status">${escape(message)}${newPrompt ? '<button id="discardDraft">Start new draft</button>' : ''}${opening ? '<button id="confirmOpen">Open saved level</button>' : ''}${deleting ? `<button id="confirmDelete" class="danger">Delete this level</button>` : ''}</div>` : ''}<div class="library-list">${this.library.levels.map(l => `<article class="library-card"><strong>${escape(l.name)}</strong><small>${l.width} × ${l.height} · ${l.planets.length} planets · ${l.stars.length} stars</small><small>Gravity ${l.gravity}× · speed ${l.speed}× · ${l.duration}s · respawn ${l.instantRespawn ? 'on' : 'off'}</small><div><button data-load="${l.id}">Edit</button><button data-play="${l.id}" class="primary">Play ↗</button><button data-delete="${l.id}" aria-label="Delete ${escape(l.name)}">Delete</button></div></article>`).join('') || '<div class="library-empty">No saved levels yet. Return to the editor, name your orbit and tap Save.</div>'}</div><button id="librarySaveCopy">Save current draft as a new level</button><p class="workshop-tip">Opening a saved level replaces the current draft. Save your draft first; deleting an entry requires confirmation. Uninstalling or clearing app data removes this library.</p></div>`;
    this.$('libraryBack').onclick = () => this.open();
    if (newPrompt) this.$('discardDraft').onclick = () => this.newLevel();
    if (deleting) this.$('confirmDelete').onclick = () => {
      const next = cloneLevel(this.library); next.levels = next.levels.filter(l => l.id !== deleting);
      if (next.draft.id === deleting) next.draft.id = '';
      if (!writeWorkshop(this.storage, next)) { this.showLibrary('Deletion failed: saving unavailable.'); return; }
      this.library = next; if (this.draft.id === deleting) this.draft.id = ''; this.showLibrary('Level deleted.');
    };
    this.$('librarySaveCopy').onclick = () => { this.open(); this.save(true); };
    const load = id => { this.draft = cloneLevel(this.library.levels.find(l => l.id === id)); this.selection = null; this.history = []; this.status = ''; this.open(); this.stash(); };
    if (opening) this.$('confirmOpen').onclick = () => { load(opening); if (playAfter) this.play(); };
    const requestLoad = (id, play = false) => { if (this.dirty()) this.showLibrary('Opening this level replaces your unsaved draft. Go back and Save first to keep it.', false, '', id, play); else { load(id); if (play) this.play(); } };
    for (const button of this.root.querySelectorAll('[data-load]')) button.onclick = () => requestLoad(button.dataset.load);
    for (const button of this.root.querySelectorAll('[data-play]')) button.onclick = () => requestLoad(button.dataset.play, true);
    for (const button of this.root.querySelectorAll('[data-delete]')) button.onclick = () => this.showLibrary('Delete this saved level? This cannot be undone.', false, button.dataset.delete);
    this.callbacks.onResize(); this.$('libraryBack').focus();
  }
  viewport(height) {
    if (this.root.hidden || this.libraryOpen) return null;
    const top = 140, bottom = 84 + (this.$('levelConfig')?.getBoundingClientRect().height || 54) + (this.$('planetPopup')?.getBoundingClientRect().height || 0);
    return { top, height: Math.max(80, height - top - bottom) };
  }
  drawOverlay(ctx, scale) {
    if (this.root.hidden || this.libraryOpen) return;
    const d = this.draft;
    ctx.strokeStyle = '#80a9d088'; ctx.lineWidth = 1 / scale; ctx.strokeRect(0, 0, d.width, d.height);
    ctx.fillStyle = '#a6bdd7'; ctx.font = `${10 / scale}px system-ui`; ctx.textAlign = 'left'; ctx.fillText(`${d.width} × ${d.height}`, 8 / scale, 17 / scale);
    const p = this.selected();
    if (p) { ctx.beginPath(); ctx.arc(p.x * d.width, p.y * d.height, (p.radius || 12) + 6 / scale, 0, Math.PI * 2); ctx.strokeStyle = '#d4b6ff'; ctx.lineWidth = 2 / scale; ctx.stroke(); }
  }
}
