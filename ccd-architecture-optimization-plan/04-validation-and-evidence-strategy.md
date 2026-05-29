# 04 — 验证与证据策略

## 基础验证分层

| 场景             | 最小验证                                                              | 扩展验证                                            |
| ---------------- | --------------------------------------------------------------------- | --------------------------------------------------- |
| 文档/ADR/计划    | `pnpm docs:commands`                                                  | `pnpm ai:doctor --open`                             |
| contracts/core   | `pnpm --filter @ccd/contracts build`, `pnpm --filter @ccd/core build` | `pnpm arch:runtime`, `pnpm api:report`              |
| shared packages  | `pnpm --filter <package> build`                                       | `pnpm ci:prepare-internal`, `pnpm type-check`       |
| web app          | `pnpm --filter @ccd/web-demo type-check`                              | `pnpm build:web-demo`, focused vitest/e2e           |
| UI/layout        | focused Playwright                                                    | `pnpm e2e:layout`, `pnpm e2e:visual`                |
| governance       | `pnpm governance:refresh`                                             | `pnpm governance:gate`, `git diff --check`          |
| final checkpoint | targeted checks                                                       | `pnpm build:ci`, `pnpm test:run`, `pnpm lint:check` |

## 证据目录建议

每个执行 lane 创建：

```text
docs/ai-runs/YYYYMMDD-HHMMSS-ccd-architecture-optimization/
  command-logs/
  reports/
  screenshots/
  artifacts/
```

## 失败处理规则

1. 验证失败时停止当前 lane。
2. 不放宽断言、不更新 snapshot 来掩盖真实布局问题。
3. 若失败与本 lane 无关，必须用 A/B 或 focused rerun 证明。
4. 失败项在 ledger 中标记 BLOCKED，并写清 narrowest next action。
5. 不继续执行后续 lane，除非 owner 明确接受风险。
