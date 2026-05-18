# Product Line Strategy

CCD uses three sibling product lines so Web runtime, desktop runtime, and portable scaffold work can evolve without contaminating each other.

## Product Line Matrix

| Branch                  | Runtime Role            | Purpose                            | Stability       |
| ----------------------- | ----------------------- | ---------------------------------- | --------------- |
| `main`                  | Web Application Runtime | Production web architecture        | Stable          |
| `desktop-version`       | Tauri Desktop Runtime   | Native desktop system product line | Active          |
| `main-portable-version` | Portable Architecture   | Minimal reusable scaffold          | Stable Template |

## Deprecation Policy

`feat/tauri-integration` is deprecated.

Reasons:

- it was a historical experiment rather than a clean product line
- merge conflict complexity made it expensive to keep rebasing from `main`
- mixed Web and desktop assumptions created architectural contamination risk
- it could not preserve clean runtime separation between browser and Tauri concerns

Policy:

- do not merge from `feat/tauri-integration`
- do not use it as a desktop rebuild baseline
- do not recover desktop runtime decisions from it without explicit review
- rebuild desktop architecture from the optimized `main` baseline on `desktop-version`

## Runtime Separation Strategy

### `main`

- Browser-first runtime
- stable Web delivery
- full example and demo surfaces
- shared architecture laws, AI governance, design system, Pro components, state sync, and CI gates

`main` must not become a dumping ground for Tauri shell code or desktop-only configuration.

### `desktop-version`

- Native shell runtime
- Tauri v2 IPC boundary
- desktop capability abstraction
- window, file, notification, external-link, and OS integration governance

Desktop APIs must be routed through bridge helpers and keep Web fallback behavior where the feature is shared.

### `main-portable-version`

- zero-business template
- no demo pollution
- clean reusable bootstrap
- minimal AI governance contract

Portable architecture must remain business-agnostic. It can remove example routes, demo assets, visual baselines, and redundant configuration, but it must keep the governance system usable.

## Development Flow

1. Put shared architecture, docs, governance, design system, and Web runtime improvements on `main`.
2. Put Tauri shell, IPC, capabilities, desktop metadata, and desktop-specific validation on `desktop-version`.
3. Put scaffold cleanup and demo removal on `main-portable-version`.
4. Propagate changes across branches only after reviewing the target branch contract.

## Validation Matrix

| Branch                  | Baseline Checks                                                                                           |
| ----------------------- | --------------------------------------------------------------------------------------------------------- |
| `main`                  | `pnpm arch:check`, `pnpm type-check`, `pnpm test:run`, `pnpm lint:check`                                  |
| `desktop-version`       | `pnpm arch:check`, `pnpm sync:desktop-config`, `pnpm check:drift`, `pnpm type-check`, targeted Playwright |
| `main-portable-version` | `pnpm arch:check`, `pnpm type-check`, targeted tests after cleanup                                        |

## Documentation Ownership

- Product line strategy: `docs/branch-model.md`
- Runtime contracts: `docs/runtime/**`
- Governance system: `docs/governance.md`
- Codex workflow: `docs/codex/quickstart.md`
