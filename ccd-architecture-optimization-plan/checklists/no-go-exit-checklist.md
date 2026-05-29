# NO_GO Exit Checklist

当前最终状态应从 `NO_GO` 转为 `CONDITIONAL_GO` 或 `GO` 前，需要完成：

- [ ] B-007/E2E layout debt 已修复或 owner 接受为非阻塞。
- [ ] UI boundary policy 已审批，guard 是否启用有明确结论。
- [ ] HTTP contract scope 已审批或明确保持 deferred。
- [ ] Guard owner decisions 已逐项关闭或延期。
- [ ] GitHub branch protection / CODEOWNERS / templates 有 operator 决策。
- [ ] Vite 8 和 dependency modernization 明确不在当前 release scope，或已有独立 lane 通过。
- [ ] `pnpm ai:doctor --open` 没有未标记 BLOCKED/DEFERRED 的 actionable task。
- [ ] final validation matrix 更新。
- [ ] final git status 报告。
