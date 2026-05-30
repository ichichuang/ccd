import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import AutoImport from 'unplugin-auto-import/vite'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { defineConfig, defineProject } from 'vitest/config'

const rootDir = dirname(fileURLToPath(import.meta.url))

const sharedInclude = [
  'apps/**/*.spec.ts',
  'apps/**/*.spec.tsx',
  'apps/**/*.test.ts',
  'apps/**/*.test.tsx',
  'packages/**/*.spec.ts',
  'packages/**/*.spec.tsx',
  'packages/**/*.test.ts',
  'packages/**/*.test.tsx',
  'scripts/**/*.spec.ts',
]

const domInclude = [
  'apps/**/*.dom.spec.ts',
  'apps/**/*.dom.spec.tsx',
  'apps/**/*.dom.test.ts',
  'apps/**/*.dom.test.tsx',
  'packages/**/*.dom.spec.ts',
  'packages/**/*.dom.spec.tsx',
  'packages/**/*.dom.test.ts',
  'packages/**/*.dom.test.tsx',
]

const sharedExclude = ['node_modules', '**/node_modules/**', 'dist']

export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
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
          exclude: [
            ...sharedExclude,
            '**/*.dom.spec.ts',
            '**/*.dom.spec.tsx',
            '**/*.dom.test.ts',
            '**/*.dom.test.tsx',
          ],
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
