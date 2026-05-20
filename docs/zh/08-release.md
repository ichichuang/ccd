# CCD 发布

## 版本来源

CCD 的版本主控入口是：

```text
project.config.json
```

其中 `release.version` 为当前版本来源之一。

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
2. 确认 `pnpm project:doctor` 正常
3. 确认 `pnpm ccd:fix` 已执行
4. 确认 `pnpm lint:check` 通过
5. 确认 `pnpm type-check` 通过
6. 确认 `pnpm governance:gate` 通过
7. 确认未手工编辑 `docs/generated/**`、`.ai/generated/**`、`.ai/governance/api-snapshots/**`

## 推荐阅读

- 发布策略目录：[docs/release](../release)
- 治理总览：[docs/governance.md](../governance.md)
