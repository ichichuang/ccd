# Owner Decision Log

Pending decisions requiring explicit sign-off from project owner/architect.

## Decision 1: restoreLoginFromToken retry strategy

**Item:** `repair_list.md` — `[hooks/modules/useAuth] restoreLoginFromToken 无重试/超时逻辑`

**Context:** Current implementation calls `requestAuthCurrentUser(token)` once. On any failure, the user is silently logged out via `userStore.clearUserInfo()`. No distinction between "server temporarily down" vs "token genuinely expired."

**Proposed default:**

- 3 retries with exponential backoff (1s, 2s, 4s)
- 5s timeout per attempt
- Distinguish 401 (token expired → immediate logout) from 5xx/network (retry then logout)
- Optional: preserve read-only session during offline state

**Status:** PENDING — requires product decision on retry UX and offline behavior.

---

## Decision 2: Guard enforcement scope

**Item:** `repair_list.md` — `[guard/coverage] ai-architecture-guard.mjs 未覆盖以下规则`

**Context:** The guard script now enforces `raw-date-constructor` and `raw-timer` rules (added in this round). The following rules remain unautomated:

- Vue SFC macro define order
- `as Type` assertion ban
- useAutoMitt enforcement
- composable return type annotations
- Dynamic UnoCSS class detection

**Proposed default:** Add all listed rules to the guard. Each rule has clear approved-file exceptions.

**Status:** PENDING — team decision on enforcement strictness.

---

## Decision 3: Rule contradiction resolution

**Item:** `repair_list.md` — `[guard/contradiction] 规则矩阵中 5 项矛盾未解决`

**Context:** Remaining contradictions documented in `rule_coverage_matrix.md`:

1. safe-storage rule vs wrapper internals example
2. VueUse priority vs useFetch/storage restrictions
3. Template strictness example using banned `as Type`
4. RESOLVED: Size density system sidebar width inconsistency. `sidebarCollapsedWidth` is now documented as geometry-derived from menu/icon tokens.
5. A1/A2 archetype conflict
6. Design-token rule duplication across files

**Proposed default:** Remaining unresolved contradictions need written resolutions choosing one rule over the other. See `rule_coverage_matrix.md` for details.

**Status:** PENDING — requires architectural consensus.

---

## Decision 4: Design-token rule consolidation

**Item:** `repair_list.md` — `[guard/owner-decisions] 待决策项`

**Context:** Color, border, z-index, and semantic-family rules are duplicated across `00-unocss-guardrails.mdc`, `01-design-tokens.mdc`, `05-semantic-color-usage-contract.mdc`.

**Proposed default:** Consolidate into a single canonical file (`05-semantic-color-usage-contract.mdc`) and reference it from others.

**Status:** PENDING — requires owner sign-off on which file is canonical.

---

## Decision 5: Desktop drift CI integration

**Item:** `repair_list.md` — `[guard/owner-decisions] 待决策项`

**Context:** Desktop branch governance rules (`09-desktop-branch-governance.mdc`) exist but are not enforced in CI. Drift detection between desktop and web branches is manual.

**Proposed default:** Add `ai:guard --staged` to pre-commit hook and `ai:guard` to CI pipeline.

**Status:** PENDING — requires CI pipeline access and team agreement.

---

## Decision 6: HTTP contract package scope

**Item:** `repair_list.md` — `[P1-HttpContract-Contracts]` and `[P1-HttpContract-Core]`

**Context:** M5 inventory found an existing runtime-neutral `packages/contracts/src/network.ts` contract and app HTTP infrastructure under `apps/web-demo/src/utils/http/**`. Creating `packages/contracts/src/http/**` or `packages/core/src/http/**` would be new architecture surface.

**Proposed default:**

- Keep `packages/contracts/src/network.ts` as the current low-level runtime-neutral contract.
- Do not add `packages/contracts/src/http/**` until request/error/retry/timeout/auth policy shapes are approved.
- Do not add `packages/core/src/http/**` unless a runtime-neutral orchestration need is proven.
- Keep alova implementation in the approved app infrastructure path `apps/web-demo/src/utils/http/**` unless owner approves a broad move to `apps/web-demo/src/adapters/http/**`.

**Status:** PENDING — requires owner approval before new contracts/core HTTP package paths or broad HTTP import-path migration.
