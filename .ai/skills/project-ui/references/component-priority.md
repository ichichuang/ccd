# Component Selection and Styling Boundaries

This internal reference owns component selection and styling boundaries for future
project-ui governance. It is not an independent Skill and carries no activation metadata.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Component Priority Order

This section owns component priority order for `component-priority.md` under the accepted
P2.3 heading registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

1. Existing @ccd/vue-ui component.

2. Existing @ccd/vue-primevue-adapter component or adapter.

3. Approved PrimeVue component through project boundaries.

4. Existing shared app component.

5. New shared primitive only after evidence proves no suitable owner exists.

Accepted P2.3 semantic coverage for this heading: 52 covered, 1 implementation-evidence.

Governance rules:

- &lt;input type="radio" | &lt;RadioButton | Always in a group with shared v-model. Source:
  .ai/rules/components/00-primevue-ecosystem.mdc:42.
- v3 Name (must not) | v4 Name (REQUIRED). Source:
  .ai/rules/components/00-primevue-ecosystem.mdc:62.
- Scrolling (GLOBAL SSOT): Cross-reference 02-pro-components.mdc. All scrollable regions
  must use &lt;CScrollbar. STRICT PROHIBITION: NEVER use overflow-auto or overflow-scroll on
  generic containers for primary page scrolling. Use &lt;CScrollbar
  class="col-fill"...&lt;/CScrollbar as the canonical pattern. Source:
  .ai/rules/components/00-primevue-ecosystem.mdc:82.
- Unsure about v4 name? → Check src/types/components.d.ts. Source:
  .ai/rules/components/00-primevue-ecosystem.mdc:173.
- Classify the component by Tier (Section 2.3). Source:
  .ai/rules/components/00-primevue-ecosystem.mdc:177.
- Check src/utils/theme/presetComponents/. Source:
  .ai/rules/components/00-primevue-ecosystem.mdc:185.
- NEVER write &lt;style scoped with :deep(.p-) selectors. Source:
  .ai/rules/components/00-primevue-ecosystem.mdc:188.
- Step 4 — COMPOUND COMPONENT CHECK. Source:
  .ai/rules/components/00-primevue-ecosystem.mdc:190.
- [ ] No v3 component names (Dropdown, Calendar, InputSwitch, Sidebar, TabView, Steps).
      Source: .ai/rules/components/00-primevue-ecosystem.mdc:204.
- [ ] Compound component structure used for Tabs / Stepper / Accordion. Source:
      .ai/rules/components/00-primevue-ecosystem.mdc:208.
- [ ] v-model used for two-way binding (not :value + @change separately). Source:
      .ai/rules/components/00-primevue-ecosystem.mdc:209.
- must not Patterns (Detailed). Source: .ai/rules/components/01-primevue-pt-styling.mdc:99.
- must not Hardcoded Inline Styles. Source:
  .ai/rules/components/01-primevue-pt-styling.mdc:101.
- Scoped styles cannot reliably follow theme variable switching. Source:
  .ai/rules/components/01-primevue-pt-styling.mdc:124.
- must not Raw CSS Variable References in component style blocks. Source:
  .ai/rules/components/01-primevue-pt-styling.mdc:128.
- Visual Need | UnoCSS Token to Use. Source:
  .ai/rules/components/01-primevue-pt-styling.mdc:154.
- Border decoration | Prefer shadow-; avoid ad-hoc decorative border styling. Source:
  .ai/rules/components/01-primevue-pt-styling.mdc:159.
- Disabled state | opacity-50 cursor-not-allowed. Source:
  .ai/rules/components/01-primevue-pt-styling.mdc:163.
- When a Pro wrapper exists, direct raw component usage is rejected by default. Source:
  .ai/rules/components/02-pro-components.mdc:38.
- Raw / Legacy usage | Required wrapper / API. Source:
  .ai/rules/components/02-pro-components.mdc:40.
- Intent | must Use. Source: .ai/rules/components/02-pro-components.mdc:50.
- LAW 1.7 — Hard Reject Examples. Source: .ai/rules/components/02-pro-components.mdc:58.
- LAW 2 — Business View Shell (A1 Default, A2 Detail Variant). Source:
  .ai/rules/components/02-pro-components.mdc:74.
