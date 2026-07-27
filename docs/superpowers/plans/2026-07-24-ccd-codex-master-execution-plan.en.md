---
document_type: codex_master_execution_roadmap
document_status: active_non_normative_control_plan
repository: ichichuang/ccd
local_repository: /Users/cc/MyPorject/ccd
tracked_branch: main
reference_baseline_sha: 58d63a608284dc93ab0aa73e1baca57b9425dbf4
reference_baseline_subject: "feat(ai): 完成 UI Skill 组合路由与精确同步"
completed_stages:
  - B1
  - B2
current_execution_gate: R1-A_REFRESH_CONTRACT_AND_TOKEN_WRITEBACK
page_redesign_allowed: false
test_asset_creation_allowed: false
---

# CCD Platform and UI Modernization Master Execution Plan

> **For agentic workers:** REQUIRED PROCESS SKILLS: use `superpowers:brainstorming` before changing an unresolved architecture or product contract, `superpowers:systematic-debugging` for runtime defects, `superpowers:writing-plans` for every stage-specific implementation plan, and either `superpowers:subagent-driven-development` or `superpowers:executing-plans` for implementation. Use `superpowers:verification-before-completion` before reporting any PASS.
>
> **Document role:** This is a non-normative, executable master roadmap for Codex and other repository agents. It coordinates stage order, scope, validation, commits, and stop conditions. It does **not** replace `.ai/protocol/AGENTS.core.md`, `.ai/skills/project-ui/SKILL.md`, `.ai/manifests/skill-routing.json`, architecture rules, package contracts, product contracts, GitHub settings, or current source code.
>
> **Conflict rule:** Current remote `main` and the relevant canonical authority always override this roadmap. When repository state has advanced beyond the reference baseline, stop before editing, inspect the intervening commits, and refresh the affected stage plan. Never force an obsolete plan onto a newer repository state.

## 1. Mission

| Dimension | Required end state |
|---|---|
| Runtime correctness | HTTP, authentication, network state, Desktop, Login, and user interaction entry points have no known deterministic defects. |
| AI governance | One routing authority, one normative UI body, deterministic routing parity, exact skill projection, and CI-enforced repository invariants. |
| Architecture | API, session, storage, runtime, and shared-package ownership are explicit and non-duplicated. |
| Cleaning | Only evidence-proven dead, duplicated, stale, or false content is removed. |
| UI system | Existing theme, density, breakpoint, UnoCSS, and component foundations are retained; an independent adaptive material axis is added later. |
| Accessibility | Keyboard, focus, zoom, screen reader semantics, contrast, transparency preference, and motion preference are supported. |
| Layout | Bounded viewport where practical, modular work regions, and one explicit scroll owner per region. |
| Delivery target | `CCD_PLATFORM_AND_UI_MODERNIZATION_COMPLETE` |

## 2. Repository reference state

| Item | Reference value | Execution rule |
|---|---|---|
| Repository | `ichichuang/ccd` | Verify origin authority before every stage. |
| Local path | `/Users/cc/MyPorject/ccd` | Refuse to operate from another root. |
| Branch | `main` | Do not implement on an unexpected branch unless explicitly authorized. |
| Reference baseline | `58d63a608284dc93ab0aa73e1baca57b9425dbf4` | Historical anchor only; current remote state must be re-read. |
| Completed control stages | B1, B2 | Treat as frozen unless a verified regression exists. |
| Current unlocked stage | R1 HTTP runtime repair | Do not start B3, cleaning, C0, or page redesign in parallel. |
| Test policy | No new test files, test frameworks, E2E, fixtures, snapshots, or coverage | Use production checks and explicit manual acceptance. |
| Page redesign | Blocked | Remains blocked until C0 and shared-component gates pass. |

## 3. Work classification

Codex must label every stage and every commit using one or more of the following categories. Do not mix unrelated categories merely because the files are nearby.

| Category | Definition | Adds product capability? | CCD examples |
|---|---|---:|---|
| **Repairing** | Restore behavior that is currently broken, unsafe, racy, inaccessible, or inconsistent with an existing contract. | No | Refresh flow, RequestManager cleanup, health checks, Desktop CTA, Login selector, browser zoom. |
| **Standardizing** | Establish one authority, owner, interface, command, naming rule, or validation contract. | Usually no | Single UI body, AI governance, API ownership, CODEOWNERS, canonical commands. |
| **Cleaning** | Remove content proven to be dead, duplicated, stale, misleading, or unsupported. | No | Old references, dead shims, orphan assets, false README claims, compatibility aliases. |
| **Improving** | Preserve external capability while improving maintainability, reuse, performance, accessibility, or experience. | Minor or none | Store decoupling, component reuse, scroll ownership, rendering efficiency. |
| **Upgrading** | Introduce a new model, capability, migration, or product-level experience. | Yes | Dual-axis material model, Adaptive Liquid Glass, page visual migration. |

## 4. Permanent authority map

