---
title_en: AI Cold-Start
title_zh: AI 冷启动契约
aliases:
  - ai-cold-start
  - AI Cold Start
tags:
  - design
  - governance
  - ai
tags_zh:
  - 设计
  - 治理
  - AI
status: published
confidence: 0.95
source_langs:
  - en
source_paths:
  - .ai/protocol/adapter-manifest.json
  - .ai/protocol/AGENTS.core.md
  - scripts/generate-ai-protocol-adapters.mjs
  - scripts/governance/cold-start-validate.mjs
last_reviewed: '2026-07-16'
wiki_owner: LLM-maintained CCD architecture wiki
---

# AI Cold-Start

AI cold-start is the repository entrypoint contract for agents that read CCD before any local synchronization command runs. It is static design documentation, not a lifecycle ledger. Current lifecycle state is owned by `.ai/governance/coverage/project-ui-semantic-coverage.json` and the five project-ui lifecycle documents.

Current boundary summary: `P4_STARTED=yes`, `P4_COMPLETE=yes`, `P5_STARTED=yes`, `P5_COMPLETE=yes`, `PROJECT_UI_DISCOVERED=yes`, `PROJECT_UI_ROUTED=yes`, `PROJECT_UI_SYNCHRONIZED=yes`, `PROJECT_UI_ADAPTER_ACTIVATED=yes`, `SOURCE_SCANNER_IMPLEMENTED=no`, and `PAGE_CONTRACT_CREATED=no`. This page intentionally does not duplicate the complete terminal lifecycle block.

## Authority hierarchy

System and tool instructions remain highest authority. Repository AI governance is sourced from `.ai/**`, with `.ai/protocol/adapter-manifest.json` as the structured cold-start authority and `.ai/protocol/AGENTS.core.md` as the canonical protocol authority. Generated compatibility outputs must never become independent sources of truth.

## Canonical sources

The cold-start generator consumes exactly two canonical sources:

- `.ai/protocol/adapter-manifest.json`
- `.ai/protocol/AGENTS.core.md`

The one-owner model assigns generation to `scripts/generate-ai-protocol-adapters.mjs` and validation to `scripts/governance/cold-start-validate.mjs`.

## Generated outputs

The six tracked generated outputs are:

- `.ai/protocol/adapters/claude.md`
- `.ai/protocol/adapters/codex.md`
- `.ai/protocol/adapters/README.md`
- `.ai/protocol/AI.entry.md`
- `AGENTS.md`
- `CLAUDE.md`

The five output kinds are `shared-generated-entry`, `root-compatibility-entrypoint`, `root-client-pointer`, `client-adapter-guidance`, and `adapter-index`. Target clients are `shared`, `agents-aware`, `codex`, and `claude`. Discovery roles are shared entry content, agents root discovery, Claude root discovery, client guidance, and adapter index.

## Generation DAG

The adapter guidance outputs are rendered from the manifest and core protocol. The adapter index depends on the adapter guidance. `AI.entry.md` depends on the adapter guidance. `AGENTS.md` depends on `AI.entry.md`. `CLAUDE.md` depends on `AGENTS.md` and the Claude adapter.

## Fingerprints

Every generated output is fingerprinted with SHA-256. Validation compares the working candidate, staged candidate, or committed archive against the manifest-defined output set and expected bytes. Rendering is deterministic and normalizes to one final newline.

## Generator modes

Default mode writes outputs transactionally: render to an isolated candidate, verify the full set, then replace target files. Check mode renders without writing and fails on byte drift. Rollback behavior is all-or-nothing; a failed candidate must not partially update tracked outputs.

## Ignore policy

The narrow ignore-policy result is that repository cold-start entrypoints are tracked while local runtime state remains excluded. `AGENTS.md`, `CLAUDE.md`, and `.ai/protocol/adapters/claude.md` are available in a fresh clone before sync. `pnpm ai:sync` remains idempotent and must preserve local runtime files.

## Validators

Dedicated validator modes cover working-candidate validation, staged-candidate validation, committed archive validation, generator check mode, consumer ordering, committed ignore policy, candidate archive simulation, and ai:sync idempotency. `codex-preflight` selects terminal cold-start validation first and falls back to implementation mode only for the accepted terminal-lifecycle-incomplete diagnostic during the transition.

## P5 Extension

P5 activation extends the P4 cold-start contract without changing its sources, six generated outputs, or fresh-clone guarantees. The terminal routing layer discovers the canonical `.ai/skills/project-ui` source, selects it by stable routing contracts, synchronizes noncanonical Codex and Claude materializations transactionally, and activates the corresponding adapter mappings. Isolated sync and preflight targets protect real client state.

## Isolated HOME

Cold-start validation includes isolated-HOME execution so entrypoint availability does not depend on unrelated real-home state. Local runtime preservation remains part of the boundary: ignored `.ai/runtime/**`, `.claude/**`, `.cursor/**`, and editor/runtime state are not cold-start sources.

## Non-goals

Historically, P4 did not start P5 or discover, route, synchronize, or adapter-activate project-ui; the terminal P5 extension now owns those completed states. The combined P4/P5 contract still does not implement the source scanner, create Page Contract artifacts, globally always-load project-ui, scaffold routes, or retire legacy Skills and rules.
