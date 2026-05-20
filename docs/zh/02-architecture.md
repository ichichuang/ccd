# CCD 架构

## 包角色

| 目录                 | 角色                         |
| -------------------- | ---------------------------- |
| `packages/contracts` | 公共 ABI：仅接口与共享类型   |
| `packages/core`      | 运行时无关平台逻辑           |
| `apps/web-demo`      | 浏览器运行时真相源           |
| `apps/desktop`       | Tauri 桌面运行时外壳与适配层 |
| `root`               | 编排外壳                     |

## 依赖方向

```text
@ccd/contracts -> @ccd/core -> apps/*
```

这是硬约束，不能反向依赖，也不能跨层穿透。

## 运行时无关规则

`packages/contracts` 和 `packages/core` 不得出现以下内容：

- 浏览器全局对象
- Node 内建模块
- Tauri API
- `fetch`
- `console`
- `crypto`
- `localStorage` / `sessionStorage`
- `setTimeout` / `setInterval` 等定时器直接使用

运行时能力必须通过 contracts 定义的接口注入。

## 适配层边界

运行时能力只能出现在应用适配层：

- `apps/web-demo/src/adapters/**`
- `apps/desktop/src/adapters/**`

适配层只负责翻译与接入，不应当成为业务规则中心。

## 包输出模型

`packages/contracts` 与 `packages/core` 的对外消费形式均为构建产物：

- `dist/index.js`
- `dist/index.d.ts`

应用包通过 workspace 包引用这些构建产物，而不是直接把源码当运行时入口。

## 为什么 tsconfig.base.json 不能包含全局 @ccd/\* 路径

`tsconfig.base.json` 不应包含全局 `@ccd/*` 路径映射。

原因：

- 本仓库是多包 monorepo
- 包之间应通过 workspace 协议与构建产物边界解耦
- 全局路径映射会掩盖真实依赖关系
- 它会导致类型检查、构建和运行时边界校验结果不一致

正确做法是让每个包维护自己的 `tsconfig.json`，并依赖包导出与构建产物。

## 推荐阅读

- 架构总览：[docs/architecture.md](../architecture.md)
- 架构契约（英文 AI）：[docs/en/architecture-contract.md](../en/architecture-contract.md)