| Domain | Canonical authority or implementation owner | Roadmap restriction |
|---|---|---|
| Shared AI protocol | `.ai/protocol/AGENTS.core.md` | Do not duplicate protocol text here. |
| Skill routing | `.ai/manifests/skill-routing.json` | B2 is frozen; do not create a second routing manifest. |
| Product UI governance | `.ai/skills/project-ui/SKILL.md` | B3 will make this the only normative UI body. |
| GSAP implementation | `.ai/skills/core/gsap-core/SKILL.md` | Technical lifecycle only; never product visual authority. |
| Design tokens | `packages/design-tokens` | Canonical owner of the future material model. |
| UnoCSS semantics | `packages/unocss-preset` | Expose semantic roles; pages must not own material parameters. |
| PrimeVue adaptation | `packages/vue-primevue-adapter` | Own PrimeVue material and behavior adaptation. |
| CCD shared components | `packages/vue-ui` | Reuse before raw PrimeVue; raw PrimeVue before new custom components. |
| Remote governance | GitHub branch protection, rulesets, CODEOWNERS | B4-B only; record before-state and rollback values. |

## 5. Global execution rules

| Rule | Requirement |
|---|---|
| Fresh-state gate | Before every stage, verify repository root, origin, branch, local HEAD, `origin/main`, remote `main`, ahead/behind, worktree, index, and untracked files. |
| Stale-baseline handling | If remote `main` advanced, inspect intervening commits and update the stage plan before editing. Do not reset or rewrite unrelated work. |
| One stage at a time | A downstream stage remains blocked until its predecessor has local and remote acceptance where required. |
| One responsibility per commit | Repair, cleanup, governance, architecture, and upgrade work must remain independently reviewable and revertible. |
| Existing foundations first | Reuse CCD tokens, UnoCSS shortcuts, adapters, and shared components before adding abstractions. |
| No speculative deletion | A cleanup candidate is not authorization to delete. Re-prove zero consumers against current `main`. |
| No speculative API contract | Unknown backend, persistence, or Tauri behavior must be resolved from repository or real runtime evidence before implementation. |
| No page-first material work | Material tokens, fallbacks, and shared surfaces must exist before page migration. |
| No hidden completion | Never report PASS when a required command, manual acceptance state, remote check, or safety gate is missing. |
| No force push | Use normal fast-forward pushes only when push is explicitly authorized. |

## 6. Master stage map

| Order | Stage | Classification | Primary objective | Required predecessor | Unlocks | Typical commit count |
|---:|---|---|---|---|---|---:|
| 0 | B2 Freeze | Standardizing | Preserve compositional routing, sole manifest, exact mirror, and Node/Python parity. | Complete | R1 | 0 |
| 1 | R1 HTTP Runtime Repair | Repairing | Repair refresh, request cleanup, and health checks. | B2 remote PASS | B3 | 3 |
| 2 | B3 Single UI Body | Standardizing + Cleaning | Consolidate all valid UI governance into one normative Skill body. | R1 PASS | B4-A | 1 |
| 3 | B4-A Repository Governance | Standardizing | Add governance aggregation and CI enforcement. | B3 PASS | B4-B | 1–2 |
| 4 | B4-B Remote Governance | Standardizing + Cleaning | Align required checks, CODEOWNERS, and rulesets. | New CI green on remote | R2 | Remote operations |
| 5 | R2 Runtime UI Repair | Repairing | Repair Desktop, Login, first paint, zoom, and short-screen behavior. | B4 PASS | A11Y-R | 2 |
| 6 | A11Y-R Existing Accessibility Repair | Repairing | Close existing keyboard, focus, semantic, and zoom defects. | R2 PASS | C1 | Split by surface |
| 7 | C1 Documentation Governance | Cleaning + Standardizing | Replace misleading documentation and remove stale instructions. | A11Y-R PASS | C2 | 1–2 |
| 8 | C2 Source Cleanup | Cleaning | Remove evidence-proven dead shims, duplicate runtime code, and aliases. | C1 PASS | C3 | Multiple thin commits |
| 9 | C3 Asset and Dead API Cleanup | Cleaning | Remove orphan assets, duplicate files, and empty public APIs. | C2 PASS | A1 | Multiple thin commits |
| 10 | A1 Ownership Unification | Standardizing + Improving | Unify API, 401, logout, storage, CoreRuntime, and neutral boundaries. | Cleaning PASS | C0 | 4–6 |
| 11 | C0 Adaptive Material Foundation | Upgrading | Add independent color/material axes, tokens, semantic adapters, migration, and fallbacks. | A1 PASS | UI-I | 3–5 |
| 12 | UI-I Shared Component Improvement | Improving + Repairing | Apply material, density, performance, and advanced accessibility at shared-component level. | C0 PASS | PAGE-1 | Split by component |
| 13 | PAGE-1 Admin Chrome | Improving + Upgrading | Migrate navigation, toolbar, overlays, and bounded workspace chrome. | UI-I PASS | PAGE-2 | Slice-based |
| 14 | PAGE-2 Login | Improving + Upgrading | Move private Login material and advanced motion into shared contracts. | PAGE-1 PASS | PAGE-3 | 1–2 |
| 15 | PAGE-3 Desktop | Improving + Upgrading | Complete Desktop theme, density, responsiveness, and material behavior. | PAGE-2 PASS | PAGE-4 | 1–2 |
| 16 | PAGE-4 Dashboard and Showcase | Improving + Upgrading | Migrate semantic surfaces without glassifying content cards. | PAGE-3 PASS | Final acceptance | Module-based |

