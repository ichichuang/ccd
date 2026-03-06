# Enterprise Vue3 Boilerplate

一个基于 Vue 3 + TypeScript + Vite + PrimeVue + UnoCSS + Pinia + Alova 的企业级中后台管理模板，可作为新项目的起步脚手架。

## ✨ 特性

- 现代技术栈：Vue 3.5、TypeScript、Vite 7、PrimeVue、UnoCSS、Pinia、Alova
- 企业级架构：清晰的目录结构、模块化路由、状态管理与请求封装
- 通用组件：内置 DataTable、SchemaForm、UseEcharts、PrimeDialog、Icons 等高复用组件
- 设计系统：主题（亮/暗）、尺寸阶梯、语义化颜色与样式
- 国际化支持：内置中英文切换（vue-i18n）

## 🚀 快速开始

### 环境要求

- Node.js >= 20
- pnpm >= 8

### 安装与启动

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

### 常用命令

| 命令            | 说明           |
| --------------- | -------------- |
| `pnpm dev`      | 启动开发服务器 |
| `pnpm build`    | 生产构建       |
| `pnpm preview`  | 预览构建产物   |
| `pnpm lint`     | 代码检查       |
| `pnpm lint:fix` | 代码检查并修复 |

## 📁 项目结构概览

```text
app-template/
├── build/          # 构建配置
├── docs/           # 文档
├── src/
│   ├── api/        # 接口定义
│   ├── assets/     # 静态资源
│   ├── components/ # 通用组件
│   ├── constants/  # 常量
│   ├── hooks/      # 组合式逻辑
│   ├── layouts/    # 布局壳
│   ├── locales/    # 国际化
│   ├── plugins/    # 应用插件
│   ├── router/     # 路由
│   ├── stores/     # Pinia 状态
│   ├── types/      # 类型定义
│   ├── utils/      # 工具函数
│   └── views/      # 页面
```

## 📄 License

本仓库作为企业内部或自用模板，请根据实际情况补充许可证说明。