- Do NOT wrap the entire view in &lt;CScrollbar if the parent LayoutAdmin already provides
  the main scrollable area. Source: .ai/rules/components/02-pro-components.mdc:95.
- MANDATORY: All scrollable regions must use &lt;CScrollbar. NEVER use overflow-auto.
  Source: .ai/rules/components/02-pro-components.mdc:101.
- must not on sections:. Source: .ai/rules/components/02-pro-components.mdc:130.
- padding: raw pixel-unit value inline — use p-md. Source:
  .ai/rules/components/02-pro-components.mdc:131;
  .ai/rules/components/02-pro-components.mdc:252.
- background: fff — use bg-card. Source: .ai/rules/components/02-pro-components.mdc:132.
- width: raw pixel-unit value — use w-full, layout-narrow, col-fill. Source:
  .ai/rules/components/02-pro-components.mdc:133.
- // must typed column array. Source: .ai/rules/components/02-pro-components.mdc:143.
- // TSX — MANDATORY for VNode cell output. Source:
  .ai/rules/components/02-pro-components.mdc:152.
- Fixed-size embed | "fixed" | Requires :height="'raw pixel-unit value'". Source:
  .ai/rules/components/02-pro-components.mdc:178.
- Content-driven | "auto" | Default. Source: .ai/rules/components/02-pro-components.mdc:179.
- // must TSX. Source: .ai/rules/components/02-pro-components.mdc:186.
- Bare overflow-auto | must not | &lt;CScrollbar. Source:
  .ai/rules/components/02-pro-components.mdc:251.
- background: fff / raw hex | must not | bg-card. Source:
  .ai/rules/components/02-pro-components.mdc:253.
- Never bypass this system. Source: .ai/rules/components/03-echarts-theming.mdc:13.
- Required Path. Source: .ai/rules/components/03-echarts-theming.mdc:27.
- All resize-like events must route through the shared scheduler. Do not add direct
  instance.resize() calls in views or local business wrappers. Source:
  .ai/rules/components/03-echarts-theming.mdc:49.
- Required Coverage For Rendering Changes. Source:
  .ai/rules/components/03-echarts-theming.mdc:51.
- The Playwright coverage must preserve these scenarios:. Source:
  .ai/rules/components/03-echarts-theming.mdc:60.
- // Define ONLY your data — no colors, no backgrounds. Source:
  .ai/rules/components/03-echarts-theming.mdc:80.
- // must not static hex colors break dark mode and theme switching. Source:
  .ai/rules/components/03-echarts-theming.mdc:157.
- must not Setting backgroundColor Directly. Source:
  .ai/rules/components/03-echarts-theming.mdc:172.
- backgroundColor: 'transparent', // use only if you KNOW the container bg. Source:
  .ai/rules/components/03-echarts-theming.mdc:178.
- // must not violates design token contract. Source:
  .ai/rules/components/03-echarts-theming.mdc:199.
- must not AS DEFAULT ROOT: NEVER use col-fill as the root wrapper for standard flowing
  pages where the parent layout handles scrolling. Source:
  .ai/rules/design-system/00-unocss-guardrails.mdc:263.
- 05-semantic-color-usage-contract.mdc owns semantic color naming and component severity
  mapping details. Source: .ai/rules/design-system/01-design-tokens.mdc:15.
- If a token is intended for readable content, do not store it under a decorative .light
  slot just to bypass validation. Source: .ai/rules/design-system/01-design-tokens.mdc:69.
- Importing SIZEPRESETS in view/component files | Use CSS vars via Uno classes. Source:
  .ai/rules/design-system/02-size-density-system.mdc:201.
- Do NOT downgrade an action or text token into a decorative slot just to make validation
  pass. Source: .ai/rules/design-system/05-semantic-color-usage-contract.mdc:68.
- Do NOT render a separate visible collapsed rail tree, duplicate root menu renderer, or
  swap PanelMenu for another visible component during sidebar collapse. Source:
  .ai/rules/integrations/03-layout-architecture.mdc:111.

