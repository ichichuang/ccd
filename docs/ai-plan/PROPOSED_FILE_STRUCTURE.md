# Proposed Repository Planning File Structure

```text
docs/
  ai-plan/
    00_INDEX.md
    AGENTS_DRAFT.md
    SPEC.md
    PLAN.md
    STATUS.md
    VALIDATION.md
    DECISIONS.md
    RISK_REGISTER.md
    EVIDENCE_POLICY.md
    SECURITY_AND_APPROVALS.md
    ROLLBACK.md
    FINAL_GO_NO_GO.md
    FINAL_VALIDATION_MATRIX.md
    OPERATOR_SOP.md
    NEXT_ACTIONS.md
    CHANGE_SUMMARY.md
    REVIEW_CHECKLIST.md
    OUTPUT_QUALITY_REQUIREMENTS.md
  ai-runs/
    _template-YYYYMMDD-HHMMSS-ccd-architecture-repair/
      command-logs/
      diffs/
      reports/
      screenshots/
      sources/
```

## File roles

- `00_INDEX.md`: overview and reading order.
- `AGENTS_DRAFT.md`: concise repository-level AI addendum draft. Do not copy to root `AGENTS.md` without approval.
- `SPEC.md`: durable specification, goals, non-goals, constraints, and acceptance criteria.
- `PLAN.md`: milestone and task system.
- `STATUS.md`: live progress ledger.
- `VALIDATION.md`: validation commands and evidence requirements.
- `DECISIONS.md`: architecture decision log.
- `RISK_REGISTER.md`: live risk register.
- `EVIDENCE_POLICY.md`: evidence capture rules.
- `SECURITY_AND_APPROVALS.md`: allowed, forbidden, and approval-required operations.
- `ROLLBACK.md`: rollback guidance.
- `FINAL_GO_NO_GO.md`: final decision template.
- `FINAL_VALIDATION_MATRIX.md`: final validation matrix.
- `OPERATOR_SOP.md`: human operator runbook.
- `NEXT_ACTIONS.md`: next-milestone queue and deferred lane notes.
- `CHANGE_SUMMARY.md`: final change summary.
- `REVIEW_CHECKLIST.md`: human reviewer checklist.
- `OUTPUT_QUALITY_REQUIREMENTS.md`: quality rules for future outputs.
- `docs/ai-runs/**`: run evidence, command logs, screenshots, source notes, and diff reports.
