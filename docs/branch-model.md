# CCD Branch Model

CCD 当前采用三条同级分支交付线，目的是把 Web 架构主线、桌面应用重建线和纯净便携底座分开维护，避免旧桌面分支冲突继续污染主线。

## Branch Roles

| Branch                  | Role                | Keep                                             | Do Not Keep                                      |
| ----------------------- | ------------------- | ------------------------------------------------ | ------------------------------------------------ |
| `main`                  | Web 架构主线        | 完整示例、演示站、架构文档、AI 治理、CI          | Tauri 运行时重建资产、桌面专项配置               |
| `desktop-version`       | Tauri v2 桌面应用线 | `src-tauri/**`、桌面桥接、capabilities、桌面验证 | 旧 `feat/tauri-integration` 的冲突历史和临时修补 |
| `main-portable-version` | 新项目便携纯净底座  | 最小可复用架构、AI 协议、基础工程命令            | 示例页面、演示目录、冗余快照、非必要配置         |

`feat/tauri-integration` 已退休。后续桌面工作不得继续从该分支合并，也不得把它作为冲突修复基线。

## Development Flow

1. 通用架构、组件、设计系统、AI 治理和 Web 示例能力优先进入 `main`。
2. 桌面运行时、OS 能力、Tauri permissions、窗口行为和桌面发布配置进入 `desktop-version`。
3. 纯净模板、示例裁剪、便携化默认配置进入 `main-portable-version`。
4. 跨分支同步必须按目标分支契约手动审查，不做旧桌面分支的自动追平。

## Validation Matrix

| Branch                  | Baseline Checks                                                                                                |
| ----------------------- | -------------------------------------------------------------------------------------------------------------- |
| `main`                  | `pnpm arch:check`, `pnpm type-check`, `pnpm test:run`, `pnpm lint:check`                                       |
| `desktop-version`       | `pnpm sync:desktop-config`, `pnpm check:drift`, `pnpm type-check`, targeted Playwright when UI/runtime changes |
| `main-portable-version` | `pnpm arch:check`, `pnpm type-check`, targeted tests after cleanup                                             |

## AI Governance

- `.ai/**` remains the source of truth across all branches.
- `AGENTS.md` and `CLAUDE.md` remain generated adapters.
- Desktop-related Codex routing is active for `desktop-version` and for direct edits under desktop bridge or `src-tauri/**` paths.
- Portable cleanup must keep the AI protocol usable, but may remove example-specific routes, views, snapshots, and docs that no longer apply.