Implementation evidences:

- Use as implementation evidence only, not as independent governance: Implementation
  evidence shows root wrappers must not use background, surface, or material classes
  directly in the example boundary. Source: .ai/rules/components/02-pro-components.mdc:85.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Existing CCD Vue UI Components

This section owns existing ccd vue ui components for `component-priority.md` under the
accepted P2.3 heading registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Vue PrimeVue Adapter

This section owns vue primevue adapter for `component-priority.md` under the accepted P2.3
heading registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Approved PrimeVue Use

This section owns approved primevue use for `component-priority.md` under the accepted P2.3
heading registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Existing Shared App Components

This section owns existing shared app components for `component-priority.md` under the
accepted P2.3 heading registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## New Shared Primitive Evidence Gate

This section owns new shared primitive evidence gate for `component-priority.md` under the
accepted P2.3 heading registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## PrimeVue Ecosystem

This section owns primevue ecosystem for `component-priority.md` under the accepted P2.3
heading registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

Accepted P2.3 semantic coverage for this heading: 14 covered.

Governance rules:

- In src/views/, src/components/, and src/layouts/, native HTML interactive/data/feedback
  elements are must not when a PrimeVue equivalent exists. Source:
  .ai/rules/components/00-primevue-ecosystem.mdc:20.
- When a project Pro-wrapper equivalent exists, direct raw PrimeVue usage is also must not.
  Source: .ai/rules/components/00-primevue-ecosystem.mdc:22.
- must not Native Element | REQUIRED PrimeVue v4 Component | Notes. Source:
  .ai/rules/components/00-primevue-ecosystem.mdc:36.
- &lt;a (internal navigation) | &lt;RouterLink | Not PrimeVue, but REQUIRED for SPA nav.
  Source: .ai/rules/components/00-primevue-ecosystem.mdc:56.
- During any PrimeVue migration or refactor pass, API renaming is NOT enough. The following
  cleanups are mandatory whenever discovered:. Source:
  .ai/rules/components/00-primevue-ecosystem.mdc:128.
- Tier 3 → ALWAYS fetch https://primevue.org/[component] before writing the first line.
  Source: .ai/rules/components/00-primevue-ecosystem.mdc:180.
- [ ] All Tier 3 component APIs verified against PrimeVue v4 docs. Source:
      .ai/rules/components/00-primevue-ecosystem.mdc:205.
- Prerequisite: Ensure you have selected the CORRECT component per
  00-primevue-ecosystem.mdc. This rule covers HOW to style. Source:
  .ai/rules/components/01-primevue-pt-styling.mdc:7.
- must not Overriding PrimeVue internals in &lt;style scoped. Source:
  .ai/rules/components/01-primevue-pt-styling.mdc:113.
- Outside these files, targeting PrimeVue internal .p- selectors is prohibited. Source:
  .ai/rules/components/01-primevue-pt-styling.mdc:148.
- All tabular data and user input must use PrimeVue components. Native HTML elements are
  must not. Source: .ai/rules/components/02-pro-components.mdc:15.
- src/assets/styles/custom-primevue.scss must use the same icon size CSS variable for
  --admin-sidebar-icon-box-width. Source:
  .ai/rules/design-system/02-size-density-system.mdc:141.
- The admin sidebar menu is a continuous interaction surface. Preserve the existing
  route-driven menu generation, permission filtering, active route highlighting,
  expanded-key persistence, PrimeVue PanelMenu, and TieredMenu popup behavior. Source:
  .ai/rules/integrations/03-layout-architecture.mdc:104.
- This skill exists because CCD already has architecture, PrimeVue, UnoCSS, token, and
  governance rules, but those rules alone do not guarantee beautiful UI. Source:
  .ai/skills/design/ccd-product-language/SKILL.md:13.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## PassThrough Styling

This section owns passthrough styling for `component-priority.md` under the accepted P2.3
heading registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

Accepted P2.3 semantic coverage for this heading: 29 covered.

Governance rules:

