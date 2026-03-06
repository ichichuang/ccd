# Antigravity Rules and Skills System

This directory contains constraints and capability definitions for the Antigravity Agent.

## Directory Structure

- **`.agent/rules/`**: Rule files that define mandatory constraints for AI
- **`.agent/skills/`**: Skill files that define standard operating procedures (SOP)

## Rules

Rules define strict boundaries that AI must follow. Rules with `alwaysApply: true` are applied automatically.

### Core Rules (auto-applied)

1. **`00-primary-directive.md`** – Primary directive and core principles
   - **Purpose**: SSOT, tools-first, no hardcoding
   - **Scope**: All files (`globs: **/*`)
   - **Auto-apply**: Yes
   - **Contents**: Single source of truth (SSOT), tools-first, no hardcoded values

2. **`10-ui-architecture.md`** – UI architecture
   - **Purpose**: UnoCSS only, PrimeVue integration, component system, transitions
   - **Scope**: Vue/TSX/TS (`globs: **/*.vue, **/*.tsx, **/*.ts`)
   - **Auto-apply**: Yes
   - **Contents**: UnoCSS as the only styling approach, PrimeVue usage, component reuse; §5 transitions: hover/active/focus need transition; Icons group-hover needs transition on Icons; duration-scale pairs with transition\*

3. **`12-logic-awareness.md`** – Logic layer
   - **Purpose**: API -> Hook -> UI three-layer architecture
   - **Scope**: Vue/TS/TSX (`globs: **/*.vue, **/*.ts, **/*.tsx`)
   - **Auto-apply**: Yes
   - **Contents**: Three-layer separation, API layer, Hook layer business logic, UI layer presentation only

4. **`15-toolchain-first.md`** – Toolchain first
   - **Purpose**: Mandatory tool lookup table, reuse existing tools
   - **Scope**: TS/Vue/TSX (`globs: **/*.ts, **/*.vue, **/*.tsx`)
   - **Auto-apply**: Yes
   - **Contents**: HTTP, secure storage, date/string utils, global events

5. **`20-code-standards.md`** – Code standards
   - **Purpose**: Naming, directory structure, exports, TypeScript practices
   - **Scope**: TS/Vue/TSX (`globs: **/*.ts, **/*.vue, **/*.tsx`)
   - **Auto-apply**: Yes
   - **Contents**: Naming conventions, directory structure, export patterns (no default export), TS type annotations, Vue template syntax constraints

6. **`22-verification.md`** – Verification
   - **Purpose**: Agent self-check and browser testing standards
   - **Scope**: All files (`globs: **/*`)
   - **Auto-apply**: Yes
   - **Contents**: Verification loop, browser tool usage, common failure modes, Definition of Done

### Specific Scenarios

7. **`25-adaptive-layout.md`** – Adaptive layout
   - **Purpose**: PC/Tablet/Mobile, breakpoints, effective visibility, userAdjusted
   - **Scope**: Layout-related (`globs: src/layouts/**/*, src/stores/modules/layout.ts, src/stores/modules/device.ts`)
   - **Auto-apply**: No (file-match)
   - **Details**: `docs/ai-specs/ADAPTIVE_LAYOUT.md`
   - **Contents**: Single driver, breakpoint system, effective visibility logic

8. **`25-html-tag-semantics.md`** – HTML tag semantics and formatting
   - **Purpose**: Correct use of code/span/div/pre, avoid formatter conflicts and syntax errors
   - **Scope**: Vue/TSX (`globs: src/**/*.{vue,tsx}`)
   - **Auto-apply**: Yes
   - **Contents**: `<code>` only in `<pre><code>`; `<span>` for inline in `<p>`; `<div>` for blocks (not inside `<p>`); HTML nesting rules; Prettier/ESLint conflict handling

9. **`08-auth-login-flow.md`** – Auth / login flow
   - **Purpose**: Login/logout, token, 401, route guards, whitelist
   - **Scope**: TS/Vue (`globs: src/**/*.{ts,vue}`)
   - **Auto-apply**: No (file-match)
   - **Details**: `docs/ai-specs/AUTH_AND_LOGIN_FLOW.md`
   - **Contents**: Login flow, token handling, 401 handling, route guards, dynamic routes

10. **`26-repair-list-workflow.md`** – Repair list workflow

- **Purpose**: repair_list.txt creation, writing, progress tracking, clearing
- **Scope**: Project root, check/fix tasks
- **Auto-apply**: Yes (`alwaysApply: true`)
- **Contents**:
  - Ask mode: ask before writing; Agent mode: auto-write
  - Plain txt format, ✅ for progress
  - Clear content when all resolved
  - In .gitignore, do not commit

## Skills

Skills define standard workflows for common tasks.

See: `.agent/skills/README.md`

## Usage Guide

### Auto-Applied Rules

Rules with `alwaysApply: true` are applied automatically; no manual reference needed. They apply to all tasks.

### File Matching

Rules with `globs` are matched by the edited file. For example, when editing `src/layouts/**/*`, `25-adaptive-layout.md` is applied.

### Manual Reference

For complex tasks, explicitly reference rules:

```
Read @docs/ai-specs/PROJECT_PROTOCOL.md first
Follow @.agent/rules/00-primary-directive.md
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
