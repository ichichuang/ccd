import type { UserConfig } from 'vite'
export default {
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
    exclude: ['node_modules', 'dist', 'legacy'],
    passWithNoTests: true,
    coverage: {
      provider: 'v8',
      include: ['apps/**/src/**', 'packages/**/src/**'],
      exclude: ['**/*.d.ts'],
    },
  },
} satisfies UserConfig
