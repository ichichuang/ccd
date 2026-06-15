---
name: ccd-ui-review-gate
description: A final UI review checklist for CCD visual work before staging, committing, or pushing.
version: 1.0.0
---

# CCD UI Review Gate

## Purpose

Use this skill before staging UI changes.

## Required review sequence

1. Verify architecture boundary.
2. Verify page design thesis.
3. Verify UIDesignState mapping.
4. Verify PrimeVue/Pro component usage.
5. Verify UnoCSS/token compliance.
6. Verify material and motion restraint.
7. Verify state completeness.
8. Verify responsive behavior.
9. Verify accessibility.
10. Verify validation commands.

## Visual quality gate

Reject if any answer is no:

```text
Can the primary task be understood within three seconds?
Is there one visual thesis?
Is there one signature detail at most?
Is the content hierarchy obvious?
Does the page look intentional in both light and dark mode?
Are hover, focus, selected, disabled, loading, empty, and error states designed?
Are icons used only where useful?
Is motion restrained and explanatory?
Does the UI feel CCD-specific rather than generic SaaS?
```

## Token and implementation gate

Reject if found:

- raw hex/RGB/RGBA colors in UI implementation;
- Tailwind default palette classes;
- raw numeric z-index;
- forbidden `glass-base` usage;
- `rem`/`em` layout values where CCD forbids them;
- invented UnoCSS shortcuts;
- dynamic UnoCSS class construction;
- native buttons/inputs/tables where PrimeVue/Pro wrappers should be used;
- `:deep(.p-*)` outside documented exceptions;
- broad `overflow-auto` on page roots;
- unnecessary new dependencies.

## Layout gate

Reject if:

- page root has horizontal overflow;
- footer touches final content;
- cards are cramped on normal desktop;
- tables and evidence panels squeeze each other;
- mobile layout is just a squeezed desktop;
- sticky/floating actions overlap content;
- scrollbars appear where no scroll is intended.

## Login-specific gate

Reject if:

- form is not the visual hero;
- background competes with the form;
- rotating or heavy animation exists;
- theme switch remounts form or clears input;
- locale/theme controls look like default controls;
- quick account chips look like temporary debug controls;
- error state is harsh or unreadable.

## Required evidence for UI-heavy changes

Before committing:

- light desktop screenshot;
- dark desktop screenshot;
- mobile screenshot when touched;
- relevant validation-state screenshot for forms;
- no-console-error manual check or Playwright evidence;
- overflow metrics for complex layouts.

Do not commit local screenshot artifacts unless the repo explicitly tracks them.

## Validation baseline

Use the smallest sufficient set first, then final gates:

```bash
pnpm --filter @ccd/web-demo type-check
pnpm lint:check
pnpm build:web-demo
pnpm e2e:smoke
pnpm e2e:layout
pnpm e2e:visual
pnpm e2e:qa
pnpm governance:gate
pnpm validate
git diff --check
```

If snapshots intentionally change, request owner approval before updating them.
