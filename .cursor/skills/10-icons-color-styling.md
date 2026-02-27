# Skill 10: Icons Color Styling (When color does not apply)

## Goal

When Icons component color/opacity set via `class` does not apply, use this Skill's decision table to choose the fix.

## Pre-check (mandatory)

- `@docs/ai-specs/UNOCSS_AND_ICONS.md` §6.3, §6.3.1, §6.3.2, §2.7.1
- `@.cursor/rules/18-components-and-icons.mdc`

## Root cause quick reference

1. Icons adds `text-foreground` when `color` is not passed; conflicts with custom class
2. Inside PrimeVue (Menubar, Dropdown, etc.), parent styles have higher specificity
3. Multiple color classes with same specificity; order is non-deterministic

## Decision table (by priority)

| Scenario                        | Solution                 | Example                                |
| ------------------------------- | ------------------------ | -------------------------------------- |
| Need override, inline style ok  | Use `color` prop         | `color="rgb(var(--primary))"`          |
| Must use class to override      | Add `!` to color/opacity | `class="text-primary! opacity-100!"`   |
| hover / group-hover not applied | Add `!` to state class   | `group-hover:text-primary-hover!`      |
| Match parent text color         | `text-current`           | `class="text-current"`                 |
| Custom `i-custom:*` icon        | Same as above            | Same rules, inject fill="currentColor" |

## Steps

1. **Identify scenario**: Is Icons inside PrimeVue or a parent with higher specificity?
2. **Choose solution**: Prefer `color` prop; if class is required, add `!`
3. **Check opacity**: If `opacity-*` is also overridden, add `!` there too
4. **Verify**: Inspect icon final color in browser

## Icons and transition

When Icons use `group-hover:` color/opacity, transition MUST be on Icons class; parent transition does not apply. Example: `class="transition-colors duration-scale-md group-hover:text-primary-hover!"`. Use primary-hover for hover; `text-primary!` for brand **static** color.

## Forbidden

- `color` prop with hex or `var(--primary)` (MUST use `rgb(var(--primary))`)
- Hand-written `<svg>` or external icons
- Icons with group-hover color but transition only on parent

## Reference

- Full rules: `docs/ai-specs/UNOCSS_AND_ICONS.md` §6.3.1, §6.3.2, §2.7.1
- Example: `src/layouts/components/admin/AdminHeader.vue` (Icons in Menubar using `text-primary!` etc.)
