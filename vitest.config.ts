import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import type { UserConfig } from 'vite'

const rootDir = dirname(fileURLToPath(import.meta.url))
export default {
  plugins: [
    vue(),
    AutoImport({ imports: ['vue', 'vue-router', 'pinia', '@vueuse/core'], dts: false }),
  ],
  test: {
    globals: true,
    environment: 'node',
    include: [
      'apps/**/*.spec.ts',
      'apps/**/*.test.ts',
      'packages/**/*.spec.ts',
      'packages/**/*.test.ts',
      'scripts/**/*.spec.ts',
    ],
    exclude: ['node_modules', '**/node_modules/**', 'dist', 'legacy'],
    passWithNoTests: true,
    coverage: {
      provider: 'v8',
      include: ['apps/**/src/**', 'packages/**/src/**'],
      exclude: ['**/*.d.ts'],
    },
  },
  resolve: {
    alias: {
      '@': resolve(rootDir, 'apps/web-demo/src'),
    },
  },
} satisfies UserConfig
