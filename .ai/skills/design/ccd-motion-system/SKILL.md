---
name: ccd-motion-system
description: Defines CCD motion levels, animation limits, reduced-motion behavior, and motion review rules.
version: 1.0.0
---

# CCD Motion System

## Purpose

Use this skill for any UI task involving animation, transition, hover movement, loading, visual background motion, page transitions, route transitions, dialogs, drawers, accordions, tabs, or micro-interactions.

## Motion principle

```text
Motion explains change. Motion does not decorate uncertainty.
```

## Motion levels

### Level 0: Static

Default for:

- tables;
- dense forms;
- settings;
- operational pages;
- governance evidence;
- long text or code surfaces.

### Level 1: Micro feedback

Allowed for:

- hover;
- focus;
- active;
- selected;
- button press;
- row highlight;
- toolbar affordance;
- subtle line sweep on onboarding/login background.

Limits:

- small opacity changes;
- small color/surface changes;
- small border glow;
- no layout shift;
- no heavy transform.

### Level 2: Spatial transition

Allowed for:

- dialog appearance;
- drawer open/close;
- sidebar collapse;
- route/page transition;
- tab content transition where continuity matters.

Limits:

- must explain spatial relationship;
- use existing transition utilities and duration tokens;
- respect reduced motion.

### Level 3: Brand moment

Rare. Requires explicit owner approval.

Examples:

- product launch/onboarding hero;
- special visualization intro.

Not allowed by default for login, settings, data pages, tables, or ordinary dashboards.

## Login motion rule

Login may use Level 1 motion only by default:

- subtle background-position line sweep;
- low-intensity glow pulse;
- focus ring transition;
- button hover/press;
- tiny signal dot opacity pulse.

Login must not use:

- rotating geometry;
- 3D transforms;
- WebGL canvas;
- particle fields;
- large scale/translate motion;
- animation that resets on theme toggle;
- animations that compete with form input.

## Theme switching rule

Changing light/dark mode must not remount visual-stage roots or reset form input.

Implementation rules:

- Do not use `:key="theme"` on animated components.
- Do not use `v-if/v-else` to render separate light/dark animation trees.
- Do not redefine `animation` shorthand in `.dark` or light selectors.
- Theme selectors may change CSS variables only.
- Keep `animation-name`, duration, timing, and iteration stable.

## Reduced motion

For substantial animation, implement:

```css
@media (prefers-reduced-motion: reduce) {
  /* disable non-essential animation */
}
```

Reduced motion should preserve:

- layout;
- visual hierarchy;
- form usability;
- focus visibility;
- route/dialog state clarity.

## Performance rules

Do not scatter `will-change`, `transform-gpu`, or large blur across pages.

Allowed:

- one small animated sweep layer with justified `will-change`;
- PrimeVue transition machinery;
- existing route/layout animation utilities.

Forbidden:

- nested glass + blur + animation;
- animated table backgrounds;
- animated heavy scroll regions;
- permanently animated panels in data-heavy pages;
- canvas/WebGL without explicit owner approval.

## Motion review checklist

Before committing, answer:

```text
What state change does this motion explain?
Does it continue correctly across theme changes?
Does reduced motion disable non-essential movement?
Can it run on CI visual tests without flake?
Does it compete with the primary task?
Does it require new dependencies?
```

If the answer is unclear, remove or simplify the motion.
