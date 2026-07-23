---
name: gsap-core
description: Technical GSAP lifecycle, ownership, cleanup, and performance guidance.
---

# GSAP Core

Use this skill only when a task explicitly names GSAP, a GSAP timeline, ScrollTrigger,
`createScopedGsapContext`, or an existing GSAP implementation path.

For UI-scoped work, load `project-ui` first. This skill is technical GSAP implementation.

## Lifecycle ownership

- Reuse the repository animation adapter instead of importing GSAP directly into additional
  feature surfaces.
- Create component-owned work after its DOM scope exists and bind selectors through
  `gsap.context` or the repository `createScopedGsapContext` wrapper.
- Keep the context, timeline, tween, `gsap.matchMedia` instance, and ScrollTrigger handles owned by
  the lifecycle that created them.
- Revert contexts and match-media registrations, kill active timelines or tweens, and dispose
  ScrollTrigger instances when their owner unmounts or is replaced.

## Interruption and cleanup

- Before starting replacement work, stop the previous timeline or tween and clear its retained
  handle so stale completion callbacks cannot mutate current state.
- Make cleanup idempotent and safe when setup exits early.
- Use `gsap.matchMedia` for conditional setup and call its `revert()` method during teardown.
- When using ScrollTrigger, refresh only after the owned layout is ready and kill every owned
  trigger during cleanup.
- When reduced motion is active, skip or complete setup through the same lifecycle path so teardown
  remains deterministic.

## Performance

- Prefer compositor-friendly transform and opacity properties.
- Batch reads before writes, avoid layout reads inside update callbacks, and scope selectors to the
  owning root.
- Do not register global plugins, listeners, or triggers repeatedly from component setup.
