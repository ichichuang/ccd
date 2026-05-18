# ccd-core

`@ccd/core` is the system boundary for CCD. It is the only place where runtime governance, provider contracts, transport contracts, routing contracts, execution contracts, cache contracts, token contracts, and adapter interfaces may be defined.

Allowed here:

- runtime governance contracts
- provider contracts
- routing contracts
- transport contracts
- execution pipeline contracts
- token/cache contracts
- UI-system base contracts
- adapter interfaces

Forbidden here:

- demo pages
- business features
- example routes
- Tauri API calls
- portable-runtime host state
- app composition

Apps and runtimes may depend on `@ccd/core`; `@ccd/core` must not depend on apps or concrete runtimes.
