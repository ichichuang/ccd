# CCD Design Skills

This directory contains CCD-specific product design skills. They are loaded by AI agents when UI, UX, design, layout, dashboard, settings, login, form, table, dialog, navigation, visual polish, dark-mode, responsive, or accessibility work is requested.

## Skill loading order

When a task touches UI, load these skills in this order:

1. `ccd-product-language`
2. `ccd-page-archetypes`
3. `ccd-material-system`
4. `ccd-motion-system`
5. `ccd-ui-review-gate`

These skills complement `.ai/rules/**`. They do not override architecture, runtime, PrimeVue, UnoCSS, UIDesignState, or governance rules.

## Activation keywords

Load these skills when user intent includes:

```text
UI, UX, visual, beautiful, premium, Apple-like, Google-like, liquid glass, glass, layout, dashboard, settings, login, form, table, dialog, drawer, navigation, responsive, dark mode, animation, motion, page shell, design review, polish.
```

## Non-negotiable

Beauty cannot break governance.
