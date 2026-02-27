---
description: HTML tag semantics and formatting rules: proper use of code/span/div/pre, avoid formatter conflicts and syntax errors
globs: src/**/*.{vue,tsx}
alwaysApply: true
---

# HTML Tag Semantics & Formatting Rules

## 1. Primary Directive

When generating HTML/Vue template code, you MUST:

1. **Use semantically correct HTML tags** based on content type and context
2. **Respect HTML nesting rules** (e.g. `<p>` cannot contain block-level elements)
3. **Avoid formatting conflicts** between Prettier and ESLint by choosing appropriate tags
4. **Preserve code readability** while keeping valid HTML structure

## 2. Tag Selection Guide

### 2.1 `<code>` Tag Usage

**✅ CORRECT Usage:**

1. **Code blocks** – MUST use with `<pre>`:

   ```vue
   <pre class="m-0 bg-muted/50 p-padding-md fs-sm">
     <code class="text-foreground">
       &lt;div class="example"&gt;Content&lt;/div&gt;
     </code>
   </pre>
   ```

2. **Inline code snippets** – Use `<span>` instead (see below)

**❌ FORBIDDEN:**

- Using `<code>` alone for inline text styling (causes formatting issues)
- Using `<code>` inside `<p>` without `<pre>` wrapper
- Splitting closing tag across lines: `<code>content</code` + `>` (invalid HTML)

**Why avoid standalone `<code>`?**

- Prettier's `singleAttributePerLine: true` produces verbose formatting
- ESLint Vue rules conflict with Prettier
- Can lead to syntax errors when closing tags are split

### 2.2 `<span>` Tag Usage

**✅ CORRECT Usage:**

1. **Inline text styling** – Use `<span>` for styled inline content:

   ```vue
   <p class="text-muted-foreground fs-sm">
     Based on <span class="bg-muted px-padding-xs rounded">fontSizeBase</span> and
     <span class="bg-muted px-padding-xs rounded">FONT_SCALE_RATIOS</span> for dynamic calculation
   </p>
   ```

2. **Inside `<p>` tags** – MUST use `<span>` (not `<div>`):

   ```vue
   <p>
     Login with <span>admin / 123456</span>
   </p>
   ```

3. **Simple inline containers** – When you need inline styling:

   ```vue
   <div class="flex items-center gap-sm">
     <span class="font-mono fs-sm text-foreground">{{ key }}:class</span>
   </div>
   ```

**Rules:**

- `<span>` is an **inline element** – use for text-level styling
- Can be nested inside `<p>`, `<div>`, `<h1-h6>`, etc.
- Prefer `<span>` for inline code-like styling without semantic code meaning

### 2.3 `<div>` Tag Usage

**✅ CORRECT Usage:**

1. **Block-level containers** – Use `<div>` for layout/structure:

   ```vue
   <div class="flex flex-col gap-sm">
     <div
       class="bg-muted p-padding-sm rounded-scale-sm fs-sm cursor-pointer hover:bg-muted/80"
       @click="copyToClipboard('row-center')"
     >
       row-center
     </div>
   </div>
   ```

2. **Clickable code-like blocks** – Use `<div>` when you need block-level click handlers:

   ```vue
   <div
     class="bg-muted p-padding-sm rounded-scale-sm fs-sm cursor-pointer"
     @click="copyToClipboard('fs-{scale}')"
   >
     fs-{scale}
   </div>
   ```

**❌ FORBIDDEN:**

- Using `<div>` inside `<p>` tags (invalid HTML, parsing errors):

  ```vue
  <!-- ❌ WRONG -->
  <p>
    Based on <div class="bg-muted">fontSizeBase</div> for calculation
  </p>

  <!-- ✅ CORRECT -->
  <p>
    Based on <span class="bg-muted">fontSizeBase</span> for calculation
  </p>
  ```

**Rules:**

- `<div>` is a **block-level element** – creates block formatting context
- Cannot be nested inside `<p>` (HTML spec violation)
- Use for layout containers, clickable blocks, or when block-level behavior is needed

### 2.4 `<pre>` Tag Usage

**✅ CORRECT Usage:**

- **Code blocks** – MUST use `<pre><code>` together:

  ```vue
  <pre class="m-0 bg-muted/50 p-padding-md fs-sm">
    <code class="text-foreground">
      &lt;div class="example"&gt;
        Content
      &lt;/div&gt;
    </code>
  </pre>
  ```

**Rules:**

- `<pre>` preserves whitespace and line breaks
- Always pair with `<code>` for semantic code blocks
- This is the ONLY correct way to display code snippets

## 3. HTML Nesting Rules

### 3.1 Block vs Inline Elements

**Block-level elements** (cannot be inside `<p>`):

- `<div>`, `<section>`, `<article>`, `<header>`, `<footer>`
- `<h1>`–`<h6>`, `<ul>`, `<ol>`, `<li>`, `<table>`, `<form>`
- `<pre>`, `<blockquote>`, `<p>` itself

**Inline elements** (can be inside `<p>`):

- `<span>`, `<a>`, `<strong>`, `<em>`, `<code>` (when used correctly)
- `<button>`, `<input>`, `<label>`, `<img>`, `<br>`

### 3.2 Common Nesting Violations

**❌ FORBIDDEN Patterns:**

```vue
<!-- ❌ Block element inside <p> -->
<p>
  Text <div class="bg-muted">content</div> more text
</p>

<!-- ❌ Multiple <p> tags nested -->
<p>
  <p>Nested paragraph</p>
</p>

<!-- ❌ Block element inside inline element -->
<span>
  <div>Block content</div>
</span>
```

**✅ CORRECT Patterns:**

