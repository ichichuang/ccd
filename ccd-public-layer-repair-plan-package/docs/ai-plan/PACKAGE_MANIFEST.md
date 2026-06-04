# PACKAGE_MANIFEST — Planning Package Map

## Section 1: Executive planning summary

Located primarily in `README.md`, `SPEC.md`, `PLAN.md`, and `WORKFLOW_RECOMMENDATIONS.md`.

Project objective: repair and harden remaining `apps/**` public-layer structural issues without unsafe migrations.

Expected outcome: a validated, evidence-backed public-layer repair with explicit deferred owner decisions for surfaces that are not safe to move now.

In scope:

- Route/menu/access contracts and pure helper migration where safe.
- API/DTO response contract normalization.
- System preference type contract split.
- Sync/build owner decisions.
- Theme/size facade review and optional low-risk helper extraction.
- Guard, validation, documentation, and final certification artifacts.

Explicit non-goals:

- Broad rewrites.
- Store migration.
- Route view migration.
- SafeStorage crypto/compression migration.
- DateUtils migration.
- HTTP runtime adapter migration.
- Generated manual edits.
- Dependency/manifest changes without approval.

Primary risks:

- Package owner ambiguity.
- Runtime code leaking into contracts.
- Route/access behavior regression.
- API/DTO contract drift.
- Zod/dependency manifest pressure.
- Generated drift.
- AI-agent evidence fabrication.

Recommended execution mode:

- Isolated worktree.
- Codex Goal mode or equivalent checkpointed long-horizon agent mode.
- No unattended risky operations.

Codex Goal mode: appropriate.

Worktrees: recommended.

Plugins, automations, SDK: not needed by default.

Subagents: optional for discovery only.

Final workflow: M0 baseline, M1-M4 high-value fixes, M5-M6 owner decisions, M7 optional low-risk theme/size hardening, M8 guards, M9 validation, M10 final artifacts.

## Section 2: Confirmed facts, assumptions, and open questions

### Confirmed facts from the user and prior audit

- Repository: `https://github.com/ichichuang/ccd`.
- The user wants all remaining unaddressed potential structural problems in the analysis column turned into a complete repair plan.
- The focus is `apps/**` public-layer ownership: store, hooks/composables, types, utils, runtime adapters, public facades, build utilities, and generated boundaries.
- Prior review concluded current remaining concerns are mostly deferred owner decisions or type-contract issues, not broad immediate migrations.

### Assumptions

- Implementation will happen later by an AI coding agent.
- This package should be copied into the repository root.
- The future agent will inspect exact scripts and conventions before running commands.
- No commit or push is requested.
- No dependency, manifest, lockfile, or new package owner change is approved by default.

### Non-blocking open questions

- Whether the owner wants a new sync runtime package later.
- Whether the owner wants a new build config package later.
- Whether schema contracts should ever accept Zod as a dependency.
- Whether optional size DOM writer extraction is worth the visual regression risk.

### Blocking questions

None for producing this planning package.

### Information that must be inspected before implementation

- Current working tree status.
- Current package scripts and package manager versions.
- Existing commit conventions if any commit is later requested.
- Current package owner boundaries and exports.
- Current architecture guard implementation.
- Current generated-file owner commands.

## Section 3: Proposed repository planning file structure

- `AGENTS.md`: root-level agent rules and stop conditions.
- `docs/ai-plan/SPEC.md`: precise project specification.
- `docs/ai-plan/PLAN.md`: milestone and task execution plan.
- `docs/ai-plan/STATUS.md`: live progress ledger.
- `docs/ai-plan/VALIDATION.md`: validation contract.
- `docs/ai-plan/DECISIONS.md`: architecture decision log.
- `docs/ai-plan/RISK_REGISTER.md`: risk register.
- `docs/ai-plan/EVIDENCE_POLICY.md`: evidence requirements.
- `docs/ai-plan/SECURITY_AND_APPROVALS.md`: safety and approval policy.
- `docs/ai-plan/ROLLBACK.md`: rollback guidance.
- `docs/ai-plan/FINAL_GO_NO_GO.md`: final decision template.
- `docs/ai-plan/FINAL_VALIDATION_MATRIX.md`: final validation matrix template.
- `docs/ai-plan/OPERATOR_SOP.md`: human operator procedure.
- `docs/ai-plan/NEXT_ACTIONS.md`: immediate next steps and deferred lanes.
- `docs/ai-plan/CHANGE_SUMMARY.md`: final change summary template.
- `docs/ai-plan/CODEX_GOAL_PROMPT.md`: ready-to-paste Codex Goal prompt.
- `docs/ai-plan/REVIEW_CHECKLIST.md`: human review checklist.
- `docs/ai-plan/WORKFLOW_RECOMMENDATIONS.md`: execution-mode decisions.
- `docs/ai-plan/OUTPUT_QUALITY_REQUIREMENTS.md`: final output quality requirements.
- `docs/ai-runs/YYYYMMDD-HHMMSS-ccd-public-layer-repair/`: evidence directory template.

## Sections 4-18 coverage

- Section 4: `AGENTS.md`
- Section 5: `SPEC.md`
- Section 6: `PLAN.md`
- Section 7: `STATUS.md`
- Section 8: `VALIDATION.md`
- Section 9: `DECISIONS.md`
- Section 10: `RISK_REGISTER.md`
- Section 11: `EVIDENCE_POLICY.md`
- Section 12: `SECURITY_AND_APPROVALS.md`
- Section 13: `ROLLBACK.md`
- Section 14: `CODEX_GOAL_PROMPT.md`
- Section 15: `WORKFLOW_RECOMMENDATIONS.md`
- Section 16: `FINAL_GO_NO_GO.md`, `FINAL_VALIDATION_MATRIX.md`, `OPERATOR_SOP.md`, `NEXT_ACTIONS.md`, `CHANGE_SUMMARY.md`, `RISK_REGISTER.md`, `STATUS.md`
- Section 17: `REVIEW_CHECKLIST.md`
- Section 18: `OUTPUT_QUALITY_REQUIREMENTS.md`
