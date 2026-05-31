# M6 Approval Checklist

## B-07 SafeStorage Crypto

- [ ] Owner chooses one crypto runtime owner path.
- [ ] Owner confirms Web Crypto/fallback implementation must not move to `packages/core` or `packages/contracts`.
- [ ] Owner approves whether `packages/contracts/src/crypto.ts` needs any additional type-only API.
- [ ] Owner confirms persisted payload format and key-rotation compatibility requirements.
- [ ] Future lane includes focused storage, serializer, HMAC, and ProForm draft tests.
- [ ] Future lane keeps `@/utils/safeStorage` compatibility facade until imports are migrated.

## C-06 PrimeVue Allowlist Reduction

- [ ] Owner approves selected M12 reduction group before editing imports or allowlists.
- [ ] Owner/product confirms whether showcase exception remains long-lived or should be redesigned.
- [ ] Wrapper target is explicit: `@ccd/vue-ui` for UI primitives or `@ccd/vue-primevue-adapter` for config/service/locale/directive adapters.
- [ ] Generated type registry is changed only through its owning generator.
- [ ] Future lane runs guard, package tests/builds, web-demo type-check, and focused visual/e2e validation.
- [ ] No broad PrimeVue allowlist globs are added.

## M7-M14 Lane Approval

- [ ] M7 allowed to touch non-crypto storage codec/facade only.
- [ ] M8 allowed to add or expose pure theme/size resolver APIs.
- [ ] M9 owner decides OS/device resolver package owner.
- [ ] M10 confirms Pinia stores remain app-owned.
- [ ] M11 confirms app router/i18n bindings stay in app facades.
- [ ] M12 confirms one PrimeVue reduction group and visual validation budget.
- [ ] M13 confirms build/reference repair strategy before package public API additions.
- [ ] M14 confirms any status changes have owner/operator evidence.

## Global Guardrails

- [ ] No source migration without lane approval.
- [ ] No package manifest or lockfile edits unless listed in the approved lane.
- [ ] No manual edits under `docs/generated/**` or `.ai/generated/**`.
- [ ] No commit, stage, push, reset, or clean in this lane.
- [ ] B-07 remains `BLOCKED` until owner approval is recorded.
- [ ] C-06 remains `OPEN` until source migration and policy reduction are approved and validated.
