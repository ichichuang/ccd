# M6-T1 Guard and Owner Decision Inventory

## Scope

- Target tasks: `P1-Guard-*`
- Evidence: `docs/ai-runs/20260529-070550-ccd-architecture-repair/command-logs/M6-T1-20260529-075435-guard-owner-inventory.log`

## Current guard coverage

Existing `scripts/ai-architecture-guard.mjs` already emits checks for:

- AI generated-code policy
- business view structure and forbidden direct API/router/network/storage/form/DTO patterns
- raw network/storage restrictions with exception lists
- VueUse `useFetch`/storage restrictions
- raw date constructor
- raw timer
- UnoCSS internal `glass-base`, `dark:text-white`, raw z-index
- Pinia persistence serializer drift
- store router/API import boundaries
- route module sync view imports, route names/meta/component loader/path checks

## Open guard items

| Ledger task | Owner/contradiction dependency | Result |
|---|---|---|
| `P1-Guard-SFCMacroOrder` | Owner Decision 2 asks team to decide guard enforcement strictness. | BLOCKED |
| `P1-Guard-TypeAssertions` | Owner Decision 2 plus Rule Contradiction 3 (`props.item as UserInfo` example vs assertion ban). | BLOCKED |
| `P1-Guard-AutoMitt` | Owner Decision 2. | BLOCKED |
| `P1-Guard-ComposableReturnTypes` | Owner Decision 2. | BLOCKED |
| `P1-Guard-DynamicUnoCSS` | Owner Decision 2. | BLOCKED |
| `P1-Guard-RuleContradictions` | Owner Decision 3 lists unresolved contradictions requiring architectural consensus. | BLOCKED |
| `P1-Guard-DesignTokenCanonical` | Owner Decision 4 requires owner sign-off on canonical file. | BLOCKED |
| `P1-Guard-OwnerSignoff` | No owner signoff exists in this run. | BLOCKED |

## Additional blocked inputs

- `P1-UIBoundary-Guard` remains blocked pending approval of proposed D-003 policy and exception list.
- `P1-HttpContract-Contracts` remains blocked pending owner Decision 6.

## Conclusion

No guard code should be added in M6. The next valid action is owner/architect review of Decisions 2, 3, 4, 5, and 6 plus proposed D-003. Any guard implementation before that would be enforcement without accepted scope.
