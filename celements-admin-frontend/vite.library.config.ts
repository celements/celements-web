import { fileURLToPath, URL } from 'node:url';

import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite';

const peerDependencies = ['pinia', 'primevue', 'vue', 'vue-i18n', 'vue-router', 'vuefinder'];

export default defineConfig({
  define: {
    'import.meta.env.VITE_CELEMENTS_DEPLOYABLE': JSON.stringify('false'),
  },
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.includes('-'),
        },
      },
    }),
  ],
  build: {
    cssCodeSplit: false,
    emptyOutDir: false,
    lib: {
      entry: {
        runtime: 'src/public/runtime.ts',
        'page-attachments': 'src/public/page-attachments.ts',
        'page-attachments-island': 'src/public/page-attachments-island.ts',
        styles: 'src/public/styles.ts',
      },
      cssFileName: 'styles',
      formats: ['es'],
    },
    outDir: 'dist/package',
    rollupOptions: {
      external: (id) =>
        peerDependencies.some((dependency) => id === dependency || id.startsWith(`${dependency}/`)),
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name]-[hash].js',
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
