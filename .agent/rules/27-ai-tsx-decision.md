---
description: AI TSX decision rules — TSX/lang switch, VNode vs template string forbidden
globs: src/**/*.{vue,tsx}
alwaysApply: true
---

# AI TSX Decision Rules (Must Follow)

## 1. Causal Rules (MUST follow)

- **R1**: If script contains JSX syntax (`<Tag>` / `<>` / `{expr}` in JSX context), the file MUST use `lang="tsx"` or JSX will not compile.
- **R2**: When body/formatter/headerRenderer/filterRenderer/editorRenderer/contentRenderer/customFooter need to return **VNode**, use TSX/JSX; FORBIDDEN template string `return \`<tag>...\`` (returns string, not VNode).
- **R3**: When returning plain string only (e.g. `row.name`, \`¥${x}\`), keep `lang="ts"`.

## 2. Triggers (consider TSX + lang switch when these appear)

When returning styled DOM or VNode, MUST use TSX and ensure `lang="tsx"` or standalone `.tsx`:

| Trigger                         | Description            | If returning VNode                  |
| ------------------------------- | ---------------------- | ----------------------------------- |
| `body`                          | DataTable column cell  | Use JSX, not `return \`<span>...\`` |
| `headerRenderer`                | Custom header          | Use JSX                             |
| `filterRenderer`                | Column filter          | Use JSX                             |
| `editorRenderer`                | Editable column editor | Use JSX                             |
| `contentRenderer`               | Dialog content         | Use JSX                             |
| `customFooter`                  | Column footer          | Use JSX                             |
| `v-slot` dynamic content        | Dynamic slot           | Use JSX                             |
| Render function returning VNode | Any                    | Use JSX                             |

## 3. VNode vs String

| Return form                                            | Type                   | VNode? | Need lang="tsx"? |
| ------------------------------------------------------ | ---------------------- | ------ | ---------------- |
| `return row.name`                                      | string                 | No     | No               |
| `return \`¥${row.amount}\``                            | string                 | No     | No               |
| `return <span>{row.name}</span>`                       | VNode                  | Yes    | **Yes**          |
| `return <Tag class={cls}>{row.x}</Tag>`                | VNode                  | Yes    | **Yes**          |
| `return \`<span class="${cls}">${row.status}</span>\`` | **string** (not VNode) | No     | Wrong            |

## 4. Forbidden

- ❌ `body: row => return \`<span class="${cls}">${row.status}</span>\`` — template string returns string, not VNode; table won't render correctly.
- ❌ Using JSX syntax but keeping `lang="ts"` — JSX won't compile.
- ❌ `return "<span>" + x + "</span>"` — string concat, not VNode.
- ❌ Using `h()` to build VNode — MUST use TSX; see `.cursor/rules/24-tsx-rendering.mdc`.

## 5. Correct Examples

```tsx
// In .vue: MUST use <script setup lang="tsx">
body: row => <span class={`font-semibold ${cls}`}>{row.status}</span>

// Or
body: row => {
  const cls = row.status === 'active' ? 'text-success' : 'text-muted-foreground'
  return <span class={cls}>{statusMap[row.status]}</span>
}
```

## 6. Golden Samples (MUST reference and mimic)

- **DataTable column body**: `docs/ai-specs/GOLDEN_SAMPLES/DataTableBodyColumn.vue` — has `lang="tsx"`, correct body JSX
- **Full column config**: `src/views/example/data-table/configs/customColumnConfig.tsx` — body, filterRenderer, customFooter
- **PrimeVue in body/filterRenderer** (Select, MultiSelect, etc.): also reference `docs/ai-specs/PRIMEVUE_V4_API.md`, use v4 names (Select not Dropdown, DatePicker not Calendar)

## 7. lang Switch Table

| Action                                        | Current     | Change                                       |
| --------------------------------------------- | ----------- | -------------------------------------------- |
| Add `body: row => <span>...</span>`           | `lang="ts"` | **Change to** `lang="tsx"`                   |
| Add `filterRenderer: () => <Select />`        | `lang="ts"` | **Change to** `lang="tsx"`                   |
| Add `contentRenderer: () => <div>...</div>`   | `lang="ts"` | **Change to** `lang="tsx"`                   |
| Column config in standalone `configs/xxx.tsx` | —           | .tsx supports JSX; .vue can keep `lang="ts"` |
| Only `body: row => row.name` or \`¥${...}\``  | `lang="ts"` | Keep, no switch needed                       |
