import { describe, expect, it } from 'vitest'
import {
  classifyPackageInternalImport,
  collectExportTargets,
  validatePackagePublicSurface,
} from './package-surface-rules.mjs'

const packages = [
  { name: '@ccd/design-tokens', path: 'packages/design-tokens', publicApi: true },
  { name: '@ccd/vue-ui', path: 'packages/vue-ui', publicApi: true },
  { name: '@ccd/web-demo', path: 'apps/web-demo', publicApi: false },
]

describe('package public surface rules', () => {
  it('collects nested package export targets', () => {
    expect(
      collectExportTargets(
        Object.fromEntries([
          [
            '.',
            {
              types: './dist/index.d.ts',
              import: './dist/index.js',
            },
          ],
          ['./style.css', './dist/vue-ui.css'],
        ])
      )
    ).toEqual(['./dist/index.d.ts', './dist/index.js', './dist/vue-ui.css'])
  })

  it('accepts explicit dist-backed public package surfaces', () => {
    expect(
      validatePackagePublicSurface(
        { name: '@ccd/vue-ui', path: 'packages/vue-ui', publicApi: true },
        {
          main: './dist/index.js',
          module: './dist/index.js',
          types: './dist/index.d.ts',
          exports: Object.fromEntries([
            [
              '.',
              {
                types: './dist/index.d.ts',
                import: './dist/index.js',
                default: './dist/index.js',
              },
            ],
            ['./style.css', './dist/vue-ui.css'],
          ]),
        },
        { hasSourceIndex: true }
      )
    ).toEqual([])
  })

  it('rejects src-backed or missing public package surfaces', () => {
    expect(
      validatePackagePublicSurface(
        { name: '@ccd/vue-ui', path: 'packages/vue-ui', publicApi: true },
        {
          main: './src/index.ts',
          exports: Object.fromEntries([['.', './src/index.ts']]),
        },
        { hasSourceIndex: false }
      )
    ).toEqual([
      '@ccd/vue-ui must define its public source surface in src/index.ts',
      '@ccd/vue-ui export target must point at ./dist/**, received "./src/index.ts"',
      'main must point at ./dist/**, received "./src/index.ts"',
    ])
  })

  it('allows same-package internal imports but blocks cross-workspace source imports', () => {
    expect(
      classifyPackageInternalImport(
        'packages/vue-ui/src/ProTable/index.ts',
        '../ProForm/index',
        packages
      )
    ).toMatchObject({ allowed: true, owner: '@ccd/vue-ui' })

    expect(
      classifyPackageInternalImport(
        'apps/web-demo/src/main.ts',
        '../../../packages/vue-ui/src/ProTable/index',
        packages
      )
    ).toMatchObject({ allowed: false, owner: '@ccd/vue-ui' })

    expect(
      classifyPackageInternalImport(
        'packages/vue-ui/src/index.ts',
        '../../design-tokens/src/theme',
        packages
      )
    ).toMatchObject({ allowed: false, owner: '@ccd/design-tokens' })
  })
})
