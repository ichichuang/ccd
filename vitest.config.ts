import type { UserConfig } from 'vite'
import { mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'

const base = viteConfig({ mode: 'test', command: 'serve' })

export default mergeConfig(base as UserConfig, {
  test: {
    globals: true,
    // 默认 node，纯工具单测无需 DOM；组件测试可在文件头加 // @vitest-environment jsdom
    environment: 'node',
    include: ['src/**/*.spec.ts', 'src/**/*.test.ts', 'scripts/**/*.spec.ts'],
    exclude: ['node_modules', 'dist'],
    // ⚠️ 不再允许无测试通过 — 强制要求核心模块必须有测试覆盖
    passWithNoTests: false,
    // 覆盖率配置（可选开启）
    coverage: {
      provider: 'v8',
      include: ['src/utils/**', 'src/components/**/engine/**'],
      exclude: ['src/**/*.d.ts', 'src/types/**'],
    },
  },
})
