import { fileURLToPath, URL } from 'node:url';

import vue from '@vitejs/plugin-vue';
import { defineConfig, loadEnv } from 'vite';

// https://vite.dev/config/
export default defineConfig(({mode}) =>  getViteConfig(mode));

// Export a function to resolve the config manually for Vitest
export const getViteConfig = (mode: string) => {
  const env = loadEnv(mode, process.cwd());
  return defineConfig({
    plugins: [
      vue({
        template:{
          compilerOptions:{
            isCustomElement: (tag) => tag.includes('-')
          }
        }
      }),
    ],
    server: {
      proxy: {
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
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
    },
    preview: {
      allowedHosts: ['alumni.appint.demospace.ch', 'localhost'],
    },
  });
};
