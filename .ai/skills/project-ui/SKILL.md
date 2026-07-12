---
name: project-ui
description: Canonical CCD project-level UI governance source for manual loading now and future routed use later.
version: 1.0.0
---

# CCD Project UI

project-ui is the canonical CCD project-level UI governance source. It can be read directly by a new session to classify UI work, select references, preserve boundaries, reuse foundations, and validate output.

## Identity and Purpose

project-ui is the canonical CCD project-level UI governance source for planning, implementation, refactoring, review, and validation. A manually loaded Codex or Claude session can use it without current Skill discovery because it defines classification, references, preflight, precedence, foundations, output, and validation.

## Transitional Status

The initial project-ui source was introduced on main by commit `624948ea9058507f8fae91975dabc715d984703a` with subject `feat(governance): 建立唯一项目级 UI Skill`. project-ui remains undiscovered by the current Skill lock, unrouted, and unsynchronized; legacy design Skills and legacy UI rules remain unchanged.

## Future Activation Intent

Future phases may route UI tasks to this Skill after their own owners create machine policy, cold-start, routing, and synchronization support. Until then, manual loading is the supported use and must not imply adapter activation or cold-start behavior.

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

Validate in order: architecture boundary, loaded-reference check, token audit, component ownership, layout and scroll ownership, responsive behavior, state matrix, keyboard and focus, reduced motion, light and dark parity, visual regression when applicable, runtime behavior preservation, final diff review, and protected-path review. Do not claim machine validation where it does not exist.

## Conditional Motion Loading

GSAP is eligible only for timeline-heavy, scroll-linked, or complex choreography with local cleanup and reduced-motion fallback. animate-lite is eligible only for lightweight route, class, or state transitions. Neither tool loads by default and they must not become simultaneous defaults.

## Future Integration Boundaries

Future phases own future enforcement and routing. Current project-ui provides human-readable canonical governance plus semantic-quality validation only; it does not create machine enforcement, cold-start activation, or sync.

## P3 Machine UI Policy Boundary

P3 owns Machine UI Policy and that policy does not exist now. The semantic-quality gate checks source quality and coverage integrity only and must not be described as P3 machine UI enforcement.

## Page Contract Boundary

Page Contract Schema does not exist now. Page archetypes are conceptual patterns, and requirements deferred to page contracts remain deferred until a future page-contract owner creates a schema.

## P4 Cold-Start Boundary

P4 owns cold-start loading and has not started. This Skill must not claim automatic loading by Codex, Claude, adapters, or generated entrypoints.

## P5 Routing and Synchronization Boundary

P5 owns Skill discovery, routing, lock updates, adapter synchronization, Codex sync, and Claude sync. P5 has not started and this correction must not change those surfaces.

## Internal Reference Authority

The ten files under `references/` are internal authority for project-ui. They are not separate Skills, must not contain Skill frontmatter, and must be loaded through this entrypoint or a future approved router.
