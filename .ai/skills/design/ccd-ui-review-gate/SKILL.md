---
name: ccd-ui-review-gate
description: Final CCD product UI review before handoff.
version: 1.0.0
---

# CCD UI Review Gate

Review architecture ownership, visual hierarchy, token use, component selection, material restraint, states, responsive behavior, accessibility, and motion.

Reject changes that introduce raw visual constants, invented shortcuts, avoidable native controls, broad page-root scrolling, hidden focus, incomplete states, overlapping actions, or unnecessary dependencies.

For UI-heavy changes, inspect light, dark, and affected responsive layouts. Verify keyboard behavior, overflow, loading, empty, error, disabled, and success states.

Run the smallest sufficient production checks:

```bash
pnpm type-check
pnpm lint:check
pnpm arch:boundaries
pnpm arch:runtime
pnpm build:web-demo
git diff --check
```
