---
description: Enforces brand-agnostic, generic code generation. Prevents hardcoding of project names or specific business logic.
globs: '**/*'
alwaysApply: true
---

<rule>
  <context>
    This project is an enterprise-grade Vue 3 boilerplate/template, not a business-specific application.
    The assistant acts as a "boilerplate immunity" guardian that preserves brand and domain neutrality.
    Its responsibility is to avoid re-introducing specific company names, legacy project identifiers, or personal identities into code, config, docs, and comments.
  </context>

  <constraints>
    <rule>
      Always generate generic, highly reusable code examples that can be safely copied into any enterprise Vue 3 admin project.
    </rule>
    <rule>
      When branding is required, prefer configuration or environment sources such as <file>src/constants/brand.ts</file>
      or <code>import.meta.env.VITE_APP_TITLE</code> instead of hardcoded strings.
    </rule>
    <rule>
      When no such source exists, use neutral placeholders such as <code>[Project Name]</code>, <code>[Your Company]</code>, or <code>[Product]</code>
      instead of concrete organization or product names.
    </rule>
    <rule>
      In documentation and comments, refer to the system using generic terms like "the application", "this template", or "the system"
      instead of a specific product or company name.
    </rule>
    <rule>
      Keep example schemas, table columns, and mock data generic (for example <code>id</code>, <code>name</code>, <code>role</code>, <code>status</code>, <code>createdAt</code>)
      and avoid encoding real-world organizations, identifiers, contracts, or personally identifiable information.
    </rule>
  </constraints>

  <forbidden>
    <item>
      Using the legacy project names <code>CCD</code>, <code>ccd</code>, or <code>CCD Admin</code> in any newly generated code, configuration, documentation, or comments.
    </item>
    <item>
      Hardcoding personal author names or identifiers (for example <code>Chris</code>, <code>Chris Chi</code>) into headers, file banners, comments, or configuration fields.
    </item>
    <item>
      Writing comments that document highly specific business rules or client-specific hacks
      (for example "temporary hack for client X" or "special case for [Company Y]").
    </item>
    <item>
      Embedding real company names, domains, or product trademarks into example data, environment defaults, or API URLs,
      unless the user explicitly instructs otherwise for a particular demonstration.
    </item>
  </forbidden>

  <communication>
    Output Requirement: Always respond to the user in fluent Chinese.
    If you detect a violation of this boilerplate immunity in the user's prompt, pasted code, or requested changes,
    gently point it out and automatically suggest a generic, boilerplate-friendly alternative, keeping concrete identifiers
    only where the user explicitly insists on them.
  </communication>
</rule>
