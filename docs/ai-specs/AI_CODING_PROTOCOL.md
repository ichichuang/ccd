# AI 编码协议（AI Coding Protocol）

> **目标读者：AI**。生成或修改代码前，AI 必须执行本协议中的决策流程与自检清单，以符合项目架构并避免常见反模式。

## 1. 生成前决策流程

### 1.1 任务分类检查与触发词（AI 必执行）

在动笔前，先判断任务是否涉及以下场景。**用户若使用下列关键词，可直接判定为「程序化渲染」场景**，必须执行 §1.2 决策：

| 用户/任务可能表述                                              | 判定为                   | 必执行              |
| -------------------------------------------------------------- | ------------------------ | ------------------- |
| 自定义列、列 body、列渲染、status 列带样式、表格列带 badge/tag | DataTable body           | §1.2 + 参考黄金样本 |
| filterRenderer、列筛选器自定义                                 | DataTable filterRenderer | §1.2                |
| contentRenderer、Dialog 自定义内容                             | Dialog contentRenderer   | §1.2                |
| props.render、SchemaForm 自定义渲染                            | SchemaForm render        | §1.2                |

**黄金样本（必须参考模仿）**：

- **DataTable 列 body**：`docs/ai-specs/GOLDEN_SAMPLES/DataTableBodyColumn.vue` — 含 `lang="tsx"`、正确 body JSX 写法
- **完整示例**：`src/views/example/DataTable/configs/customColumnConfig.tsx` — 含 body、filterRenderer、customFooter

### 1.1a 任务分类检查表

在动笔前，判断任务是否涉及以下场景：

| 场景                                                                 | 涉及？ | 若涉及，必读规范                                                                            |
| -------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------- |
| DataTable 表格列自定义渲染（body / filterRenderer / editorRenderer） | □      | `DataTable_COMPONENT.md` §7、`.cursor/rules/24-tsx-rendering.mdc`、`27-ai-tsx-decision.mdc` |
| Dialog 自定义内容（contentRenderer / headerRenderer）                | □      | `DIALOG_COMPONENT.md`、`24-tsx-rendering.mdc`                                               |
| SchemaForm 自定义渲染（props.render）                                | □      | `SCHEMA_FORM_COMPONENT.md`、`24-tsx-rendering.mdc`                                          |
| PrimeVue 组件（下拉/日期/抽屉等）                                    | □      | `PRIMEVUE_V4_API.md`（禁止 v3 弃用名，以 https://primevue.org/ 为准）                       |
| 图表                                                                 | □      | `ECHARTS_THEME.md`、`18-components-and-icons.mdc`                                           |
| 多字段表单                                                           | □      | `SCHEMA_FORM_COMPONENT.md`                                                                  |
| 布局 / 路由 / 鉴权                                                   | □      | `PROJECT_PROTOCOL.md`、`ADAPTIVE_LAYOUT.md`、`AUTH_AND_LOGIN_FLOW.md`                       |

### 1.2 TSX 与 lang 决策（涉及程序化渲染时必执行）

当任务涉及 **body / formatter / headerRenderer / filterRenderer / editorRenderer / contentRenderer / customFooter** 等需要返回 VNode 的场景时：

1. **执行** `.cursor/rules/27-ai-tsx-decision.mdc` 中的因果规则。
2. **确定**：使用 `lang="tsx"` 或独立 `.tsx` 文件。
3. **禁止**：`return \`<span class="${cls}">${row.status}</span>\``（模板字符串不是 VNode）。
4. **必须**：`return <span class={\`font-semibold ${cls}\`}>{row.status}</span>`（TSX 返回 VNode）。
5. **若在 .vue 内写 JSX**：必须将 `lang="ts"` 改为 `lang="tsx"`。

### 1.3 必读规范索引（按任务类型）

