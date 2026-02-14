# Antigravity Rules & Skills System

This directory contains the operational constraints and capabilities for the Antigravity Agent.

## Rules (`.agent/rules/`)

These files define the strict boundaries the agent must operate within.

- **`00-primary-directive.md`**: The supreme law. SSOT, Utility First, No Hardcoding.
- **`10-ui-architecture.md`**: UnoCSS only, proper Component/Icon usage.
- **`12-logic-awareness.md`**: Architecture layers (API -> Hook -> UI).
- **`15-toolchain-first.md`**: Mandatory lookup map for existing tools.
- **`20-code-standards.md`**: Naming, Directory, Export conventions.
- **`22-verification.md`**: How to verify work using the `browser` tool.
- **`25-adaptive-layout.md`**: Layout adaptive (PC/Tablet/Mobile, breakpoint, effective visibility, userAdjusted). Full semantics: `docs/ADAPTIVE_LAYOUT.md`.
- **`08-auth-login-flow.md`**: Auth & login flow (login/logout, token, 401, route guards, whitelist). Full semantics: `docs/AUTH_AND_LOGIN_FLOW.md`.

## Skills (`.agent/skills/`)

These files define standard procedures for common tasks.

- **`01-build-ui-component`**: Create a new UI component.
- **`02-build-page-view`**: Assemble a full page.
- **`03-fix-ui-issue`**: Debug and fix UI bugs.
- **`04-full-feature`**: End-to-end feature implementation.
- **`05-refactor-component`**: Clean up logic and styles.
- **`06-style-audit`**: Enforce UnoCSS compliance.

## Usage

When the agent starts a task, it should:

1.  Read the **Rules** to understand constraints.
2.  Select the appropriate **Skill** for the task.
3.  Follow the **Steps** in the skill file.
4.  **Verify** the result before finishing.
