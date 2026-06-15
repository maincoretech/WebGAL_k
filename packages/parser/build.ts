#!/usr/bin/env bun
// Replace rollup with bun build

import { rmSync, existsSync } from 'fs';

const outDir = 'build';
if (existsSync(outDir)) rmSync(outDir, { recursive: true });

const shared = {
  entrypoints: ['src/index.ts'],
  target: 'bun',
  external: ['chevrotain', 'cloudlogjs', 'lodash'],
};

await Bun.build({ ...shared, outdir: 'build/es', format: 'esm', naming: 'index.js' });
await Bun.build({ ...shared, outdir: 'build/cjs', format: 'cjs', naming: 'index.cjs' });
await Bun.build({ ...shared, outdir: 'build/umd', format: 'iife', naming: 'index.global.js' });

// Declarations
const tsc = Bun.spawnSync(['bunx', 'tsc', '--project', 'tsconfig.build.json']);
if (tsc.stderr.length) console.error(new TextDecoder().decode(tsc.stderr));
if (tsc.stdout.length) console.log(new TextDecoder().decode(tsc.stdout));

console.log('✅ Parser build complete');
