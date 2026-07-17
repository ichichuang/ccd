---
title_en: Project UI Routing
title_zh: 项目 UI 路由
aliases:
  - project-ui-routing
  - Project UI Routing
tags:
  - design
  - ui
  - governance
  - routing
tags_zh:
  - 设计
  - UI
  - 治理
  - 路由
status: published
confidence: 0.95
source_langs:
  - en
source_paths:
  - .ai/skills/project-ui/**
  - .ai/manifests/skill-routing.json
  - .ai/manifests/routing-scopes.json
  - .ai/manifests/skills-lock.json
  - scripts/governance/project-ui-routing-validate.mjs
last_reviewed: '2026-07-17'
wiki_owner: LLM-maintained CCD architecture wiki
---

# Project UI Routing

P5 terminal integration makes `.ai/skills/project-ui` the singleton canonical project UI Skill. Stable Skill IDs connect the canonical source to routing, lock, synchronization, and adapter contracts; generated client copies never become independent authorities.

## Routing Contract

The Node router at `.ai/skills/codex/task-orchestrator/scripts/skill_router.mjs` is primary. The Python router at `.ai/skills/codex/task-orchestrator/scripts/skill_router.py` is the fallback and must remain behaviorally equivalent. `.ai/manifests/skill-routing.json` owns route selection, while `.ai/manifests/routing-scopes.json` owns the canonical scope registry.

Generic UI evidence selects `project-ui`. Non-UI Vue work remains isolated from project-ui. Page and route composition activates project-ui only from explicit creation or restructuring evidence. GSAP and animate-lite Skills activate only from their own engine evidence; generic UI does not load both. UnoCSS and Vite activation remains narrow and evidence-driven.

## Lock and Synchronization

Skills lock v3 records stable IDs, source paths, included files, and content hashes. Project-ui has twelve tracked source files. The fifteen legacy Skill records remain present and valid. Rule-index v2 remains the canonical rule projection, and legacy rules remain retained.

Codex and Claude synchronization uses a shared transactional engine. Acceptance runs target isolated temporary roots and verifies repeated synchronization is byte-identical. Codex and Claude project-ui copies are noncanonical materializations. The ignored repository-local Claude path `.claude/skills/project-ui` is also a noncanonical projection and is not required to exist in the working tree.

## Adapter Activation

The generated adapter graph maps project-ui to both Codex and Claude. Adapter activation extends the tracked P4 cold-start entrypoints; it does not replace `.ai/protocol/adapter-manifest.json`, `.ai/protocol/AGENTS.core.md`, or the six generated cold-start outputs.

## Validation Phases

The routing validator recognizes a pre-terminal phase while lifecycle documents still carry the accepted P5 transition state, and a terminal phase only when the exact ordered terminal markers are present. Terminal validation preserves all P3 Machine UI Policy counts and all P4 cold-start assertions while requiring current routing parity, lock state, synchronization fixtures, and adapter mappings.

## Command Surface

- `pnpm ui:policy:validate`
- `node .ai/skills/project-ui/scripts/validate-semantic-quality.mjs`
- `pnpm ai:cold-start:validate`
- `pnpm ai:routing:validate`
- `pnpm ai:rule-index:check`
- `pnpm ai:protocol-adapters:check`
- `pnpm ai:sync:codex:check -- --target-root <temporary-root>/codex/skills`
- `pnpm ai:sync:claude:check -- --project-root <temporary-root>/claude-project`
- `pnpm ai:sync:skills:check -- --codex-target-root <temporary-root>/combined/codex/skills --claude-project-root <temporary-root>/combined/claude-project`
- `pnpm governance:gate`

## Explicit Absences

P5 does not implement application-source scanning, create a Page Contract, scaffold routes, globally always-load project-ui, or retire legacy Skills and rules. These absences are part of the terminal contract rather than unfinished claims about implemented behavior.
