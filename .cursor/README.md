# Cursor Rules and Skills System

This directory contains constraints and capability definitions for the Cursor AI editor.

## Directory Structure

- **`.cursor/rules/`**: Rule files that define mandatory constraints for AI
- **`.cursor/skills/`**: Skill files that define standard operating procedures (SOP)

## Rules

Rules define strict boundaries that AI must follow. Rules with `alwaysApply: true` are applied automatically.

See: `.cursor/rules/README.md`

## Skills

Skills define standard workflows for common tasks.

See: `.cursor/skills/README.md`

## Usage Guide

### Auto-Applied Rules

Rules with `alwaysApply: true` are applied automatically and do not require manual @-reference. They apply to all tasks.

### File Matching

Rules with a `globs` field are matched based on the currently edited file. For example, when editing `src/hooks/**/*.ts`, `10-logic-layer.mdc` is applied automatically.

### Manual Reference

For complex tasks, explicitly reference relevant rules:

```
Read @docs/ai-specs/PROJECT_PROTOCOL.md first
Follow @.cursor/rules/00-core-architecture.mdc
Also follow task-related rules:
- @.cursor/rules/10-logic-layer.mdc (logic)
- @.cursor/rules/12-api-layer.mdc (new API)
- @.cursor/rules/15-utils-and-hooks-first.mdc (tools first)
- @.cursor/rules/18-components-and-icons.mdc (components/icons)
- @.cursor/rules/20-ui-styling.mdc (UI/styling)
- @.cursor/rules/22-layouts.mdc (layout shell/Admin sub-modes)
- @.cursor/rules/24-tsx-rendering.mdc (use TSX for programmatic render, forbid h())
```

### Cursor Workflow

When Cursor starts a task, it should:

1. Read **Rules** to understand constraints
2. Choose the appropriate **Skill** for the task
3. Follow the steps in the Skill file
4. **Verify** the result (type check, build check)

## Related Docs

- **Project protocol**: `docs/ai-specs/PROJECT_PROTOCOL.md`
- **Golden samples**: `docs/ai-specs/GOLDEN_SAMPLES/`
- **Antigravity rules**: `.agent/rules/`
- **Antigravity skills**: `.agent/skills/`

## Rule Correspondence with Antigravity

Although `.cursor` is for the Cursor AI editor and `.agent` is for the Antigravity Agent, their rules and skills should stay aligned:

- `.cursor/rules/00-core-architecture.mdc` ↔ `.agent/rules/00-primary-directive.md`
- `.cursor/rules/10-logic-layer.mdc` ↔ `.agent/rules/12-logic-awareness.md`
- `.cursor/rules/12-api-layer.mdc` ↔ no direct match (.cursor only)
- `.cursor/rules/15-utils-and-hooks-first.mdc` ↔ `.agent/rules/15-toolchain-first.md`
- `.cursor/rules/18-components-and-icons.mdc` ↔ `.agent/rules/10-ui-architecture.md` (partial)
- `.cursor/rules/20-ui-styling.mdc` ↔ `.agent/rules/10-ui-architecture.md` (partial)
- `.cursor/rules/22-layouts.mdc` ↔ `.agent/rules/25-adaptive-layout.md`
- `.cursor/rules/24-tsx-rendering.mdc` ↔ no direct match (.cursor only)
- `.cursor/rules/25-html-tag-semantics.mdc` ↔ `.agent/rules/25-html-tag-semantics.md`
- `.cursor/rules/08-auth-login-flow.mdc` ↔ `.agent/rules/08-auth-login-flow.md`

Note: `.agent`-only rules (e.g. `22-verification.md`, `20-code-standards.md`) may be scattered across other Cursor rule files.
