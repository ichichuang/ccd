# CCD 快速开始

## 环境要求

| 工具    | 版本        |
| ------- | ----------- |
| Node.js | `24.x`      |
| pnpm    | `>= 10.0.0` |

## 安装

```bash
git clone git@github.com:ichichuang/ccd.git
cd ccd
pnpm install --frozen-lockfile
```

## 启动 web-demo

```bash
pnpm dev:web
```

## 构建

### 验证构建（CI 思路）

```bash
pnpm build:ci
```

### 部署构建（Vercel 思路）

```bash
pnpm vercel:build
```

### 仅构建内部依赖

```bash
pnpm ci:prepare-internal
```

### 仅验证包解析

```bash
pnpm ci:smoke:packages
```

## 日常开发流程

推荐顺序：

```bash
pnpm ccd:doctor
pnpm ccd:fix
pnpm ccd:ship -- "feat: describe change"
```

说明：

- `ccd:doctor`：检查配置、元数据、git 状态
- `ccd:fix`：修复元数据、刷新生成产物、格式化并校验
- `ccd:ship`：修复、校验、暂存、提交，并经过 Husky / commitlint

## 提交前校验

```bash
pnpm lint:check
pnpm type-check
pnpm governance:gate
```

## 推送前建议

在向远端推送前，建议至少确认：

1. `pnpm ccd:doctor` 正常
2. `pnpm lint:check` 通过
3. `pnpm type-check` 通过
4. `pnpm governance:gate` 通过
5. `git diff --check` 无空白问题
