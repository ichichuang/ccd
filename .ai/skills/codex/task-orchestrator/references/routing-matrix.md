# Routing Matrix

This document is a non-authoritative projection of `.ai/manifests/skill-routing.json`, the sole
routing authority. It summarizes behavior and does not define an independent routing policy.

Routing is compositional. For UI-intent work, `project-ui` is always first and matching
technical skills follow in the manifest's fixed skill order.

| Task scope | Selected skills |
| --- | --- |
| Generic UI | `project-ui` |
| Vue UI | `project-ui, vue` |
| UnoCSS UI | `project-ui, unocss` |
| Vue plus UnoCSS UI | `project-ui, vue, unocss` |
| Desktop UI | `project-ui, desktop-tauri-guard` |
| Desktop Vue UI | `project-ui, desktop-tauri-guard, vue` |
| Explicit GSAP UI | `project-ui, gsap-core` |
| Explicit GSAP Vue UI | `project-ui, gsap-core, vue` |
| Pure Vue utility work | `vue` |
| Pure UnoCSS build configuration | `unocss` |
| Vite build configuration | `vite` |
| Tauri adapter work | `desktop-tauri-guard` |
| GitHub workflow work | `github-ops` |
| Unrelated or ambiguous work | `task-orchestrator` |

Generic `motion` and `animation` wording selects `project-ui`, not `gsap-core`. The GSAP skill
requires an explicit GSAP, timeline, ScrollTrigger, `createScopedGsapContext`, or existing GSAP
implementation-path match.
