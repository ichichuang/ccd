# CCD 项目主控中心

## SSOT

CCD 项目元数据的唯一手动编辑入口是：

```text
project.config.json
```

该文件控制：

- 产品包名、显示名、桌面标题
- 描述、作者、主页、协议
- 桌面标识符
- 关键词
- 版本（`release.version` 是唯一手工版本来源）
- 治理策略版本与治理阶段

`apps/*` 与 `packages/*` 下的 `package.json` 仅是工作区包清单，不是手工版本真源。

## 工作区职责提醒

项目元数据主控不等于架构职责主控，当前职责边界应保持清晰：

- `packages/contracts`：跨运行时接口与 DTO 契约
- `packages/core`：最小运行时无关适配门面，不是前端共享能力收纳桶
- `apps/web-demo`：应用外壳、路由、页面、stores、应用适配层，以及暂时仍留在应用内的共享候选模块
- `apps/desktop`：Tauri 桌面外壳与桌面适配层

`PrimeDialog`、`ProForm`、`ProTable` 的公共 UI 原语当前归 `packages/vue-ui` 所有；`apps/web-demo` 仅保留插件与 compatibility facade 集成层。

当前 `apps/web-demo` 中的以下路径应视为“应用内共享候选模块”，仅用于后续分阶段治理，不是当前主控中心阶段立即迁移目标：

- `apps/web-demo/src/layouts/runtime/layoutRuntime.ts`
- `apps/web-demo/src/hooks/modules/useAutoMitt.ts`
- `apps/web-demo/src/hooks/modules/useDialog.tsx`
- `apps/web-demo/src/hooks/modules/useProTableUrlSync.ts`
- `apps/web-demo/src/plugins/modules/primevue.ts`
- `apps/web-demo/src/plugins/modules/proform.ts`
- `apps/web-demo/src/plugins/modules/protable.ts`
- `apps/web-demo/src/utils/http/**`
- `apps/web-demo/src/utils/theme/engine.ts`
- `apps/web-demo/src/utils/theme/sizeEngine.ts`
- `apps/web-demo/src/utils/deviceSync.ts`
- `apps/web-demo/src/utils/safeStorage`
- `apps/web-demo/src/stores/modules/system/**`

以下区域当前不要移动：

- `packages/core/src/index.ts`
- `apps/web-demo/src/main.ts`
- `apps/web-demo/src/plugins/**`
- `apps/web-demo/src/router/**`
- `apps/web-demo/src/stores/**`
- `apps/web-demo/src/views/**`
- `apps/web-demo/src/utils/date/dateUtils.ts`
- `apps/web-demo/src/utils/theme/engine.ts`
- 注入 router/store/i18n/browser capabilities 的 app-local compatibility facades

## 需要同步的文件

当你修改 `project.config.json` 后，应执行：

```bash
pnpm project:sync
```

该命令会将元数据同步到下游受控文件，包括：

- 根 `package.json`
- `apps/*` 与 `packages/*` 下的工作区包清单
- `apps/web-demo/src/constants/brand.ts`
- `apps/desktop/src-tauri/tauri.conf.json`
- `apps/desktop/src-tauri/Cargo.toml`
- `.release-please-manifest.json`
- `.ai/governance/policies/version.json`

`apps/desktop/index.html` 是 Vite 构建期 HTML 模板，不由 `project:sync`
重写；桌面标题、描述、作者等展示元信息由 `apps/desktop/build/html.ts`
在 dev/build 时从 `project.config.json` 注入，模板内应保留占位符。

不要手工修改这些由 `project.config.json` 派生的字段。

## project:doctor

用于检测元数据是否一致：

```bash
pnpm project:doctor
```

适合在以下场景使用：

- 修改 `project.config.json` 之后
- 准备提交之前
- 准备发布之前

`pnpm governance:gate` 也会执行 `pnpm project:doctor`，因此元数据漂移会直接阻止进入主分支。

## ccd:fix

```bash
pnpm ccd:fix
```

该命令通常包含：

- 修复元数据
- 刷新生成产物
- 格式化相关文件
- 校验状态

## ccd:ship

```bash
pnpm ccd:ship -- "feat: describe change"
```

该命令用于一键完成：

- 检查
- 修复
- 暂存
- 提交
- 经过 Husky / commitlint

`ccd:ship` 是幂等的。如果校验后工作区已经干净，它不会创建空提交。

## 不应手工修改的文件

不要手工修改：

- `docs/generated/**`
- `.ai/generated/**`
- `.ai/governance/api-snapshots/**`

这些文件应通过治理脚本刷新。

## 推荐阅读

- 项目主控中心：[docs/project-control-center.md](../project-control-center.md)
- 项目元数据契约（英文 AI）：[docs/en/project-metadata-contract.md](../en/project-metadata-contract.md)