| 任务类型                                       | 必读                                                                                                                    |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| 表格列 body / renderer                         | `GOLDEN_SAMPLES/DataTableBodyColumn.vue`、`DataTable_COMPONENT.md` §7、`24-tsx-rendering.mdc`、`27-ai-tsx-decision.mdc` |
| Dialog 自定义内容                              | `DIALOG_COMPONENT.md`、`24-tsx-rendering.mdc`                                                                           |
| SchemaForm 自定义                              | `SCHEMA_FORM_COMPONENT.md`、`24-tsx-rendering.mdc`                                                                      |
| PrimeVue 组件（Select、DatePicker、Drawer 等） | `PRIMEVUE_V4_API.md`、`GOLDEN_SAMPLES/PrimeVueFormBasic.vue`                                                            |
| 图表                                           | `ECHARTS_THEME.md`、`18-components-and-icons.mdc`                                                                       |
| 表单                                           | `SCHEMA_FORM_COMPONENT.md`                                                                                              |
| 通用 UI                                        | `PROJECT_PROTOCOL.md`、`00-core-architecture.mdc`                                                                       |

## 2. 生成后自检清单

### 2.1 涉及 DataTable / 表格列

- [ ] 列是否有 `body` / `filterRenderer` / `editorRenderer` / `customFooter`？
- [ ] 若有且需返回带样式的 DOM（非纯文本）→ 是否用 JSX 返回 VNode？
- [ ] 是否避免 `return \`<tag>...\`` 这种模板字符串写法？
- [ ] 若在 .vue 内写 JSX → 是否已设为 `lang="tsx"`？
- [ ] 若列配置在独立文件 → 是否为 `.tsx` 且使用正确 JSX 语法？

### 2.2 涉及 Dialog / Slot

- [ ] 是否有 `contentRenderer` / `headerRenderer` 等返回 VNode 的函数？
- [ ] 若有 → 是否使用 TSX（JSX）而非 `h()` 或模板字符串？
- [ ] 对应 .vue 是否使用 `lang="tsx"`？

### 2.3 涉及 SchemaForm

- [ ] 是否有 `props.render` 等自定义渲染？
- [ ] 若有且返回 VNode → 是否用 TSX，且所在文件为 `lang="tsx"`？

### 2.4 通用

- [ ] 是否遵循 `docs/ai-specs/PROJECT_PROTOCOL.md` 与 `00-core-architecture.mdc`？
- [ ] 是否使用 UnoCSS 语义类，无硬编码 px/hex？
- [ ] 类型是否显式注解（无隐式推断）？

## 3. 黄金样本索引（DataTable 列 body 必模仿）

| 场景                               | 黄金样本路径                                                 | 关键点                                        |
| ---------------------------------- | ------------------------------------------------------------ | --------------------------------------------- |
| DataTable 列 body 自定义           | `docs/ai-specs/GOLDEN_SAMPLES/DataTableBodyColumn.vue`       | `lang="tsx"`、`body: row => <span>...</span>` |
| 完整列配置（含 filterRenderer 等） | `src/views/example/DataTable/configs/customColumnConfig.tsx` | 独立 .tsx 文件，全部 JSX 语法                 |

## 4. 规范引用链

```
AI_CODING_PROTOCOL.md（本文档）
    ├── 决策流程、自检清单
    └── 引用
        ├── .cursor/rules/27-ai-tsx-decision.mdc（TSX 决策、lang 切换、VNode vs string）
        ├── .cursor/rules/24-tsx-rendering.mdc（TSX 策略、何时用 TSX）
        ├── docs/ai-specs/DataTable_COMPONENT.md
        ├── docs/ai-specs/DIALOG_COMPONENT.md
        ├── docs/ai-specs/SCHEMA_FORM_COMPONENT.md
        └── docs/ai-specs/PROJECT_PROTOCOL.md
```

## 5a. 用户提示词建议（提升任务识别率）

用户若在提问时使用以下关键词，AI 更易识别为「程序化渲染」并自动执行协议：

- 「自定义列」「列 body」「列渲染」「status 列带样式」「表格列带 badge/tag/颜色」
- 「filterRenderer」「列筛选器自定义」「contentRenderer」「Dialog 自定义内容」

## 6. 冲突时的优先级

当规则冲突时，按以下顺序优先：

1. **程序化渲染（VNode）**：`27-ai-tsx-decision.mdc`、`24-tsx-rendering.mdc` 优先于默认 `lang="ts"`。
2. **DataTable 列**：`DataTable_COMPONENT.md` 优先。
3. **通用 Vue 约定**：`PROJECT_PROTOCOL.md`、`00-core-architecture.mdc`。
