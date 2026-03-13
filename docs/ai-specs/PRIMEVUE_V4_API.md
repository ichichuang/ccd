# PrimeVue v4 API 规范 (SSOT)

> **目标读者：AI**。本项目使用 **PrimeVue v4**，AI 生成 PrimeVue 相关代码时**必须以 https://primevue.org/ 最新文档为准**，禁止使用 v3 已废弃的组件名与 API。

## 1. 版本约束

- **本项目 PrimeVue 版本**：v4.x（见 `package.json`）
- **官方文档**：https://primevue.org/（v4 文档）
- **禁止**：参考 v3 文档（https://v3.primevue.org/）或使用 v3 API

## 2. v3 → v4 组件名映射（必用 v4）

| v3（已弃用，禁止使用） | v4（必须使用） | 说明                                                                 |
| ---------------------- | -------------- | -------------------------------------------------------------------- |
| `Dropdown`             | `Select`       | 下拉选择，`import Select from 'primevue/select'`                     |
| `Calendar`             | `DatePicker`   | 日期选择，`import DatePicker from 'primevue/datepicker'`             |
| `InputSwitch`          | `ToggleSwitch` | 开关，`import ToggleSwitch from 'primevue/toggleswitch'`             |
| `Sidebar`              | `Drawer`       | 侧边抽屉（PrimeVue overlay），`import Drawer from 'primevue/drawer'` |
| `OverlayPanel`         | `Popover`      | 悬浮面板，`import Popover from 'primevue/popover'`                   |

**注意**：项目自定义组件 `AdminSidebar`（`src/layouts/components/admin/AdminSidebar.tsx`）与 PrimeVue 的 Sidebar/Drawer 无关，无需替换。

## 3. v4 已废弃组件（禁止使用）

以下 v3 组件在 v4 中已废弃，需用替代方案：

| 已废弃              | 替代方案                                     |
| ------------------- | -------------------------------------------- |
| Chips               | AutoComplete + `multiple` + `typeahead` 关闭 |
| TabMenu             | Tabs（无 panels）                            |
| Steps               | Stepper（无 panels）                         |
| InlineMessage       | Message 组件                                 |
| BadgeDirective      | OverlayBadge                                 |
| TabView             | 新版 Tabs 组件                               |
| Accordion（旧用法） | AccordionHeader + AccordionContent           |

## 4. 正确组件名速查（v4）

**表单相关**：`InputText`、`Password`、`InputNumber`、`Checkbox`、`RadioButton`、**`Select`**、`MultiSelect`、**`DatePicker`**、**`ToggleSwitch`**、`CascadeSelect`、`TreeSelect`、`ColorPicker`、`Slider`

**弹窗/浮层**：`Dialog`、**`Drawer`**、**`Popover`**

**其他**：`Button`、`Menu`、`Menubar`、`Toast`、`ConfirmPopup`、`ConfirmDialog`

## 5. 生成 PrimeVue 代码前的必读

1. 查阅 https://primevue.org/ 对应组件页面的 API、Props、Events。
2. 使用 v4 组件名，禁止 `Dropdown`、`Calendar`、`InputSwitch`、`Sidebar`、`OverlayPanel`。
3. PassThrough（`pt`）在 v4 中有变更（`pc` 前缀等），参考组件文档的 Pass Through 部分。
4. 主题与样式：见 `./PRIMEVUE_THEME.md`。

## 6. 参考

- PrimeVue v4 迁移指南：https://primevue.org/guides/migration/v4/
- 组件列表：https://primevue.org/
