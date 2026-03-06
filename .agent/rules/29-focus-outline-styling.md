---
description: Modern focus styling with :focus-visible + ring; forbid outline/outline-none
globs: src/**/*.{vue,ts,tsx}
alwaysApply: true
---

<rule>
  <context>
    This rule defines modern focus styling for keyboard accessibility.
    Focus indication must use <code>:focus-visible</code> and semantic ring tokens, not browser default outlines or outline suppression.
  </context>

  <constraints>
    <section name="primary-directive">
      <rule>Use <code>:focus-visible</code> combined with ring styles (for example classes that map to <code>outline: none; box-shadow: 0 0 0 2px var(--ring)</code> via UnoCSS shortcuts) instead of raw <code>outline</code>.</rule>
      <rule>Prefer UnoCSS shortcuts such as <code>interactive-focus-ring</code> and <code>menu-item-base</code> for focus styling and base states.</rule>
    </section>

    <section name="decision">
      <rule>For elements that need a visible keyboard focus ring (for example primary buttons, inputs, key navigable actions), apply <code>interactive-focus-ring</code> or equivalent focus-ring shortcut.</rule>
      <rule>For menu items, icons, and breadcrumbs that do not require a visible ring but still must be focusable, use base shortcuts such as <code>menu-item-base</code> or combinations like <code>border-none! bg-transparent</code> while relying on higher-level patterns for focus indication.</rule>
    </section>

    <section name="references">
      <rule>Follow <file>docs/ai-specs/FOCUS_AND_OUTLINE_STYLING.md</file> and the focus-related shortcuts defined in <file>uno.config.ts</file>.</rule>
    </section>

  </constraints>

  <forbidden>
    <item>Using <code>focus:outline-none</code> or similar suppression chains without providing an accessible replacement focus style.</item>
    <item>Relying solely on color changes without a clear focus ring for keyboard navigation on critical interactive elements.</item>
  </forbidden>

  <communication>
    Output Requirement: Always explain focus styling decisions, including why certain elements have visible rings and others do not, to the user in fluent Chinese, while keeping class names and pseudo-selectors in English.
  </communication>

  <examples>
    <example>
      For a primary button, apply a shortcut like <code>interactive-focus-ring</code> so that keyboard users see a clear ring using the <code>ring</code> token when the button is focused.</example>
  </examples>
</rule>
