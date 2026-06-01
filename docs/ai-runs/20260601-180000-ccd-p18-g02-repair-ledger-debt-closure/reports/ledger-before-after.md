# P18 Ledger Before / After

## Counts

| metric | before P18 | after P18 |
|---|---|---|
| `pnpm ai:doctor --open` | 80 | 78 (expected post-validation) |
| G-02 status | `ACCEPTED_DEFERRED_DEBT` | `ACCEPTED_DEFERRED_DEBT` |
| top-level GO | `CONDITIONAL_GO` | `CONDITIONAL_GO` (unchanged) |
| full GO authorized | no | no |

## Checkbox changes in `.ai/runtime/repair_list.md`

| task_id | before | after | evidence |
|---|---|---|---|
| `P1-HttpContract-Contracts` | `[ ]` BLOCKED pending owner approval | `[x]` type-only contracts added per D-014 | `892dad30`, HTTP-001 run |
| `P2-Vite8-Progress` | `[ ]` plugin "remains unchanged" | `[x]` active usage removed in P2 BUILD-003 | P2 CSS modernization run |

## Unchanged policy

- 78 tasks remain open accepted deferred debt.
- C-06, M12, Clawd/theme, PrimeVue allowlist, safeStorage crypto, manifests, and lockfile untouched.
- No `[ ]` → `[x]` edits beyond the two evidence-backed rows above.