- PrimeVue v4 Ecosystem — Component Substitution Law, API Zero-Hallucination Protocol, and
  PT Styling Mandate. Read BEFORE using any interactive or data UI element. Source:
  .ai/rules/components/00-primevue-ecosystem.mdc:2.
- AI agents frequently (a) reach for native HTML elements instead of PrimeVue components,
  (b) hallucinate prop/event/slot names from outdated training data, and (c) use :deep() CSS
  overrides instead of the PT system. This rule enforces three pillars of defense. Source:
  .ai/rules/components/00-primevue-ecosystem.mdc:9.
- These exceptions do NOT extend to business pages or general components. Source:
  .ai/rules/components/00-primevue-ecosystem.mdc:76.
- Cross-check with the project's PT presets in src/utils/theme/ptPresets/ and
  src/utils/theme/presetComponents/ to confirm global configuration coverage. Source:
  .ai/rules/components/00-primevue-ecosystem.mdc:102.
- All visual customization of PrimeVue components must use the Pass-Through (pt) system. See
  01-primevue-pt-styling.mdc for the complete methodology, token reference, and correct
  patterns. Source: .ai/rules/components/00-primevue-ecosystem.mdc:140.
- 3.2 :deep() Prohibition — Exhaustive Exception List. Source:
  .ai/rules/components/00-primevue-ecosystem.mdc:142.
- :deep(.p-) targeting PrimeVue internal classes is must not in business code. Exactly three
  files have documented exceptions:. Source:
  .ai/rules/components/00-primevue-ecosystem.mdc:144.
- Any NEW :deep(.p-) usage requires explicit architectural justification and must be added
  to this exception list. Source: .ai/rules/components/00-primevue-ecosystem.mdc:150.
- 3.3 Global PT Presets — Check Before Writing. Source:
  .ai/rules/components/00-primevue-ecosystem.mdc:152.
- Before writing any local :pt prop, check if a global preset already covers the component:.
  Source: .ai/rules/components/00-primevue-ecosystem.mdc:154.
- If a global PT exists, your local :pt should only ADD classes, not DUPLICATE or CONFLICT
  with the global preset. Source: .ai/rules/components/00-primevue-ecosystem.mdc:160.
- Step 3 — PT PRESET CHECK. Source: .ai/rules/components/00-primevue-ecosystem.mdc:182.
- Global PT exists? → Local :pt should ADD, not DUPLICATE. Source:
  .ai/rules/components/00-primevue-ecosystem.mdc:186.
- Need visual customization? → Use :pt with UnoCSS semantic tokens
  (01-primevue-pt-styling.mdc). Source: .ai/rules/components/00-primevue-ecosystem.mdc:187.
- [ ] No :deep(.p-) in &lt;style scoped outside documented exceptions. Source:
      .ai/rules/components/00-primevue-ecosystem.mdc:206.
- [ ] Global PT presets checked — no conflict with local :pt. Source:
      .ai/rules/components/00-primevue-ecosystem.mdc:207.
- Step 0: Check Global PTs Before Writing Local Ones. Source:
  .ai/rules/components/01-primevue-pt-styling.mdc:25.
- Open the relevant preset before writing a local :pt. If global PT already styles the slot
  you need, do not duplicate locally. Source:
  .ai/rules/components/01-primevue-pt-styling.mdc:36.
- must Use :pt for All Component Customization. Source:
  .ai/rules/components/01-primevue-pt-styling.mdc:40.
- To customize any PrimeVue component beyond what the preset provides, you must use pt
  (Pass-Through). Combine with semantic UnoCSS tokens for dark-mode safety. Source:
  .ai/rules/components/01-primevue-pt-styling.mdc:42.
- Use semantic token classes via :pt instead. Source:
  .ai/rules/components/01-primevue-pt-styling.mdc:136.
- :deep(.p-) Whitelist (Exact 3-file Exception). Source:
  .ai/rules/components/01-primevue-pt-styling.mdc:140.
- New :deep(.p-) usage is forbidden except the following three files:. Source:
  .ai/rules/components/01-primevue-pt-styling.mdc:142.
- // must not Vue hyperscript helper calls for cell output. Source:
  .ai/rules/components/02-pro-components.mdc:189.
