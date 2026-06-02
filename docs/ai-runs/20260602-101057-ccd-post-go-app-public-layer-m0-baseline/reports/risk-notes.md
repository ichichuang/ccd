# M0 Risk Notes

| Risk | Status | Note |
|---|---|---|
| User-supplied plan package is untracked | OPEN | The plan package is the controlling task input. It is not removed or cleaned. |
| `.DS_Store` files exist inside the plan package | NOT_ACTIONED | They are ignored by git status and were not deleted. |
| M0 validation can generate package `dist` outputs | MITIGATED | Owning commands ran; no tracked diff remained after validation. |
| Browser/computer plugins requested | NOT_APPLICABLE | No UI or desktop runtime validation surface was touched in M0. |
