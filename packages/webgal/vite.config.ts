// @ts-nocheck

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import loadVersion from 'vite-plugin-package-version';
import { resolve, relative } from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import { readdirSync, watch, writeFileSync } from 'fs';
import { isEqual } from 'lodash';

// postcss
import postcssPresetEnv from 'postcss-preset-env';
import cssnano from 'cssnano';

// https://vitejs.dev/config/

// @ts-ignore
const env = process.env.NODE_ENV;
console.log(env);
(() => {
  const pixiPerformScriptDirPath = './src/Core/gameScripts/pixi/performs/';
  const pixiPerformManagerDirPath = './src/Core/util/pixiPerformManager/';
  const relativePath = relative(pixiPerformManagerDirPath, pixiPerformScriptDirPath).replaceAll('\\', '/');
  let lastFiles: string[] = [];

  function setInitFile() {
    console.log('Automatic writing pixi.js dependencies mixins...');
    writeFileSync(
      resolve(pixiPerformManagerDirPath, 'initRegister.ts'),
      lastFiles
        .map((v) => {
          const filePath = relativePath + '/' + v.slice(0, v.lastIndexOf('.'));
          return `import '${filePath}';`;
        })
        .join('\n') + '\n',
      { encoding: 'utf-8' },
    );
    console.log('Done.');
  }

  function getPixiPerformScriptFiles() {
    const pixiPerformScriptFiles = readdirSync(pixiPerformScriptDirPath, { encoding: 'utf-8' }).filter((v) =>
      ['ts', 'js', 'tsx', 'jsx'].includes(v.slice(v.indexOf('.') + 1, v.length)),
    );
    if (!isEqual(pixiPerformScriptFiles, lastFiles)) {
      lastFiles = pixiPerformScriptFiles;
      setInitFile();
    }
  }

  getPixiPerformScriptFiles();

  if (env !== 'production') watch(pixiPerformScriptDirPath, { encoding: 'utf-8' }, getPixiPerformScriptFiles);
})();

export default defineConfig({
  css: {
    postcss: {
      plugins: [postcssPresetEnv(), cssnano()],
    },
  },
  plugins: [react(), loadVersion(), visualizer()],
  resolve: {
    alias: {
      '@': resolve('src'),
    },
  },
  build: {
    // sourcemap: true,
  },
});
