import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { defineConfig, defineProject } from 'vitest/config'

const rootDir = dirname(fileURLToPath(import.meta.url))

const sharedInclude = [
  'apps/**/*.spec.ts',
  'apps/**/*.test.ts',
  'packages/**/*.spec.ts',
  'packages/**/*.test.ts',
  'scripts/**/*.spec.ts',
]

const domInclude = [
  'apps/**/*.dom.spec.ts',
  'apps/**/*.dom.test.ts',
  'packages/**/*.dom.spec.ts',
  'packages/**/*.dom.test.ts',
]

const sharedExclude = ['node_modules', '**/node_modules/**', 'dist']

export default defineConfig({
  plugins: [
    vue(),
    AutoImport({ imports: ['vue', 'vue-router', 'pinia', '@vueuse/core'], dts: false }),
  ],
  test: {
    globals: true,
    coverage: {
      provider: 'v8',
      include: ['apps/**/src/**', 'packages/**/src/**'],
      exclude: ['**/*.d.ts'],
    },
    projects: [
      defineProject({
        extends: true,
        test: {
          name: 'node',
          environment: 'node',
          include: sharedInclude,
          exclude: [...sharedExclude, '**/*.dom.spec.ts', '**/*.dom.test.ts'],
          passWithNoTests: true,
        },
      }),
      defineProject({
        extends: true,
        test: {
          name: 'jsdom',
          environment: 'jsdom',
          include: domInclude,
          exclude: sharedExclude,
        },
      }),
    ],
  },
  resolve: {
    alias: {
      '@': resolve(rootDir, 'apps/web-demo/src'),
      '@!': resolve(rootDir, 'apps/web-demo/src/api'),
      '@&': resolve(rootDir, 'apps/web-demo/src/layouts/components'),
    },
  },
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
  },
})
