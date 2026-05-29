# Output Quality Requirements

The plan and all future Codex execution reports must be:

- specific enough for Codex Desktop to execute without repeatedly asking for direction;
- conservative about risky operations;
- explicit about validation;
- explicit about evidence;
- explicit about stop conditions;
- adapted to the CCD stack and governance model;
- free of vague tasks like “improve code” unless decomposed into concrete tasks;
- free of fake commands, fake conventions, fake test results, or fake evidence;
- clear about what must be inspected before execution;
- clear about what requires human approval;
- suitable for long-horizon execution through concise Goal mode prompts.

## Prohibited reporting patterns

Do not say:

- “validation passed” without log path and exit code;
- “tests passed” without command and evidence;
- “implemented successfully” while blockers remain;
- “no risks” when milestone touched architecture, HTTP, UI, dependencies, build config, or governance.

## Required reporting patterns

Always report:

- active milestone;
- task status;
- files changed;
- validation commands;
- evidence paths;
- blockers;
- risk changes;
- next action;
- stop condition status.

## Language policy

- User-facing chat summaries: Simplified Chinese.
- Codex Desktop prompts and mission packets: English.
- Planning files: English for execution clarity.
- Commit messages if requested: detailed Simplified Chinese and commitlint-compliant after inspecting conventions.
