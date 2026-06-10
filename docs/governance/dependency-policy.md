# Dependency Governance Policy

CCD dependency work is policy-driven and lane-isolated. Do not run blind global upgrades on `main`.

## Placement Rules

- Root `dependencies` are the central runtime singleton registry for app stacks and supply-chain policy. The root remains orchestration-only and must not become a runtime importer.
- Root `devDependencies` own workspace orchestration tools and local `workspace:*` package references used by governance, builds, and generated reports.
- Apps declare runtime packages they import in `dependencies`, including `@ccd/*` workspace packages they consume at runtime.
- Shared packages declare imported runtime packages in `dependencies`; package-local build and test tools belong in `devDependencies`.
- `@ccd/*` workspace packages must not be moved between dependency fields only for hoisting. Placement must match the importing package's runtime/build role.

## Version Policy

- Dependency modernization is owner-deferred for current Full GO.
- External dependency ranges are centralized in the default pnpm catalog in `pnpm-workspace.yaml`; workspace package manifests and root pnpm overrides reference those ranges with `catalog:`.
- `pnpm deps:catalog:check` is the syncpack-equivalent alignment check. It fails when an external dependency or override bypasses the catalog, when a catalog entry is missing, or when an entry is unused.
- Future upgrades use single-dependency or tightly coupled compatibility lanes.
- Vite major migration stays separate from Vue tooling, UI, HTTP, desktop, and dependency cleanup lanes.
- Version range changes require manifest diff review, lockfile review, targeted validation, and rollback notes.

## pnpm Overrides Policy

`pnpm.overrides` may be used only for a documented transitive dependency risk, compatibility constraint, or security response. External override ranges must resolve through the pnpm catalog; do not hard-pin an override range directly in `package.json`.

An override change must record:

- Package and version being overridden.
- Reason and affected dependency chain.
- Whether the override is temporary or permanent.
- Validation commands run.
- Removal condition or next review trigger.

Do not use overrides to mask architecture violations, package export failures, or broken direct dependency declarations.

Current overrides:

Validation for the 2026-06-10 P2 dependency validation close-out: `pnpm deps:catalog:check`,
`pnpm deps:scan`, and `pnpm supply:check` passed after the override changes. Full branch validation is recorded in
`.ai/runtime/repair_list.md`.

| Override                           | Catalog source                             | Reason / affected dependency chain                                                                                                         | Removal condition                                                                                                       |
| ---------------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| `glob`                             | `catalogs.overrides.glob`                  | Preserve the existing transitive compatibility policy while direct workspace manifests use `catalog:`.                                     | Remove after an isolated dependency lane proves the normal catalog range can resolve without lockfile or tooling drift. |
| `path-scurry>lru-cache`            | `catalogs.overrides.lru-cache`             | Preserve the previously locked `path-scurry@2.0.1` transitive resolution while moving the override version declaration into pnpm catalogs. | Remove in the same isolated dependency lane that refreshes `glob`/`path-scurry` lockfile resolution.                    |
| `@commitlint/config-validator>ajv` | `catalogs.overrides.ajv`                   | Security response for `@commitlint/cli>@commitlint/load>@commitlint/config-validator>ajv`, patched floor `^8.18.0`.                        | Remove after the Commitlint lane resolves a non-vulnerable tree without this override.                                  |
| `defu`                             | `catalogs.overrides.defu`                  | Security response for `unocss>@unocss/cli>@unocss/config>unconfig>defu`, patched floor `^6.1.5`.                                           | Remove after the UnoCSS lane resolves a non-vulnerable tree without this override.                                      |
| `diff`                             | `catalogs.overrides.diff`                  | Security response for `ts-node>diff`, patched floor `^4.0.4`.                                                                              | Remove after the Node script tooling lane resolves a non-vulnerable tree without this override.                         |
| `editorconfig>minimatch`           | `catalogs.overrides-minimatch9.minimatch`  | Security response for `@vue/test-utils>js-beautify>editorconfig>minimatch`, patched floor `^9.0.7`.                                        | Remove after the Vue test tooling lane resolves a non-vulnerable tree without this override.                            |
| `fast-uri`                         | `catalogs.overrides.fast-uri`              | Security response for `ajv>fast-uri`, patched floor `^3.1.2`.                                                                              | Remove after the Commitlint/AJV lane resolves a non-vulnerable tree without this override.                              |
| `flatted`                          | `catalogs.overrides.flatted`               | Security response for `eslint>file-entry-cache>flat-cache>flatted`, patched floor `^3.4.2`.                                                | Remove after the ESLint lane resolves a non-vulnerable tree without this override.                                      |
| `glob>minimatch`                   | `catalogs.overrides-minimatch10.minimatch` | Security response for `glob>minimatch`, patched floor `^10.2.3`.                                                                           | Remove after the `glob` lane resolves a non-vulnerable tree without this override.                                      |
| `immutable`                        | `catalogs.overrides.immutable`             | Security response for `sass>immutable`, patched floor `^5.1.5`.                                                                            | Remove after the Sass lane resolves a non-vulnerable tree without this override.                                        |
| `js-cookie`                        | `catalogs.overrides.js-cookie`             | Security response for `@vue/test-utils>js-beautify>js-cookie`, patched floor `^3.0.7`.                                                     | Remove after the Vue test tooling lane resolves a non-vulnerable tree without this override.                            |
| `lodash`                           | `catalogs.overrides.lodash`                | Security response for `commitizen>lodash`, patched floor `^4.18.0`.                                                                        | Remove after the Commitizen lane resolves a non-vulnerable tree without this override.                                  |
| `npm-run-all2>minimatch`           | `catalogs.overrides-minimatch9.minimatch`  | Security response for `npm-run-all2>minimatch`, patched floor `^9.0.7`.                                                                    | Remove after the `npm-run-all2` lane resolves a non-vulnerable tree without this override.                              |
| `picomatch`                        | `catalogs.overrides.picomatch`             | Security response for `commitizen>find-node-modules>findup-sync>micromatch>picomatch`, patched floor `^2.3.2`.                             | Remove after the Commitizen lane resolves a non-vulnerable tree without this override.                                  |
| `rollup`                           | `catalogs.overrides.rollup`                | Security response for `rollup-plugin-visualizer>rollup`, patched floor `^4.59.0`.                                                          | Remove after the visualizer/Vite tooling lane resolves a non-vulnerable tree without this override.                     |
| `shell-quote`                      | `catalogs.overrides.shell-quote`           | Security response for `concurrently>shell-quote` and `npm-run-all2>shell-quote`, patched floor `^1.8.4`.                                   | Remove after the script-orchestration tooling lane resolves a non-vulnerable tree without this override.                |
| `undici`                           | `catalogs.overrides.undici`                | Security response for `jsdom>undici`, patched floor `^7.24.0`.                                                                             | Remove after the jsdom lane resolves a non-vulnerable tree without this override.                                       |
| `yaml`                             | `catalogs.overrides.yaml`                  | Security response for `lint-staged>yaml`, patched floor `^2.8.3`.                                                                          | Remove after the lint-staged lane resolves a non-vulnerable tree without this override.                                 |

## Scanning Policy

`pnpm supply:check` and generated SBOM review are the current repository gates.

`pnpm deps:scan` records a local runtime dependency scan summary for:

- pnpm outdated inventory.
- pnpm audit advisories.
- Cargo locked dependency inventory.

The scan is evidence-producing, not an automatic upgrade. Advisories and outdated packages must be handled in isolated dependency lanes with manifest diff review, lockfile review, targeted validation, and rollback notes.
