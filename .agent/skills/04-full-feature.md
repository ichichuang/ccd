---
description: 全功能开发：API Definition -> Business Hook -> UI Integration
globs: **/*
---

# Full Feature Development Skill

## 1. Goal

Implement a complete feature from backend API definition to frontend UI.

## 2. Steps

### Step 1: API Definition (Level 1)

- Create `src/api/<module>/<feature>.ts`.
- Define `Req` / `Res` / `DTO` interfaces.
- Export `build<Feature>Method` using `alovaInstance`.

### Step 2: Business Logic Hook (Level 2)

- Create `src/hooks/modules/use<Feature>.ts`.
- Import API from Step 1.
- Use `useHttpRequest` to wrap the API call.
- Export reactive state (`data`, `loading`, `error`) and methods (`fetch`, `submit`).

### Step 3: UI Implementation (Level 3)

- Create `src/views/<Module>/<Page>.vue`.
- Import the Hook from Step 2.
- Bind reactive state to the template.
- Use `UnoCSS` for styling.
- Use components from `src/components/` **without** manual import (auto-imported). Layout components in `src/layouts/` require **explicit** import.

### Step 4: Verify

1.  Check console for API errors.
2.  Inspect Network tab in `browser`.
3.  Verify UI states (Loading, Error, Success).
