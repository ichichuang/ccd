---
name: task-orchestrator
description: Select the smallest repository skill set and a proportional production validation path.
---

# Task Orchestrator

Use the Node router first:

`node .ai/skills/codex/task-orchestrator/scripts/skill_router.mjs "<task>" --json`

Use the Python router only when Node is unavailable.

## Workflow

1. Classify the task from explicit wording and affected paths.
2. Load only the selected skills and their relevant references.
3. Inspect current repository evidence before editing.
4. Keep write scopes disjoint if parallel work is explicitly requested.
5. Validate the affected production surface with the smallest sufficient command set.

See `references/routing-matrix.md` and `references/validation-ladder.md`.