## 7. Stage B2 freeze contract

| Frozen item | Required state |
|---|---|
| Routing authority | `.ai/manifests/skill-routing.json` only. |
| UI composition | `project-ui` first, followed by independently matched technical skills in manifest order. |
| GSAP activation | Explicit GSAP, timeline, ScrollTrigger, `createScopedGsapContext`, or an existing GSAP implementation path only. |
| Client projection | Exact `project-ui` mirror detecting missing, changed, and extra files. |
| Router parity | Node and Python output remain byte-equal and JSON-equal. |
| Allowed future edits | Verified regressions only; no opportunistic expansion. |

## 8. R1 — HTTP runtime repair

### 8.1 R1-A Refresh contract and token writeback

| Item | Requirement |
|---|---|
| Classification | Repairing |
| Known defect | The fallback refresh path bypasses the canonical base policy, returns a token without persisting it, and retries through a reader that can still expose the old token. |
| Primary files | `apps/web-demo/src/utils/http/policies/authRefreshPolicy.ts`, `apps/web-demo/src/infra/auth/tokenProvider.ts`, `apps/web-demo/src/plugins/modules/authBridge.ts`, session store owner, relevant interceptor and endpoint configuration. |
| Contract discovery | Determine the actual request transport, cookie/body expectations, response fields, token ownership, and failure behavior from real repository or backend evidence. |
| Required design | Keep HTTP isolated from Pinia by extending the bridge or installing a canonical executor. Resolve the endpoint through the existing API policy. Persist the fresh token through the session owner before retry. Allow only one post-refresh retry. Emit one terminal unauthorized action. |
| Prohibited assumptions | Do not assume a request-body refresh token. Do not assume `accessToken`/`refreshToken` field names. Do not import Pinia directly into HTTP infrastructure. Do not introduce another HTTP client. |
| Commit | `fix(http): 修复刷新令牌写回与单次重试` |

### 8.2 R1-B RequestManager settlement and identity

| Item | Requirement |
|---|---|
| Classification | Repairing |
| Known defect | A detached `finally()` chain can create a secondary unhandled rejection, and an older request can delete state owned by a replacement request under the same key. |
| Primary file | `apps/web-demo/src/utils/http/methods.ts` |
| Required design | Add an owner identity or generation per request. Cleanup only when the current map entry still belongs to that identity. Attach cleanup to the returned settlement path or consume the cleanup chain. Preserve queueing, concurrency, deduplication, cancellation, timeout, stats, and clear behavior. |
| Prohibited action | Do not replace RequestManager with a simplified helper that drops existing behavior. |
| Commit | `fix(http): 修复请求清理与取消竞态` |

### 8.3 R1-C Health check correctness

| Item | Requirement |
|---|---|
| Classification | Repairing |
| Known defect | The current check treats any completed fetch as healthy, does not require `response.ok`, does not always clear timeout state, and does not consistently apply the production base policy. |
| Primary files | `apps/web-demo/src/utils/http/connection.ts`, `apps/web-demo/src/constants/http.ts`, canonical URL resolver if one exists. |
| Required design | Resolve the health URL through the canonical API policy. Define whether the backend supports HEAD or requires GET. Count only the accepted HTTP success range as healthy. Clear the timeout in `finally`. Preserve the explicit demo-mock boundary. |
| Prohibited action | Never classify 404 or 500 as online. Do not silently change the backend health contract. |
| Commit | `fix(http): 修复健康检查状态与超时清理` |

### 8.4 R1 validation and gate

| Validation | Minimum requirement |
|---|---|
| Repository | `pnpm project:validate` |
| Lint | `pnpm lint:check` |
| Types | `pnpm type-check` |
| Runtime boundary | `pnpm arch:runtime` |
| Web production build | `pnpm build:web-demo` |
| Manual refresh acceptance | One refresh for concurrent 401s; token persisted before retry; one retry only; one terminal unauthorized action. |
| Manual request acceptance | Failure, cancellation, deduplication, timeout, and same-key replacement preserve correct map ownership. |
| Manual health acceptance | 2xx healthy; 404/500 unhealthy; timeout/abort unhealthy; offline and demo-mock behavior correct. |

| R1 PASS | R1 BLOCKED |
|---|---|
| Real refresh contract confirmed and implemented. | Any refresh field or transport remains guessed. |
| Fresh token is written through the canonical session owner before retry. | Retry can still read the stale token. |
| Old requests cannot remove new request state. | Identity guard is absent or incomplete. |
| Health checks reject unsuccessful HTTP status. | 404/500 still count as healthy. |
| All production checks and manual states pass. | Any required command or manual state is unverified. |

## 9. B3 — single normative UI body

### 9.1 Scope

