import { describe, expect, it } from 'vitest'
import { ESLint } from 'eslint'
import vueEslintParser from 'vue-eslint-parser'
import tseslint from 'typescript-eslint'
// @ts-ignore local ESM rule module does not publish TS declarations
import localArchitectureRules from './no-hardcoded-colors.mjs'

function createTester(filePath: string): ESLint {
  return new ESLint({
    overrideConfigFile: true,
    overrideConfig: [
      {
        files: ['src/**/*.{vue,ts,tsx}'],
        languageOptions: {
          parser: filePath.endsWith('.vue') ? vueEslintParser : tseslint.parser,
          parserOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            ecmaFeatures: { jsx: true },
            parser: tseslint.parser,
          },
        },
        plugins: {
          'app-architecture': localArchitectureRules,
        },
        rules: {
          'app-architecture/no-hardcoded-colors': 'error',
        },
      },
    ],
  })
}

async function lintText(code: string, filePath: string) {
  const eslint = createTester(filePath)
  const [result] = await eslint.lintText(code, { filePath })
  return result.messages.map(message => message.ruleId)
}

describe('no-hardcoded-colors ESLint rule', () => {
  it('reports Vue template raw palette classes', async () => {
    await expect(
      lintText('<template><div class="text-gray-500"></div></template>', 'src/views/demo.vue')
    ).resolves.toContain('app-architecture/no-hardcoded-colors')
  })

  it('reports TSX className palette classes', async () => {
    await expect(
      lintText('export const X = () => <div className="bg-white" />', 'src/components/Demo.tsx')
    ).resolves.toContain('app-architecture/no-hardcoded-colors')
  })

  it('reports style hex values in Vue style blocks', async () => {
    await expect(
      lintText('<template><div /></template><style>.x{color:#ff0000}</style>', 'src/views/demo.vue')
    ).resolves.toContain('app-architecture/no-hardcoded-colors')
  })

  it('allows token source files to define hex values', async () => {
    await expect(
      lintText('export const color = "#ff0000"', 'src/constants/theme.ts')
    ).resolves.not.toContain('app-architecture/no-hardcoded-colors')
  })
})
