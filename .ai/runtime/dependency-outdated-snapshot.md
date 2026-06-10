# Dependency Outdated Snapshot

- Date: 2026-06-10
- Commands: `pnpm deps:outdated`, `pnpm audit --audit-level high --json`, `pnpm deps:scan`
- Generated scan source: `.ai/runtime/dependency-scan-summary.json`
- Result: `pnpm deps:outdated` exits `1` because outdated dependencies remain; no broad upgrades were run.
- Security response: direct `lodash-es` and `uuid` were patched through the default pnpm catalog, and vulnerable transitive packages were patched through documented pnpm catalog overrides.
- Remaining advisories: 2 records for one deferred `tmp@0.0.33` chain through `commitizen>inquirer>external-editor>tmp`.
- Owner constraint: `.ai/runtime/owner_decisions.md` keeps dependency modernization lane-isolated; remaining outdated packages require future isolated lanes.

## Patch/Minor Candidates

These remain deferred P3/P4 or future isolated dependency lanes. They are not current security blockers after the P2 security response.

| Package                    | Current   | Latest    | Dependency field  |
| -------------------------- | --------- | --------- | ----------------- |
| `@iconify-json/logos`      | `1.2.10`  | `1.2.11`  | `devDependencies` |
| `@iconify-json/lucide`     | `1.2.96`  | `1.2.111` | `devDependencies` |
| `@iconify/utils`           | `3.1.0`   | `3.1.3`   | `devDependencies` |
| `@tanstack/vue-virtual`    | `3.13.23` | `3.13.28` | `dependencies`    |
| `@vue/test-utils`          | `2.4.6`   | `2.4.11`  | `devDependencies` |
| `autoprefixer`             | `10.4.23` | `10.5.0`  | `devDependencies` |
| `baseline-browser-mapping` | `2.9.19`  | `2.10.35` | `devDependencies` |
| `crypto-es`                | `3.1.2`   | `3.1.3`   | `dependencies`    |
| `dayjs`                    | `1.11.19` | `1.11.21` | `dependencies`    |
| `dependency-cruiser`       | `17.4.0`  | `17.4.3`  | `devDependencies` |
| `echarts`                  | `6.0.0`   | `6.1.0`   | `dependencies`    |
| `gsap`                     | `3.14.2`  | `3.15.0`  | `dependencies`    |
| `overlayscrollbars`        | `2.14.0`  | `2.16.0`  | `dependencies`    |
| `overlayscrollbars-vue`    | `0.5.9`   | `0.5.10`  | `dependencies`    |
| `prettier`                 | `3.8.1`   | `3.8.4`   | `devDependencies` |
| `sass`                     | `1.97.3`  | `1.100.0` | `devDependencies` |
| `stylelint`                | `17.4.0`  | `17.13.0` | `devDependencies` |
| `terser`                   | `5.46.0`  | `5.48.0`  | `devDependencies` |
| `tsx`                      | `4.21.0`  | `4.22.4`  | `devDependencies` |
| `turbo`                    | `2.9.14`  | `2.9.17`  | `devDependencies` |
| `zod`                      | `4.3.6`   | `4.4.3`   | `dependencies`    |

## Major/Compatibility Lanes

These are blocked from this close-out because they require isolated compatibility lanes or explicit owner decisions.

| Package                           | Current   | Latest   | Dependency field  |
| --------------------------------- | --------- | -------- | ----------------- |
| `@commitlint/cli`                 | `19.8.1`  | `21.0.2` | `devDependencies` |
| `@commitlint/config-conventional` | `19.8.1`  | `21.0.2` | `devDependencies` |
| `@faker-js/faker`                 | `9.9.0`   | `10.4.0` | `devDependencies` |
| `@types/node`                     | `24.12.4` | `25.9.2` | `devDependencies` |
| `chokidar`                        | `4.0.3`   | `5.0.0`  | `devDependencies` |
| `concurrently`                    | `9.2.1`   | `10.0.3` | `devDependencies` |
| `cross-env`                       | `7.0.3`   | `10.1.0` | `devDependencies` |
| `glob`                            | `11.1.0`  | `13.0.6` | `devDependencies` |
| `jsdom`                           | `28.1.0`  | `29.1.1` | `devDependencies` |
| `lint-staged`                     | `15.5.2`  | `17.0.7` | `devDependencies` |
| `npm-run-all2`                    | `7.0.2`   | `9.0.1`  | `devDependencies` |
| `rollup-plugin-visualizer`        | `6.0.5`   | `7.0.1`  | `devDependencies` |
| `typescript`                      | `5.9.3`   | `6.0.3`  | `devDependencies` |
| `unplugin-auto-import`            | `20.3.0`  | `21.0.0` | `devDependencies` |
| `unplugin-vue-components`         | `28.8.0`  | `32.1.0` | `devDependencies` |
| `uuid`                            | `13.0.2`  | `14.0.0` | `dependencies`    |

## Deferred Advisory

| Package | Installed | Patched floor | Chain                                     | Decision                                                                                                                                                               |
| ------- | --------- | ------------- | ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tmp`   | `0.0.33`  | `>=0.2.6`     | `commitizen>inquirer>external-editor>tmp` | Deferred to a future Commitizen/inquirer tooling lane. The patched floor jumps out of the old `0.0.x` chain and should not be forced by override in this P2 close-out. |

## Applied Security Response

- Direct catalog ranges: `lodash-es` moved from `^4.17.21` to `^4.18.0`; `uuid` moved from `^13.0.0` to `^13.0.1`.
- Lockfile resolutions: `lodash-es@4.18.1`; `uuid@13.0.2`.
- Cataloged transitive overrides patched advisories in `ajv`, `defu`, `diff`, `fast-uri`, `flatted`, `immutable`, `js-cookie`, `lodash`, `minimatch`, `picomatch`, `rollup`, `shell-quote`, `undici`, and `yaml`.
- Rollback: remove the corresponding pnpm override and catalog entry, then rerun `pnpm install --lockfile-only --ignore-scripts`, `pnpm deps:catalog:check`, `pnpm deps:scan`, and `pnpm supply:check`.
