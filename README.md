# CCD

自保护确定性多运行时平台架构。

## 阅读入口

- 架构知识库：[`wiki/index.md`](./wiki/index.md)
- 中文导览：[`wiki/indexes-zh/开始阅读.md`](./wiki/indexes-zh/开始阅读.md)
- AI 入口：[`wiki/indexes/ai-entry.md`](./wiki/indexes/ai-entry.md)
- 生成证据索引：[`wiki/indexes/generated-evidence-index.md`](./wiki/indexes/generated-evidence-index.md)
- `/docs` 迁移状态：[`wiki/generated/docs-migration-status.md`](./wiki/generated/docs-migration-status.md)
- `/docs` 删除就绪报告：[`wiki/generated/docs-deletion-readiness-report.md`](./wiki/generated/docs-deletion-readiness-report.md)

`/wiki` 是当前架构知识库入口。`/docs` 暂时保留为 legacy compatibility 与历史证据层；除非 [`wiki/_schema/docs-deletion-readiness.md`](./wiki/_schema/docs-deletion-readiness.md) 的所有标准通过，否则不得删除。

## 当前架构不变量

```text
packages/contracts -> packages/core -> apps/*
```

- `packages/contracts` 只包含接口、DTO 与共享类型。
- `packages/core` 保持 runtime-neutral，只依赖 `@ccd/contracts`。
- Web/Tauri/浏览器存储/HTTP 等运行时能力留在应用适配层或已批准的 app-owned runtime infrastructure。
- 不添加全局 `@ccd/*` TypeScript aliases。
- 不移动 alova HTTP runtime，不移动 safeStorage runtime。
- P4 项是非行动型战略守卫，不是本分支可实现事项。

## 快速开始

```bash
pnpm install --frozen-lockfile
pnpm dev:web-demo
```

## 常用验证

```bash
pnpm wiki:validate
pnpm docs:commands
pnpm project:doctor
pnpm check
pnpm validate
```

完整命令表与适用场景见 [`wiki/canonical/governance/command-surface.md`](./wiki/canonical/governance/command-surface.md) 和 [`wiki/canonical/governance/validation-gates.md`](./wiki/canonical/governance/validation-gates.md)。

## 生成证据

生成产物仍由各自脚本拥有，不手工维护事实内容：

- `docs/generated/**`
- `.ai/generated/**`
- `.ai/governance/api-snapshots/**`
- `wiki/generated/**`

如需刷新 wiki 生成视图，运行：

```bash
pnpm wiki:refresh
```