- This exception must not be copied into src/views/. Source:
  .ai/rules/components/02-pro-components.mdc:221.
- must not Hardcoded theme colors in option (hex, fixed rgb(...), hardcoded dark/light
  palette overrides). Source: .ai/rules/components/03-echarts-theming.mdc:20.
- Build rawOption with business data structure only. Source:
  .ai/rules/components/03-echarts-theming.mdc:31.
- must not Hardcoded Colors in option. Source:
  .ai/rules/components/03-echarts-theming.mdc:154.
- must not Hardcoded Font Sizes or Font Families in option. Source:
  .ai/rules/components/03-echarts-theming.mdc:196.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Forms and ProForm

This section owns forms and proform for `component-priority.md` under the accepted P2.3
heading registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

Accepted P2.3 semantic coverage for this heading: 8 covered, 2 implementation-evidence.

Governance rules:

- Permitted native elements (structural/semantic only): &lt;div, &lt;span, &lt;section,
  &lt;header, &lt;footer, &lt;main, &lt;nav, &lt;aside, &lt;article, &lt;ul, &lt;ol, &lt;li,
  &lt;label, &lt;form, &lt;h1–&lt;h6, &lt;p, &lt;a (external links only — internal
  navigation must use &lt;RouterLink). Source:
  .ai/rules/components/00-primevue-ecosystem.mdc:27.
- Inside src/views/ (Business Pages), native &lt;form is must not. must use &lt;ProForm for
  forms with 2+ fields. Single-field trivial cases may use standalone PrimeVue controls.
  Source: .ai/rules/components/00-primevue-ecosystem.mdc:30.
- Custom ProForm field wrappers (packages/vue-ui/src/ProForm/renderers/components/) — may
  use native elements for fine-grained internal control. Source:
  .ai/rules/components/00-primevue-ecosystem.mdc:74.
- Check src/utils/theme/ptPresets/formControlsPt.ts and menuPt.ts. Source:
  .ai/rules/components/00-primevue-ecosystem.mdc:184.
- NEVER use: &lt;table, &lt;tr, &lt;td, &lt;th, &lt;thead, &lt;tbody, &lt;form, &lt;input,
  &lt;select, &lt;textarea, &lt;button (use PrimeVue &lt;Button instead). Source:
  .ai/rules/components/02-pro-components.mdc:32.
- Do not use A2 for standard CRUD/table/form views. Source:
  .ai/rules/components/02-pro-components.mdc:79.
- All forms with ≥2 fields must use &lt;ProForm with a typed FormSchema. Source:
  .ai/rules/components/02-pro-components.mdc:217.
- Internal implementation note: native &lt;form is allowed inside
  packages/vue-ui/src/ProForm/. Source: .ai/rules/components/02-pro-components.mdc:219.

Implementation evidences:

- Use as implementation evidence only, not as independent governance: Global pass-through
  presets live in src/utils/theme/ptPresets/ (e.g., formControlsPt.ts). These are registered
  at the app level and apply to every instance of a given component type. Always check if a
  global PT already covers your use case before writing a local one. Source:
  .ai/rules/components/01-primevue-pt-styling.mdc:15.
- Use as implementation evidence only, not as independent governance: For standard flowing
  content (for example showcases, forms), the root wrapper must not constrain height. Use
  col-stretch gap-md or layout-container (for examples). Source:
  .ai/rules/components/02-pro-components.mdc:94.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Tables and ProTable

This section owns tables and protable for `component-priority.md` under the accepted P2.3
heading registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

Accepted P2.3 semantic coverage for this heading: 10 covered, 1 implementation-evidence.

Governance rules:

- &lt;DataTable / &lt;Column in business pages - use &lt;ProTable. Source:
  .ai/rules/components/00-primevue-ecosystem.mdc:23.
- packages/vue-ui/src/ProTable/ProTable.vue — DataTable frozen column z-index management,
  row selection coloring, and grid line control. These are CSS-variable overrides that
  cannot be expressed via PT. Source: .ai/rules/components/00-primevue-ecosystem.mdc:146.
- Check the Substitution Table (Section 1.2). PrimeVue equivalent exists? → Use it. Source:
  .ai/rules/components/00-primevue-ecosystem.mdc:171.
