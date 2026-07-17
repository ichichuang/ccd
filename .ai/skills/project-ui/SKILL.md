---
name: project-ui
description: Canonical CCD project-level UI governance source for routed and direct UI work.
version: 1.0.0
---

# CCD Project UI

project-ui is the canonical CCD project-level UI governance source. Repository routing selects its stable Skill ID for generic UI work, and a session may also read it directly to classify UI work, select references, preserve boundaries, reuse foundations, and validate output.

## Identity and Purpose

project-ui is the canonical CCD project-level UI governance source for planning, implementation, refactoring, review, and validation. Codex and Claude consume noncanonical synchronized materializations of this repository source; routing and direct loading both preserve the same classification, references, preflight, precedence, foundations, output, and validation contract.

## Transitional Status

The initial project-ui source was introduced on main by commit `624948ea9058507f8fae91975dabc715d984703a` with subject `feat(governance): 建立唯一项目级 UI Skill`. P3 Machine UI Policy and P4 cold-start contracts remain complete. P5 now discovers project-ui as the singleton canonical project Skill, locks its twelve-file source inventory, routes generic UI tasks to its stable Skill ID, synchronizes isolated Codex and Claude materializations transactionally, and activates both adapters. Application-source enforcement remains baseline-only because the source scanner is not implemented. Legacy design Skills and legacy UI rules remain available through conditional routing.

## Future Activation Intent

The Node router is primary and the Python router is the parity fallback. Generic UI evidence selects project-ui; explicit page or route composition may add task-orchestrator and Vue; non-UI work remains isolated; motion, UnoCSS, and Vite activate only from their own narrow evidence. Adapter activation does not make project-ui a global always-loaded Skill.

## Scope

This Skill governs UI planning, page and route composition, layout and scrolling, component selection, tokens and UnoCSS, theme and Product UI Profile, interaction and motion, accessibility, human validation, UI-only refactoring, and UI review across current `apps/**` UI surfaces and shared UI packages when product UI is affected.

## Non-Goals

Loading this Skill does not authorize business logic, API, authentication, HTTP, synchronization, storage, security, architecture-boundary, dependency, package-boundary, routing-manifest, Skill discovery, sync, runtime foundation replacement, Machine UI Policy creation, Page Contract Schema creation, legacy Skill retirement, or legacy rule retirement.

## Authority and Precedence

System instructions, repository protocol, and `.ai/rules/**` remain higher authority. Permanent platform invariants override replaceable product profile choices; accessibility, token ownership, component boundaries, layout ownership, and runtime behavior preservation cannot be weakened by visual preference.

## Required Preflight

Execute this ordered sequence before editing: verify repository path, origin, branch, HEAD, worktree, index, and task scope; inspect architecture and runtime boundaries; classify the UI task; load required references; inspect existing tokens, components, adapters, foundations, and nearby patterns; identify page topology, layout regions, scroll owners, states, accessibility, responsive behavior, and motion needs; separate UI-only work from business behavior; define focused validation.

## Task Classification

Use these classes: `visual-expression`, `layout-scroll`, `page-structure`, `token-style`, `component-interaction`, `motion`, `accessibility`, `validation-review`, and `mixed-ui`. Mixed tasks load the union of applicable references, while generic UI tasks must not load both motion systems by default.

## Reference Loading Matrix

Always load [platform invariants](references/platform-invariants.md). Add [product language](references/product-language.md) and [product UI profile](references/product-ui-profile.md) for visual-expression, [layout and scroll](references/layout-scroll.md) for layout, [page archetypes](references/page-archetypes.md) for page-structure, [tokens and UnoCSS](references/tokens-unocss.md) for token-style, [component priority](references/component-priority.md) for component work, [interaction and motion](references/interaction-motion.md) only for motion, [accessibility](references/accessibility.md) for user-facing UI, and [validation](references/validation.md) before completion.

## Platform Invariants and Product UI Profile

Permanent invariants live in platform, layout, token, component, motion, accessibility, and validation references. CCD Architectural Glass is the current replaceable Product UI Profile and must consume those invariants instead of redefining them.

## Existing Foundation Reuse

Reuse current foundations before new code: `packages/vue-ui/**`, `packages/vue-primevue-adapter/**`, `packages/design-tokens/**`, current `apps/*/src/views/**`, current `apps/*/src/router/**`, PrimeVue v4 through approved boundaries, UnoCSS semantic shortcuts, and current AppContainer evidence at `apps/web-demo/src/layouts/components/AppContainer.vue`.

## Mandatory UI Work Output Contract

Every UI report must include task classification, references loaded, foundation reuse, changed owners, layout and scroll owners, component owners, token decisions, state matrix, accessibility checks, motion decisions, validation commands, protected-path review, and residual risks.

## Required Validation Sequence

