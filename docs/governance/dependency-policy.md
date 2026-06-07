# Dependency Governance Policy

CCD dependency work is policy-driven and lane-isolated. Do not run blind global upgrades on `main`.

## Placement Rules

- Root `dependencies` are the central runtime singleton registry for app stacks and supply-chain policy. The root remains orchestration-only and must not become a runtime importer.
- Root `devDependencies` own workspace orchestration tools and local `workspace:*` package references used by governance, builds, and generated reports.
- Apps declare runtime packages they import in `dependencies`, including `@ccd/*` workspace packages they consume at runtime.
- Shared packages declare imported runtime packages in `dependencies`; package-local build and test tools belong in `devDependencies`.
- `@ccd/*` workspace packages must not be moved between dependency fields only for hoisting. Placement must match the importing package's runtime/build role.

## Version Policy

- Dependency modernization is owner-deferred for current Full GO.
- Future upgrades use single-dependency or tightly coupled compatibility lanes.
- Vite major migration stays separate from Vue tooling, UI, HTTP, desktop, and dependency cleanup lanes.
- Version range changes require manifest diff review, lockfile review, targeted validation, and rollback notes.

## pnpm Overrides Policy

`pnpm.overrides` may be used only for a documented transitive dependency risk, compatibility constraint, or security response.

An override change must record:

- Package and version being overridden.
- Reason and affected dependency chain.
- Whether the override is temporary or permanent.
- Validation commands run.
- Removal condition or next review trigger.

Do not use overrides to mask architecture violations, package export failures, or broken direct dependency declarations.

## Scanning Policy

`pnpm supply:check` and generated SBOM review are the current repository gates. Automated outdated or vulnerability scanning for pnpm and Cargo dependencies requires a future owner/operator-approved dependency governance lane.
