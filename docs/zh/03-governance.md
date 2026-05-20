# CCD 治理

## 统一门禁

CCD 的权威治理入口是：

```bash
pnpm governance:gate
```

该门禁会在 CI 中先于类型检查、测试、lint 和生产构建运行。

## 刷新与门禁的关系

推荐顺序：

```bash
pnpm governance:refresh
pnpm governance:gate
```

- `governance:refresh` 用于刷新治理产物
- `governance:gate` 用于执行统一校验

不要跳过门禁直接提交生成物。

## 生成产物漂移

`docs/generated/**`、`.ai/generated/**`、`.ai/governance/api-snapshots/**` 均为生成产物。

如果源策略、API 导出、拓扑或脚本发生变更，应重新执行：

```bash
pnpm governance:gate
```

不要手工修补生成文件。

## API 快照

API 快照用于守护公共导出兼容性。

相关命令：

```bash
pnpm api:report
```

该命令会生成 API 报告，并用于检测：

- 公共符号删除
- 公共导出子路径删除
- 内部导出泄漏

## 供应链检查

```bash
pnpm supply:check
```

用于校验依赖策略与供应链基线。

## 运行时泄漏检查

```bash
pnpm arch:runtime
```

用于检测 `packages/contracts` 和 `packages/core` 是否引入了运行时全局对象或平台内建模块。

## GitHub 工作流注册表卫生

```bash
pnpm governance:github-workflows
```

用于检测 GitHub 远端工作流记录是否与 `.github/workflows` 声明一致。

历史禁用记录应当保留审计痕迹，而不是被重新激活。

## 推荐阅读

- 治理总览：[docs/governance.md](../governance.md)
- 治理契约（英文 AI）：[docs/en/governance-contract.md](../en/governance-contract.md)
