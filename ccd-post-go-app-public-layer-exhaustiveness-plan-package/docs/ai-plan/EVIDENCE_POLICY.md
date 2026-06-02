# EVIDENCE POLICY

## Run directory

Use:
`docs/ai-runs/<YYYYMMDD-HHMMSS>-ccd-post-go-app-public-layer-<lane>/`

Each lane must include:

- `reports/summary.md`
- inventory or before/after report
- validation summary
- command logs
- risk notes
- final status

## Evidence rules

- Do not claim validation passed without logs.
- Do not fabricate evidence.
- Record BLOCKED with exact reason.
- Record NOT_APPLICABLE with exact reason.
- For generated files, record the owning command.
- For migrations, record old owner, new owner, changed files, behavior risk, and validation.
