import { readdirSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
for (const dir of ['web', 'web/vendor', 'scripts', 'tests']) for (const name of readdirSync(dir)) {
  if (!/\.(js|mjs)$/.test(name)) continue;
  const r = spawnSync(process.execPath, ['--check', `${dir}/${name}`], { stdio: 'inherit' });
  if (r.status) process.exit(r.status);
}
for (const file of ['index.html', 'style.css', 'game.js', 'simulation.js', 'save.js', 'audio.js']) if (!readFileSync(`web/${file}`).length) throw new Error(`Empty ${file}`);
console.log('JavaScript syntax and web entrypoint: PASS');
