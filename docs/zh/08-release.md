# CCD 发布

## 版本来源

CCD 的版本主控入口是：

```text
project.config.json
```

其中 `release.version` 是唯一手工版本来源。

`apps/*` 与 `packages/*` 下的 `package.json` 仅承担工作区包清单职责，不应作为版本修改入口。

## 发布前的职责边界提醒

发布治理只负责验证，不应借发布流程临时重写工作区职责：

- `packages/contracts`：跨运行时接口与 DTO 契约
- `packages/core`：最小运行时无关适配门面，不是前端共享能力收纳桶
- `apps/web-demo`：浏览器应用外壳、路由、页面、stores、应用适配层，以及暂时仍留在应用内的共享候选模块
- `apps/desktop`：Tauri 桌面外壳与桌面适配层

当前应仅将以下路径记录为“应用内共享候选模块”，不要在发布准备阶段直接迁移：

- `apps/web-demo/src/components/PrimeDialog`
- `apps/web-demo/src/components/ProForm`
- `apps/web-demo/src/components/ProTable`
- `apps/web-demo/src/layouts/runtime/layoutRuntime.ts`
- `apps/web-demo/src/infra/shared/createCapabilityBridge.ts`
- `apps/web-demo/src/hooks/modules/useAutoMitt.ts`
- `apps/web-demo/src/utils/theme/engine.ts`
- `apps/web-demo/src/utils/safeStorage`

发布前仍应保持以下区域不动：

- `packages/core/src/index.ts`
- `apps/web-demo/src/main.ts`
- `apps/web-demo/src/plugins/**`
- `apps/web-demo/src/router/**`
- `apps/web-demo/src/stores/**`
- `apps/web-demo/src/views/**`
- `apps/web-demo/src/utils/date/dateUtils.ts`
- `apps/web-demo/src/utils/theme/engine.ts`
- `apps/web-demo/src/components/ProForm/**`
- `apps/web-demo/src/components/ProTable/**`

相关元数据通过以下命令同步：

```bash
pnpm project:sync
```

## 发布前校验

推荐顺序：

```bash
pnpm project:doctor
pnpm ccd:fix
pnpm lint:check
pnpm type-check
pnpm governance:gate
```

如果要执行更完整的本地验证，可使用：

```bash
pnpm build:ci
```

## 稳定标签建议

发布时建议保持：

- 提交信息符合 Conventional Commits
- 生成产物已同步
- 治理门禁已通过
- 不依赖手工修补 generated 文件

## 发布检查清单

1. 确认 `project.config.json` 版本与目标版本一致
2. 运行 `pnpm project:sync` 同步派生元数据
3. 确认 `pnpm project:doctor` 正常
4. 确认 `pnpm ccd:fix` 已执行
5. 确认 `pnpm lint:check` 通过
6. 确认 `pnpm type-check` 通过
7. 确认 `pnpm governance:gate` 通过
8. 确认未手工编辑 `docs/generated/**`、`.ai/generated/**`、`.ai/governance/api-snapshots/**`

## 推荐阅读

- 发布策略目录：[docs/release](../release)
- 治理总览：[docs/governance.md](../governance.md)
