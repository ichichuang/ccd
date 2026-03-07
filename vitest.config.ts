import type { UserConfig } from 'vite'
import { mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'

const base = viteConfig({ mode: 'test', command: 'serve' })

export default mergeConfig(base as UserConfig, {
  test: {
    globals: true,
    // 默认 node，纯工具单测无需 DOM；组件测试可在文件头加 // @vitest-environment jsdom
    environment: 'node',
    include: ['src/**/*.spec.ts', 'src/**/*.test.ts'],
    exclude: ['node_modules', 'dist'],
    passWithNoTests: true,
  },
})
