---
description: UI must be generated from UIDesignState; no designing before state
globs: src/**/*.{vue,ts,tsx}
alwaysApply: true
---

<rule>
  <context>
    This rule enforces the UI Design State discipline: all UI work must start from an explicit <code>UIDesignState</code>, not from ad-hoc visual design or component picking.
    The goal is to keep layout, density, and interaction consistent with documented intent profiles and archetypes.
  </context>

  <workflow>
    <step>Determine <code>UIDesignState</code> first, focusing on primary intent and context.</step>
    <step>Derive secondary state using <file>docs/ai-specs/INTENT_PROFILES.md</file> (for example density, hierarchy, CTA policy).</step>
    <step>Validate the design state against <file>docs/ai-specs/UI_STATE_CONTRACT.md</file> to ensure all required fields are set and consistent.</step>
    <step>Select a layout archetype from <file>docs/ai-specs/ARCHETYPE_SPEC.md</file> that matches the design state.</step>
    <step>Generate a layout structure (flex/grid skeleton, scroll model, key regions) that matches the chosen archetype.</step>
    <step>Map high-level responsibilities to components (existing project components first, then PrimeVue, then native elements for simple static content).</step>
    <step>Only after the above steps are complete, implement concrete UI code in Vue components.</step>
  </workflow>

  <constraints>
    <rule>Never start from components; always start from <code>UIDesignState</code> and archetype selection.</rule>
    <rule>Never design visually first (for example “a page with three cards and a big chart”) without an explicit design state.</rule>
    <rule>The layout shell and scroll model must come from the archetype spec, not from ad-hoc decisions.</rule>
    <rule>Form density, visual hierarchy, and CTA policy must be derived from intent profiles, not free choice.</rule>
  </constraints>

  <forbidden>
    <item>Building a page by directly assembling components without defining <code>UIDesignState</code>.</item>
    <item>Inventing a custom scroll model that conflicts with the selected archetype.</item>
    <item>Flattening more than eight form fields into a single long section when the design state calls for sections or steps (see user-centric rules).</item>
    <item>Ignoring documented intent profiles when deciding density or CTA prominence.</item>
  </forbidden>

  <output>
    <rule>When describing UI plans to the user, follow this response order unless the user explicitly requests another format:</rule>
    <list>
      <item>UIDesignState (explicit object).</item>
      <item>Short archetype reasoning (why this archetype matches the intent).</item>
      <item>Layout structure (flex/grid skeleton and scroll model).</item>
      <item>Component mapping (which project components and PrimeVue components fill each region).</item>
      <item>Implementation code (Vue components and supporting logic).</item>
    </list>
  </output>

  <communication>
    Output Requirement: Always respond to the user in fluent, developer-friendly Chinese, including the UIDesignState description, archetype reasoning, layout structure, and component mapping.
    Keep identifiers, file paths, and code syntax in their original language, but explain intent and trade-offs in Chinese.
  </communication>

  <examples>
    <example>
      A valid response starts with a JSON-like <code>UIDesignState</code> object, followed by a brief note such as “本页面以分析型 Dashboard 为主，采用双栏固定头布局…”, then a flex layout outline, then which existing components to use, and finally the Vue code.
    </example>
  </examples>
</rule>
