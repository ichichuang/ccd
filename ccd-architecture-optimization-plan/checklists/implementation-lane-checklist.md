# Implementation Lane Checklist

## 开始前

- [ ] 确认只处理一个 lane。
- [ ] 确认是否触发 approval gate。
- [ ] 读取相关 module README 和 issue details。
- [ ] 记录目标 issue IDs。
- [ ] 建立 evidence 目录。

## 实施中

- [ ] 先跑 focused failing validation 或 diagnostic。
- [ ] 只改列明路径和直接依赖面。
- [ ] 不扩大到 Vite/dependency/auth/GitHub/P4 等未审批范围。
- [ ] 不手动编辑 generated artifacts。
- [ ] 每个 public export 变化后运行 `pnpm api:report`。

## 收口

- [ ] 运行 issue 中列明 validation。
- [ ] 更新 active report。
- [ ] 更新 status/risk/decision docs。
- [ ] 运行 `pnpm docs:commands`（若文档被改）。
- [ ] 运行 `git diff --check`。
- [ ] 报告 final git status。
