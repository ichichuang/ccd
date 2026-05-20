# CCD 文档系统说明

本文档说明 CCD 的双语文档架构。

## 设计原则

- 中文文档面向人类开发者
- 英文文档面向 AI 代理与自动化工作流
- `docs/generated/**` 与 `.ai/generated/**` 为机器生成产物，不可手工修改

## 入口文件

### README.md

GitHub 默认入口，优先使用中文。

### README.en.md

英文 AI 入口，面向代理与自动化场景。

### docs/README.md

文档索引，负责指向中文与英文文档体系。

## 中文文档

中文文档位于：

- `docs/zh/00-overview.md`
- `docs/zh/01-quickstart.md`
- `docs/zh/02-architecture.md`
- `docs/zh/03-governance.md`
- `docs/zh/04-project-control-center.md`
- `docs/zh/05-ci-deploy.md`
- `docs/zh/06-ai-workflow.md`
- `docs/zh/07-troubleshooting.md`
- `docs/zh/08-release.md`

目标是帮助开发者快速理解仓库。

## 英文文档

英文文档位于：

- `docs/en/ai-entry.md`
- `docs/en/architecture-contract.md`
- `docs/en/governance-contract.md`
- `docs/en/command-contract.md`
- `docs/en/ci-deploy-contract.md`
- `docs/en/project-metadata-contract.md`
- `docs/en/troubleshooting-contract.md`

目标是帮助 AI 代理以最小上下文准确工作。

## generated 文档

`docs/generated/**` 与 `.ai/generated/**` 由治理脚本生成。

刷新方式：

```bash
pnpm governance:refresh
pnpm governance:gate
```

不要手工编辑。

## .ai 的角色

`.ai/**` 是 AI 协议真相源。

文档系统应与 `.ai/**` 保持一致，但不要用手工文档替代机器治理。