Validate in order: architecture boundary, loaded-reference check, token audit, component ownership, layout and scroll ownership, responsive behavior, state matrix, keyboard and focus, reduced motion, light and dark parity, visual regression when applicable, runtime behavior preservation, final diff review, and protected-path review. Run `node .ai/skills/project-ui/scripts/validate-semantic-quality.mjs` and `node .ai/governance/ui/scripts/validate-ui-policy.mjs` where applicable. Do not claim machine source-scanning enforcement where the scanner does not exist.

## Conditional Motion Loading

GSAP is eligible only for timeline-heavy, scroll-linked, or complex choreography with local cleanup and reduced-motion fallback. animate-lite is eligible only for lightweight route, class, or state transitions. Neither tool loads by default and they must not become simultaneous defaults.

## Future Integration Boundaries

Current project-ui provides human-readable canonical governance, deterministic policy and semantic-quality validation, routed activation, and transactional synchronization contracts. It does not provide source-scanning enforcement, Page Contracts, route scaffolding, or automatic global loading. P4 AI cold-start validation still owns repository entrypoint availability; P5 extends that contract with conditional project-ui discovery and adapter activation.

## P3 Machine UI Policy Boundary

P3 Machine UI Policy is complete at `.ai/governance/policies/ui.json` with 68 canonical rules across 14 semantic-obligation clusters. Its schemas, Product UI Profile, empty exception registry, fixtures, and deterministic validator are present. The source scanner is not implemented, so application-source enforcement remains baseline-only.

## Lifecycle State

```text
P3_COMPLETE=yes
MACHINE_UI_POLICY_COMPLETE=yes
MACHINE_UI_POLICY_PRESENT=yes
POLICY_SCHEMAS_PRESENT=yes
PRODUCT_UI_PROFILE_PRESENT=yes
EXCEPTION_REGISTRY_PRESENT=yes
EXCEPTION_COUNT=0
POLICY_FIXTURES_PRESENT=yes
POLICY_VALIDATOR_PRESENT=yes
P4_STARTED=yes
P4_COMPLETE=yes
COLD_START_ATOMIC_REPLACEMENT_COMPLETE=yes
AGENTS_TRACKED=yes
CLAUDE_TRACKED=yes
CLAUDE_ADAPTER_TRACKED=yes
ADAPTER_MANIFEST_COLD_START_COMPLETE=yes
ADAPTER_GENERATION_DETERMINISTIC=yes
AI_SYNC_IDEMPOTENT=yes
FRESH_CLONE_ENTRYPOINTS_PASS=yes
P5_STARTED=yes
P5_COMPLETE=yes
PROJECT_UI_DISCOVERED=yes
PROJECT_UI_ROUTED=yes
PROJECT_UI_SYNCHRONIZED=yes
PROJECT_UI_ADAPTER_ACTIVATED=yes
PROJECT_UI_LOCKED=yes
PROJECT_UI_CODEX_SYNC_CONTRACT_COMPLETE=yes
PROJECT_UI_CLAUDE_SYNC_CONTRACT_COMPLETE=yes
SKILL_ROUTING_MANIFEST_CURRENT=yes
ROUTING_SCOPE_REGISTRY_COMPLETE=yes
SKILLS_LOCK_CURRENT=yes
RULE_INDEX_CURRENT=yes
NODE_PYTHON_ROUTER_PARITY=yes
GENERIC_UI_ROUTES_TO_PROJECT_UI=yes
MOTION_ROUTING_CONDITIONAL=yes
NON_UI_ROUTING_PRESERVED=yes
ADAPTER_PROJECT_UI_MAPPING_COMPLETE=yes
CODEX_ADAPTER_PROJECT_UI_ACTIVE=yes
CLAUDE_ADAPTER_PROJECT_UI_ACTIVE=yes
SOURCE_SCANNER_IMPLEMENTED=no
PAGE_CONTRACT_CREATED=no
LEGACY_SKILLS_RETIRED=no
LEGACY_RULES_RETIRED=no
```

## Page Contract Boundary

Page Contract Schema does not exist now. Page archetypes are conceptual patterns, and requirements deferred to page contracts remain deferred until a future page-contract owner creates a schema.

## P4 Cold-Start Boundary

P4 AI cold-start atomic replacement is complete for repository entrypoints: `AGENTS.md`, `CLAUDE.md`, `.ai/protocol/adapters/claude.md`, and the protocol adapter manifest are tracked and validator-owned. This Skill still must not claim automatic project-ui loading by Codex, Claude, adapters, or generated entrypoints.

## P5 Routing and Synchronization Boundary

P5 is complete for Skill discovery, routing, lock updates, adapter synchronization, Codex sync, and Claude sync. `.ai/skills/project-ui` remains the canonical source; synchronized client copies are noncanonical materializations and real client targets are never validation targets.

## Internal Reference Authority

The ten files under `references/` are internal authority for project-ui. They are not separate Skills, must not contain Skill frontmatter, and must be loaded through this entrypoint or the approved router.
