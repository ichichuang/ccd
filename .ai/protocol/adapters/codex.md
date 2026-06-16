# Codex Adapter Guide

## Discovery Entry

- Codex reads root AGENTS.md.
- In this repo, AGENTS.md is generated from .ai/protocol/AI.entry.md.

## What to Load First

1. .ai/protocol/AGENTS.core.md
2. .ai/rules/core/00-global-architect.mdc
3. .ai/rules/core/00-root-gatekeeper.mdc
4. .ai/rules/core/01-global-preflight.mdc
5. .ai/rules/core/02-ui-preflight.mdc when visual surfaces are touched
6. .ai/rules/core/10-ai-generation-workflow.mdc when creating or restructuring routes/pages/hooks
7. Domain rules under .ai/rules/\*\*

## Skill Mapping

- Implementation: .ai/skills/core/{vue,vueuse-functions,unocss,vite}
- Design: .ai/skills/design/{ccd-product-language,ccd-page-archetypes,ccd-material-system,ccd-motion-system,ccd-gsap-motion,ccd-animate-lite,ccd-ui-review-gate}
- Orchestration: .ai/skills/codex/task-orchestrator
- Browser/E2E: .ai/skills/codex/architecture-browser-master
- Desktop/Tauri: .ai/skills/codex/desktop-tauri-guard
- GitHub/remote workflows: .ai/skills/codex/github-ops

## Auto-Trigger Hints

- Start with node .ai/skills/codex/task-orchestrator/scripts/skill_router.mjs "<task>" --json for ambiguous tasks or deterministic low-token skill selection.
- Use the Python router only as a fallback: python3 .ai/skills/codex/task-orchestrator/scripts/skill_router.py "<task>" --json.
- If the task mentions GitHub, PRs, issues, Actions, CI, releases, reviews, remote branches, or .github/\*\*, load github-ops and inspect local repo GitHub context first.
- If the task touches UI behavior, layout, screenshots, navigation, or perceived performance, load architecture-browser-master.
- If the task mentions UI, UX, visual design, page layout, dashboard, settings, login, form, table, dialog, drawer, navigation, responsive behavior, dark mode, animation, motion, material, glass, liquid glass, Apple-like, Google-like, beautiful, premium, polish, beautification, gsap, GreenSock, timeline animation, ScrollTrigger, animate-lite, AnimateWrapper, route transition, animation library, motion library, 交互动效, 高级动效, 时间线动画, or 路由动画, load the CCD design skill chain before editing: .ai/skills/design/ccd-product-language, .ai/skills/design/ccd-page-archetypes, .ai/skills/design/ccd-material-system, .ai/skills/design/ccd-motion-system, plus .ai/skills/design/ccd-gsap-motion for GSAP/timeline work, .ai/skills/design/ccd-animate-lite for route/class transition work, and .ai/skills/design/ccd-ui-review-gate. These design skills are subordinate to .ai/rules/\*\*, PrimeVue v4 rules, UnoCSS guardrails, UIDesignState, architecture boundaries, runtime boundaries, and governance gates.
- If the task creates a new business route or page, run pnpm ai:scaffold:view-route -- --segment <segment> --title-key <i18n.key> --kind <table|form|detail> before writing business code.
- If the task touches Tauri, desktop bridge behavior, src-tauri/\*\*, capability files, or desktop drift cleanup, load desktop-tauri-guard.
- If the task mentions Playwright CRX, recorder exports, codegen, traces, recordings, or replaying browser flows, load architecture-browser-master and prefer flow-import or flow-run.
- If the task is vague, cross-module, or likely needs staged validation, load task-orchestrator.

## Health Commands

- pnpm ai:doctor
- pnpm env:doctor
- pnpm governance:full
- pnpm arch:boundaries
- pnpm arch:runtime
- pnpm api:report
- pnpm supply:check
- pnpm arch:report
- pnpm arch:visualize
- pnpm ai:sync
- pnpm ai:sync:codex
- pnpm codex:preflight

Generated from:

- .ai/protocol/adapter-manifest.json
