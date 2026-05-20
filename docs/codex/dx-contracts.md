# DX Contracts

This document records the repo-level DX decisions that are easy to misread from generated files.

## Auto-Imports

Source of truth: `build/plugins.ts` and `.ai/rules/core/07-vue-auto-imports.mdc`.

The auto-import scope is intentionally narrow:

- Vue, Vue Router, Pinia, VueUse, and `$t` are available through `unplugin-auto-import`.
- Store auto-imports are limited to grouped store folders under `src/stores/modules/{system,session,ui}`.
- Composable auto-imports are limited to `src/hooks/**/*.ts`.
- API methods, constants, router config, utilities, plugins, and layouts stay explicit.

Decision: keep this scope. Do not add `src/utils/**`, `src/api/**`, root store barrels, or constants to auto-imports. Explicit imports preserve source clarity and keep business calls reviewable.

## Semantic Shortcuts

Source of truth: `packages/unocss-preset/src/shortcuts/semanticShortcuts.ts`.

Use semantic shortcuts for repeated layout/material patterns such as `layout-narrow`, `col-fill`, `material-elevated`, `glass-panel`, `surface-info`, and `code-block`. Do not invent new shortcut names in templates; add them to the SSOT first.

`glass-base` is an internal primitive for shortcut composition only. Templates should use public wrappers such as `glass-panel`, `glass-card`, `glass-shell`, `glass-icon-box`, or `glass-capsule`.

## Lodash Wrapper

Source of truth: `src/utils/lodashes.ts` and `.ai/rules/core/00-root-gatekeeper.mdc`.

Keep `@/utils/lodashes` as the third-party utility anti-corruption layer. Direct `lodash-es` imports should stay inside the wrapper unless the root gatekeeper rule is changed at the same time.

Component interaction utilities should prefer VueUse first, for example `useDebounceFn` or `useThrottleFn`, because VueUse handles component lifecycle cleanup.
