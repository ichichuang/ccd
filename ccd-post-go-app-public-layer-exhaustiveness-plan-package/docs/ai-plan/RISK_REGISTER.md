# RISK REGISTER

| Risk ID | Description                                                        | Probability | Impact | Detection                       | Mitigation                                         | Status |
| ------- | ------------------------------------------------------------------ | ----------: | -----: | ------------------------------- | -------------------------------------------------- | ------ |
| R1      | Moving app-owned runtime code into common packages breaks behavior |      Medium |   High | Tests/build/runtime smoke       | explicit ownership classification; smallest slices | OPEN   |
| R2      | Over-migration creates common-layer dumping ground                 |      Medium |   High | package API review              | package ownership rules                            | OPEN   |
| R3      | Generated files drift                                              |      Medium | Medium | validate:governance, api:report | owning generators only                             | OPEN   |
| R4      | PrimeVue wrappers lose behavior                                    |      Medium |   High | web-demo tests, visual smoke    | preserve props/slots/PT/ref methods                | OPEN   |
| R5      | auto-imports generated format drift                                |        High |    Low | git diff after build            | Prettier normalize and verify no diff              | OPEN   |
| R6      | app-specific routes/stores are incorrectly migrated                |      Medium |   High | inventory review                | app-owned justification register                   | OPEN   |
| R7      | validation time is large                                           |      Medium | Medium | command duration                | milestone validation + final matrix                | OPEN   |
| R8      | AI agent closes task without evidence                              |         Low |   High | evidence review                 | evidence policy and stop conditions                | OPEN   |
