# Protocol Versioning

CCD protocol assets are versioned through `.ai/protocol/version.json`.

## Version fields

- `protocolVersion`
- `manifestVersion`
- `adapterVersion`
- `governanceVersion`
- `governanceBaselineVersion`
- `runtimeProfileSchemaVersion`
- `routerSchemaVersion`

## Compatibility policy

- adapters must declare compatible protocol and adapter versions
- validation must fail before incompatible protocol execution
- migrations must be deterministic and idempotent

## Commands

- `pnpm protocol:migrate`
- `pnpm adapters:validate`
- `pnpm governance:validate`
