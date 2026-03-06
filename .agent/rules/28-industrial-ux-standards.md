---
description: Industrial UX checklist for new/updated Vue pages and components
globs: src/views/**/*.vue, src/components/**/*.vue
---

<rule>
  <context>
    This rule enforces industrial-grade UX quality for all Vue pages and UI components.
    It complements <file>docs/ai-specs/INDUSTRIAL_UX_DESIGN_SYSTEM.md</file> and <file>docs/ai-specs/EMPTY_STATE_AND_ROBUSTNESS.md</file> and must be applied before outputting any UI code.
  </context>

  <constraints>
    <section name="layout-check">
      <rule>Wrap top-level pages in a full-height, column-based layout (for example using classes like <code>h-full flex flex-col overflow-hidden</code> or the project’s layout shell) so that toolbars do not scroll with content.</rule>
      <rule>Treat toolbars and headers as non-flexing regions (for example <code>shrink-0</code>), and localize scroll behavior to the main content body via a flex region (for example <code>flex-1 min-h-0</code> with <code>&lt;CScrollbar&gt;</code>).</rule>
    </section>

    <section name="color-check">
      <rule>Do not use raw Tailwind-like color classes such as <code>text-red-500</code> or <code>bg-blue-500</code>; always use semantic tokens such as <code>text-danger</code>, <code>text-success</code>, <code>text-primary</code>, <code>text-muted-foreground</code> as defined in the theme system.</rule>
    </section>

    <section name="empty-and-loading-check">
      <rule>For any page that fetches data, include both a loading state (for example a skeleton or spinner) and an empty state.</rule>
      <rule>For empty states, use the <code>&lt;EmptyState&gt;</code> component (icon + title + description) or a DataTable <code>#empty</code> slot that follows the same structure, choosing icons and copy according to <file>EMPTY_STATE_AND_ROBUSTNESS.md</file>.</rule>
      <rule>Avoid the “double-blank” anti-pattern (an empty table header plus a single floating text line); always use a structured empty state.</rule>
    </section>

    <section name="primevue-polish">
      <rule>Ensure DataTables follow project styling guidelines (for example dense rows, striped styling where appropriate) and align numeric columns to the right.</rule>
      <rule>Ensure tab headers use icons where the design system expects them.</rule>
    </section>

    <section name="feedback-check">
      <rule>Protect destructive actions with confirmation dialogs (for example via <code>useDialog()</code> or confirm flows) instead of performing them immediately.</rule>
      <rule>Configure toast error messages with sufficient display time (for example longer <code>life</code> values like 8000ms) so users can read them.</rule>
    </section>

    <section name="empty-state-i18n">
      <rule>Do not hardcode empty-state titles and descriptions; always use localized keys such as <code>$t('emptyState.*')</code> or equivalent locale entries.</rule>
    </section>

  </constraints>

  <forbidden>
    <item>Pages without proper scroll containment (for example entire window scrolling including toolbars) when a layout shell with local scroll is expected.</item>
    <item>Using raw color utilities instead of semantic color tokens.</item>
    <item>Data-fetching pages that lack either loading or empty states.</item>
    <item>Hardcoded empty-state texts that bypass the i18n system.</item>
  </forbidden>

  <communication>
    Output Requirement: Always explain industrial UX decisions, layout shells, empty/loading handling, and feedback behaviors to the user in fluent Chinese, while keeping class names, token names, and API calls in English.
  </communication>

  <examples>
    <example>
      Before returning a new list page, verify that it has a fixed toolbar region, a scrollable content region wrapped in <code>&lt;CScrollbar&gt;</code>, a loading skeleton, and an <code>&lt;EmptyState&gt;</code> for no-data scenarios, all with localized copy.
    </example>
  </examples>
</rule>
