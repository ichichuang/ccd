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
- 版本
- 治理策略版本与治理阶段

## 需要同步的文件

当你修改 `project.config.json` 后，应执行：

```bash
pnpm project:sync
```

该命令会将元数据同步到下游受控文件。

## project:doctor

用于检测元数据是否一致：

```bash
pnpm project:doctor
```

适合在以下场景使用：

- 修改 `project.config.json` 之后
- 准备提交之前
- 准备发布之前

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
