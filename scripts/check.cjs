const { readdirSync } = require('node:fs');
const { spawnSync } = require('node:child_process');
const { resolve } = require('node:path');
const root = resolve(__dirname, '..');
let failed = 0;
for (const name of readdirSync(resolve(root, 'checks')).filter(n => n.endsWith('.cjs')).sort()) {
  const result = spawnSync(process.execPath, [resolve(root, 'checks', name)], { cwd: root, stdio: 'inherit' });
  if (result.error || result.status !== 0) failed++;
}
if (failed) console.error(`${failed} check(s) failed.`);
process.exitCode = failed ? 1 : 0;
