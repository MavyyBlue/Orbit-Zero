import * as THREE from './vendor/three.module.min.js';
import { buildOutpost } from './station-outpost.js';
import { normalizeStationCamera, defaultStationCamera } from './station-model.js';
import { StationGesture } from './station-input.js';
import { buildStationSpace } from './station-space.js';

// A self-contained diorama. No simulation imports, physics, or save writes.
export class StationView {
  constructor(root, { camera, reduced, onBuilding, onCamera, onStatus }) {
    this.root = root; this.state = normalizeStationCamera(camera); this.reduced = reduced;
    this.onCamera = onCamera; this.onStatus = onStatus; this.destroyed = false; this.lost = false;
    this.cleanup = []; this.geometries = new Set(); this.materials = new Map(); this.textures = new Set(); this.raf = null;
    this.canvas = document.createElement('canvas'); this.canvas.id = 'stationCanvas';
    this.canvas.tabIndex = 0; this.canvas.setAttribute('aria-label', '3D orbital station. Drag to pan, pinch or scroll to zoom. Tap a building to enter its system. A station system menu is available to keyboard and screen-reader users.');
    root.append(this.canvas);
    try {
      this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: true, powerPreference: 'low-power' });
      this.renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
      this.renderer.setClearColor(0x000000, 0); this.renderer.outputColorSpace = THREE.SRGBColorSpace;
      this.scene = new THREE.Scene(); this.camera = new THREE.OrthographicCamera(-8, 8, 8, -8, .1, 100);
      // Thin greenhouse framing must not steal taps from neighboring buildings.
      this.ray = new THREE.Raycaster(); this.ray.params.Line.threshold = .04; this.plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      this.scene.add(new THREE.HemisphereLight(0xd9f4ff, 0x25314e, 1.5));
      const sun = new THREE.DirectionalLight(0xffedd4, 2.2); sun.position.set(-6, 14, 8); this.scene.add(sun);
      this.resizeSpace = buildStationSpace(this);
      this.build();
      this.gesture = new StationGesture({ onPan: (dx, dy) => this.pan(dx, dy), onZoom: (factor, x, y) => this.zoom(factor, x, y), onTap: (x, y) => {
        this.ray.setFromCamera(this.screenPoint(x, y), this.camera);
        const hit = this.ray.intersectObjects(this.scene.children, true).find(h => h.object.userData.building);
        if (hit) onBuilding(hit.object.userData.building, { x, y });
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
  build() { buildOutpost(this); }
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
    const { x, z, zoom } = this.state; this.camera.position.set(x + 9, 11, z + 16); this.camera.lookAt(x, .3, z);
    this.camera.zoom = zoom; this.camera.updateProjectionMatrix(); this.camera.updateMatrixWorld();
    this.root.dataset.camera = JSON.stringify(this.state); this.onCamera({ ...this.state }); this.draw();
  }
  resize() {
    if (this.destroyed || this.lost) return;
    const r = this.root.getBoundingClientRect(); if (!r.width || !r.height) return;
    this.renderer.setSize(r.width, r.height, false); const aspect = r.width / r.height, half = Math.max(5.5, 8 / aspect);
    this.camera.left = -half * aspect; this.camera.right = half * aspect; this.camera.top = half; this.camera.bottom = -half; this.updateCamera();
  }
  draw() { if (!this.destroyed && !this.lost && !document.hidden) { this.resizeSpace?.(this.camera.right / this.camera.zoom, this.camera.top / this.camera.zoom); this.renderer.render(this.scene, this.camera); } }
  run() {
    if (this.destroyed || this.lost || document.hidden) return; this.draw();
    if (this.reduced || this.raf !== null) return;
    const frame = t => {
      this.raf = null; if (this.destroyed || this.lost || document.hidden) return;
      if (!this.lastFrame || t - this.lastFrame >= 33) { this.collector.rotation.y = Math.sin(t * .0005) * .025; this.draw(); this.lastFrame = t; }
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
    for (const texture of this.textures) texture.dispose();
    this.renderer?.dispose(); this.renderer?.forceContextLoss(); this.canvas.remove();
  }
}
