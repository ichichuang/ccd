# Project Metadata Contract

## project.config.json Is SSOT

Canonical manual metadata source:

```text
project.config.json
```

## project:sync

Use this command to propagate metadata changes:

```bash
pnpm project:sync
```

## project:doctor

Use this command to verify metadata alignment:

```bash
pnpm project:doctor
```

## Forbidden Direct Edits

Do not manually edit generated outputs under:

- `docs/generated/**`
- `.ai/generated/**`
- `.ai/governance/api-snapshots/**`

Use the existing refresh and validation scripts instead.
