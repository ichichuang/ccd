---
name: ccd-gsap-motion
description: Governs controlled GSAP usage for CCD web-demo component-scoped Level 1 and Level 2 motion.
version: 1.0.0
---

# CCD GSAP Motion

## Purpose

Use this skill when a task mentions GSAP, GreenSock, timeline animation, advanced interaction motion, or ScrollTrigger.

CCD allows GSAP only as a controlled app-local capability for `apps/web-demo`. CCD governance remains the source of truth even when official GSAP skills exist.

## Allowed use

Use GSAP for controlled Level 1 or Level 2 interaction and timeline work when CSS, Vue `<Transition>`, or local animate-lite is insufficient.

Examples:

- sequencing related micro-feedback inside one component;
- coordinating a short component-local timeline;
- making an interaction state transition easier to understand.

## Required constraints

- Import GSAP only through the app-local adapter at `apps/web-demo/src/plugins/animation`.
- Scope selectors to component roots.
- Cleanup with `context.revert()` or the adapter cleanup helper on unmount.
- Respect `prefers-reduced-motion`; pass reduced-motion state into the app-local helper instead of reading browser globals inside the GSAP adapter.
- Prefer opacity and transform over layout properties.
- Do not create import-time animations.
- Do not create global animation side effects.
- Do not use GSAP in `packages/**`.
- Do not extract GSAP into shared packages.

## Forbidden by default

- Do not animate login or static backgrounds by default.
- Do not register ScrollTrigger unless the owner explicitly approves a scroll-driven page.
- Do not use GSAP as default page decoration.
- Do not use GSAP to hide weak layout or unclear hierarchy.

## Review checklist

Before accepting GSAP usage, answer:

```text
Why are CSS, Vue Transition, and animate-lite insufficient?
What state change does the timeline explain?
Is the selector scoped to a component root?
Where is cleanup called?
What happens under prefers-reduced-motion?
Does this avoid login/static background motion?
```
