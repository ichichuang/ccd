---
description: Schema-First policy; configs-first for complex UI
globs: src/views/**/*.{vue,ts,tsx}, src/components/**/*.{vue,tsx}
alwaysApply: true
---

<rule>
  <context>
    This rule enforces schema-driven development for forms and data tables.
    For non-trivial forms and tables, the schema is the source of truth for structure; page-level views must not manually compose individual fields or columns.
  </context>

  <workflow>
    <step>Place reusable schemas and column configs in dedicated config files (for example <code>schemas/*.ts</code>, <code>configs/*.tsx</code>) or as typed constants in the same file, not inline in templates.</step>
    <step>For complex cells, supply TSX render functions (for example <code>body</code> / <code>render</code>) in the column config instead of using inline template slots.</step>
  </workflow>

  <constraints>
    <rule>Standardize <code>FormSchemaItem</code> / <code>SchemaColumnsItem</code> fields such as <code>dependsOn</code>, <code>vIf</code>, and <code>options</code> to express conditional visibility and dynamic options.</rule>
  </constraints>

  <forbidden>
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