- [ ] No native &lt;button, &lt;input, &lt;select, &lt;textarea, &lt;table, &lt;dialog,
      &lt;progress in business code. Source: .ai/rules/components/00-primevue-ecosystem.mdc:203.
- [ ] Complex tables use &lt;ProTable when appropriate (02-pro-components.mdc). Source:
      .ai/rules/components/00-primevue-ecosystem.mdc:211.
- Use material-elevated for each logical content section (search area, table area, detail
  card). Sections are separated by gap-md or gap-lg on the layout-narrow wrapper. Source:
  .ai/rules/components/02-pro-components.mdc:113.
- For tables with 3 columns, columns must live in a separate file:. Source:
  .ai/rules/components/02-pro-components.mdc:162.
- NEVER set explicit pixel height on the ProTable wrapper via inline style. Source:
  .ai/rules/components/02-pro-components.mdc:181.
- ProTable manages PrimeVue DataTable's scrollable/scrollHeight internally — do NOT pass
  these directly. Source: .ai/rules/components/02-pro-components.mdc:209.
- &lt;table&lt;tr&lt;td in views | must not | &lt;ProTable :columns :data /. Source:
  .ai/rules/components/02-pro-components.mdc:249.

Implementation evidences:

- Use as implementation evidence only, not as independent governance: Use &lt;CScrollbar
  only for local scrollable regions (for example inside a fixed-height sidebar, drawer
  panel, or a specific datatable wrapper). Source:
  .ai/rules/components/02-pro-components.mdc:96.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Tree Tables and ProTreeTable

This section owns tree tables and protreetable for `component-priority.md` under the
accepted P2.3 heading registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Charts

This section owns charts for `component-priority.md` under the accepted P2.3 heading
registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

Accepted P2.3 semantic coverage for this heading: 19 covered, 1 implementation-evidence.

Governance rules:

- Enforces the useChartTheme wrapper for ECharts to ensure dark mode and theme color
  reactivity. Source: .ai/rules/components/03-echarts-theming.mdc:2.
- must not Raw vue-echarts initialization (echarts.init(...), direct VChart mounting in
  business code). Source: .ai/rules/components/03-echarts-theming.mdc:19.
- must not Building a parallel chart theming layer outside useChartTheme. Source:
  .ai/rules/components/03-echarts-theming.mdc:21.
- must not Ad-hoc chart resize logic in business views. Resize, visibility, and KeepAlive
  recovery belong in UseEcharts / echarts-render-core. Source:
  .ai/rules/components/03-echarts-theming.mdc:22.
- must not Replacing vue-echarts integration with raw echarts.init(...) inside
  UseEcharts.vue without an explicit architecture decision. Source:
  .ai/rules/components/03-echarts-theming.mdc:23.
- All business charts must follow this path only:. Source:
  .ai/rules/components/03-echarts-theming.mdc:29.
- UseEcharts owns ECharts rendering timing. The current rendering model is:. Source:
  .ai/rules/components/03-echarts-theming.mdc:41.
- vue-echarts owns actual ECharts component initialization and disposal. Source:
  .ai/rules/components/03-echarts-theming.mdc:43.
- echarts-render-core.ts owns DOM-size gating, RAF scheduling, guarded resize, and pending
  setOption flushes. Source: .ai/rules/components/03-echarts-theming.mdc:44.
- When touching src/components/UseEcharts/, run targeted validation:. Source:
  .ai/rules/components/03-echarts-theming.mdc:53.
- pnpm vitest run src/components/UseEcharts/echarts-render-core.spec.ts
  src/components/UseEcharts/UseEcharts.spec.ts. Source:
  .ai/rules/components/03-echarts-theming.mdc:56.
- must Use useChartTheme() for All Chart Options. Source:
  .ai/rules/components/03-echarts-theming.mdc:70.
- The brand palette from useChartTheme is automatically applied in order to your series.
  Define series shapes only — do not set color per series:. Source:
  .ai/rules/components/03-echarts-theming.mdc:111.
