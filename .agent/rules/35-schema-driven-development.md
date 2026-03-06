---
description: Schema-First policy; enforce SchemaForm and DataTable/DataTableV2 usage
globs: src/views/**/*.{vue,ts,tsx}, src/components/**/*.{vue,tsx}
alwaysApply: true
---

<rule>
  <context>
    This rule enforces schema-driven development for forms and data tables.
    For non-trivial forms and tables, the schema is the source of truth for structure; page-level views must not manually compose individual fields or columns.
  </context>

  <workflow>
    <step>When building a form with more than trivial 1–2 fields, define a <code>SchemaForm</code> schema object (columns, layout, rules, options) and use <code>SchemaForm</code> + <code>useSchemaForm</code> instead of hand-writing fields.</step>
    <step>When building a data table with interactive features (pagination, sorting, filtering, export, API integration), define a <code>DataTable</code> or <code>DataTableV2</code> column config array and use the project DataTable components.</step>
    <step>Place reusable schemas and column configs in dedicated config files (for example <code>schemas/*.ts</code>, <code>configs/*.tsx</code>) or as typed constants in the same file, not inline in templates.</step>
    <step>For complex cells, supply TSX render functions (for example <code>body</code> / <code>render</code>) in the column config instead of using inline template slots.</step>
  </workflow>

  <constraints>
    <rule>Use SchemaForm for multi-field forms that require validation, steps, sections, or dynamic behavior; keep page-level views thin.</rule>
    <rule>Use DataTable/DataTableV2 for interactive tables with API integration and persistence; avoid building such behavior directly on top of raw PrimeVue DataTable or <code>&lt;table&gt;</code>.</rule>
    <rule>Standardize <code>FormSchemaItem</code> / <code>SchemaColumnsItem</code> fields such as <code>dependsOn</code>, <code>vIf</code>, and <code>options</code> to express conditional visibility and dynamic options.</rule>
    <rule>Standardize <code>DataTableColumn&lt;T&gt;</code> usage with <code>field</code>, <code>header</code>, <code>width</code>, <code>render</code>, and optional <code>rowActions</code>.</rule>
  </constraints>

  <forbidden>
    <item>Manually composing PrimeVue <code>&lt;Column&gt;</code> loops for each field in page-level views when a schema can express the table.</item>
    <item>Manually composing multiple <code>&lt;InputText&gt;</code>, <code>&lt;Select&gt;</code>, and other fields for large forms instead of using SchemaForm.</item>
    <item>Using template slots like <code>&lt;template #body&gt;</code> when an equivalent TSX <code>render</code>/<code>body</code> function can be plugged into column config.</item>
  </forbidden>

  <communication>
    Output Requirement: Always respond to the user, write code comments, and generate CLI/git logs in fluent Chinese when explaining schema-driven designs, while keeping type names, interfaces, and code snippets in their original language.
  </communication>

  <examples>
    <example>
      Schema columns (<code>SchemaColumnsItem</code> / <code>FormSchemaItem</code>) should use <code>dependsOn</code>, <code>vIf</code>, and <code>options</code> rather than template <code>v-if</code> or ad-hoc option loading.
    </example>
    <example>
      A complex user management table should define its columns in <code>src/views/example/user-management/configs/userColumns.tsx</code> with TSX <code>render</code> functions, and the page view should simply consume this config.
    </example>
  </examples>
</rule>