| Work item | Classification | Required action |
|---|---|---|
| Normative UI body | Standardizing | Expand `.ai/skills/project-ui/SKILL.md` into the complete canonical body. |
| Existing references | Cleaning | Migrate valid rules, then delete `.ai/skills/project-ui/references/**`. |
| UI entry rule | Standardizing | Make `.ai/rules/ui/00-project-ui-entry.mdc` point only to the canonical Skill. |
| Shared protocol | Standardizing | Remove authorization for references as normative UI bodies from `AGENTS.core.md`. |
| Generated adapters | Standardizing | Keep `AGENTS.md`, `CLAUDE.md`, and adapter guides pointer-only. Regenerate only through the existing generator. |
| GSAP boundary | Standardizing | Product motion decisions remain in `project-ui`; GSAP lifecycle remains in `gsap-core`. |
| New UI Skills | Prohibited | Do not create `liquid-glass`, `apple-design`, `pick-ui-library`, or another product UI Skill. |
| Product source | Prohibited | Do not modify application pages, design tokens, UnoCSS material implementation, or components in B3. |

### 9.2 Required sections in the canonical Skill

| Section | Required content |
|---|---|
| Authority | Sole normative path, scope, and relationship to technical Skills. |
| Repository foundations | Existing design tokens, UnoCSS, PrimeVue adapter, `vue-ui`, size, breakpoint, and runtime foundations. |
| Product direction | Restrained, structured, premium, accessible, operational, and non-marketing expression. |
| Surface model | Content Canvas, Standard Module Surface, and Functional Glass Layer. |
| Layout and scroll | Bounded viewport, modular regions, and one scroll owner per region. |
| Theme and density | Light/dark/auto behavior, three density modes, dynamic sizing, and first-paint parity. |
| Component priority | CCD-owned wrappers first, PrimeVue second, no unapproved custom component invention. |
| Responsive runtime | Breakpoint, container, orientation, short-screen, resize, and live update behavior. |
| Interaction and motion | CSS/simple component motion first; explicit GSAP criteria; interruption and reduced-motion requirements. |
| Forms, tables, overlays | Shared components, states, sizing, scrolling, focus, empty/error/loading behavior. |
| Accessibility | Keyboard, focus-visible, zoom, semantics, contrast, transparency preference, and motion preference. |
| Prohibited patterns | Raw page values, excessive glass, nested glass, nested same-axis scrolling, content-layer glassification, decorative operational UI. |
| AI workflow | Preflight, owner discovery, foundation reuse, narrow validation, change report, residual risk. |

### 9.3 B3 commit and acceptance

| Item | Required value |
|---|---|
| Commit | `refactor(ui): 收口 CCD 唯一 UI 规范` |
| Normative UI bodies | 1 |
| `project-ui` reference files | 0 |
| Competing UI Skills | 0 |
| Product source changes | 0 |
| Validation | `pnpm ai:protocol-adapters:check`, `pnpm ai:routing:validate`, all three sync checks, `pnpm lint:check`, `pnpm type-check`, both app builds, `git diff --check`. |

## 10. B4 — repository and remote governance closure

### 10.1 B4-A repository changes

| Substage | Classification | Required work |
|---|---|---|
| B4-A1 Governance aggregator | Standardizing | Add one minimal `ai:governance:check` command that composes existing adapter, routing, uniqueness, pointer, and temporary mirror checks. |
| B4-A2 CI integration | Standardizing | Make `build:ci` run `ai:governance:check` and `desktop:security` before production builds. |
| B4-A3 Validator closure | Standardizing | Enforce one UI body, zero references, zero competing UI authorities, pointer-only entries, valid commands, and canonical routing pointers. |
| B4-A4 Exact-mirror probe | Standardizing | Validate missing/changed/extra behavior against temporary targets only. Never inspect real user skill directories from CI. |

### 10.2 B4-B remote settings

| Substage | Classification | Required action | Safety rule |
|---|---|---|---|
| Required contexts | Standardizing | After the new remote CI succeeds, remove nonexistent `E2E QA` and retain only real required checks. | Save the complete before-state and rollback values. |
| CODEOWNERS | Standardizing + Cleaning | Delete ineffective entries or replace them with real users/teams that have write permission when review ownership is actually required. | Separate repository content changes from permission changes. |
| Rulesets | Cleaning | Remove disabled or duplicate rulesets only after identifying active layering and rule IDs. | Record every rule ID, status, and full configuration first. |

### 10.3 B4 acceptance

| Item | Requirement |
|---|---|
| Repository commit | `chore(ai): 完成 UI 治理与生产校验闭环` |
| Local commands | `pnpm ai:governance:check`, `pnpm desktop:security`, `pnpm build:ci`. |
| Remote CI | `Core Quality` succeeds on the exact remote commit. |
| Branch protection | Required contexts equal checks that actually exist. |
| CI environment | Does not inspect `~/.codex/skills` or other user-specific state. |

## 11. R2 — Desktop and Web/Login runtime repair

