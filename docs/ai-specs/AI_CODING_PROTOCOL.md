# AI 编码协议（AI Coding Protocol）

> **目标读者：AI**。生成或修改代码前，AI 必须执行本协议中的决策流程与自检清单，以符合项目架构并避免常见反模式。

## 1. 生成前决策流程

### 1.1 任务分类检查与触发词（AI 必执行）

在动笔前，先判断任务是否涉及以下场景。**用户若使用下列关键词，可直接判定为「程序化渲染」场景**，必须执行 §1.2 决策：

| 用户/任务可能表述                  | 判定为                 | 必执行 |
| ---------------------------------- | ---------------------- | ------ |
| contentRenderer、Dialog 自定义内容 | Dialog contentRenderer | §1.2   |
| props.render、自定义渲染           | Programmatic render    | §1.2   |

**黄金样本（必须参考模仿）**：见 `docs/ai-specs/GOLDEN_SAMPLES/` 中与当前任务类型匹配的样本。

### 1.1a 任务分类检查表

在动笔前，判断任务是否涉及以下场景：

| 场景                                                  | 涉及？ | 若涉及，必读规范                                                      |
| ----------------------------------------------------- | ------ | --------------------------------------------------------------------- |
| Dialog 自定义内容（contentRenderer / headerRenderer） | □      | `DIALOG_COMPONENT.md`、`24-tsx-rendering.mdc`                         |
| PrimeVue 组件（下拉/日期/抽屉等）                     | □      | `PRIMEVUE_V4_API.md`（禁止 v3 弃用名，以 https://primevue.org/ 为准） |
| 图表                                                  | □      | `ECHARTS_THEME.md`、`18-components-and-icons.mdc`                     |
| 布局 / 路由 / 鉴权                                    | □      | `PROJECT_PROTOCOL.md`、`ADAPTIVE_LAYOUT.md`、`AUTH_AND_LOGIN_FLOW.md` |

### 1.2 TSX 与 lang 决策（涉及程序化渲染时必执行）

当任务涉及 **body / formatter / headerRenderer / filterRenderer / editorRenderer / contentRenderer / customFooter** 等需要返回 VNode 的场景时：

1. **执行** `.cursor/rules/27-ai-tsx-decision.mdc` 中的因果规则。
2. **确定**：使用 `lang="tsx"` 或独立 `.tsx` 文件。
3. **禁止**：`return \`<span class="${cls}">${row.status}</span>\``（模板字符串不是 VNode）。
4. **必须**：`return <span class={\`font-semibold ${cls}\`}>{row.status}</span>`（TSX 返回 VNode）。
5. **若在 .vue 内写 JSX**：必须将 `lang="ts"` 改为 `lang="tsx"`。

### 1.3 必读规范索引（按任务类型）

| 任务类型                                       | 必读                                                         |
| ---------------------------------------------- | ------------------------------------------------------------ |
| Dialog 自定义内容                              | `DIALOG_COMPONENT.md`、`24-tsx-rendering.mdc`                |
| PrimeVue 组件（Select、DatePicker、Drawer 等） | `PRIMEVUE_V4_API.md`、`GOLDEN_SAMPLES/PrimeVueFormBasic.vue` |
| 图表                                           | `ECHARTS_THEME.md`、`18-components-and-icons.mdc`            |
| 通用 UI                                        | `PROJECT_PROTOCOL.md`、`00-core-architecture.mdc`            |

## 2. 生成后自检清单

### 2.1 涉及 DataTable / 表格列

（已移除旧表格组件相关自检项）

### 2.2 涉及 Dialog / Slot

- [ ] 是否有 `contentRenderer` / `headerRenderer` 等返回 VNode 的函数？
- [ ] 若有 → 是否使用 TSX（JSX）而非 `h()` 或模板字符串？
- [ ] 对应 .vue 是否使用 `lang="tsx"`？

### 2.3 涉及 SchemaForm

（已移除旧表单组件相关自检项）

### 2.4 通用

- [ ] 是否遵循 `docs/ai-specs/PROJECT_PROTOCOL.md` 与 `00-core-architecture.mdc`？
- [ ] 是否使用 UnoCSS 语义类，无硬编码 px/hex？
- [ ] 类型是否显式注解（无隐式推断）？

## 3. 黄金样本索引

（已移除旧表格/表单黄金样本条目；请按当前仓库保留的 GOLDEN_SAMPLES 自行选择对应样本）

## 4. 规范引用链

```
AI_CODING_PROTOCOL.md（本文档）
    ├── 决策流程、自检清单
    └── 引用
        ├── .cursor/rules/27-ai-tsx-decision.mdc（TSX 决策、lang 切换、VNode vs string）
        ├── .cursor/rules/24-tsx-rendering.mdc（TSX 策略、何时用 TSX）
        ├── docs/ai-specs/DIALOG_COMPONENT.md
        └── docs/ai-specs/PROJECT_PROTOCOL.md
```

## 5a. 用户提示词建议（提升任务识别率）

用户若在提问时使用以下关键词，AI 更易识别为「程序化渲染」并自动执行协议：

- 「自定义列」「列 body」「列渲染」「status 列带样式」「表格列带 badge/tag/颜色」
- 「filterRenderer」「列筛选器自定义」「contentRenderer」「Dialog 自定义内容」

## 6. 冲突时的优先级

当规则冲突时，按以下顺序优先：

1. **程序化渲染（VNode）**：`27-ai-tsx-decision.mdc`、`24-tsx-rendering.mdc` 优先于默认 `lang="ts"`。
2. **通用 Vue 约定**：`PROJECT_PROTOCOL.md`、`00-core-architecture.mdc`。
