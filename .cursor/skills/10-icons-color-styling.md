---
description: Icons color customization and class specificity override
globs: **/*.vue, **/*.tsx
---

# Skill 10: Icons Color Customization (when color does not apply)

## Goal

When Icons component color/opacity set via `class` does not apply, use this skill's decision table to choose a fix.

## Pre-check (required)

- `docs/ai-specs/UNOCSS_AND_ICONS.md` §6.3, §6.3.1, §6.3.2, §2.7.1
- `.cursor/rules/18-components-and-icons.mdc` or `.agent/rules/10-ui-architecture.md` §4.1

## Root Cause Quick Reference

1. Icons adds `text-foreground` when `color` is not passed, conflicting with custom class
2. Inside PrimeVue (Menubar, Select, etc.), parent styles have higher specificity
3. Multiple color classes with same specificity, order not deterministic

## Decision Table (by priority)

| Scenario                               | Approach                       | Example                                |
| -------------------------------------- | ------------------------------ | -------------------------------------- |
| Need override, inline style acceptable | Use `color` prop               | `color="rgb(var(--primary))"`          |
| Need class override                    | Add `!` to color/opacity class | `class="text-primary! opacity-100!"`   |
| hover / group-hover color not applied  | Add `!` to state class         | `group-hover:text-primary-hover!`      |
| Match parent text color                | `text-current`                 | `class="text-current"`                 |
| Custom `i-custom:*` icons              | Same as above                  | Same rules, inject fill="currentColor" |

## Steps

1. **Identify scenario**: Is Icons inside PrimeVue or a high-specificity parent?
2. **Choose approach**: Prefer `color` prop; if class is required, add `!`
3. **Check opacity**: If `opacity-*` is also overridden, add `!` there too
4. **Verify**: Check final icon color in browser

## Icons and Transition (hover / group-hover)

When Icons use `group-hover:`, `hover:` color/opacity classes, **transition MUST be on Icons class**; parent transition does not apply. Example: `class="transition-colors duration-scale-md group-hover:text-primary-hover!"`. Use primary-hover for hover; `text-primary!` for static brand color.

## Forbidden

- hex or `var(--primary)` in `color` prop (must use `rgb(var(--primary))`)
- Hand-written `<svg>` or external icon URLs
- Adding transition only on parent when Icons has group-hover color

## Reference

- Rules: `docs/ai-specs/UNOCSS_AND_ICONS.md` §6.3.1, §6.3.2, §2.7.1
- Example: `src/layouts/components/admin/AdminHeader.vue` (Icons in Menubar with `text-primary!` etc.)
