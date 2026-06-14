// @ts-nocheck
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import loadVersion from 'vite-plugin-package-version';
import { resolve } from 'path';
import Info from 'unplugin-info/vite';
import viteCompression from 'vite-plugin-compression';
import fs from 'fs';
import path from 'path';

// https://vitejs.dev/config/

const env = process.env.NODE_ENV;
console.log(env);

/** Remove dist/game/ — assets are served from hexz archive */
function stripGameAssets() {
  return {
    name: 'strip-game-assets',
    closeBundle() {
      const gameDir = path.resolve(__dirname, 'dist', 'game');
      if (fs.existsSync(gameDir)) {
        fs.rmSync(gameDir, { recursive: true, force: true });
        console.log('[strip-game-assets] Removed dist/game/');
      }
    },
  };
}

export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ['legacy-js-api'],
      },
    },
  },
  plugins: [
    react(),
    loadVersion(),
    Info(),
    viteCompression({
      filter: /^(.*assets).*\.(js|css|ttf)$/,
      algorithm: 'brotliCompress',
    }),
    stripGameAssets(),
    // @ts-ignore
    // visualizer(),
  ],
  resolve: {
    alias: {
      '@': resolve('src'),
    },
  },
  build: {
    // sourcemap: true,
  },
});
