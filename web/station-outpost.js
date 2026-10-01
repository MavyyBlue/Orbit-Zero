import * as THREE from './vendor/three.module.min.js';
import { STATION_BUILDINGS } from './station-catalog.js';
import { buildHangar } from './station-hangar.js';

const gray = '#a0a5af', orange = '#e99a36', dark = '#465267', cyan = '#39cfff', amber = '#ffc655';

// One reference-led composition: center bay/deck with attached functional areas.
export function buildOutpost(view) {
  const box = (g, color, x, y, z, w, h, d) => view.box(g, color, x, y, z, w, h, d);
  const cylinder = (g, color, x, y, z, r, h) => view.cylinder(g, color, x, y, z, r, h, 8);
  const light = (g, color, x, y, z, w, h, d) => {
    const key = `outpost-light-${color}`;
    if (!view.materials.has(key)) view.materials.set(key, new THREE.MeshLambertMaterial({ color, emissive: color, emissiveIntensity: .7, flatShading: true }));
    const mesh = box(g, color, x, y, z, w, h, d); mesh.material = view.materials.get(key); return mesh;
  };
  const platform = (g, radius) => {
    cylinder(g, '#7d8490', 0, -.16, 0, radius, .65);
    cylinder(g, gray, 0, .18, 0, radius, .04);
    cylinder(g, dark, 0, -.63, 0, radius * .7, .3);
    for (let i = 0; i < 8; i++) {
      const angle = i * Math.PI / 4, x = Math.sin(angle) * (radius - .11), z = Math.cos(angle) * (radius - .11);
      const rim = box(g, orange, x, .24, z, .37, .09, .13); rim.rotation.y = angle;
      const brace = box(g, dark, x, -.1, z, .21, .56, .14); brace.rotation.y = angle;
    }
    light(g, amber, 0, -.05, radius, .47, .17, .03);
  };
  const bridge = (g, id, start, end, width = .85) => {
    const dx = end[0] - start[0], dz = end[1] - start[1], length = Math.hypot(dx, dz);
    const b = new THREE.Group(); b.position.set((start[0] + end[0]) / 2, 0, (start[1] + end[1]) / 2); b.rotation.y = Math.atan2(dx, dz); g.add(b);
    box(b, gray, 0, -.05, 0, width, .38, length);
    for (const x of [-width / 2, width / 2]) box(b, orange, x, .17, 0, .08, .07, length);
    box(b, '#505866', 0, .15, 0, width * .7, .03, length);
    b.traverse(o => { if (o.isMesh) o.userData.building = id; });
  };
  const links = new THREE.Group(); view.scene.add(links);
  bridge(links, 'astronaut_station', [-1.9, -.9], [-4.1, -1]);
  bridge(links, 'stardust_harvester', [-1.2, 1.1], [-3.6, 3.4]);
  bridge(links, 'martian_garden', [1.9, .4], [4.1, 1], 1.1);

  const worker = (g, x, z) => {
    // Decorative astronaut figurines; they do not imply hired crew or production.
    box(g, '#e2e3df', x, .43, z, .2, .29, .16);
    const helmet = view.mesh(g, new THREE.IcosahedronGeometry(.17, 1), '#edf0ee', x, .69, z);
    box(g, '#173b53', x, .69, z + .135, .21, .11, .06);
    box(g, orange, x, .48, z + .095, .11, .09, .025);
    for (const dx of [-.08, .08]) box(g, '#ced6dd', x + dx, .24, z, .07, .13, .12);
    for (const dx of [-.16, .16]) box(g, '#dfe4e6', x + dx, .44, z, .07, .2, .08);
    helmet.rotation.y = .2;
  };
  for (const definition of STATION_BUILDINGS) {
    const g = new THREE.Group(); g.position.set(definition.x, 0, definition.z); view.scene.add(g);
    if (definition.id === 'hangar') {
      g.scale.set(1.2, 1.15, 1.25); buildHangar(view, g);
    } else if (definition.id === 'engineering_bay') {
      // Compact attached machines; this wing shares the central structure.
      box(g, gray, 0, .66, 0, 1.5, 1.2, 1.9);
      box(g, orange, 0, 1.3, 0, 1.63, .13, 2);
      box(g, dark, .77, .72, 0, .08, .62, 1.45);
      for (const z of [-.45, 0, .45]) light(g, cyan, .82, .77, z, .04, .3, .26);
      cylinder(g, '#c4c5c9', .5, .79, 1.15, .29, 1.2);
      cylinder(g, orange, .5, 1.42, 1.15, .33, .12);
      box(g, dark, -.15, 1.57, -.55, .12, .45, .12); light(g, amber, -.15, 1.83, -.55, .12, .14, .12);
      light(g, amber, 0, .76, .98, .62, .27, .04);
    } else if (definition.id === 'astronaut_station') {
      platform(g, 1.57);
      cylinder(g, gray, 0, .86, 0, .57, 1.3);
      cylinder(g, orange, 0, 1.54, 0, .69, .14);
      cylinder(g, dark, 0, 1.72, 0, .57, .23);
      cylinder(g, gray, 0, 2.1, 0, .44, .57);
      cylinder(g, orange, 0, 2.4, 0, .53, .1);
      cylinder(g, gray, 0, 2.93, 0, .27, .99);
      light(g, amber, 0, .95, .58, .31, .45, .035);
      light(g, cyan, .57, .95, 0, .035, .31, .27);
      for (const x of [-.2, .2]) {
        box(g, dark, x, 3.7, 0, .065, .74, .065); light(g, x < 0 ? '#ff6145' : cyan, x, 4.11, 0, .1, .14, .1);
      }
      const solar = new THREE.Group(); solar.position.set(-1.24, 1.44, -.18); solar.rotation.z = .55; g.add(solar);
      box(solar, gray, 0, 0, 0, 1.28, .1, 2.07);
      for (const x of [-.31, .31]) for (const z of [-.72, 0, .72]) {
        box(solar, '#335db2', x, .065, z, .56, .04, .62);
        for (const offset of [-.13, .13]) box(solar, '#87a2cb', x + offset, .09, z, .015, .01, .62);
      }
      worker(g, .78, .88);
      box(g, orange, -.54, .37, 1.08, .39, .35, .37);
    } else if (definition.id === 'stardust_harvester') {
      platform(g, 1.6);
      cylinder(g, orange, -.34, .3, -.1, .71, .16);
      cylinder(g, dark, -.34, .42, -.1, .63, .14);
      const crystals = new THREE.Group(); g.add(crystals); view.collector = crystals;
      for (const [x, z, height] of [[-.34, -.1, 1.45], [-.64, .18, .9], [-.02, .15, 1.08], [-.54, -.44, 1.04], [.02, -.35, .81]]) {
        const mesh = view.mesh(crystals, new THREE.ConeGeometry(.19, height, 5), cyan, x, .46 + height / 2, z); mesh.rotation.z = x * .12;
      }
      for (const x of [-1.03, .36]) {
        box(g, gray, x, 1.17, -.26, .2, 1.5, .31);
        const arm = box(g, orange, x + (x < 0 ? .23 : -.23), 1.97, -.26, .68, .14, .21); arm.rotation.z = x < 0 ? .52 : -.52;
      }
      for (const z of [-.44, .19]) {
        cylinder(g, gray, .86, .91, z, .22, 1.36);
        cylinder(g, orange, .86, 1.63, z, .25, .08);
        light(g, cyan, .86, .96, z + .22, .18, .72, .035);
      }
      worker(g, .58, 1.03);
    } else if (definition.id === 'martian_garden') {
      platform(g, 1.83);
      cylinder(g, orange, 0, .29, -.15, 1.28, .17);
      const geometry = new THREE.SphereGeometry(1.25, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2);
      const glass = view.mesh(g, geometry, '#9ad6ce', 0, .37, -.15);
      const material = new THREE.MeshLambertMaterial({ color: '#a0d8d4', transparent: true, opacity: .19, depthWrite: false, side: THREE.DoubleSide, flatShading: true });
      view.materials.set('garden-glass', material); glass.material = material;
      const edges = new THREE.EdgesGeometry(geometry); view.geometries.add(edges);
      const cageMaterial = new THREE.LineBasicMaterial({ color: '#e8bc62' }); view.materials.set('garden-cage', cageMaterial);
      const cage = new THREE.LineSegments(edges, cageMaterial); cage.position.copy(glass.position); g.add(cage);
      const plant = (x, z, color, height = .3) => {
        box(g, '#638c43', x, .46, z, .04, .32, .04);
        for (const dx of [-.09, .09]) { const leaf = view.mesh(g, new THREE.ConeGeometry(.13, height, 5), color, x + dx, .56, z); leaf.rotation.z = dx < 0 ? -.65 : .65; }
      };
      for (const x of [-.64, -.24, .24, .64]) for (const z of [-.65, .3]) plant(x, z, '#73b44f');
      for (const x of [-.19, 0, .19]) plant(x, -.1, '#d64d3b', .74);
      for (const [x, z] of [[-1.38, .44], [1.27, .7], [.22, 1.36]]) {
        box(g, orange, x, .31, z, .49, .23, .47); box(g, '#674c33', x, .44, z, .41, .025, .39);
        plant(x - .08, z, '#91c94f'); plant(x + .09, z, '#66ae50');
      }
      worker(g, -.9, 1.09);
      box(g, dark, 1.35, .9, -.51, .09, 1.36, .09); light(g, cyan, 1.35, 1.62, -.51, .12, .17, .12);
    }
    // Includes platform and figurines: each area stays easy to tap at phone size.
    g.traverse(o => { if (o.isMesh || o.isLineSegments) o.userData.building = definition.id; });
  }
}
