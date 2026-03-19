# Antigravity Rules and Skills System

This directory contains constraints and capability definitions for the Antigravity Agent.

## Directory Structure

- **`.agent/rules/`**: Rule files that define mandatory constraints for AI
- **`.agent/skills/`**: Skill files that define standard operating procedures (SOP)

## Rules

This repository treats `.cursor/rules/` as the SSOT. The `.agent/rules/` directory mirrors `.cursor/rules/` with the same basenames (extension differs: `.mdc` vs `.md`).

See the authoritative index:

- `.agent/rules/README.md`

## Skills

Skills define standard workflows for common tasks.

See: `.agent/skills/README.md`

## Usage Guide

### Auto-Applied Rules

Rules with `alwaysApply: true` are applied automatically; no manual reference needed. They apply to all tasks.

### File Matching

Rules with `globs` are matched by the edited file. For example, when editing `src/layouts/**/*`, `22-layouts.md` is applied.

### Manual Reference

For complex tasks, reference:

```
Read @docs/ai-specs/PROJECT_PROTOCOL.md first
Follow @.cursor/rules/00-core-architecture.mdc
```

### Agent Workflow

When the Agent starts a task, it should:

1. Read **Rules** to understand constraints
2. Choose the appropriate **Skill** for the task
3. Follow the steps in the Skill file
4. **Verify** the result (browser tool)

## Related Docs

- **Project protocol**: `docs/ai-specs/PROJECT_PROTOCOL.md`
- **Golden samples**: `docs/ai-specs/GOLDEN_SAMPLES/`
- **Cursor rules**: `.cursor/rules/`
- **Cursor skills**: `.cursor/skills/`

## Rule Correspondence with Cursor

To maintain a Single Source of Truth, the `.agent` configuration has been unified to strictly mirror `.cursor` configuration.

- All rules in `.agent/rules/*.md` exactly match `.cursor/rules/*.mdc`.
- All skills in `.agent/skills/*.md` exactly match `.cursor/skills/*.md`.

Any updates to architectural constants or instructions should be replicated across both directories to ensure all AI agents maintain the same product-minded enforcement (such as the UX Watchdog rules).
