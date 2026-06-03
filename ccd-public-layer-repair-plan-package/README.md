# CCD Public-Layer Repair Planning Package

This package is a repository-resident planning system for the `ichichuang/ccd` public-layer remediation work. It is not an implementation patch.

The package converts the prior audit findings into durable execution artifacts for a coding agent such as Codex Desktop, Codex CLI, Cursor, Claude Code, or another AI coding agent.

## Objective

Repair and harden the remaining structural public-layer issues in `apps/**` without broad rewrites or unsafe ownership changes.

The plan focuses on:

1. Route/menu/access type contract extraction.
2. Route/menu/access pure helper migration after type ownership is explicit.
3. API/DTO response contract normalization.
4. System preference contract split without moving Zod schemas unless approved.
5. Sync runtime owner decision and optional future extraction.
6. Build config owner decision and optional future extraction.
7. Theme/size facade hardening where package ownership already exists.
8. Guard, validation, evidence, and final certification updates.

## How to use

Copy the contents of this package into the repository root. Then instruct the coding agent to read:

- `AGENTS.md`
- every file under `docs/ai-plan/`

The agent must create a real active evidence directory under `docs/ai-runs/YYYYMMDD-HHMMSS-ccd-public-layer-repair/` before starting implementation.

## Important

Do not treat this package as proof that validation has passed. It defines the required validation and evidence contract. The future coding agent must run commands and record evidence inside the repository.

## Ready-to-paste Codex Goal Prompt

See `docs/ai-plan/CODEX_GOAL_PROMPT.md`.
