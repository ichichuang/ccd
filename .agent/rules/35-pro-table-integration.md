---
description: ProTable V1.0 integration guardrails (SSOT + E2E generics + dual-engine + clean view layer)
globs: src/**/*.{vue,ts,tsx}
alwaysApply: false
---

<rule>
  <context>
    ProTable V1.0 is finalized. This rule defines strict, constraint-driven guardrails for all future AI-generated/AI-modified ProTable code.
    Legacy patterns (inline magic numbers, missing generics, `any`, and mixed-engine rendering) are forbidden.
  </context>

  <constraints>
    <section name="ssot-mandate-config-ts-only">
      <rule>
        [SSOT REQUIRED] Never hardcode magic numbers or fallback strings in views/components/columns:
        page sizes, page size options, debounce timings, virtual row heights, overscan, infinite-scroll thresholds, fixed-height fallbacks, selection column widths, grid column fallbacks, etc.
      </rule>
      <rule>
        You MUST import defaults from <code>src/components/ProTable/engine/config.ts</code> and use them verbatim:
        <code>PRO_TABLE_PROPS_DEFAULTS</code> / <code>PAGINATION_DEFAULTS</code> / <code>SORT_DEFAULTS</code> /
        <code>FILTER_DEFAULTS</code> / <code>INFINITE_SCROLL_DEFAULTS</code> / <code>VIRTUAL_GRID_DEFAULTS</code> /
        <code>TOOLBAR_DEFAULTS</code> / <code>UI_DEFAULTS</code>.
      </rule>
      <rule>
        Never replace SSOT usage with “equivalent numbers” (e.g. writing 10/20/50/100 directly, or 48px row height).
        If a value exists in config.ts, use that value.
      </rule>
    </section>

    <section name="e2e-generic-propagation-no-any">
      <rule>
        [E2E GENERICS REQUIRED] Any ProTable wrapper / view-layer integration component MUST use:
        <code>&lt;script setup lang="ts" generic="T extends Record&lt;string, unknown&gt;"&gt;</code>.
      </rule>
      <rule>
        Columns and data MUST be strictly typed:
        <code>ProTableColumn&lt;T&gt;[]</code> for columns and <code>T[]</code> for data arrays.
        Never use <code>any</code> (including <code>as any</code>) in ProTable-related code.
      </rule>
      <rule>
        Do not degrade generics to <code>Record&lt;string, unknown&gt;</code> “for convenience” in views.
        The view must preserve the domain row type end-to-end.
      </rule>
    </section>

    <section name="dual-engine-awareness-virtualScroll-vs-standard">
      <rule>
        [DUAL-ENGINE AWARENESS] ProTable has two rendering paradigms:
        - Standard mode: PrimeVue DataTable (slot-based, Column templates, DataTable events)
        - <code>virtualScroll</code> mode: Virtual Grid engine (<code>@tanstack/vue-virtual</code>) via <code>VirtualGridRenderer.vue</code>
      </rule>
      <rule>
        Never mix paradigms. If <code>virtualScroll</code> is enabled:
        - Do not render PrimeVue DataTable-specific UI branches
        - Do not render pagination UI (mutual exclusion)
        - Ensure the controller remains the single source of processed rows (use <code>TableController.processedRows</code>)
      </rule>
      <rule>
        In standard mode (PrimeVue DataTable), do not copy Virtual Grid assumptions (row height, overscan, grid templates) into DataTable code paths.
      </rule>
    </section>

    <section name="clean-view-layer-props-and-types">
      <rule>
        [CLEAN VIEW LAYER] Never write large inline prop interfaces for ProTable in views/components.
        Prefer importing the canonical types/props from engine:
        <code>src/components/ProTable/engine/types/props.ts</code> and <code>src/components/ProTable/engine/types/column.ts</code>.
      </rule>
      <rule>
        When a reusable prop shape exists (e.g. <code>ProTableProps&lt;T&gt;</code>), use it instead of re-declaring.
      </rule>
    </section>

  </constraints>

  <communication>
    Output Requirement: When explaining or changing ProTable-related code, explicitly state:
    - which guardrail is being applied (SSOT / generics / dual-engine / clean view layer)
    - which legacy anti-pattern is forbidden and the correct replacement
    Keep file paths, type names, keys, and import statements in English for copy/paste.
  </communication>
</rule>
