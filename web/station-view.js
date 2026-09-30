import * as THREE from './vendor/three.module.min.js';
import { STATION_BUILDINGS } from './station-catalog.js';
import { normalizeStationCamera, defaultStationCamera } from './station-model.js';
import { StationGesture } from './station-input.js';

// A self-contained diorama. No simulation imports, physics, or save writes.
export class StationView {
  constructor(root, { camera, reduced, onBuilding, onCamera, onStatus }) {
    this.root = root; this.state = normalizeStationCamera(camera); this.reduced = reduced;
    this.onCamera = onCamera; this.onStatus = onStatus; this.destroyed = false; this.lost = false;
    this.cleanup = []; this.geometries = new Set(); this.materials = new Map(); this.raf = null;
    this.canvas = document.createElement('canvas'); this.canvas.id = 'stationCanvas';
    this.canvas.tabIndex = 0; this.canvas.setAttribute('aria-label', '3D orbital station. Drag to pan, pinch or scroll to zoom. Use building buttons below to enter systems.');
    root.append(this.canvas);
    try {
      this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
      this.renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
      this.renderer.setClearColor(0x000000, 0); this.renderer.outputColorSpace = THREE.SRGBColorSpace;
      this.scene = new THREE.Scene(); this.camera = new THREE.OrthographicCamera(-8, 8, 8, -8, .1, 100);
      this.ray = new THREE.Raycaster(); this.plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      this.scene.add(new THREE.HemisphereLight(0xd9f4ff, 0x354564, 2.3));
      const sun = new THREE.DirectionalLight(0xffedd4, 2.7); sun.position.set(-6, 14, 8); this.scene.add(sun);
      this.build();
      this.gesture = new StationGesture({ onPan: (dx, dy) => this.pan(dx, dy), onZoom: (factor, x, y) => this.zoom(factor, x, y), onTap: (x, y) => {
        this.ray.setFromCamera(this.screenPoint(x, y), this.camera);
        const hit = this.ray.intersectObjects(this.scene.children, true).find(h => h.object.userData.building);
        if (hit) onBuilding(hit.object.userData.building);
      } });
      this.listen(this.canvas, 'pointerdown', e => { e.preventDefault(); this.canvas.setPointerCapture(e.pointerId); this.gesture.down(e.pointerId, e.clientX, e.clientY); });
      this.listen(this.canvas, 'pointermove', e => this.gesture.move(e.pointerId, e.clientX, e.clientY));
      this.listen(this.canvas, 'pointerup', e => this.gesture.up(e.pointerId, e.clientX, e.clientY));
      this.listen(this.canvas, 'pointercancel', () => this.cancelGestures());
      this.listen(this.canvas, 'lostpointercapture', e => { if (this.gesture.pointers.has(e.pointerId)) this.cancelGestures(); });
      this.listen(this.canvas, 'wheel', e => { e.preventDefault(); this.zoom(Math.exp(-e.deltaY * .0015), e.clientX, e.clientY); }, { passive: false });
      this.listen(this.canvas, 'keydown', e => {
        const directions = { ArrowLeft: [-24, 0], ArrowRight: [24, 0], ArrowUp: [0, -24], ArrowDown: [0, 24] };
        if (directions[e.key]) { e.preventDefault(); this.pan(...directions[e.key]); }
        else if (['+', '=', '-'].includes(e.key)) { e.preventDefault(); this.zoom(e.key === '-' ? .9 : 1.1); }
        else if (e.key === 'Home') { e.preventDefault(); this.reset(); }
      });
      this.listen(this.canvas, 'webglcontextlost', e => { e.preventDefault(); this.lost = true; this.cancelGestures(); this.stop(); onStatus('lost'); });
      this.listen(this.canvas, 'webglcontextrestored', () => { this.lost = false; this.resize(); onStatus('ready'); this.run(); });
      this.listen(document, 'visibilitychange', () => { if (document.hidden) this.suspend(); else this.run(); });
      this.observer = new ResizeObserver(() => { this.cancelGestures(); this.resize(); }); this.observer.observe(root);
      this.resize(); onStatus('ready'); this.run();
    } catch (error) { this.destroy(); throw error; }
  }
  listen(target, event, handler, options) { target.addEventListener(event, handler, options); this.cleanup.push(() => target.removeEventListener(event, handler, options)); }
  material(color) {
    if (!this.materials.has(color)) this.materials.set(color, new THREE.MeshLambertMaterial({ color, flatShading: true }));
    return this.materials.get(color);
  }
  mesh(parent, geometry, color, x, y, z) {
    this.geometries.add(geometry); const mesh = new THREE.Mesh(geometry, this.material(color));
    mesh.position.set(x, y, z); parent.add(mesh); return mesh;
  }
  box(parent, color, x, y, z, w, h, d) { return this.mesh(parent, new THREE.BoxGeometry(w, h, d), color, x, y, z); }
  cylinder(parent, color, x, y, z, radius, height, sides = 8) { return this.mesh(parent, new THREE.CylinderGeometry(radius, radius, height, sides), color, x, y, z); }
  build() {
    const base = new THREE.Group(); this.scene.add(base);
    this.box(base, '#1b2944', 0, -.6, 0, 10.7, .7, 10.3);
    this.box(base, '#405676', 0, -.22, 0, 10.6, .12, 10.2);
    // Shared service spine and short painted walkways join four fixed plots.
    this.box(base, '#9ce8df', 0, -.13, 0, .18, .04, 9.4);
    this.box(base, '#9ce8df', 0, -.12, 0, 9.8, .04, .18);
    for (const x of [-5, 5]) for (const z of [-4.8, 4.8]) {
      this.cylinder(base, '#20324c', x, -.8, z, .42, 1.1);
      this.cylinder(base, '#8ff4e0', x, -.19, z, .17, .1);
    }
    for (const definition of STATION_BUILDINGS) {
      const g = new THREE.Group(); g.position.set(definition.x, 0, definition.z); this.scene.add(g);
      this.box(g, '#263953', 0, -.03, 0, 4.4, .26, 4.1);
      this.box(g, '#526b83', 0, .11, 0, 4.2, .06, 3.9);
      if (definition.id === 'hangar') this.hangar(g, definition.color);
      else if (definition.id === 'engineering_bay') this.engineering(g, definition.color);
      else if (definition.id === 'stardust_harvester') this.harvester(g, definition.color);
      else this.astronauts(g, definition.color);
      // All visible building parts are generous tap targets, including the plot.
      g.traverse(object => { if (object.isMesh) object.userData.building = definition.id; });
    }
  }
  hangar(g, color) {
    this.box(g, '#465b75', -.2, .87, -.45, 2.8, 1.5, 1.7);
    this.box(g, color, -.2, 1.68, -.45, 3.0, .24, 1.9);
    this.box(g, '#14243e', -.2, .8, .415, 2.25, 1.23, .06);
    for (const x of [-1.46, 1.06]) this.box(g, color, x, .85, .5, .15, 1.4, .15);
    for (let i = 0; i < 4; i++) this.box(g, '#fff1ae', -.2, .85, .46, 2, .025, .06).position.y += i * .18;
    this.box(g, '#8babb4', 0, .18, 1.2, 3.2, .1, 1.35);
    for (const x of [-1.35, 1.35]) this.box(g, color, x, .26, 1.2, .09, .035, 1.1);
    const ship = new THREE.Group(); ship.position.set(0, .46, 1.2); g.add(ship);
    const hull = this.mesh(ship, new THREE.ConeGeometry(.35, 1.2, 5), color, 0, .1, 0); hull.rotation.x = -Math.PI / 2;
    this.box(ship, '#e5fff3', 0, .1, 0, 1.2, .1, .42); this.box(ship, '#29374e', 0, .29, -.12, .28, .17, .32);
  }
  engineering(g, color) {
    this.box(g, '#8692bb', -.3, .83, 0, 2.5, 1.35, 2.2);
    this.box(g, color, -.3, 1.57, 0, 2.8, .2, 2.5);
    this.box(g, '#20304d', -.3, .91, 1.12, 1.9, .48, .05);
    for (const x of [-.94, -.3, .34]) this.box(g, '#a1fbf5', x, .91, 1.17, .48, .3, .06);
    this.cylinder(g, '#d5d0eb', 1.35, .67, -.2, .43, 1.05);
    this.cylinder(g, color, 1.35, 1.23, -.2, .51, .14);
    this.box(g, '#6e81a1', -.65, 2.03, -.4, .08, .8, .08);
    const dish = this.mesh(g, new THREE.ConeGeometry(.57, .24, 8), color, -.65, 2.4, -.4); dish.rotation.z = -.45;
    this.box(g, '#ffe0a0', -.6, 1.77, .5, .6, .16, .4);
  }
  harvester(g, color) {
    this.cylinder(g, '#a9a6a0', 0, .52, 0, .92, .75);
    this.cylinder(g, color, 0, .94, 0, 1.08, .12);
    this.cylinder(g, '#607790', 0, 1.32, 0, .16, .72);
    this.collector = this.mesh(g, new THREE.ConeGeometry(1.32, .45, 8), color, 0, 1.88, 0); this.collector.rotation.z = .15;
    this.mesh(g, new THREE.IcosahedronGeometry(.22, 0), '#fff6cc', 0, 2.2, 0);
    for (const x of [-1.45, 1.45]) {
      this.box(g, '#33476b', x, .73, 0, .86, .14, 2.45);
      for (let i = 0; i < 4; i++) this.box(g, '#699fe6', x, .81, -.9 + i * .6, .73, .035, .45);
      this.box(g, '#46576f', x, .45, 0, .12, .6, .12);
    }
    this.box(g, '#ecbd70', .35, .38, 1.4, .95, .44, .45);
  }
  astronauts(g, color) {
    this.box(g, '#c4c9ce', 0, .79, 0, 2.5, 1.25, 2.2);
    this.box(g, color, 0, 1.48, 0, 2.75, .17, 2.45);
    this.mesh(g, new THREE.SphereGeometry(.81, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2), '#91c5d3', 0, 1.57, -.25);
    this.box(g, '#253e54', .55, .64, 1.12, .65, .94, .07);
    this.box(g, color, .55, 1.18, 1.19, .83, .12, .17);
    for (const x of [-.9, -.15]) this.box(g, '#94e5e0', x, .88, 1.13, .47, .36, .09);
    this.box(g, '#667c99', -1.6, 1.07, -.4, .12, 1.8, .12);
    this.box(g, color, -1.33, 1.81, -.4, .52, .4, .08);
    this.box(g, '#edbd92', 1.6, .37, 1.25, .45, .45, .6);
  }
  screenPoint(x, y) { const r = this.canvas.getBoundingClientRect(); return new THREE.Vector2((x - r.left) / r.width * 2 - 1, -(y - r.top) / r.height * 2 + 1); }
  planePoint(x, y) { this.ray.setFromCamera(this.screenPoint(x, y), this.camera); return this.ray.ray.intersectPlane(this.plane, new THREE.Vector3()); }
  pan(dx, dy) {
    const r = this.canvas.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
    const a = this.planePoint(x, y), b = this.planePoint(x + dx, y + dy); if (!a || !b) return;
    this.state.x += a.x - b.x; this.state.z += a.z - b.z; this.updateCamera();
  }
  zoom(factor, x, y) {
    const before = x === undefined ? null : this.planePoint(x, y);
    this.state.zoom *= factor; this.updateCamera();
    if (before) { const after = this.planePoint(x, y); if (after) { this.state.x += before.x - after.x; this.state.z += before.z - after.z; this.updateCamera(); } }
  }
  reset() { this.cancelGestures(); this.state = defaultStationCamera(); this.updateCamera(); }
  updateCamera() {
    this.state = normalizeStationCamera(this.state);
    const { x, z, zoom } = this.state; this.camera.position.set(x + 12, 15, z + 12); this.camera.lookAt(x, 0, z);
    this.camera.zoom = zoom; this.camera.updateProjectionMatrix(); this.camera.updateMatrixWorld();
    this.root.dataset.camera = JSON.stringify(this.state); this.onCamera({ ...this.state }); this.draw();
  }
  resize() {
    if (this.destroyed || this.lost) return;
    const r = this.root.getBoundingClientRect(); if (!r.width || !r.height) return;
    this.renderer.setSize(r.width, r.height, false); const aspect = r.width / r.height, half = Math.max(5.5, 8 / aspect);
    this.camera.left = -half * aspect; this.camera.right = half * aspect; this.camera.top = half; this.camera.bottom = -half; this.updateCamera();
  }
  draw() { if (!this.destroyed && !this.lost && !document.hidden) this.renderer.render(this.scene, this.camera); }
  run() {
    if (this.destroyed || this.lost || document.hidden) return; this.draw();
    if (this.reduced || this.raf !== null) return;
    const frame = t => {
      this.raf = null; if (this.destroyed || this.lost || document.hidden) return;
      if (!this.lastFrame || t - this.lastFrame >= 33) { this.collector.rotation.z = .15 + Math.sin(t * .0005) * .04; this.draw(); this.lastFrame = t; }
      this.raf = requestAnimationFrame(frame);
    }; this.raf = requestAnimationFrame(frame);
  }
  stop() { if (this.raf !== null) cancelAnimationFrame(this.raf); this.raf = null; }
  cancelGestures() {
    const ids = [...(this.gesture?.pointers.keys() || [])]; this.gesture?.cancel();
    for (const id of ids) if (this.canvas.hasPointerCapture(id)) this.canvas.releasePointerCapture(id);
  }
  suspend() { this.cancelGestures(); this.stop(); }
  destroy() {
    if (this.destroyed) return; this.destroyed = true; this.suspend(); this.observer?.disconnect();
    for (const remove of this.cleanup) remove();
    for (const geometry of this.geometries) geometry.dispose(); for (const material of this.materials.values()) material.dispose();
    this.renderer?.dispose(); this.renderer?.forceContextLoss(); this.canvas.remove();
  }
}
