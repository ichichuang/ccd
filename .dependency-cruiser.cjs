/* global module */

module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      comment: 'Circular dependencies are forbidden in shared packages.',
      from: { path: '^packages/' },
      to: { circular: true },
    },
    {
      name: 'core-does-not-import-apps',
      severity: 'error',
      comment: 'Core must remain runtime-neutral and cannot depend on apps.',
      from: { path: '^packages/core/src' },
      to: { path: '^apps/' },
    },
    {
      name: 'apps-do-not-import-sibling-apps',
      severity: 'error',
      comment: 'Apps cannot import sibling apps.',
      from: { path: '^apps/([^/]+)/src' },
      to: { path: '^apps/(?!$1/)[^/]+/src' },
    },
    {
      name: 'no-core-deep-imports',
      severity: 'error',
      comment: 'Use @ccd/core public exports only.',
      from: {},
      to: { dependencyTypes: ['npm'], path: '^@ccd/core/' },
    },
    {
      name: 'no-filesystem-core-deep-imports',
      severity: 'error',
      comment: 'Filesystem deep imports into core are forbidden.',
      from: { pathNot: '^packages/core/src' },
      to: { path: '^packages/core/src/(?!index\\.ts$)' },
    },
    {
      name: 'desktop-tauri-contained',
      severity: 'error',
      comment: 'Tauri imports are allowed only in desktop adapter modules.',
      from: { path: '^apps/desktop/src/(?!adapters/)' },
      to: { dependencyTypes: ['npm'], path: '^@tauri-apps/' },
    },
    {
      name: 'no-legacy-imports',
      severity: 'error',
      comment: 'Legacy archive is historical only and cannot re-enter active graphs.',
      from: { path: '^(apps|packages)/' },
      to: { path: '^legacy/' },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    exclude: {
      path: '(^|/)(dist|node_modules|legacy|src-tauri/target)/',
    },
    tsPreCompilationDeps: true,
    tsConfig: { fileName: 'tsconfig.json' },
  },
}
