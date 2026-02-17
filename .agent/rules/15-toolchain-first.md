---
description: 工具链优先：必备工具查找表 (Mandatory Lookup)
globs: **/*.ts, **/*.vue, **/*.tsx
alwaysApply: true
---

# 工具链优先策略

在实现逻辑之前，请查看此映射。**如果这里存在，你必须使用它。**

## 1. 网络与数据

- **HTTP**：`src/hooks/modules/useHttpRequest.ts`
- **连接**：`src/utils/http/connection.ts`（网络状态、重连）
- **上传**：`src/utils/http/uploadManager.ts`（分片、暂停/恢复）
- **安全存储**：`src/utils/safeStorage`（加密、持久化）

## 2. UI 与交互

- **对话框**：`src/hooks/modules/useDialog.tsx`（确认、警告、自定义）
- **全屏**：`src/hooks/layout/useFull.ts`
- **加载**：`src/hooks/layout/useLoading.ts`
- **主题**：`src/hooks/modules/useThemeSwitch.ts`
- **语言**：`src/hooks/modules/useLocale.ts`
- **元素尺寸**：`src/hooks/modules/useAppElementSize.ts`

## 3. 可视化

- **ECharts 主题**：`src/hooks/modules/useChartTheme/`（自动主题化）

## 4. 工具

- **日期/时间**：`src/hooks/modules/useDateUtils.ts`
- **事件**：`src/utils/mitt.ts`（全局事件总线）
- **Lodash**：`src/utils/lodashes.ts`（深克隆/合并）
- **ID**：`src/utils/ids.ts`
- **设备**：`src/utils/deviceSync.ts`（挂载前检测）

## 5. Schema-Form（表单 Schema 相关任务必查）

- **useSchemaForm**：`src/hooks/modules/useSchemaForm.ts` — Schema 与 formValues 状态管理（addField/removeField/updateField/moveField 等）
- **SchemaForm 组件**：`src/components/SchemaForm` — Schema 驱动表单渲染
- **Hooks**：`src/components/SchemaForm/hooks/` — useFormSync、useFormActions、useFormMemory、useLayout、useValidation、usePersistence、useSteps、useSubmit、useLifecycle
- 详见 `docs/SCHEMA_FORM_COMPONENT.md`

## 5a. DataTable 列持久化（表格列配置相关任务必查）

- **useTablePersistence**：`src/hooks/modules/useTablePersistence.ts` — DataTable 列顺序/列宽/隐藏列持久化
- 配合 `tableId` 使用，数据存于 `src/stores/modules/dataTable.ts`；详见 `docs/DataTable_COMPONENT.md`

## 6. 方法查找工作流

需要方法时：

1. 查找：`src/components/SchemaForm/hooks/`（如果与 SchemaForm 相关）+ `src/utils/`
2. 找到 → 直接使用。未找到 → 分析是否适合全局复用。
3. 输出分析（目的、全局 vs 本地、推荐位置）。
4. 询问用户："添加到 utils/hooks，还是保留在使用位置？" — 等待决定。