```vue
<!-- ✅ Inline element inside <p> -->
<p>
  Text <span class="bg-muted">content</span> more text
</p>

<!-- ✅ Block elements at same level -->
<div>
  <p>Paragraph one</p>
  <p>Paragraph two</p>
</div>

<!-- ✅ Inline elements nested -->
<span>
  <strong>Bold</strong> and <em>italic</em>
</span>
```

## 4. Formatting Conflict Resolution

### 4.1 Prettier vs ESLint

**Problem:**

- Prettier formats based on `printWidth` and `singleAttributePerLine`
- ESLint Vue rules enforce specific formatting (e.g. `vue/singleline-html-element-content-newline`)
- Conflicts cause format to revert on save

**Solution:**

1. **Choose appropriate tags** – Use tags that work with both formatters:
   - `<span>` for inline styling (avoids `<code>` formatting issues)
   - `<div>` for block containers (but not inside `<p>`)

2. **ESLint ignores** – Vue formatting rules ignore certain tags:
   - `pre`, `textarea`, `code` (when used correctly)
   - `td`, `th`, `span`, `p`, `h1-h6`, `div`, `label`, `button`

3. **Severity** – Vue formatting rules are set to `warn` (not `error`) so Prettier can run first

### 4.2 Tag Selection Decision Tree

```
Need to show code / code-like styling?
├─ Code block (multi-line, formatted)?
│  └─ ✅ Use <pre><code>
│
├─ Inline code style (single line, inside paragraph)?
│  ├─ Inside <p>?
│  │  └─ ✅ Use <span class="..."> (NOT <code>)
│  │
│  └─ In block container?
│     ├─ Needs click handler?
│     │  └─ ✅ Use <div class="..." @click="...">
│     │
│     └─ Display only?
│        └─ ✅ Use <span class="...">
│
└─ Plain text styling?
   └─ ✅ Use <span> or direct classes
```

## 5. Common Patterns & Examples

### 5.1 Inline Code Styling

**❌ WRONG:**

```vue
<p>
  Use <code class="bg-muted px-padding-xs rounded">fontSizeBase</code> for calculation
</p>
```

**✅ CORRECT:**

```vue
<p>
  Use <span class="bg-muted px-padding-xs rounded">fontSizeBase</span> for calculation
</p>
```

### 5.2 Clickable Code Blocks

**❌ WRONG:**

```vue
<code
  class="bg-muted p-padding-sm rounded-scale-sm fs-sm cursor-pointer"
  @click="copyToClipboard('row-center')"
>row-center</code>
```

**✅ CORRECT:**

```vue
<div
  class="bg-muted p-padding-sm rounded-scale-sm fs-sm cursor-pointer hover:bg-muted/80"
  @click="copyToClipboard('row-center')"
>
  row-center
</div>
```

### 5.3 Code Blocks

**✅ CORRECT (ONLY way):**

```vue
<pre class="m-0 bg-muted/50 p-padding-md fs-sm">
  <code class="text-foreground">
    &lt;div class="example"&gt;
      Content
    &lt;/div&gt;
  </code>
</pre>
```

### 5.4 Paragraph Content

**❌ WRONG:**

```vue
<p class="text-muted-foreground fs-sm">
  Based on <div class="bg-muted px-padding-xs rounded">fontSizeBase</div> for calculation
</p>
```

**✅ CORRECT:**

```vue
<p class="text-muted-foreground fs-sm">
  Based on <span class="bg-muted px-padding-xs rounded">fontSizeBase</span> for calculation
</p>
```

## 6. Quick Reference Checklist

Before generating code, check:

- [ ] **Is this code content?**
  - Yes → Use `<pre><code>` for blocks, `<span>` for inline
  - No → Continue

- [ ] **Is this inside a `<p>` tag?**
  - Yes → MUST use `<span>` (not `<div>` or standalone `<code>`)
  - No → Use `<div>` or `<span>` based on layout needs

- [ ] **Does this need click interaction?**
  - Yes → Use `<div>` with `@click` (not `<code>`)
  - No → Use `<span>` for inline, `<div>` for block

- [ ] **Is this a code block (multi-line, formatted)?**
  - Yes → MUST use `<pre><code>`
  - No → Use `<span>` or `<div>` based on context

## 7. Anti-Patterns

**❌ FORBIDDEN Patterns:**

1. **Standalone `<code>` for styling:**

   ```vue
   <!-- ❌ Causes formatting issues -->
   <code class="bg-muted px-padding-xs rounded">text</code>
   ```

2. **`<div>` inside `<p>`:**

   ```vue
   <!-- ❌ Invalid HTML -->
   <p>Text <div>content</div> more text</p>
   ```

3. **Split closing tags:**

   ```vue
   <!-- ❌ Syntax error -->
   <code class="...">content</code>
   ```

4. **`<code>` without `<pre>` for code blocks:**

   ```vue
   <!-- ❌ Missing semantic structure -->
   <code>multi-line code</code>
   ```

## 8. Summary

**Key Rules:**

1. ✅ **`<pre><code>`** – ONLY for code blocks (multi-line, formatted)
2. ✅ **`<span>`** – For inline styling, especially inside `<p>`
3. ✅ **`<div>`** – For block containers and clickable blocks (NOT inside `<p>`)
4. ❌ **Standalone `<code>`** – Avoid for styling (use `<span>` instead)
5. ❌ **`<div>` inside `<p>`** – Invalid HTML, parsing errors

**Remember:**

- Choose tags by **semantic meaning** and **HTML nesting rules**
- Avoid formatter conflicts with tags that work for Prettier/ESLint
- When in doubt, use `<span>` for inline and `<div>` for block
- Never nest block elements inside `<p>`
