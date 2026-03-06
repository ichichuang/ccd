---
description: HTML tag semantics and formatting — correct use of code/span/div/pre, avoid format conflicts and syntax errors
globs: src/**/*.{vue,tsx}
alwaysApply: true
---

<rule>
  <context>
    This rule defines how to choose HTML tags in Vue templates so that markup is semantically correct, valid per HTML nesting rules, and friendly to the Prettier + ESLint toolchain.
    The focus is on using <code>code</code>, <code>span</code>, <code>div</code>, and <code>pre</code> correctly.
  </context>

  <constraints>
    <section name="primary-directive">
      <rule>Choose tags based on content semantics (code vs text vs layout) and HTML validity, not just visual appearance.</rule>
      <rule>Respect HTML nesting rules; for example, do not place block-level elements inside <code>&lt;p&gt;</code> or <code>&lt;span&gt;</code>.</rule>
    </section>

    <section name="code-tag-usage">
      <rule>Use <code>&lt;pre&gt;&lt;code&gt;</code> together for multi-line or formatted code blocks only.</rule>
      <rule>Do not use standalone <code>&lt;code&gt;</code> for inline styling; use <code>&lt;span&gt;</code> with classes instead.</rule>
      <rule>Do not place <code>&lt;code&gt;</code> directly inside <code>&lt;p&gt;</code> for multi-line code; wrap code blocks in <code>&lt;pre&gt;&lt;code&gt;</code>.</rule>
    </section>

    <section name="span-and-div-usage">
      <rule>Use <code>&lt;span&gt;</code> for inline text styling, especially inside <code>&lt;p&gt;</code> and other flow text, and nest it safely where inline content is allowed.</rule>
      <rule>Use <code>&lt;div&gt;</code> for block-level layout containers and clickable blocks; do not place <code>&lt;div&gt;</code> directly inside <code>&lt;p&gt;</code> or other inline-only contexts.</rule>
    </section>

    <section name="pre-tag-usage">
      <rule>Use <code>&lt;pre&gt;</code> with <code>&lt;code&gt;</code> for preformatted multi-line code where whitespace and line breaks must be preserved.</rule>
    </section>

    <section name="formatting-conflicts">
      <rule>Prefer tags that play well with Prettier and ESLint: use <code>span</code> for inline stylings and <code>div</code> for block containers to avoid formatting oscillations.</rule>
      <rule>Be aware that <code>pre</code>, <code>textarea</code>, and <code>code</code> receive special handling by formatters; use them only when semantically correct.</rule>
    </section>

  </constraints>

  <forbidden>
    <item>Using standalone <code>&lt;code&gt;</code> for inline styling (for example as a styled label) instead of <code>&lt;span&gt;</code>.</item>
    <item>Placing <code>&lt;div&gt;</code> inside <code>&lt;p&gt;</code> or other inline contexts.</item>
    <item>Splitting closing tags (for example breaking <code>&lt;/code&gt;</code> across lines) in a way that produces invalid HTML.</item>
    <item>Using <code>&lt;code&gt;</code> without <code>&lt;pre&gt;</code> for multi-line code blocks.</item>
  </forbidden>

  <communication>
    Output Requirement: Always explain tag choices and HTML semantics to the user in fluent Chinese, while keeping tag names and example code in their original language.
  </communication>

  <examples>
    <example>
      For inline “code-like” text inside a paragraph, use:
      <code-block language="vue">&lt;p&gt;基于 &lt;span class="bg-muted px-padding-xs rounded"&gt;fontSizeBase&lt;/span&gt; 计算&lt;/p&gt;</code-block>
      instead of using <code>&lt;code&gt;</code> directly.
    </example>
    <example>
      For a clickable code-style block, wrap it in a <code>&lt;div&gt;</code> with classes and <code>@click</code>, not in a <code>&lt;code&gt;</code> tag.
    </example>
  </examples>
</rule>
