import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const workspace = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const commands = {
  'app-tests': [['node_modules/vitest/vitest.mjs', 'run', '--config', 'vitest.config.ts']],
  'loop-tests': [['node_modules/vitest/vitest.mjs', 'run', '--config', 'tools/vitest.loop.config.mjs']],
  build: [['node_modules/typescript/bin/tsc'], ['node_modules/vite/bin/vite.js', 'build']],
};
const selected = commands[process.argv[2]];
if (!selected) throw new Error('Unknown gate; expected app-tests, loop-tests, or build');
for (const args of selected) {
  const code = await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, args, {cwd: workspace, shell: false, windowsHide: true, stdio: 'inherit'});
    child.once('error', reject); child.once('close', code => resolve(code ?? 1));
  });
  if (code !== 0) { process.exitCode = code; break; }
}
