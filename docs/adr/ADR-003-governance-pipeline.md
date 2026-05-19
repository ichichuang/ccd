# ADR-003: Governance Pipeline

## Context

Governance expansion introduced multiple checks for AI assets, architecture boundaries, runtime neutrality, API compatibility, supply chain, release topology, workflow registry hygiene, and generated reports.

## Decision

CCD consolidates governance behind `pnpm governance:gate`. `pnpm governance:full` is an alias. CI calls the unified gate once before quality and build validation.

## Consequences

Local diagnosis can run subcommands directly, but CI policy is centralized. Generated governance artifacts must be reproducible and committed when changed.

## Rejected alternatives

- Duplicate governance orchestration in CI, package scripts, and shell scripts.
- Make generated reports advisory only.
- Allow policy manifests to be bypassed by ad hoc scripts.

## Migration implications

New governance checks must be added to the unified gate and documented in `docs/governance/README.md` instead of creating another top-level orchestration path.
