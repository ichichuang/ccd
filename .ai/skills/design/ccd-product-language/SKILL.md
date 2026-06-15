---
name: ccd-product-language
description: Defines CCD's product visual language so AI-generated UI feels premium, coherent, Apple/Google-quality, and CCD-specific while preserving architecture and governance.
version: 1.0.0
---

# CCD Product Language

## Purpose

Use this skill whenever creating, refactoring, reviewing, or polishing CCD UI. It defines the product-level visual language that sits above page implementation details.

This skill exists because CCD already has architecture, PrimeVue, UnoCSS, token, and governance rules, but those rules alone do not guarantee beautiful UI.

## Source-of-truth order

Follow this order:

1. User request.
2. `.ai/protocol/AGENTS.core.md`.
3. `.ai/rules/**`.
4. Existing app/package implementation patterns.
5. This product language skill.
6. General Apple, Google, or external design inspiration.

If this skill conflicts with CCD architecture or rules, CCD rules win.

## CCD visual thesis

CCD uses `Architectural Glass`:

```text
Apple clarity + Vercel precision + Linear calm + Material state completeness + CCD architecture governance.
```

CCD UI should feel:

```text
quiet, structured, premium, architectural, governed, deterministic, legible, calm, precise, token-driven.
```

CCD UI must not feel:

```text
cyberpunk, noisy, neon, generic SaaS, random AI dashboard, shader playground, component gallery, template admin, marketing landing page.
```

## Product manifesto

```text
Content over decoration.
Hierarchy over effects.
Rhythm over gradients.
Structure over animation.
Materials explain layers.
Motion explains change.
Beauty never fights usability.
Architecture is visible through clarity, not literal diagrams.
```

## Apple-inspired translation

Use Apple ideas as principles, not as copied surfaces:

- Clarity: the primary task must be visible within three seconds.
- Deference: chrome supports content and does not compete.
- Depth: depth explains hierarchy and layering.
- Liquid material: use restrained material transitions and luminous surfaces only where they clarify foreground/background separation.
- Motion: use motion to show continuity, not to entertain.

Do not make CCD look like an Apple marketing page.

## Google-inspired translation

Use Material ideas as state and system discipline:

- States are first-class: default, hover, active, selected, focus, disabled, loading, empty, error, success, warning.
- Dynamic color means token-driven color relationships, not arbitrary gradients.
- Responsive means intentionally adapted layouts, not squeezed desktop pages.
- Surfaces carry meaning: canvas, card, elevated card, command, overlay, popover, toast.

Do not import Material UI or copy Google components.

## One visual thesis rule

Before code, resolve one sentence:

```text
This surface is a [page type] where [primary user] needs [primary action], so the UI emphasizes [main information] through [layout and material strategy].
```

Bad visual theses:

```text
Make it modern.
Make it glass.
Make it like Apple.
Add 21st.dev effects.
```

Good visual theses:

```text
A calm settings editor where configuration groups are visible at once and runtime state reads as low-noise bento cards.
A governed architecture console where package boundaries and runtime ownership read before demos.
A login gateway where the form is the hero and branding stays quiet.
```

## One signature detail rule

Each major surface may have one signature visual detail.

Allowed examples:

- a refined settings bento grid;
- a controlled command panel;
- a precise route evidence table;
- a subtle liquid-glass overlay for a dialog;
- a single low-frequency background line sweep on an onboarding page.

Forbidden combinations:

- glass + glow + 3D + particles + large icons + animated backgrounds;
- metric cards + hero shader + floating chips + table + charts all competing;
- every card using accent color;
- every label using an icon.

## Icon policy

Icons must support recognition or action affordance. They are not decoration.

Use icons for:

- navigation recognition;
- compact action affordances;
- real status recognition;
- empty/error state explanation;
- repeated domain objects where text alone is not enough.

Avoid:

- icons on every label;
- decorative status icons without status text;
- mixing icon weights;
- icons in quick account chips when text is enough;
- architecture diagrams made of many icons.

## Login-specific lesson

Login is not a shader demo. It should prioritize:

- a premium, spacious form card;
- stable input and validation states;
- restrained branding;
- minimal motion;
- quiet theme/language controls.

Do not use:

- rotating core visuals;
- giant architecture words;
- animated geometric centers;
- crowded signal chips;
- heavy WebGL backgrounds.

## CCD aesthetic rejection criteria

Reject a UI if any of these are true:

- It looks like a generic admin template.
- It looks like an AI-generated SaaS dashboard.
- It needs explanation to understand the primary action.
- It uses decoration to hide weak structure.
- It has too many icons.
- It uses strong motion that does not explain state change.
- It looks acceptable only in one theme.
- It breaks token, PrimeVue, UnoCSS, UIDesignState, or governance rules.
