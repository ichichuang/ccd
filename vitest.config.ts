import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'

const root = process.cwd()
const pathResolve = (dir: string) => resolve(root, dir)

export default defineConfig({
  plugins: [vue(), vueJsx()],
  resolve: {
    alias: {
      '@': pathResolve('src'),
      '@!': pathResolve('src/api'),
      '@&': pathResolve('src/layouts/components'),
    },
  },
  test: {
    globals: true,
    environment: 'node', // use 'jsdom' for component tests; node suffices for hook-only tests
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    passWithNoTests: true, // 无测试文件时以 exit 0 退出，避免 CI/check 失败
  },
})