| Work item | Classification | Known defect | Required repair |
|---|---|---|---|
| Desktop verification CTA | Repairing | The CTA invokes capabilities that are intentionally unimplemented. | Remove the CTA. Do not grant capabilities for demo convenience. |
| Desktop first-paint theme | Repairing | Initial class resolution and runtime token resolution can diverge. | Use one resolver and one persisted contract across bootstrap and runtime. |
| Desktop security | Repairing | Current CI does not prove full HTML/Tauri packaging security. | Externalize bootstrap where required, extend the security checker, and run a real Tauri build. |
| Login GSAP target | Repairing | Script selector and template class do not match. | Correct the selector while preserving scoped lifecycle cleanup. |
| Browser zoom | Repairing | Viewport metadata blocks user zoom. | Remove `user-scalable=no` and maximum-scale restrictions. |
| Legacy glass first paint | Repairing | Bootstrap and runtime resolve legacy `glass` differently. | Align semantics before the C0 migration. |
| Login short screen | Repairing | Short screens lack an explicit scroll owner. | Use the existing governed scroll component and maintain one owner. |

| Commit | Required validation |
|---|---|
| `fix(desktop): 修复能力入口与首屏主题一致性` | Desktop build, desktop security, real Tauri build, first-paint theme acceptance. |
| `fix(login): 修复动画目标、缩放与短屏布局` | Web build, keyboard flow, 200% zoom, short-screen, landscape, reduced-motion. |

## 12. A11Y-R — repair existing accessibility defects

| Surface | Classification | Required repair |
|---|---|---|
| Dialog/Drawer | Repairing | Focus trap, Escape, return focus, and background inertness. |
| User menu | Repairing | Keyboard opening, focus order, menu semantics. |
| Admin Tabs | Repairing | `tablist`/`tab`/`tabpanel` semantics and arrow-key behavior. |
| Breadcrumb | Repairing | Navigation landmark, current-item semantics, link focus. |
| Context Menu | Repairing | Roving tabindex, Escape, arrow keys, focus return. |
| Fullscreen Table | Repairing | Focus entry, background isolation, exit restoration. |
| ProForm | Repairing | Instance-scoped IDs and multi-form collision prevention. |
| Browser viewport | Repairing | User zoom support. |
| Charts | Repairing | Accessible name, description, and text/data alternative. |

| Execution rule | Requirement |
|---|---|
| Commit sizing | Split by component or interaction surface. Do not create one large accessibility commit. |
| Validation | Both app builds, full keyboard flow, screen-reader inspection, 200% zoom, focus-visible, overlay focus isolation. |

## 13. C1 — documentation cleaning and standardization

| Target | Classification | Required work |
|---|---|---|
| ProForm README | Cleaning + Standardizing | Replace AI-generated draft accumulation with an accurate current API document. |
| Unimplemented capability claims | Cleaning | Remove unsupported Builder, AI generation, Undo/Redo, DevTools, or future-platform promises. |
| Dependency claims | Cleaning | Remove claims about libraries or integrations not present in current dependencies. |
| `.ai` documentation | Cleaning | Remove stale commands, removed paths, and old reference routing. |
| Root documentation | Standardizing | Describe current repository truth only; do not publish speculative stage status. |

### 13.1 Required ProForm README content

| Section | Source of truth |
|---|---|
| Current exports | Actual `ProForm/index.ts` exports. |
| Current schema | Actual `FieldSchema`, `GroupSchema`, reactions, and layout types. |
| Current hooks | `useForm`, `useField`, `useFieldArray`, `useFormContext`. |
| Persistence | Actual DraftStorage behavior. |
| Plugins | Actual PluginManager API. |
| Usage examples | Must compile against current code with no fictional API. |
| Limitations | Explicit limitations, not promises. |

## 14. C2 — source cleanup

### 14.1 Candidate list, not deletion authorization

| Candidate | Classification | Mandatory proof before deletion |
|---|---|---|
| Old app-side theme derivation | Cleaning | Delete only duplicated pure derivation. Preserve browser DOM application and preload-storage ownership. |
| Token forwarding shim | Cleaning | No imports, exports, build consumers, generated consumers, or dynamic references. |
| `constants/validation.ts` | Cleaning | Zero static, dynamic, script, and generated consumers. |
| `ParentView.vue` | Cleaning | No route record, lazy import, or dynamic path consumer. |
| `sync/setup.ts` | Cleaning | No bootstrap or runtime consumer. |
| Unused directives | Cleaning | Preserve directives with actual consumers, including authorization behavior. |
| `ambient-orb-animations.scss` | Cleaning | No selector consumer and no generated style dependency. |
| Old storage aliases | Cleaning | All callers migrated to one owner. |
| Layout no-op APIs | Cleaning | No compatibility or generated contract role. |
| Type aliases | Cleaning | No downstream package or app consumer. |

### 14.2 Mandatory deletion evidence

| Evidence class | Requirement |
|---|---|
| Static graph | No import or re-export. |
| Dynamic use | No dynamic import, route string, selector contract, or runtime lookup. |
| Package exports | No public export consumer. |
| Scripts and CI | No CLI, generator, packaging, or CI consumer. |
| Generated contracts | Not consumed by auto-import, generated types, manifests, or generators. |
| Production builds | Web and Desktop builds pass. |
| Architecture | `pnpm arch:boundaries` and `pnpm arch:runtime` pass. |
| Commit boundary | One owner or one responsibility domain per commit. |

