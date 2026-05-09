# Theme Presets

This document records the maintenance contract for `src/constants/theme.ts`.

Theme presets are source data for the design token engine. They are allowed to contain raw `#RRGGBB` values because the theme compiler converts them into semantic CSS variables. Business UI, Vue templates, TSX, CSS, and PrimeVue pass-through styling must still use semantic tokens such as `bg-background`, `text-foreground`, `bg-primary`, and `border-border`.

## Source Of Truth

- Runtime data: `src/constants/theme.ts`
- Type contract: `src/types/systems/theme.d.ts`
- Source-data tests: `src/constants/theme.spec.ts`
- Engine tests: `src/utils/theme`
- Contrast gate: `scripts/validate-token-contrast.ts`
- Batch validation helper: `scripts/upgrade-all-themes.mjs`

Theme Engine v5 modules under `src/utils/theme/**` should not be changed for palette-only work.

## Current Palettes

| Preset             | Primary   | Accent    | Neutral   |
| ------------------ | --------- | --------- | --------- |
| `midnight-classic` | `#1c1d22` | `#d88e69` | `#89817e` |
| `earth-caramel`    | `#d88e69` | `#c07541` | `#d0b6a1` |
| `ivory-cream`      | `#e1d7cc` | `#827265` | `#ebe7e4` |
| `stone-taupe`      | `#827265` | `#d9d5d2` | `#606062` |
| `sapphire-marine`  | `#3c7b9f` | `#69b5d7` | `#434254` |
| `blossom-pink`     | `#dfafbb` | `#fe60ba` | `#d2b0a7` |
| `sunset-citrus`    | `#f2782f` | `#f05841` | `#ad907a` |
| `golden-mimosa`    | `#f6dd7f` | `#df8818` | `#ebdfb5` |
| `crimson-velvet`   | `#a4384f` | `#d93a3a` | `#decdb3` |
| `amethyst-orchid`  | `#a6588c` | `#965da8` | `#d9c7d4` |
| `emerald-forest`   | `#2f5c4f` | `#0da57c` | `#847659` |

`crimson-velvet` uses `#d93a3a` for its resolved accent token instead of the seed `#da3b3b` because the seed sits just below WCAG AA contrast with both white and near-black foregrounds.

## Preset Contract

Each preset must use `CompleteThemePreset` and explicitly define both `light` and `dark` modes.

Each mode must include:

- `background`, `foreground`
- `neutral.base`, `neutral.bg`, `neutral.foreground`, `neutral.secondaryForeground`, `neutral.mutedForeground`
- `secondary`, `secondaryForeground`
- `muted`, `mutedForeground`
- `border`, `input`, `ring`
- complete state families: `primary`, `accent`, `success`, `warn`, `danger`, `info`, `help`
- independent `sidebar.background`, `sidebar.foreground`, `sidebar.primary`, `sidebar.primaryForeground`, `sidebar.accent`, `sidebar.accentForeground`, `sidebar.border`, `sidebar.ring`

Every state family must include:

- `default`
- `foreground`
- `hover`
- `light`
- `lightForeground`

## Visual Rules

- `sidebar.background` must not equal root `background`.
- `ring` should resolve to `primary.default` or `accent.default`.
- Light-mode `hover` should be darker than `default`.
- Dark-mode `hover` should be lighter than `default`.
- Light-mode `light` should be lighter than `default`.
- Dark-mode `light` should be darker than `default`.
- Status hue semantics must remain stable:
  - `success`: green family
  - `warn`: yellow or orange family
  - `danger`: red family
  - `info`: blue family
  - `help`: purple family

## Validation

Run these checks after any preset change:

```bash
pnpm exec tsx scripts/upgrade-all-themes.mjs
pnpm exec vitest run src/constants/theme.spec.ts src/utils/theme
pnpm exec eslint src/constants/theme.ts src/constants/theme.spec.ts src/types/systems/theme.d.ts
```

For a broader project gate, run:

```bash
pnpm validate:tokens
pnpm ai:doctor
```
