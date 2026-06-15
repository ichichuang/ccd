---
name: ccd-material-system
description: Defines CCD material, liquid-glass-inspired surfaces, depth, shadows, borders, and overlay usage while preserving token and readability rules.
version: 1.0.0
---

# CCD Material System

## Purpose

Use this skill when designing cards, panels, dialogs, dropdowns, overlays, command surfaces, login cards, settings cards, dashboards, and glass-like material effects.

## Material principle

```text
Material explains layers. Material is not decoration.
```

## Material vocabulary

CCD can be Apple-liquid-glass-inspired without copying Apple.

CCD liquid glass means:

- tokenized surfaces;
- soft but readable elevation;
- controlled translucency;
- restrained luminous borders;
- stable dark-mode optics;
- minimal blur;
- no readability sacrifice.

CCD liquid glass does not mean:

- heavy blur everywhere;
- transparent text surfaces;
- nested glass cards;
- neon borders;
- fake frosted panels over busy content;
- low-contrast input fields;
- glass tables.

## Material mapping

Use existing approved material shortcuts first.

| Surface           | Preferred treatment                                    |
| ----------------- | ------------------------------------------------------ |
| Main page canvas  | quiet background token field                           |
| Stable cards      | `material-solid` or app-local tokenized card class     |
| Form cards        | `material-elevated` or tokenized form surface          |
| Dashboard cards   | `glass-card` only when content remains readable        |
| Dialogs/dropdowns | `glass-panel` or component-owned overlay material      |
| Icon containers   | `glass-icon-box` when icon is meaningful               |
| Tiny labels/pills | `glass-capsule` or semantic surface                    |
| Tables            | solid material, not glass                              |
| Login form        | elevated solid/glass hybrid, but form readability wins |

Do not use `glass-base` directly.

## Light mode optics

Light mode should feel calm, not empty.

Use:

- enough surface contrast between canvas and cards;
- subtle semantic borders;
- small shadow only where depth matters;
- low-opacity pastel glows only as background support;
- clear text hierarchy.

Avoid:

- white cards on white background without depth;
- invisible input borders;
- pale gray text as primary content;
- overwashed glass.

## Dark mode optics

Dark mode should feel rich, not muddy.

Use:

- semantic borders;
- controlled luminous edge or inset lift;
- stable card surfaces;
- text contrast;
- accent only for focus/selection/status.

Avoid:

- black panels with low-contrast gray text;
- ordinary outer shadows as the only depth cue;
- brand tint everywhere;
- over-dark transparent forms.

## Inputs and forms

Inputs must be solid enough to read.

Required states:

- default;
- hover;
- focus;
- invalid;
- disabled;
- filled;
- password visibility button state.

Avoid:

- icons that crowd fields;
- visibility buttons that look detached;
- harsh error states that destroy card aesthetics;
- low-contrast placeholders.

## Toolbar and dropdown material

Toolbar controls must read as one system.

Rules:

- theme and locale controls share shape, density, and state language;
- hover is subtle surface lift;
- selected is a small accent cue, not a large block;
- dropdown is an overlay material, not a default browser menu;
- avoid extra decorative icons.

## Borders

Visible border requires width, style, and semantic color according to CCD rules.

Do not add borders everywhere. Use borders to clarify grouping, selected state, focus, and overlay boundaries.

## Shadows

Use shadows to show elevation, not style.

Avoid hardcoded black shadows in app code. Prefer existing material utilities or CSS variables based on semantic tokens.

## Review checklist

Reject material if:

- text readability depends on backdrop blur;
- dark mode is muddy;
- light mode has no separation;
- controls look native/default;
- glass is nested inside glass;
- data-heavy surfaces use decorative material;
- raw colors or arbitrary alpha hacks appear.
