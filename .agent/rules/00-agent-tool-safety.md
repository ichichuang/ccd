---
description: CRITICAL SAFETY RULE: Restricts the use of file deletion tools to prevent accidental loss of codebase files during cleanup tasks.
globs: *
---

# Agent Tool Safety (Anti-Deletion Protocol)

<CRITICAL>
You are operating in a strict Enterprise Codebase. You must adhere to the following tool-usage constraints safely.
</CRITICAL>

## 1. The "Remove Code" vs "Delete File" Rule

- When the user asks to "remove unused variables", "clean up imports", "delete this block", or "remove dead code", you MUST ONLY use the `edit_file` tool to erase the specific text inside the file.
- **NEVER** use the `delete_file` tool for refactoring or code cleanup.

## 2. Explicit Deletion Only

- You are ONLY permitted to use the `delete_file` tool if the user's prompt explicitly and unequivocally says: "Delete the file [filename]" or "Remove this file from the disk".

## 3. Read-Only Fallback

- If you are unsure whether the user wants to delete a file or just empty its contents, ask for clarification. Default to `edit_file`.