## 15. C3 — asset and dead API cleanup

| Candidate | Classification | Required action |
|---|---|---|
| Duplicate Lottie assets | Cleaning | Delete only when byte-identical and unreferenced. |
| `autoImportModulesSync` | Cleaning | Delete after proving zero consumers. |
| `DIALOG_BREAKPOINTS` | Cleaning | Delete after proving zero consumers. |
| `closeDelay` | Cleaning or Repairing | Implement if part of a valid public contract; otherwise remove from implementation, types, and docs. |
| Unconsumed public props | Cleaning | Implement or remove; do not retain empty public APIs. |
| Duplicate generated configuration | Standardizing + Cleaning | Keep one owner and one generated location. |
| Old governance aliases | Cleaning | Remove only after the canonical replacement is stable and documented. |

## 16. A1 — architecture ownership unification

Each A1 item requires a separate stage-specific plan and an independent commit boundary.

| Substage | Classification | Objective | Must not be mixed with |
|---|---|---|---|
| A1-A API ownership | Standardizing + Improving | Use one Method builder and `useHttpRequest` path for auth/system APIs. | UI redesign. |
| A1-B 401 ownership | Standardizing | Keep one terminal 401 decision owner. | Business-layer retry/logout duplication. |
| A1-C Logout orchestration | Standardizing + Improving | User store resets only its own state; move cross-store coordination to a session orchestrator. | Additional store cross-imports. |
| A1-D ProTable storage | Improving | Inject a safe storage adapter rather than directly owning browser storage inside the package. | Unmigrated persistence format changes. |
| A1-E CoreRuntime decision | Standardizing | Decide whether Web has a real CoreRuntime consumer; retain real use or remove unconnected dependency. | Deletion based only on temporary non-use. |
| A1-F Runtime-neutral boundaries | Standardizing | Extend neutral-boundary enforcement to `design-tokens` and `shared-utils`. | DOM dependencies in neutral packages. |

| Suggested commit | Subject |
|---|---|
| API | `refactor(http): 统一业务 API 请求所有权` |
| Logout | `refactor(session): 收口退出登录编排` |
| Storage | `refactor(table): 注入安全持久化适配器` |
| CoreRuntime | Dedicated architecture-decision commit |
| Boundaries | Dedicated governance commit |

## 17. C0 — Adaptive Liquid Glass material foundation

### 17.1 Target state model

| Axis | Target model |
|---|---|
| Color scheme | `light | dark | auto` |
| Material mode | `solid | translucent | liquidGlass` |
| Legacy persistence migration | `glass` becomes `auto + liquidGlass` unless current product evidence requires another deterministic mapping. |
| Legacy enum removal | Remove only after persisted state, bootstrap, runtime, Desktop, Web, and all consumers migrate. |

### 17.2 C0 substages

| Substage | Classification | Required work |
|---|---|---|
| C0-A Dual-axis model | Upgrading | Separate color semantics from material semantics. |
| C0-B Persistence migration | Upgrading | Add an idempotent migration for legacy `glass` state. |
| C0-C Material tokens | Upgrading | Add semantic transmission, blur, saturation, tint, edge, highlight, shadow, scrim, contrast, thickness, and fallback roles. Exact names require a C0-specific design decision. |
| C0-D UnoCSS semantics | Upgrading + Standardizing | Expose role-based shortcuts/rules; pages select roles, not optical parameters. |
| C0-E PrimeVue adaptation | Upgrading | Apply material roles to overlays, navigation, toolbars, and relevant PrimeVue surfaces through the adapter. |
| C0-F Shared Vue UI | Upgrading | Apply material behavior to shared functional chrome only. Do not bulk-edit pages. |
| C0-G Fallbacks | Upgrading + Improving | Support reduced transparency, increased contrast, reduced motion, weak support, and disabled material. |
| C0-H Platform tiers | Improving | Validate Windows WebView2, macOS WKWebView, Linux WebKitGTK, and browser behavior independently. |

### 17.3 Surface model

| Surface | Product role | Allowed material |
|---|---|---|
| Content Canvas | Main content foundation | Solid |
| Standard Module Surface | Forms, tables, content modules | Solid or translucent |
| Functional Chrome | Navigation, toolbar, overlay, key controls | Liquid Glass with translucent/solid fallback |

### 17.4 C0 prohibitions

| Prohibited action | Reason |
|---|---|
| Page-owned blur, tint, shadow, specular, or optical values | Creates parallel material systems. |
| Glass on every card | Destroys hierarchy, performance, and readability. |
| Nested glass surfaces | Creates optical and performance defects. |
| New Liquid Glass or Apple Design Skill | Breaks the single UI authority. |
| GSAP for every transition | Simple feedback remains CSS/component-owned. |
| Page migration before shared material | Creates private implementations and duplicate parameters. |

