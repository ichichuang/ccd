# Governance Contract

## Refresh Before Gate

Preferred sequence:

```bash
pnpm governance:refresh
pnpm governance:gate
```

Do not submit generated artifacts without passing the gate.

## Generated Artifact Rules

Do not manually edit:

- `docs/generated/**`
- `.ai/generated/**`
- `.ai/governance/api-snapshots/**`

These are machine-generated governance outputs.

## API Snapshots

Use:

```bash
pnpm api:report
```

API snapshots guard public export compatibility.

## Drift Handling

If governance or generated outputs drift, regenerate and validate with:

```bash
pnpm governance:gate
```

Do not patch generated files by hand.

## Never Manually Edit Generated Reports

Generated reports must be refreshed by existing governance scripts only.

Manual edits break the machine-enforced governance contract.
