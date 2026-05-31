# P16a Accepted Residual Debt Register

Owner-accepted residual debt supporting `CONDITIONAL_GO`. None of these items authorize full GO.

## C-06 — PrimeVue allowlist remainder

| Field | Value |
|-------|-------|
| Status | `OPEN` (owner-accepted residual) |
| Owner acceptance | P16 final reconciliation; formalized P16a in `DECISIONS.md` D-017 section |
| Scope | 8 exact allowlist rows + showcase exception; E3 long-lived per D-017 Option D |
| Distinction | Accepted residual debt ≠ resolved issue ≠ full GO |
| Evidence | P14 E1/E2/E4 runs; P16 reconciliation |

## G-02 — Repair ledger deferred tasks

| Field | Value |
|-------|-------|
| Status | `ACCEPTED_DEFERRED_DEBT` |
| Owner acceptance | P15 lane (`12f71e0a`); formalized P16a in `DECISIONS.md` G-02 section |
| Scope | 80 open tasks in `.ai/runtime/repair_list.md`; count unchanged |
| Distinction | Accepted deferred debt ≠ resolved issue ≠ full GO |
| Evidence | `docs/ai-runs/20260601-155000-ccd-p15-repair-ledger-closure/` |

## M12 — PrimeVue reduction program

| Field | Value |
|-------|-------|
| Status | `PARTIAL` |
| Completed | E1, E2, E4 |
| Deferred | E3 showcase (long-lived per D-017 Option D) |
| Distinction | Partial completion with accepted showcase residual |

## G-03 — Completion gate

| Field | Value |
|-------|-------|
| Status | `DONE` (conditional gate only) |
| Basis | Validation green + explicit owner-accepted residual debt for C-06 and G-02 |
| Distinction | Conditional completion gate ≠ full GO |
