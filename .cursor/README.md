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

Although `.cursor` is for the Cursor AI editor and `.agent` is for the Antigravity Agent, their rules and skills should stay aligned.

This repository uses `.cursor/rules/` as the SSOT; `.agent/rules/` mirrors it with the same basenames:

- `.cursor/rules/00-core-architecture.mdc` ↔ `.agent/rules/00-core-architecture.md`
- `.cursor/rules/01-naming-conventions.mdc` ↔ `.agent/rules/01-naming-conventions.md`
- `.cursor/rules/02-boilerplate-immunity.mdc` ↔ `.agent/rules/02-boilerplate-immunity.md`
- `.cursor/rules/03-auto-import-shield.mdc` ↔ `.agent/rules/03-auto-import-shield.md`
- `.cursor/rules/04-strict-vue-typescript.mdc` ↔ `.agent/rules/04-strict-vue-typescript.md`
- `.cursor/rules/05-architecture-decoupling.mdc` ↔ `.agent/rules/05-architecture-decoupling.md`
- `.cursor/rules/06-data-immutability.mdc` ↔ `.agent/rules/06-data-immutability.md`
- `.cursor/rules/07-compilation-boundaries.mdc` ↔ `.agent/rules/07-compilation-boundaries.md`
- `.cursor/rules/08-auth-login-flow.mdc` ↔ `.agent/rules/08-auth-login-flow.md`
- `.cursor/rules/09-enterprise-guardrails.mdc` ↔ `.agent/rules/09-enterprise-guardrails.md`
- `.cursor/rules/10-logic-layer.mdc` ↔ `.agent/rules/10-logic-layer.md`
- `.cursor/rules/12-api-layer.mdc` ↔ `.agent/rules/12-api-layer.md`
- `.cursor/rules/15-utils-and-hooks-first.mdc` ↔ `.agent/rules/15-utils-and-hooks-first.md`
- `.cursor/rules/18-components-and-icons.mdc` ↔ `.agent/rules/18-components-and-icons.md`
- `.cursor/rules/20-ui-styling.mdc` ↔ `.agent/rules/20-ui-styling.md`
- `.cursor/rules/21-color-system.mdc` ↔ `.agent/rules/21-color-system.md`
- `.cursor/rules/22-layouts.mdc` ↔ `.agent/rules/22-layouts.md`
- `.cursor/rules/24-tsx-rendering.mdc` ↔ `.agent/rules/24-tsx-rendering.md`
- `.cursor/rules/25-html-tag-semantics.mdc` ↔ `.agent/rules/25-html-tag-semantics.md`
- `.cursor/rules/26-repair-list-workflow.mdc` ↔ `.agent/rules/26-repair-list-workflow.md`
- `.cursor/rules/27-ai-tsx-decision.mdc` ↔ `.agent/rules/27-ai-tsx-decision.md`
- `.cursor/rules/28-industrial-ux-standards.mdc` ↔ `.agent/rules/28-industrial-ux-standards.md`
- `.cursor/rules/29-focus-outline-styling.mdc` ↔ `.agent/rules/29-focus-outline-styling.md`
- `.cursor/rules/30-drift-check.mdc` ↔ `.agent/rules/30-drift-check.md`
- `.cursor/rules/31-temp-artifacts-lifecycle.mdc` ↔ `.agent/rules/31-temp-artifacts-lifecycle.md`
- `.cursor/rules/35-schema-driven-development.mdc` ↔ `.agent/rules/35-schema-driven-development.md`
- `.cursor/rules/36-pro-form-integration.mdc` ↔ `.agent/rules/36-pro-form-integration.md`
- `.cursor/rules/40-echarts-visualization.mdc` ↔ `.agent/rules/40-echarts-visualization.md`
- `.cursor/rules/50-user-centric-engineering.mdc` ↔ `.agent/rules/50-user-centric-engineering.md`
- `.cursor/rules/101-premium-ui.mdc` ↔ `.agent/rules/101-premium-ui.md`
- `.cursor/rules/102-primevue-unstyled.mdc` ↔ `.agent/rules/102-primevue-unstyled.md`
- `.cursor/rules/103-architecture-docs-enforcement.mdc` ↔ `.agent/rules/103-architecture-docs-enforcement.md`
- `.cursor/rules/104-anti-flicker-ring-less.mdc` ↔ `.agent/rules/104-anti-flicker-ring-less.md`
