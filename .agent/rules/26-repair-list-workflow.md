---
description: Repair list workflow — repair_list.txt creation, writing, progress tracking, and clearing
globs: repair_list.txt, **/*
alwaysApply: true
---

# Repair List Workflow (repair_list.txt)

## 1. File Location and Creation

- Path: project root `repair_list.txt`
- If missing, AI may create and populate it
- Included in .gitignore; do not commit to version control

## 2. When to Use

Enable this workflow when the user requests "check issues", "audit", "fix", "compliance check", etc.

## 3. Mode Behavior

- **Ask mode**: After the check, ask the user: "Add the above issues to repair_list.txt for later fixing?"
- **Agent mode**: After the check, write issues to repair_list.txt automatically

## 4. File Format (plain txt, not md)

### 4.1 Basic Structure

```
Repair List
Generated: YYYY-MM-DD HH:mm
Pending: N | Resolved: M

=== Pending (N) ===
1. [⬜] file:line - description
2. [⬜] file:start-end - [type] description

=== Resolved (M) ===
3. [✅] file:line - resolved description
```

### 4.2 Line Number Format

- **Single line**: `file:123`
- **Line range**: `file:123-125`

### 4.3 Pending / Resolved

- **Status markers** (required at the start of each entry):
  - Pending: `[⬜]` (empty box, Unicode U+2B1C)
  - Resolved: `[✅]` (check, Unicode U+2705)
- Pending: `number. [⬜] file:line - description`
- Resolved: `number. [✅] file:line - description`
- Section titles `=== Pending (N) ===` / `=== Resolved (M) ===` help AI parsing and quick scanning

### 4.4 Optional Category Tags

- Add `[type]` before the description for batch processing, e.g. `[transition]`, `[hardcode]`, `[import]`

## 5. Repair Flow

- If repair_list.txt exists: read it, identify `[⬜]` entries under `=== Pending ===`, fix in order
- For each resolved item: change `[⬜]` to `[✅]`, move to `=== Resolved ===`, update the stats line (Pending: N | Resolved: M)
- When all are `[✅]` and a final check shows no remaining issues: clear repair_list.txt content (keep the file for reuse)

## 6. Forbidden

- Do NOT clear repair_list.txt before all items are confirmed resolved
- Do NOT commit repair_list.txt to git
