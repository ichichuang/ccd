---
name: project-ui
description: Canonical CCD guidance for product UI implementation and review.
version: 1.0.0
---

# CCD Project UI

Use this skill for visual expression, layout, page structure, component interaction, accessibility, and UI review.

## Preflight

1. Inspect repository and worktree state.
2. Identify the owning app, component, tokens, adapters, and route.
3. Preserve business behavior and runtime boundaries.
4. Reuse existing foundations before adding abstractions.

## Reference routing

Always read `references/platform-invariants.md`. Load only the references relevant to the task:

- visual language: `product-language.md`, `product-ui-profile.md`
- layout: `layout-scroll.md`
- page structure: `page-archetypes.md`
- tokens: `tokens-unocss.md`
- components: `component-priority.md`
- interaction: `interaction-motion.md`
- accessibility: `accessibility.md`
- completion: `validation.md`

## Invariants

- Prefer `packages/vue-ui`, `packages/vue-primevue-adapter`, and `packages/design-tokens`.
- Keep one explicit scroll owner per region.
- Use semantic tokens and UnoCSS shortcuts; do not duplicate raw design values.
- Preserve keyboard, focus, reduced-motion, responsive, light, and dark behavior.
- Load a motion skill only when its engine is explicitly required.

## Completion

Report changed owners, reused foundations, accessibility decisions, validation commands, and residual risks. Run the narrowest production checks that cover the change.
