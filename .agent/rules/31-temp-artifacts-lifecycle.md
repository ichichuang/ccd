---
description: Temporary artifacts "Leave No Trace" lifecycle — allow experiments, enforce cleanup
globs: **/*
alwaysApply: true
---

<rule>
  <context>
    This rule governs temporary files and configuration changes created during reasoning or experimentation.
    Experiments are allowed, but they must leave no trace in the repository unless the user explicitly asks to keep them.
  </context>

  <workflow>
    <step>You are allowed to create temporary test files such as <code>*.spec.ts</code>, <code>*.test.ts</code>, <code>__tests__/**</code>, and temporary scripts such as <code>scripts/tmp-*.ts</code> or one-off maintenance scripts while reasoning.</step>
    <step>You may also apply temporary configuration changes to files like <code>tsconfig*.json</code>, <code>vite.config.ts</code>, <code>vitest.config.ts</code>, <code>package.json</code>, and <code>pnpm-lock.yaml</code> if they are needed to run these experiments.</step>
    <step>Before concluding your response or completing the current task, you MUST permanently delete all temporary test files and scripts you created (for example <code>*.spec.ts</code>, <code>scripts/*.ts</code> that are marked as temporary) unless the user explicitly instructs you to keep them.</step>
    <step>Before concluding, you MUST also revert any experiment-only configuration changes, removing any <code>include</code>, <code>references</code>, <code>scripts</code>, or dependencies that were added solely to support temporary files.</step>
    <step>After deletion and config reversion, ensure there are no “ghost references” in configuration files (for example, <code>tsconfig*.json</code> still including removed paths like <code>"scripts/**/*.ts"</code> or removed test directories).</step>
    <step>Confirm that running <code>pnpm check</code> or <code>tsc --build</code> does not fail because of missing temporary artifacts.</step>
  </workflow>

  <constraints>
    <rule>Temporary artifacts are valid only within the lifetime of a single task or reasoning session; they are not part of the long-term project structure.</rule>
    <rule>Configuration changes that the user explicitly requests for long-term use must be preserved; all other experiment-only changes must be reverted.</rule>
    <rule>Configuration files such as <code>tsconfig.json</code> or <code>tsconfig.node.json</code> must not contain paths to deleted tests or scripts.</rule>
  </constraints>

  <forbidden>
    <item>Keeping temporary scripts or test files (for example <code>drift-fix.ts</code>) in the repository when the user did not explicitly request them as permanent.</item>
    <item>Deleting temporary files but forgetting to clean up their paths in configuration files.</item>
    <item>Committing temporary artifacts or experiment-only configuration changes to Git unless the user explicitly asks for it.</item>
  </forbidden>

  <communication>
    Output Requirement: Always respond to the user, write code comments, and generate CLI/git logs in fluent Chinese when describing created temporary files, cleanup operations, and configuration reversions, while keeping file names and commands in their original language.
  </communication>

  <examples>
    <example>
      You may create <code>scripts/tmp-migrate-theme.ts</code> to test a migration, but before finishing, you must delete this script and remove any <code>"scripts/**/*.ts"</code> entries that were added only for it from <code>tsconfig.node.json</code>.
    </example>
  </examples>
</rule>
