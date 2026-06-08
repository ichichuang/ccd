# Remaining 91 Repair Progress

- Run timestamp: 2026-06-08 Asia/Shanghai
- Branch: `main`
- HEAD: `1dc0dea4c41be31a2ebda05cf3a3871c7856749b`
- Baseline status: existing excluded `ccd-public-layer-repair-plan-package/**` deletion residue only; preserved and not staged.
- Startup commands:
  - `git status --short`: existing excluded deletion residue observed.
  - `git rev-parse HEAD`: `1dc0dea4c41be31a2ebda05cf3a3871c7856749b`.
  - `git branch --show-current`: `main`.
  - `pnpm ai:sync`: pass; regenerated `.ai/manifests/rule-index.json`.
  - `node scripts/migrate-ledger.mjs`: pass; 226 tasks parsed.
  - `pnpm ai:doctor --open`: pass; 91 open tasks reported.

## Initial Classification

| Lane                        | Tasks | Classification                                   | Binding reason / action                                                                                                                                                     |
| --------------------------- | ----: | ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P1 guard strictness backlog |     7 | Owner-decision blocked                           | `.ai/runtime/owner_decisions.md` marks guard strictness and rule-contradiction expansion `FULL_GO_DEFERRED`; broad guard expansion needs a future approved lane.            |
| P1 owner signoff            |     1 | Already satisfied by current repository evidence | `.ai/runtime/owner_decisions.md` records D-023/P30 decisions; close only after AI/governance validation.                                                                    |
| P2 Vite 8 compatibility     |     9 | Requires isolated future branch                  | Current Vite major migration is deferred and must not mix with dependency, UI, HTTP, or governance changes on `main`.                                                       |
| P2 dependency governance    |     6 | Local actionable now                             | Catalog policy, version alignment, scanning entrypoints, and unused-dependency audit can be implemented without upgrading dependency versions.                              |
| P2 dependency upgrades      |     8 | Requires isolated single-ecosystem lanes         | Runtime stack, VueUse, Vue tooling, ESLint, PrimeVue, alova, Playwright, and Tauri upgrades require one lane at a time with official release notes and full validation.     |
| P2 GitHub local governance  |     3 | Already satisfied / local evidence now           | Existing CI, CODEOWNERS, PR template, and issue templates cover the requested local governance surface; no remote mutation.                                                 |
| P3 Login Diorama            |    47 | Owner/product-decision blocked                   | Current login behavior remains canonical in `.ai/runtime/owner_decisions.md`; implementation would alter product/auth UX and needs a future explicit product/operator lane. |
| P3 desktop smoke CI         |     1 | Owner/operator-decision blocked                  | Desktop drift CI integration remains `FULL_GO_DEFERRED`; no new CI enforcement without a future lane.                                                                       |
| P4 strategic deferred items |     6 | Owner/external-decision blocked                  | New org/repo, starter extraction, design-system split, Reka UI, TanStack Query, and desktop drift CI are future-charter work.                                               |
| P4 hard blocked items       |     2 | Owner-decision blocked                           | HTTP runtime promotion and safeStorage shared-runtime promotion are explicitly forbidden by D-014/D-019.                                                                    |

## Live Notes

- `pnpm deps:outdated` was run as the dependency-lane snapshot. It exited 1 because outdated packages exist; no upgrade was made from that output.
- pnpm catalog syntax was checked against official pnpm documentation: `catalog` entries live in `pnpm-workspace.yaml` and package manifests may reference them using `catalog:`.
- Implemented local dependency governance only: centralized external ranges through the default pnpm catalog, preserved `workspace:*` package links, removed stale `vite-plugin-progress`, added `pnpm deps:catalog:check`, and wired catalog validation into `pnpm supply:check`.
- Added `pnpm deps:scan`, which writes `.ai/runtime/dependency-scan-summary.json` without upgrading packages. Current scan status: 71 outdated packages, pnpm audit advisories found, Cargo dependency inventory generated.
- Existing local GitHub governance evidence was validated without remote mutation: `.github/workflows/ci.yml`, `.github/workflows/deploy.yml`, `.github/CODEOWNERS`, PR template, and issue templates are present; `pnpm governance:github-workflows` and `pnpm docs:commands` passed.
- Fixed the web-demo Vite build banner after catalog adoption so it prints resolved catalog ranges for Vue and UnoCSS instead of literal `catalog:` specifiers.
- Static scans completed:
  - No active `web-dom`, `apps/web-dom`, or `@ccd/web-dom` references outside excluded residue.
  - No active script references to retired `repair_list.txt`; remaining mentions are historical ledger/audit notes.
  - Structured manifest check found no package public `exports`, `main`, `module`, or `types` entries pointing to `src/**`.
  - No cross-package deep imports to `@ccd/*/src`.
  - Contracts/core runtime-surface scan found type/member names only (`path`, `crypto`) and no browser/Node/Tauri runtime calls.
  - Production mock/demo defaults remain off: `.env` and `.env.production` set `VITE_PUBLIC_DEMO_ENABLED=false` and `VITE_DEMO_MOCK_ENABLED=false`; `.env.analyze` is the explicit public-demo opt-in path.
  - Raw runtime scan still reports existing app/UI-owned browser surfaces such as web-demo storage/theme/http paths and PrimeVue imports in `@ccd/vue-ui`; repo architecture guards pass with these existing allowlisted/application-owned surfaces.
  - No implementation `any` usages found in ProForm, ProTable, bridge/adapters, contracts, core, or shared-utils after excluding specs.
  - Generated artifact scan found no `/Users/cc` absolute paths, ISO timestamp churn, `generatedAt`, `timestamp`, or `lastBuildTime` markers in `.ai/generated`, `docs/generated`, `.ai/manifests`, or `repair-ledger.json`.
  - Vite warning remains warning-only: `apps/web-demo/src/router/modules/core.ts` is both statically and dynamically imported by `apps/web-demo/src/router/index.ts`; builds exit 0 and this belongs to the deferred Vite 8 chunking lane if it becomes actionable.
- Validation notes:
  - `pnpm build:ci` initially failed because `docs/generated/sbom.json` changed during governance artifact sync. Rerunning `pnpm governance:gate` refreshed the artifact and passed; a second `pnpm build:ci` passed, confirming freshness rather than repeated nondeterminism.
  - `pnpm env:doctor` and `pnpm env:doctor:strict` passed with the existing PATH precedence warning for the mise shim.
