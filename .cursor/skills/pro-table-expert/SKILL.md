---
name: pro-table-expert
description: "ProTable 组件的终极使用指南。当用户要求生成、修改或解释表格时，必须严格遵循此配置驱动（Config-Driven）的黑盒模式。"
---

# 🛡️ SKILL: ProTable Expert & Architect

## 🎯 The Core Philosophy (Absolute Blackbox)

The `ProTable` in this project is a highly autonomous, **Config-Driven (Low-Code)** engine.
It handles its own HTTP requests, pagination state, loading UI, error handling, and parameter formatting.
**CRITICAL RULE:** You must NEVER write manual data fetching logic, `ref(loading)`, `ref(total)`, or `ref(data)` in the consumer view. The view is strictly a configuration layer.

## 📐 The Golden Signature (Template)

When generating a table, use this exact syntax as the baseline:

```vue
<template>
  <section class="col-fill min-h-0">
    <ProTable
      api-url="/your/api/endpoint"
      data-key="records"
      total-key="total"
      row-key="id"
      :columns="tableColumns"
    >
      <template #toolbar-left>
        <Button label="新增" icon="i-ph:plus-bold" @click="handleCreate" />
      </template>
    </ProTable>
  </section>
</template>
```

## 🧠 Property Definitions (You MUST understand these)

**api-url (string):** The REST endpoint. Always use this instead of `:api` or `:request`. The ProTable engine will directly execute the HTTP call using `@/utils/http`.

**api-method (string):** Defaults to `'GET'`. Change to `'POST'` if the backend uses POST for complex search payloads.

**data-key (string):** The lodash path to extract the array from the JSON response. (e.g., `"users"`, `"data.records"`, `"list"`).

**total-key (string):** The lodash path to extract the total count. (e.g., `"total"`, `"data.total"`).

**row-key (string):** The unique identifier for Vue rendering and selection (e.g., `"id"`, `"code"`).

**api-config (object):** Pass `{ headers: {...}, enableCache: true }` if custom Axios/Alova config is strictly required.

## 🚫 Strict Guardrails (What YOU MUST NOT DO)

**NO API GLUE CODE:** Do NOT create files in `src/api/` just to fetch table lists. The `api-url` prop replaces the need for standard GET list functions.

**NO MANUAL STATE:** Do NOT use `const tableData = ref([])` or `const loading = ref(false)`. The engine handles it.

**NO PARAMETER MAPPING:** Do NOT map page/pageSize to skip/limit in the view. If the backend needs a specific format, remind the user to update `src/components/ProTable/engine/config/apiAdapter.ts`.

**NO ROOT col-fill ABUSE:** The `<section class="col-fill min-h-0">` wrapper is standard for making the table fill the remaining page height. Never place `col-fill` on the root node of the page layout.

## 🛠️ Infinite Scroll Mode

If the user specifically requests "Infinite Scroll" instead of pagination, use:

```vue
<ProTable
  api-url="/your/api/endpoint"
  data-key="records"
  :infinite-scroll="true"
  :pagination="false"
  :request-config="{ accumulate: true }"
/>
```

**Instruction Acknowledgement:** When using this skill, analyze the user's DTO or backend response structure to perfectly guess the `data-key`, `total-key`, and `row-key`. Provide zero boilerplate.

## 🏷️ Enum & Tag Rendering (Zero-TSX Rule)
When the user's data structure includes a status or type field (e.g., `status: 0 | 1`), you **MUST NOT** use a `render` function to return tags.
Instead, strictly use the declarative `valueEnum` property inside the column configuration:

```typescript
{
  field: 'status',
  title: 'Status',
  valueEnum: {
    1: { label: 'Active', severity: 'success' },
    0: { label: 'Disabled', severity: 'danger' }
  }
}
