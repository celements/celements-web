import { fileURLToPath, URL } from 'node:url';

import vue from '@vitejs/plugin-vue';
import { defineConfig, loadEnv } from 'vite';

// https://vite.dev/config/
export default defineConfig(({ mode, command }) => getViteConfig(mode, command));

// Export a function to resolve the config manually for Vitest
export const getViteConfig = (mode: string, command: 'build' | 'serve' = 'serve') => {
  const env = loadEnv(mode, process.cwd());
  return defineConfig({
    base: command === 'build' ? '/static/admin/' : '/',
    define: {
      'import.meta.env.VITE_CELEMENTS_DEPLOYABLE': JSON.stringify(
        command === 'build' ? 'true' : 'false'
      ),
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
      manifest: true,
      emptyOutDir: true,
      chunkSizeWarningLimit: 1500,
      rollupOptions: {
        input: {
          embedded: 'src/embedded.ts',
          runtime: 'src/public/runtime.ts',
          'page-attachments': 'src/public/page-attachments.ts',
          'page-attachments-island': 'src/public/page-attachments-island.ts',
        },
        output: {
          entryFileNames: 'assets/[name].js',
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames(assetInfo) {
            if (assetInfo.name === 'vendor.css') return 'assets/vendor.css';
            if (assetInfo.name === 'embedded.css') return 'assets/embedded.css';
            if (assetInfo.name?.endsWith('.css')) return 'assets/admin.css';
            return 'assets/[name][extname]';
          },
          manualChunks(id) {
            if (id.includes('node_modules')) {
              return 'vendor';
            }
          },
        },
      },
    },
    server: {
      proxy: {
        '^/api': {
          target: env.VITE_CEL_API_URL,
          changeOrigin: true,
        },
        '^/download': {
          target: env.VITE_CEL_API_URL,
          changeOrigin: true,
        },
        '^/file': {
          target: env.VITE_CEL_API_URL,
          changeOrigin: true,
        },
      },
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    preview: {
      allowedHosts: ['localhost'],
    },
  });
};
