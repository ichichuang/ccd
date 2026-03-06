---
description: Repair list workflow — track issues via repair_list.txt
globs: repair_list.txt, **/*
alwaysApply: true
---

<rule>
  <context>
    This rule defines how to create, read, update, and clear the <code>repair_list.txt</code> file in the project root.
    The file is used as a lightweight backlog for issues that should be fixed now or later and must never be committed to Git.
  </context>

  <workflow>
    <step>Ensure the file <code>repair_list.txt</code> exists in the project root; if it does not exist, you may create it.</step>
    <step>When the user asks to “check issues”, “audit”, “fix”, or “compliance check”, collect all detected issues into an in-memory list first.</step>
    <step>In Ask mode, after reporting issues, ask the user whether to write them into <code>repair_list.txt</code> for later fixes; in Agent mode, write them automatically.</step>
    <step>When writing the file, include a header with title, generated timestamp, and a summary line in the form <code>Pending: N | Resolved: M</code>, followed by separate <code>=== Pending (N) ===</code> and <code>=== Resolved (M) ===</code> sections.</step>
    <step>When reading an existing repair list, parse the header and sections, then find all lines under <code>=== Pending</code> whose status marker is <code>[⬜]</code>.</step>
    <step>Process pending items in order: for each <code>[⬜]</code> item, attempt to fix the referenced issue in the codebase.</step>
    <step>After successfully fixing an item, change its status marker from <code>[⬜]</code> to <code>[✅]</code>, move it from the Pending section to the Resolved section, and update the Pending/Resolved counts accordingly.</step>
    <step>After all items are marked <code>[✅]</code> and a re-check confirms there are no remaining issues, clear the file content but keep an empty <code>repair_list.txt</code> ready for the next run.</step>
  </workflow>

  <constraints>
    <rule>Store <code>repair_list.txt</code> in the project root and ensure it remains ignored by Git.</rule>
    <rule>Use plain text format (not Markdown) with the documented header and section titles.</rule>
    <rule>Use <code>[⬜]</code> (pending) and <code>[✅]</code> (resolved) as the only status markers for items.</rule>
    <rule>Accept both English section headers and Chinese headers <code>待解决</code>/<code>已解决</code> for parsing.</rule>
  </constraints>

  <forbidden>
    <item>Clearing <code>repair_list.txt</code> before all issues are truly resolved and validated.</item>
    <item>Committing <code>repair_list.txt</code> or its contents to Git.</item>
  </forbidden>

  <communication>
    Output Requirement: Always respond to the user, write code comments, and generate CLI/git logs in fluent Chinese when explaining detected issues, repair plans, and updates to <code>repair_list.txt</code>, while keeping file paths and status markers in their original form.
  </communication>

  <examples>
    <example>
      A pending item example: <code>1. [⬜] src/views/example/index.vue:42-48 - [layout] header spacing is inconsistent</code>.
    </example>
  </examples>
</rule>
