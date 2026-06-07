# CCD 总览

CCD 是一个面向确定性、AI 安全、多运行时产品体系的企业级受控平台仓库。

## 项目定位

CCD 的目标不是单纯的 monorepo 整理，而是建立一个可长期维护、可自动守护、可跨运行时演进的平台骨架。

它同时承担三层职责：

1. 产品运行时外壳
2. 平台架构治理层
3. AI 协作协议入口

## 自保护架构

CCD 不依赖开发者的自觉来保证架构安全。

核心治理入口：

```bash
pnpm governance:gate
```

该门禁会在 CI 中先于类型检查、测试、lint 和生产构建运行。

自保护能力包括：

- 策略资产校验
- AI 安全代码生成约束
- 依赖边界校验
- 运行时泄漏检测
- 公共 API 兼容性校验
- 供应链策略校验
- 发布拓扑校验
- GitHub Actions 工作流注册表卫生检查

## Monorepo 拓扑

```text
packages/contracts  -> 公共 ABI：仅接口与共享类型
packages/core       -> 运行时无关平台逻辑
apps/web-demo       -> 浏览器 web-demo 应用外壳、路由、stores、views 与应用适配层
apps/desktop        -> 专用 Tauri 桌面运行时外壳、自有前端入口与 src-tauri 后端边界
root                -> 仅编排外壳
```

依赖方向固定为：

```text
@ccd/contracts -> @ccd/core -> apps/*
```

`apps/web-demo` 与 `apps/desktop` 共享受治理的 `packages/*` 包，而不是互相复制公共能力。共享 components、tokens、hooks、UI primitives、adapter packages、contracts 与 runtime-neutral logic 属于 `packages/*`；app-specific routes、stores、pages / views 与 plugin wiring 保持在对应 app 内。

## 目标用户

本文档主要面向以下人群：

- 前端/全栈开发者
- 平台维护者
- 负责 CI/发布流程的工程师
- 需要在本仓库中使用 AI 辅助开发的人

## 当前稳定基线

当前仓库处于 `phase-4-self-protecting-platform` 阶段。

治理策略版本与元数据入口统一来自：

```text
project.config.json
```
