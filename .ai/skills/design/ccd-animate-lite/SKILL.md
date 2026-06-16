---
name: ccd-animate-lite
description: Governs CCD local animate-lite route and wrapper transition usage without adding full Animate.css.
version: 1.0.0
---

# CCD Animate Lite

## Purpose

Use this skill when a task mentions animate-lite, AnimateWrapper, route transition, page transition, or animate.css-style class transitions.

CCD uses a local animate-lite subset, not the full Animate.css dependency.

## Allowed use

animate-lite is for route/page enter-leave and small wrapper transitions.

Prefer:

- `fadeIn`;
- `fadeOut`;
- `fadeInUp`;
- `fadeOutDown`;
- `fadeOutUp`;
- mild slide transitions only where spatial direction is meaningful;
- `zoomIn` and `zoomOut` only for existing component contracts that require them.

## Constraints

- Do not install full Animate.css unless the owner explicitly approves a separate dependency lane.
- Keep route transitions short.
- Keep reduced-motion behavior compatible.
- Keep the local class contract aligned between `animate-lite.scss` and `AnimateWrapper` types.
- Do not use animate-lite to hide weak layout, unclear hierarchy, or late content shifts.

## Discouraged effects

Do not use strong attention animations for new work:

```text
bounce, flip, rotate, jello, shake, flash, heartBeat, tada
```

If a legacy route or component still needs one of these, treat it as a migration candidate rather than expanding the local runtime.
