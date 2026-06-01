# Risk Notes

## Active Risks

- D-020 can regress PrimeVue plugin install semantics if web and desktop bootstrap behavior diverge.
- D-021 can destabilize generated registry output if the owning generator boundary is unclear.
- D-022 can regress global toast/message/dialog services and route-shell behavior.
- D-024 can reduce showcase fidelity if migrated too aggressively.
- D-023 can create false closure if G-02 tasks are marked done without implementation evidence or exact owner/operator/product decisions.

## Preserved Boundaries

- No guard weakening.
- No dependency or manifest mutation.
- No manual generated output edit.
- No Clawd/theme work.
- No safeStorage crypto/HMAC/WebCrypto ownership change.
- No lz-string ownership change.

## Stop Conditions Still Active

Stop on failed validation, unclassified dirty state, `.cursor` returning, root duplicate repair log returning, remote divergence, unstable generated drift, or inability to prove final GO.
