# Dependency Outdated Snapshot

- Date: 2026-06-08
- Command: `pnpm deps:outdated`
- Result: command exited `1` because outdated dependencies were found; no packages were upgraded.
- Owner constraint: `.ai/runtime/owner_decisions.md` marks `Dependency modernization` as `FULL_GO_DEFERRED`; upgrades must use future single-dependency or compatibility lanes.

## Patch/Minor Candidates

| Package                          | Current   | Latest    |
| -------------------------------- | --------- | --------- |
| `@iconify-json/logos`            | `1.2.10`  | `1.2.11`  |
| `@iconify-json/lucide`           | `1.2.96`  | `1.2.111` |
| `@iconify/utils`                 | `3.1.0`   | `3.1.3`   |
| `@primevue/auto-import-resolver` | `4.5.4`   | `4.5.5`   |
| `@primevue/core`                 | `4.5.4`   | `4.5.5`   |
| `@primevue/forms`                | `4.5.4`   | `4.5.5`   |
| `@primevue/icons`                | `4.5.4`   | `4.5.5`   |
| `@tanstack/vue-virtual`          | `3.13.23` | `3.13.28` |
| `@vitejs/plugin-vue`             | `6.0.3`   | `6.0.7`   |
| `@vitejs/plugin-vue-jsx`         | `5.1.3`   | `5.1.5`   |
| `@vue/compiler-sfc`              | `3.5.29`  | `3.5.35`  |
| `@vue/test-utils`                | `2.4.6`   | `2.4.11`  |
| `crypto-es`                      | `3.1.2`   | `3.1.3`   |
| `dayjs`                          | `1.11.19` | `1.11.21` |
| `dependency-cruiser`             | `17.4.0`  | `17.4.3`  |
| `postcss`                        | `8.5.6`   | `8.5.15`  |
| `prettier`                       | `3.8.1`   | `3.8.3`   |
| `primevue`                       | `4.5.4`   | `4.5.5`   |
| `turbo`                          | `2.9.14`  | `2.9.16`  |
| `vue`                            | `3.5.25`  | `3.5.35`  |
| `@playwright/test`               | `1.59.1`  | `1.60.0`  |
| `@unocss/*` packages             | `66.6.0`  | `66.7.0`  |
| `alova`                          | `3.4.0`   | `3.5.1`   |
| `autoprefixer`                   | `10.4.23` | `10.5.0`  |
| `baseline-browser-mapping`       | `2.9.19`  | `2.10.34` |
| `echarts`                        | `6.0.0`   | `6.1.0`   |
| `globals`                        | `17.1.0`  | `17.6.0`  |
| `gsap`                           | `3.14.2`  | `3.15.0`  |
| `lodash-es`                      | `4.17.21` | `4.18.1`  |
| `overlayscrollbars`              | `2.14.0`  | `2.16.0`  |
| `sass`                           | `1.97.3`  | `1.100.0` |
| `stylelint`                      | `17.4.0`  | `17.13.0` |
| `terser`                         | `5.46.0`  | `5.48.0`  |
| `tsx`                            | `4.21.0`  | `4.22.4`  |
| `typescript-eslint`              | `8.53.1`  | `8.60.1`  |
| `unocss`                         | `66.6.0`  | `66.7.0`  |
| `vitest`                         | `4.0.18`  | `4.1.8`   |
| `vue-eslint-parser`              | `10.2.0`  | `10.4.1`  |
| `zod`                            | `4.3.6`   | `4.4.3`   |
| `overlayscrollbars-vue`          | `0.5.9`   | `0.5.10`  |

## Major/Compatibility Lanes

| Package                           | Current   | Latest   |
| --------------------------------- | --------- | -------- |
| `@commitlint/cli`                 | `19.8.1`  | `21.0.2` |
| `@commitlint/config-conventional` | `19.8.1`  | `21.0.2` |
| `@eslint/js`                      | `9.39.2`  | `10.0.1` |
| `@faker-js/faker`                 | `9.9.0`   | `10.4.0` |
| `@types/node`                     | `24.12.4` | `25.9.2` |
| `@vueuse/core`                    | `13.9.0`  | `14.3.0` |
| `chokidar`                        | `4.0.3`   | `5.0.0`  |
| `concurrently`                    | `9.2.1`   | `10.0.3` |
| `cross-env`                       | `7.0.3`   | `10.1.0` |
| `eslint`                          | `9.39.2`  | `10.4.1` |
| `eslint-plugin-vue`               | `9.33.0`  | `10.9.2` |
| `glob`                            | `11.1.0`  | `13.0.6` |
| `jsdom`                           | `28.1.0`  | `29.1.1` |
| `lint-staged`                     | `15.5.2`  | `17.0.7` |
| `npm-run-all2`                    | `7.0.2`   | `9.0.1`  |
| `rollup-plugin-visualizer`        | `6.0.5`   | `7.0.1`  |
| `typescript`                      | `5.9.3`   | `6.0.3`  |
| `unplugin-auto-import`            | `20.3.0`  | `21.0.0` |
| `unplugin-vue-components`         | `28.8.0`  | `32.1.0` |
| `uuid`                            | `13.0.0`  | `14.0.0` |
| `vite`                            | `7.3.3`   | `8.0.16` |
| `vue-i18n`                        | `10.0.8`  | `11.4.5` |
| `vue-router`                      | `4.6.3`   | `5.1.0`  |
| `vue-tsc`                         | `2.2.12`  | `3.3.3`  |
| `@vue/tsconfig`                   | `0.7.0`   | `0.9.1`  |

## Follow-up Policy

- Do not run `pnpm up --latest` on `main`.
- Upgrade by isolated lanes only.
- Start each lane with targeted tests, then run `pnpm validate` when practical.
