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
- External dependency ranges are centralized in the default pnpm catalog in `pnpm-workspace.yaml`; workspace package manifests and root pnpm overrides reference those ranges with `catalog:`.
- `pnpm deps:catalog:check` is the syncpack-equivalent alignment check. It fails when an external dependency or override bypasses the catalog, when a catalog entry is missing, or when an entry is unused.
- Future upgrades use single-dependency or tightly coupled compatibility lanes.
- Vite major migration stays separate from Vue tooling, UI, HTTP, desktop, and dependency cleanup lanes.
- Version range changes require manifest diff review, lockfile review, targeted validation, and rollback notes.

## pnpm Overrides Policy

`pnpm.overrides` may be used only for a documented transitive dependency risk, compatibility constraint, or security response. External override ranges must resolve through the pnpm catalog; do not hard-pin an override range directly in `package.json`.

An override change must record:

- Package and version being overridden.
- Reason and affected dependency chain.
- Whether the override is temporary or permanent.
- Validation commands run.
- Removal condition or next review trigger.

Do not use overrides to mask architecture violations, package export failures, or broken direct dependency declarations.

Current overrides:

| Override                | Catalog source                 | Reason                                                                                                                                     | Removal condition                                                                                                       |
| ----------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| `glob`                  | `catalogs.overrides.glob`      | Preserve the existing transitive compatibility policy while direct workspace manifests use `catalog:`.                                     | Remove after an isolated dependency lane proves the normal catalog range can resolve without lockfile or tooling drift. |
| `path-scurry>lru-cache` | `catalogs.overrides.lru-cache` | Preserve the previously locked `path-scurry@2.0.1` transitive resolution while moving the override version declaration into pnpm catalogs. | Remove in the same isolated dependency lane that refreshes `glob`/`path-scurry` lockfile resolution.                    |

## Scanning Policy

`pnpm supply:check` and generated SBOM review are the current repository gates.

`pnpm deps:scan` records a local runtime dependency scan summary for:

- pnpm outdated inventory.
- pnpm audit advisories.
- Cargo locked dependency inventory.

The scan is evidence-producing, not an automatic upgrade. Advisories and outdated packages must be handled in isolated dependency lanes with manifest diff review, lockfile review, targeted validation, and rollback notes.
