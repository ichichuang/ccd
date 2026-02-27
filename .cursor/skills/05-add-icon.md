# Skill 05: Add Icon (Smart icon selection)

## Goal

When the task is "add an icon / replace an icon", smart-select and output a ready-to-use `<Icons name="...">` solution without breaking the design system.

## Pre-check (mandatory)

- `@docs/ai-specs/PROJECT_PROTOCOL.md` (component and icon rules)
- `@.cursor/rules/18-components-and-icons.mdc`
- `@docs/ai-specs/UNOCSS_AND_ICONS.md`

## Smart Selection Policy (priority order)

1. **Lucide (default/recommended)**: `i-lucide-*`
2. **MDI (fallback)**: `i-mdi-*`
3. **Logos (brands)**: `i-logos-*`
4. **Custom SVG**: When no suitable icon exists in collections
   - Place SVG in `src/assets/icons/**`
   - Use `i-custom:<path-with-dashes>`

## Output (required)

- Recommended `<Icons name="..." />` usage (include size suggestion)
- If custom SVG is needed: path to place it and final `i-custom:` name

## Hard Constraints

- FORBIDDEN: hand-written `<svg>`, external/base64 icons
- **Size**: Prefer `xs~5xl` (maps to `fs-*`, tied to SizeStore); custom size only when necessary
- **Color**:
  - Static: Use semantic classes (`class="text-primary"`); if not effective inside PrimeVue/parent, add `!`: `text-primary!`, `group-hover:text-accent-light-foreground!`
  - Dynamic/theme vars: Use `color` prop (`color="rgb(var(--primary))"`), avoids class specificity issues
  - Inherit parent: `class="text-current"`
  - No hex; `color` prop MUST use `rgb(var(--primary))` format
  - See `docs/ai-specs/UNOCSS_AND_ICONS.md` §6.3.1

## Advanced Features

When the task involves icon animation, flip, rotate, scale:

- **Animation**: `animation="spin|pulse|spin-pulse"`
- **Flip**: `flip="horizontal|vertical|both"`
- **Rotate**: `rotate="90"` or `rotate={90}` (deg)
- **Scale**: `scale={1.5}` (numeric)

**Reference:**

- Types: `src/components/Icons/utils/types.ts`
- Example page: `src/views/example/Icons/IconsExample.vue` (route: `/example/icons`)
- Full doc: `docs/ai-specs/UNOCSS_AND_ICONS.md` §6
- Color specificity: `docs/ai-specs/UNOCSS_AND_ICONS.md` §6.3.1

## Prompt Template (copy & use)

```
Read @docs/ai-specs/PROJECT_PROTOCOL.md and @docs/ai-specs/UNOCSS_AND_ICONS.md
Follow @.cursor/rules/18-components-and-icons.mdc

Task: Select/add icon for the following semantics and provide final <Icons /> usage:
Semantics: <e.g. add/edit/delete/refresh/export/settings/user/role/permission/hint/warning>

Requirements:
- Prefer Lucide, then MDI, then Logos
- If no suitable icon, describe custom SVG placement (src/assets/icons/**) and final i-custom: name
```
