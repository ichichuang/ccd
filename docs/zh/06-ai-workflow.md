# CCD AI 工作流

## 如何安全地让 AI 在 CCD 中工作

让 AI 参与本仓库开发时，建议遵循以下原则：

1. 先读文档，再改代码
2. 优先执行现有命令，而不是引入新工具
3. 先诊断，再修复
4. 不要绕过治理门禁

## 推荐验证命令

AI 在修改完成后，应优先验证：

- `pnpm project:doctor`
- `pnpm ccd:fix`
- `pnpm lint:check`
- `pnpm type-check`
- `pnpm governance:gate`

如果任务涉及部署链路，再额外确认：

- `pnpm build:ci`
- `pnpm vercel:build`
- `pnpm e2e:qa`

## AI 不宜随意修改的文件

AI 不应随意修改以下内容：

- `.ai/governance/**`
- `scripts/governance/**`
- `scripts/architecture/**`
- `tsconfig.base.json`
- `vercel.json`
- `.github/workflows/**`
- `docs/generated/**`
- `.ai/generated/**`
- `.ai/governance/api-snapshots/**`

除非任务明确要求修改这些区域，并且已说明影响。

## 生成报告规则

AI 不应手工修补生成报告。

正确做法是重新执行对应脚本或门禁，让机器重新生成。

## 推荐任务提示模式

给 AI 的任务提示建议包含：

1. 目标是什么
2. 禁止修改哪些区域
3. 必须执行哪些验证命令
4. 是否允许引入新依赖或新脚本
5. 期望输出格式：改动文件、验证结果、风险项

## 推荐阅读

- AI 工作区：[docs/ai-workspace.md](../ai-workspace.md)
- AI 入口（英文 AI）：[docs/en/ai-entry.md](../en/ai-entry.md)
