import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';
import input from './src/main/frontend/celements/index.ts';

export default defineConfig({
  plugins: [],
  build: {
    watch: process.argv.includes('--watch') ? { buildDelay: 2000 } : null,
    outDir: 'src/main/webapp/resources/dist',
    emptyOutDir: true,
    manifest: '.vite/manifest.celements.json',
    rollupOptions: {
      input,
      output: {
        // Use .mjs extension for celements module detection
        entryFileNames: '[name].[hash].mjs',
        chunkFileNames: '[name].[hash].mjs',
      },
    },
    sourcemap: true,
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src/main/frontend', import.meta.url)),
    },
  },
});
