---
description: Color semantic authority chain; colorUsage.ts is the single semantic source
globs: src/**/*.{vue,ts,tsx}
alwaysApply: true
---

# Color Authority Chain

## 1. Primary Directive

**colorUsage.ts is the single source of truth for semantic color decisions.**

All color decisions MUST follow this authority chain. Lower layers must NOT override upper semantic definitions.

## 2. Authority Priority

```
1. src/constants/theme/colorUsage.ts  ← semantic authority (SSOT)
2. Theme Engine (engine.ts → ThemeCssVars)
3. Component presets (primevuePreset.ts)
4. UnoCSS shortcuts & docs examples
```

**Lower layers must never override higher layers.**

- **hover always primary-hover**: All hover color feedback uses `primary-hover` family (PrimeVue and UnoCSS business code)
- **focus ring uses ring**: `focus:ring-ring`
- **accent = independent complementary highlight**: Tab active indicator, special markers, badge; NOT for hover/active/focus
- Rules MUST reference colorUsage.ts
- Docs must NOT redefine primary/accent/ring/neutral semantics
- Preset implements Token mapping only, does not interpret semantics
- Uno examples MUST follow colorUsage

## 3. Reference

Before generating any color-related code, read:

- **Semantic authority**: `src/constants/theme/colorUsage.ts` (COLOR_USAGE, PRIMARY_USAGE, ACCENT_USAGE)
- **Types and vars**: `src/types/systems/theme.d.ts`, `src/utils/theme/engine.ts`
- **PrimeVue integration**: `docs/ai-specs/PRIMEVUE_THEME.md`
