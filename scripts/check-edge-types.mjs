import { readdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('..', import.meta.url));
const directory = path.join(root, 'supabase', 'functions');
const args = process.argv.slice(2);
if (args.some(arg => arg !== '--update-lock')) throw new Error('Only --update-lock is supported.');
async function sources(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await sources(file));
    else if (entry.isFile() && entry.name.endsWith('.ts')) files.push(file);
  }
  return files.sort();
}
const files = await sources(directory);
if (!files.length) throw new Error('No edge-function sources found; refusing an empty typecheck.');
// Use the pinned package's Node launcher on every platform. Deno uses its own
// npm resolver and lockfile, keeping server types out of the browser compiler.
const launcher = path.join(root, 'node_modules', 'deno', 'bin.cjs');
const result = spawnSync(process.execPath, [launcher, 'check', '--config', path.join(directory, 'deno.json'), args.includes('--update-lock') ? '--frozen-lockfile=false' : '--frozen-lockfile', ...files], { cwd: root, stdio: 'inherit' });
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);
console.log(`Edge typecheck passed for all ${files.length} TypeScript sources, including shared modules.`);
