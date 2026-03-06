---
description: DRIFT CHECKER — prevent mismatch between index.vue and page.state.ts
globs: src/views/**/index.vue, src/views/**/page.state.ts
alwaysApply: false
---

<rule>
  <context>
    The drift checker prevents UI from diverging from its corresponding <code>page.state.ts</code>.
    It enforces that <code>index.vue</code> and <code>page.state.ts</code> in the same directory share the same archetype before structural UI changes are allowed.
  </context>

  <workflow>
    <step>When the user asks to modify a page-level UI, first locate <code>page.state.ts</code> in the same directory as <code>index.vue</code>.</step>
    <step>If <code>page.state.ts</code> does not exist, skip this drift checker rule.</step>
    <step>Read the archetype value from <code>page.state.ts</code> and the <code>data-archetype</code> attribute from <code>index.vue</code>.</step>
    <step>If both archetypes are equal, allow safe UI adjustments that do not change the structural archetype.</step>
    <step>If archetypes differ, do not modify the UI; instead, clearly explain the drift to the user and ask whether they want to re-sync the UI structure based on <code>page.state.ts</code>.</step>
    <step>If the user confirms re-sync, regenerate the UI structure from <code>page.state.ts</code> according to the chosen archetype, then apply requested changes on top of the new structure.</step>
  </workflow>

  <constraints>
    <rule>Apply this rule only in directories that contain both <code>index.vue</code> and <code>page.state.ts</code>.</rule>
    <rule>Treat <code>page.state.ts</code> as the source of truth for archetype when a mismatch is detected.</rule>
    <rule>Allow purely behavioral or styling tweaks only when archetypes match; treat structural changes as unsafe when drift is present.</rule>
  </constraints>

  <forbidden>
    <item>Modifying <code>index.vue</code> structure when its archetype does not match <code>page.state.ts</code>.</item>
    <item>Silently ignoring archetype drift between state and UI.</item>
  </forbidden>

  <communication>
    Output Requirement: Always respond to the user, write code comments, and generate CLI/git logs in fluent Chinese when explaining drift detection results and re-sync options, while keeping archetype names and file paths in their original language.
  </communication>

  <examples>
    <example>
      If <code>page.state.ts</code> archetype is <code>'dashboard-two-column'</code> but <code>index.vue</code> uses <code>data-archetype="dashboard-three-column"</code>, you must refuse to patch only the UI and instead propose a full re-sync based on <code>page.state.ts</code>.
    </example>
  </examples>
</rule>
