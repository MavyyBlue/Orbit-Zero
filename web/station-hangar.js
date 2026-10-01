import * as THREE from './vendor/three.module.min.js';

// Reference-led arcade Hangar: actual low-poly geometry, no textures or cabin UI.
// All materials/geometries belong to StationView's existing disposal lifecycle.
export function buildHangar(view, g) {
  const gray = '#a4a9b2', dark = '#414a5d', orange = '#ec8d28', yellow = '#f4bf50';
  const box = (color, x, y, z, w, h, d) => view.box(g, color, x, y, z, w, h, d);
  const cylinder = (color, x, y, z, radius, height) => view.cylinder(g, color, x, y, z, radius, height, 8);
  const glow = (color, x, y, z, w, h, d) => {
    const key = `hangar-light-${color}`;
    if (!view.materials.has(key)) view.materials.set(key, new THREE.MeshLambertMaterial({ color, emissive: color, emissiveIntensity: .8, flatShading: true }));
    const mesh = box(color, x, y, z, w, h, d); mesh.material = view.materials.get(key); return mesh;
  };
  // A thick floating deck with chamfered corners, visible rim equipment and
  // a small docking extension mirrors the concept's layered orbital platforms.
  const deck = cylinder('#747c8a', 0, -.15, .1, 2.45, .65); deck.scale.z = .97;
  const deckTop = cylinder('#a1a4aa', 0, .19, .1, 2.45, .05); deckTop.scale.z = .97;
  for (const x of [-2.02, 2.02]) for (const z of [-.82, 1.08]) {
    box('#626a78', x, -.13, z, .26, .69, .4);
    box(orange, x, .27, z, .28, .13, .43);
    glow('#ffd054', x, -.05, z + .22, .19, .17, .04);
  }
  cylinder(dark, 0, -.65, .1, 1.76, .36);
  const dock = cylinder('#858b96', 0, -.15, 2.65, .7, .4); dock.scale.z = .76;
  const dockTop = cylinder('#505565', 0, .07, 2.65, .62, .025); dockTop.scale.z = .76;
  for (const x of [-.53, .53]) glow('#ffb33f', x, .16, 2.62, .12, .06, .18);
  for (let i = 0; i < 3; i++) box('#8b929e', 0, .17 - i * .03, 2.09 + i * .13, 1.05, .1, .17);

  // Thick faceted shell with an open, chamfered doorway. The U profile runs
  // through the whole bay so the opening has genuine depth at every pan/zoom.
  const profile = new THREE.Shape();
  const outline = [[-1.92, 0], [-1.92, 1.62], [-1.32, 2.22], [1.32, 2.22], [1.92, 1.62], [1.92, 0], [1.37, 0], [1.37, 1.43], [1.02, 1.84], [-1.02, 1.84], [-1.37, 1.43], [-1.37, 0]];
  profile.moveTo(...outline[0]); for (const point of outline.slice(1)) profile.lineTo(...point); profile.closePath();
  view.mesh(g, new THREE.ExtrudeGeometry(profile, { depth: 2.12, bevelEnabled: false, steps: 1 }), gray, 0, .19, -1.58);
  box('#222a3b', 0, 1.05, -1.54, 3.25, 1.7, .12);
  box('#55545a', 0, .24, -.53, 2.85, .1, 2.15);
  const bayLight = new THREE.PointLight(0xffc66a, 2.5, 3, 1.5);
  bayLight.position.set(0, 1.15, .02); g.add(bayLight);
  for (const x of [-1.67, 1.67]) {
    box(orange, x, 1.05, -.48, .54, .17, 2.18);
    box('#747e8f', x, .42, .65, .56, .46, .3);
    glow('#32ccff', x, .45, .82, .27, .24, .06);
    // Warm edge lights sit inside the gray frame, not across the opening.
    glow('#ffd35b', Math.sign(x) * 1.32, .83, .38, .065, 1.07, .09);
    glow('#ffd35b', Math.sign(x) * .94, 1.93, .39, .49, .055, .09);
  }
  box('#9c9faa', 0, 2.44, -.58, 2.74, .12, 1.8);
  box(orange, 0, 2.17, .61, 2.55, .2, .13);
  box(orange, 0, 2.13, .74, .92, .52, .25);
  box(dark, 0, 2.14, .89, .65, .32, .06);
  glow('#2acaff', 0, 2.14, .93, .52, .22, .035);
  for (const x of [-.7, 0, .7]) {
    box('#596174', x, .86, -1.44, .61, 1.27, .05);
    glow('#ffd35b', x, .3, -1.39, .35, .065, .035);
  }
  for (const x of [-.93, .93]) for (let i = 0; i < 4; i++) box(yellow, x, .26, -.64 + i * .29, .1, .016, .13);

  // Landing apron: octagonal yellow outline, white H stencil and chunky edge
  // hardware. Keep the apron clear so the symbol reads at normal phone zoom.
  box('#535967', 0, .26, 1.28, 3.87, .15, 1.48);
  const marking = view.mesh(g, new THREE.RingGeometry(1.07, 1.16, 8), yellow, 0, .342, 1.22);
  marking.rotation.x = -Math.PI / 2; marking.scale.y = .57;
  for (const x of [-.3, .3]) box('#e4e4dc', x, .349, 1.22, .12, .014, .59);
  box('#e4e4dc', 0, .35, 1.22, .6, .014, .12);
  for (const x of [-1.84, 1.84]) {
    box('#848b97', x, .34, 1.26, .24, .24, 1.36);
    for (const z of [.79, 1.72]) {
      box(orange, x, .51, z, .26, .15, .22);
      glow('#ffd35b', x, .6, z, .17, .03, .12);
    }
  }
  for (const x of [-1.36, 1.36]) for (let i = 0; i < 4; i++) box(yellow, x, .347, .7 + i * .29, .11, .014, .13);
  box('#747d8b', 0, .13, 2.04, 2.2, .12, .26);
  for (const x of [-.9, .9]) box(yellow, x, .2, 2.04, .17, .025, .26);

  // Roof operations pod and a simple open low-poly satellite dish.
  cylinder('#707a8c', 0, 2.66, -.56, .69, .35);
  cylinder('#c2c3c8', 0, 2.86, -.56, .73, .08);
  glow('#26cfff', 0, 2.69, .08, .52, .16, .065);
  glow('#26cfff', .64, 2.69, -.56, .065, .16, .39);
  cylinder(dark, -.22, 3.08, -.75, .16, .36);
  const dish = view.mesh(g, new THREE.LatheGeometry([new THREE.Vector2(.05, 0), new THREE.Vector2(.22, .035), new THREE.Vector2(.46, .19), new THREE.Vector2(.61, .39)], 8), '#c9c9cd', -.22, 3.28, -.75);
  const dishKey = 'hangar-dish';
  if (!view.materials.has(dishKey)) view.materials.set(dishKey, new THREE.MeshLambertMaterial({ color: '#c9c9cd', side: THREE.DoubleSide, flatShading: true }));
  dish.material = view.materials.get(dishKey); dish.rotation.z = -.48;
  const aerial = box(dark, -.04, 3.52, -.75, .065, .59, .065); aerial.rotation.z = -.48;
  glow('#ffad37', .09, 3.79, -.75, .14, .14, .14);
  for (const [x, z, height, color] of [[-1.22, -1.15, .78, '#ff6944'], [1.21, -1.15, .53, '#29d6ff']]) {
    box('#77818e', x, 2.55, z, .17, .2, .17);
    box(dark, x, 2.62 + height / 2, z, .06, height, .06);
    glow(color, x, 2.64 + height, z, .12, .14, .12);
  }

  // A small rooftop solar array and cargo cases echo the reference's utility.
  const solar = box('#354666', 1.32, 2.21, -.57, .66, .07, 1.4); solar.rotation.z = -.25;
  for (let i = 0; i < 4; i++) {
    const cell = box('#467bd0', 1.32, 2.27, -1.08 + i * .34, .56, .025, .27); cell.rotation.z = -.25;
  }
  const crate = (x, y, z, color = '#bd792e') => {
    box(color, x, y, z, .37, .35, .35);
    for (const dx of [-.13, .13]) box('#e9a740', x + dx, y, z + .18, .06, .34, .035);
    box(dark, x, y + .03, z + .2, .11, .1, .03);
  };
  crate(.7, .42, -.8, '#496c86'); crate(.7, .77, -.8, '#496c86'); crate(.35, .42, -.65); crate(1.51, .44, 1.04);
}
