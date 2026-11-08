import { mergeConfig, defineConfig, configDefaults } from 'vitest/config'
import { getViteConfig } from './vite.config';

export default mergeConfig(
  getViteConfig(process.env.NODE_ENV || 'test'),
  defineConfig({
    test: {
      environment: 'jsdom',
      exclude: [...configDefaults.exclude, 'e2e/**'],
      root: './test',
    },
  }),
)
