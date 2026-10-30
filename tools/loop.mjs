import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root = new URL('../', import.meta.url);
const args = process.argv.slice(2);
const entry = args[0] === 'host' ? 'tools/loop-host.ts' : 'tools/agnostic-loop/cli.ts';
if (args[0] === 'host') args.shift();
const child = spawn(process.execPath, ['--experimental-strip-types', '--experimental-default-type=module', '--experimental-loader', new URL('tools/resolve-ts-hook.ts', root).href, fileURLToPath(new URL(entry, root)), ...args], { cwd: fileURLToPath(root), stdio: 'inherit', shell: false, windowsHide: true });
child.on('error', error => { console.error(error.message); process.exitCode = 1; });
child.on('exit', (code, signal) => { process.exitCode = code ?? 1; if (signal) console.error(`Loop host terminated with ${signal}; inspect durable state before retrying.`); });

