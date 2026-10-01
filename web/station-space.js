import * as THREE from './vendor/three.module.min.js';

// Decorative camera-space sky. It never participates in flight or station state.
export function buildStationSpace(view) {
  let seed = 619;
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  const sky = new THREE.Group(); view.camera.add(sky); view.scene.add(view.camera);
  const canvas = document.createElement('canvas'); canvas.width = canvas.height = 512;
  const ctx = canvas.getContext('2d');
  ctx.globalCompositeOperation = 'screen';
  for (let i = 0; i < 65; i++) {
    const x = 170 + random() * 320, y = random() * 512, radius = 24 + random() * 105;
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, i % 3 ? '#7332b52b' : '#bd41d536'); gradient.addColorStop(1, '#12072f00');
    ctx.fillStyle = gradient; ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  }
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
  view.textures.add(texture);
  const nebulaMaterial = new THREE.MeshBasicMaterial({ map: texture, transparent: true, opacity: .8, depthWrite: false });
  view.materials.set('space-nebula', nebulaMaterial);
  const nebulaGeometry = new THREE.PlaneGeometry(2, 2); view.geometries.add(nebulaGeometry);
  const nebula = new THREE.Mesh(nebulaGeometry, nebulaMaterial); nebula.position.z = -72; sky.add(nebula);
  const vertices = [], colors = [];
  for (let i = 0; i < 260; i++) { vertices.push(random() * 2 - 1, random() * 2 - 1, -70); colors.push(.65 + random() * .35, .8 + random() * .2, 1); }
  const starsGeometry = new THREE.BufferGeometry();
  starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3)); starsGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3)); view.geometries.add(starsGeometry);
  const starsMaterial = new THREE.PointsMaterial({ size: 1.7, sizeAttenuation: false, vertexColors: true, transparent: true, opacity: .8 }); view.materials.set('space-stars', starsMaterial);
  const stars = new THREE.Points(starsGeometry, starsMaterial); sky.add(stars);
  const bodies = [];
  const body = (color, x, y, radius, detail = 0) => {
    const mesh = view.mesh(sky, new THREE.IcosahedronGeometry(radius, detail), color, 0, 0, -60);
    mesh.rotation.set(random(), random(), random()); bodies.push({ mesh, x, y });
  };
  body('#ca784e', -.85, .75, 1.35, 1); body('#1762ab', .97, .7, 2.25, 2);
  for (let i = 0; i < 13; i++) {
    const x = (i % 2 ? 1 : -1) * (.72 + random() * .3), y = random() * 1.8 - .9;
    body(i % 3 ? '#747784' : '#9e8b83', x, y, .18 + random() * .38);
  }
  return (width, height) => {
    nebula.scale.set(width, height, 1); stars.scale.set(width, height, 1);
    for (const { mesh, x, y } of bodies) mesh.position.set(x * width, y * height, -60);
  };
}
