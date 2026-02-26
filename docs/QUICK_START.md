# 🚀 Quick Start: 开发者快速上手

## 1. 环境准备

- **Node.js**: >= 24.3.0 (推荐 v24+)
- **包管理器**: pnpm >= 8.0.0 (必须使用 pnpm)

```bash
# 安装依赖
pnpm install
```

## 2. 本地开发

```bash
# 启动开发服务器
pnpm dev
```

启动后访问提示的地址（默认 `http://localhost:5173`）。

## 3. 创建新页面 (开发者流)

为了保证代码质量和架构一致性，本项目推荐使用 **AI 协作流程**：

1. **定义逻辑 (Cursor)**: 在 Cursor 中，参考 `docs/ai-specs/GOLDEN_SAMPLES/useFeatureLogic.ts`，让 AI 生成 API 定义和 Hook。
2. **构建 UI (Antigravity)**: 在 Antigravity 中，参考 `docs/ai-specs/GOLDEN_SAMPLES/UIComponent.vue`，让 AI 根据 Hook 生成响应式页面。

详见：[🤝 AI 协作流程](./AI_COLLABORATION.md)

## 4. 常用命令

| 命令              | 说明                |
| ----------------- | ------------------- |
| `pnpm dev`        | 启动开发环境        |
| `pnpm build`      | 构建生产版本        |
| `pnpm lint`       | 代码风格检查        |
| `pnpm format`     | 代码格式化          |
| `pnpm type-check` | TypeScript 类型检查 |

## 5. 项目约束 (必读)

- **UI 框架**: PrimeVue (Unstyled 模式)
- **样式**: UnoCSS (禁止写死 px 和颜色)
- **请求**: Alova
- **架构**: API -> Hook -> UI 三层分离

更深层的技术选型请参考：[🛠️ 技术栈](./architecture/TECH_STACK.md)