- For translucent tooltip backgrounds, use withAlpha from the chart theme utilities:.
  Source: .ai/rules/components/03-echarts-theming.mdc:130.
- // must not chart canvas background must match the active theme surface. Source:
  .ai/rules/components/03-echarts-theming.mdc:175.
- must not Raw vue-echarts Import. Source: .ai/rules/components/03-echarts-theming.mdc:184.
- // must not bypasses UseEcharts wrapper and theme integration. Source:
  .ai/rules/components/03-echarts-theming.mdc:187.
- Use &lt;UseEcharts exclusively. It handles resize observation, theme registration, and
  disposal lifecycle. Source: .ai/rules/components/03-echarts-theming.mdc:194.
- useChartTheme injects correct typography scaled to the user's font preference. Do not
  override it. Source: .ai/rules/components/03-echarts-theming.mdc:204.

Implementation evidences:

- Use as implementation evidence only, not as independent governance: useChartTheme handles
  background injection. If you need transparent (e.g., chart floats over a card), pass {
  transparent: true } in the options argument — do not set it directly. Source:
  .ai/rules/components/03-echarts-theming.mdc:182.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Dialogs and Drawers

This section owns dialogs and drawers for `component-priority.md` under the accepted P2.3
heading registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

Accepted P2.3 semantic coverage for this heading: 6 covered.

Governance rules:

- raw business &lt;Dialog / &lt;Drawer declarations - use useDialog + PrimeDialog. Source:
  .ai/rules/components/00-primevue-ecosystem.mdc:24.
- Dialogs (ARCHITECTURAL PRIORITY): Prefer the internal dialog abstraction
  (@/components/PrimeDialog or equivalent architecture-approved wrapper / useDialog) over
  raw PrimeVue Dialog declarations when implementing business dialogs, so lifecycle
  orchestration, layout constraints, and close behaviors remain centralized. Source:
  .ai/rules/components/00-primevue-ecosystem.mdc:81.
- &lt;Dialog :visible="show" | &lt;Dialog v-model:visible="show" — must use v-model binding.
  Source: .ai/rules/components/00-primevue-ecosystem.mdc:120.
- &lt;Dialog / &lt;Drawer for business flows | useDialog().openDialog() /
  useDialog().confirm(). Source: .ai/rules/components/02-pro-components.mdc:44.
- Confirm / Delete confirm / Info prompt | useDialog. Source:
  .ai/rules/components/02-pro-components.mdc:54.
- &lt;!-- useDialog().openDialog(...) / useDialog().confirm(...) --. Source:
  .ai/rules/components/02-pro-components.mdc:68.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Navigation

This section owns navigation for `component-priority.md` under the accepted P2.3 heading
registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Feedback and State Surfaces

This section owns feedback and state surfaces for `component-priority.md` under the accepted
P2.3 heading registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Empty States

This section owns empty states for `component-priority.md` under the accepted P2.3 heading
registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Icons

This section owns icons for `component-priority.md` under the accepted P2.3 heading
registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Loading States

This section owns loading states for `component-priority.md` under the accepted P2.3 heading
registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Native Control Avoidance

This section owns native control avoidance for `component-priority.md` under the accepted
P2.3 heading registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

Accepted P2.3 semantic coverage for this heading: 2 covered.

Governance rules:

- Allowed native HTML in views: &lt;div, &lt;section, &lt;span, &lt;p, &lt;h1–&lt;h6 —
  structural containers only. Source: .ai/rules/components/02-pro-components.mdc:30.
- // must not string HTML return. Source: .ai/rules/components/02-pro-components.mdc:191.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.

## Runtime Implementation Boundary

This section owns runtime implementation boundary for `component-priority.md` under the
accepted P2.3 heading registry.

It must be loaded only through `SKILL.md` or the future P5 routing layer, never as an
independent Skill.

This structural section has no direct corrected requirement mapping, but it is required by
the accepted P2.3 heading registry and defines the local ownership boundary for adjacent
mapped sections.

Deferred enforcement boundary: this source is human-executable governance in P2.4; Machine
UI Policy, Page Contract validation, routing, adapters, and synchronization remain
later-phase work.