## 18. UI-I — shared component improvement

| Component or surface | Classification | Required improvement |
|---|---|---|
| ProTable | Improving | Inherit global density, remove duplicated size resolution, unify row height and fullscreen behavior. |
| CScrollbar | Improving + Repairing | Respect reduced motion, implement or remove ineffective behavior props, use native focusable controls. |
| Dialog/Drawer | Improving | Apply material role, overlay hierarchy, and deterministic focus lifecycle. |
| ProForm | Improving | Improve field-level rendering, stable identity, state semantics, and error semantics. |
| ProTreeTable | Repairing + Improving | Complete i18n, loading, empty, error, and public prop truthfulness. |
| Charts | Repairing + Improving | Accessible names, data alternatives, reduced motion. |
| Header/User/Tabs | Improving | Shared functional chrome and consistent interaction feedback. |

## 19. Page migration

| Batch | Classification | Scope | Migration rule |
|---|---|---|---|
| PAGE-1 | Improving + Upgrading | Admin chrome, Sidebar, Header, Tabs, Breadcrumb, overlays | Migrate fixed functional chrome first. |
| PAGE-2 | Improving + Upgrading | Login | Remove private optical values; reuse shared tokens, roles, and GSAP adapter. |
| PAGE-3 | Improving + Upgrading | Desktop | Align theme, density, live sizing, and platform fallbacks. |
| PAGE-4 | Improving + Upgrading | Dashboard and Showcase | Use semantic surfaces; do not glassify normal content cards. |

### 19.1 Permanent page rules

| Concern | Requirement |
|---|---|
| Viewport | Prefer a bounded application workspace rather than whole-page scrolling. |
| Scroll | One explicit scroll owner per region; avoid same-axis nested scrolling. |
| Components | CCD wrapper first, PrimeVue second, custom component only with explicit justification. |
| Styling | Semantic UnoCSS classes and tokens; no arbitrary raw material values. |
| Motion | CSS/simple component motion first; GSAP only for explicit complex choreography. |
| Accessibility | Keyboard, focus, zoom, reduced motion, transparency, contrast, and screen reader states. |
| States | Loading, empty, error, disabled, overlay, and fullscreen states must be complete. |

## 20. Production validation contract without test assets

| Layer | Command or acceptance method |
|---|---|
| Project configuration | `pnpm project:validate` |
| AI adapters | `pnpm ai:protocol-adapters:check` |
| AI routing | `pnpm ai:routing:validate` |
| AI governance | After B4, `pnpm ai:governance:check` |
| Client projections | Local Codex, Claude, and skill mirror checks only |
| Lint | `pnpm lint:check` |
| Type checking | `pnpm type-check` |
| Architecture | `pnpm arch:boundaries` |
| Runtime neutrality | `pnpm arch:runtime` |
| Desktop security | `pnpm desktop:security` |
| Web production build | `pnpm build:web-demo` |
| Desktop Vite build | `pnpm build:desktop` |
| CI parity | `pnpm build:ci` |
| Tauri packaging | `pnpm --filter @ccd/desktop tauri build` |
| Diff integrity | `git diff --check` |
| Visual acceptance | Light/dark/auto, all density modes, 320–3840 widths, short screen, landscape. |
| Accessibility acceptance | 200% zoom, keyboard, screen reader, focus-visible. |
| Preference acceptance | Reduced motion, reduced transparency, increased contrast. |
| State acceptance | Loading, empty, error, disabled, overlay, fullscreen. |

## 21. Stage gates

| Stage | PASS condition | BLOCK condition |
|---|---|---|
| R1 | All three HTTP defects closed; production checks and manual states pass. | Refresh contract unknown, stale-token retry possible, request identity race remains, or unsuccessful HTTP status counts healthy. |
| B3 | One UI body, zero references, zero competing UI authorities. | Any second body, stale profile, or product implementation change. |
| B4 | AI governance and Desktop security run in CI; remote required contexts match real checks. | CI still omits repository governance or branch protection references nonexistent checks. |
| R2 | Desktop and Login defects closed without weakening Tauri security. | Demo capability widening or unresolved first-paint/zoom/scroll defects. |
| A11Y-R | Existing keyboard, focus, zoom, and semantic defects closed. | Known accessibility defect remains unverified. |
| Cleaning | Every deletion has current graph and runtime evidence. | Bulk deletion or uncertain consumer. |
| A1 | One owner per API/session/storage/runtime decision and all builds pass. | Ownership remains duplicated or circular. |
| C0 | Dual-axis model, migration, fallbacks, and platform matrix complete. | Pages still own optical values or migration is incomplete. |
| UI-I | Shared components own material, density, and accessibility behavior. | Pages override incomplete shared behavior. |
| PAGE-* | Current slice passes manual and production acceptance. | Previous slice has unresolved regression. |

## 22. Permanent prohibitions

