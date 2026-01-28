# CCD Cursor 规则总览 (The Blueprint)

本目录为 Cursor AI 的上下文与规则配置，采用「通用规则打底 → 技术栈强化 → 业务/UI 按需触发」的分层策略。

## 目录结构

```text
.cursor/
├── rules/                          # 【大脑区】静态规则 (.mdc)
│   ├── 000-architecture-map.mdc    # 架构地图、目录职责、技术栈约定、关键行为准则 (alwaysApply)
│   ├── 001-project-structure.mdc   # 目录骨架、文件存放、路径别名 (alwaysApply)
│   ├── 100-typescript-environment.mdc  # TS 环境隔离、类型与 TSX 规范 (按 glob 触发)
│   ├── 200-design-system-unocss.mdc    # Shadcn-vue + UnoCSS 语义化、主题与尺寸引擎管线 (按 glob 触发)
│   ├── 300-uniapp-adapter.mdc      # (可选) UniApp/小程序，未创建
│   └── 900-test-docs.mdc           # (可选) 测试与文档规范，未创建
├── skills/                         # 【任务区】按需请求的技能 (SKILL.md)
│   ├── theme-system/               # 主题配色：新增预设、新增语义色、排错步骤
│   ├── size-system/                # 尺寸系统：新增预设、新增布局变量、阶梯规则、排错步骤
│   ├── layout-system/              # 布局配置：新增配置项、默认值、持久化、响应式适配、排错步骤
│   ├── device-system/              # 设备系统：新增断点、设备检测、响应式适配、排错步骤
│   ├── event-bus/                  # 事件总线：基于 mitt 的全局 Event Bus（useMitt），新增事件/使用/排错
│   ├── safe-storage/               # 安全存储：safeStorage 压缩 + 加密流水线，Pinia 加密持久化、通用安全存储/传输
│   ├── http-client/                # HTTP 请求：核心请求工具 src/utils/http，配置 SSOT src/constants/http.ts，API 定义层 src/api/**
│   └── core-utils/                 # 通用工具：日期时间、ID、字符串转换、lodash 防腐层、浏览器能力检测等核心 utils 的选用与扩展
├── mcp.json                        # 【手脚区】MCP 动态工具，按需创建
├── .cursorignore                   # 【注意力区】忽略 node_modules、dist、自动生成文件等（项目根目录）
├── settings.json                   # Cursor 工作区设置
└── commands/                       # (可选) 快捷指令脚本
```

## 规则与触发策略

| 规则                           | 用途                                                                                                            | 触发                                                                                                                               |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **010-agent-autonomy**         | 执行策略总控：允许 Cursor 默认自主创建/修改/删除文件与目录以完成需求；仅在敏感信息/高破坏操作等“禁止区”停下询问 | `alwaysApply: true`                                                                                                                |
| **000-architecture-map**       | 核心架构、组件/布局分工、样式流向、Pug 禁用、导入控制                                                           | `alwaysApply: true`                                                                                                                |
| **001-project-structure**      | 目录树、新文件应放哪、路径别名 `@/` / `@&/` / `@$/`                                                             | `alwaysApply: true`                                                                                                                |
| **100-typescript-environment** | tsconfig.app vs tsconfig.node、禁止 any、全局类型、TSX 选用                                                     | glob: ts/vue/tsx、tsconfig                                                                                                         |
| **200-design-system-unocss**   | Shadcn-vue 所有权、语义 Token、RGB 透明度、布局变量、主题/尺寸/布局/设备引擎管线与 Uno 融合                     | glob: vue/tsx、uno.config、constants/theme/size/layout/breakpoints、utils/theme、stores/theme/size/layout/device、types/systems/\* |

仅 000、001 全局加载；100、200 根据当前编辑文件与 description 语义匹配加载，避免规则冲突与 token 浪费。

## 技能 (Skills)

| 技能                     | 何时使用                                                                                                                                                                                                                                                             |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **skills/theme-system**  | 新增主题预设、新增语义色（如状态色 warn/success 或衍生 hover/light）、或排查主题/深色模式不生效时，按 SKILL.md 中的步骤操作。主题与尺寸 store 均在 `src/plugins/modules/stores.ts` 的 setupStores 中 init。                                                          |
| **skills/size-system**   | 新增尺寸模式、修改圆角/间距、新增布局变量（如 h-xxxHeight）、或排查尺寸/圆角/间距不生效时，按 SKILL.md 中的步骤操作。                                                                                                                                                |
| **skills/layout-system** | 新增/修改布局配置项、修改默认显隐或模式、排查布局状态或持久化异常时，按 SKILL.md 中的步骤操作。布局 store 无 init，依赖 Pinia 持久化恢复。                                                                                                                           |
| **skills/device-system** | 新增断点、修改设备检测逻辑、或排查响应式不生效时，按 SKILL.md 中的步骤操作。设备 store 在 `src/plugins/modules/stores.ts` 的 setupStores 中 init。                                                                                                                   |
| **skills/event-bus**     | 需要在不同组件/模块间进行事件传递/发布订阅，或判断使用全局 Event Bus（mitt + useMitt）是最佳方案时，按 SKILL.md 中步骤集中在 `src/utils/mitt.ts` 的 `Events` 中声明事件并通过 `useMitt()` 使用。                                                                     |
| **skills/safe-storage**  | 需要对数据进行加密存储/读取、压缩 + 加密/解压 + 解密，或实现 Pinia 持久化加密、安全本地存储/HTTP 安全传输时，按 SKILL.md 中步骤优先使用 `@/utils/safeStorage` 暴露的方法（encryptAndCompress\*、createPiniaEncryptedSerializer 等）。                                |
| **skills/http-client**   | 需要请求接口/新增或调整 API、定制鉴权/签名/重试/超时/安全字段、上传等 HTTP 行为时使用。核心请求工具在 `src/utils/http/`；配置 SSOT 在 `src/constants/http.ts` 的 `HTTP_CONFIG`；API 定义必须放在 `src/api/**`，特殊拦截逻辑集中在 `src/utils/http/interceptors.ts`。 |
| **skills/core-utils**    | 需要实现或复用通用工具函数（日期时间、ID/UUID、字符串命名转换、深拷贝/合并/比较/摘字段、防抖/节流、浏览器能力检测等）时，按 SKILL.md 中策略优先从 `src/utils/` 现有模块选择或扩展，必要时新建对应 domain 的 utils 模块。                                             |
