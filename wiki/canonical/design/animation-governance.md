---
title_en: Animation Governance
title_zh: 动画治理
aliases:
  - CCD animation governance
  - GSAP governance
  - animate-lite governance
tags:
  - design
  - animation
  - governance
tags_zh:
  - 设计
  - 动画
  - 治理
status: draft
confidence: 0.82
source_langs:
  - en
  - zh
source_paths:
  - apps/web-demo/src/plugins/animation/**
  - apps/web-demo/src/assets/styles/animate-lite.scss
  - packages/vue-ui/src/AnimateWrapper/**
  - .ai/skills/design/ccd-motion-system/SKILL.md
  - .ai/skills/design/ccd-gsap-motion/SKILL.md
  - .ai/skills/design/ccd-animate-lite/SKILL.md
last_reviewed: '2026-06-16'
wiki_owner: LLM-maintained CCD architecture wiki
---

# Animation Governance

CCD animation is governed as product behavior, not decoration.

## Canonical statement

`apps/web-demo` owns the app-local GSAP adapter. GSAP is available for advanced controlled interaction and timeline work, not as default decoration.

The existing animate-lite layer remains a local route and page transition subset. Full Animate.css is not installed by default and must not be added without an owner-approved dependency lane.

Motion Vue is a future optional evaluation only. It is not approved for current CCD runtime use.

## Requirements

- Prefer CSS, Vue `<Transition>`, and local animate-lite before GSAP.
- Use GSAP only through `apps/web-demo/src/plugins/animation`.
- Scope GSAP selectors to component roots.
- Cleanup GSAP contexts on component unmount.
- Respect `prefers-reduced-motion` for both CSS and GSAP motion.
- Prefer opacity and transform over layout properties.
- Keep route/page transitions short and restrained.
- Do not use strong motion on login or static backgrounds by default.
- Do not use animation to hide weak layout or unclear hierarchy.

## Related pages

- [[ccd-product-design-language]]
- [[ccd-ai-ui-skill-governance]]
- [[validation-gates]]
- [[dependency-governance]]