| Prohibited action | Failure class | Reason |
|---|---|---|
| Page visual redesign before B3 | Stage violation | UI authority is not consolidated. |
| Liquid Glass pages before C0 | Stage violation | Material tokens and fallbacks do not exist. |
| New Apple/Liquid Glass UI Skill | Authority conflict | Breaks the single UI authority. |
| Widen Desktop capability for a demo | Security regression | Breaks deny-by-default. |
| Bulk delete without proof | Unsafe cleaning | Can remove dynamic, generated, or packaging consumers. |
| Mix cleaning, repair, and upgrade in one commit | Review and rollback failure | Scope cannot be independently accepted. |
| Page-owned material parameters | Architecture drift | Creates a duplicate design system. |
| Add test frameworks or tracked test assets | Scope violation | This program uses the approved production-validation contract. |
| Inspect real user skill directories from CI | Environment contamination | CI validates repository invariants only. |
| Let `gsap-core` define product visual policy | Authority conflict | GSAP is a technical implementation supplement. |
| Start downstream stages before gate PASS | Process failure | Root cause, impact, and rollback boundaries become ambiguous. |

## 23. Commit and push policy

| Policy | Requirement |
|---|---|
| Baseline | Verify root, origin, branch, local/remote SHAs, ahead/behind, and clean state before each stage. |
| Commit scope | One responsibility domain per commit. |
| Repair commits | Must not contain design upgrades or broad cleanup. |
| Cleanup commits | Must not add new capability. |
| Upgrade commits | Must include migration and fallback behavior. |
| Commit language | Chinese Conventional Commit subjects. |
| Push | Only after local independent acceptance; normal fast-forward only; never force push. |
| Remote acceptance | Verify commit boundary, CI, remote settings, and final repository state. |
| Reporting | Include baseline, changed/deleted files, validations, commit topology, remote state, and residual risks. |

## 24. Required stage-specific planning workflow

This master document is not permission to execute an entire stage without a stage plan.

| Step | Codex action |
|---:|---|
| 1 | Re-read current remote `main` and all canonical authorities relevant to the stage. |
| 2 | Use the required Superpowers process Skill. |
| 3 | Create or update a stage-specific implementation plan in `docs/superpowers/plans/`. |
| 4 | List exact authorized paths, forbidden paths, interfaces, deletion evidence, validation commands, and commit boundaries. |
| 5 | Execute only the unlocked stage. |
| 6 | Run local verification and independent review. |
| 7 | Commit only when all local gates pass. |
| 8 | Push only when explicitly authorized. |
| 9 | Verify remote commit, CI, and remote settings. |
| 10 | Update stage status and next gate in this master roadmap without turning it into a second normative authority. |

## 25. Stage report template

```text
STATUS=<STAGE>_LOCAL_PASS | <STAGE>_REMOTE_PASS | <EXACT_BLOCKED_STATUS>

BASELINE
repository=/Users/cc/MyPorject/ccd
repository_authority=ichichuang/ccd
branch=main
local_head=<sha>
origin_main=<sha>
remote_main=<sha>
ahead_behind=<n/n>
initial_worktree_clean=yes|no

SCOPE
stage=<stage>
classification=Repairing|Standardizing|Cleaning|Improving|Upgrading
authorized_paths=<paths>
forbidden_paths=<paths>

CONTRACTS_RESOLVED
<contract>=resolved|unresolved

CHANGED
<files or none>

DELETED
<files or none>

VALIDATION
<command>=pass|fail|not-run

MANUAL_ACCEPTANCE
<surface-or-state>=pass|fail|not-run

REVIEW
critical=<n>
important=<n>
minor=<n>

COMMIT
sha=<sha>
parent=<sha>
subject=<subject>
commit_count=<n>

REMOTE
push=not-authorized|not-pushed|pushed
ci=<state>
remote_settings=<state>

FINAL_STATE
worktree_clean=yes|no
content_blockers=<n>
residual_risks=<items>
next_gate=<stage-or-blocked>
```

## 26. Current milestone state

| Milestone | Current status | Required target |
|---|---|---|
| B2 Routing | Complete | Frozen |
| R1 HTTP | Not started | Runtime Safe |
| B3 UI Governance | Not started | One Entry / One Body |
| B4 Governance | Not started | Repository + Remote Closed |
| R2 Runtime UI | Not started | Desktop/Login Correct |
| A11Y-R | Not started | Existing Defects Closed |
| Cleaning | Not started | Dead Content Removed |
| A1 Architecture | Not started | Ownership Unified |
| C0 Material | Not started | Adaptive Material Ready |
| UI-I Components | Not started | Shared Components Ready |
| PAGE-* | Blocked | Product UI Migrated |
| Final delivery | Not reached | `CCD_PLATFORM_AND_UI_MODERNIZATION_COMPLETE` |

```text
CURRENT_EXECUTION_GATE=R1-A_REFRESH_CONTRACT_AND_TOKEN_WRITEBACK
PARALLEL_B3_ALLOWED=no
PARALLEL_CLEANING_ALLOWED=no
PARALLEL_C0_ALLOWED=no
PARALLEL_PAGE_REDESIGN_ALLOWED=no
NEXT_REQUIRED_ARTIFACT=R1_STAGE_SPECIFIC_IMPLEMENTATION_PLAN
```
