# Ledger Before And After

Before D-023:

- `pnpm ai:doctor --open`: 78 open tasks.
- Open groups: P1 Guard 8, P2 Vite 8 8, P2 Dependencies 7, P2 GitHub 2,
  P3 Login 47, P4 Strategic 6.

After D-023:

- `.ai/runtime/repair_list.md`: all G-02 rows are checked.
- `.ai/runtime/repair-ledger.json`: regenerated from the Markdown ledger.
- `pnpm ai:doctor --open`: 0 open tasks.

Generated ownership:

- `repair-ledger.json` was not hand-edited.
- Owning command: `pnpm ai:ledger:json`.
- The generated JSON is a local runtime artifact ignored by `.gitignore`
  (`.ai/runtime/*.json`), so the committed source of truth is
  `.ai/runtime/repair_list.md` plus this evidence.
