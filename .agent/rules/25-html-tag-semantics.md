---
description: HTML 标签语义与格式化规范：正确使用 code/span/div/pre，避免格式化冲突和语法错误
globs: src/**/*.{vue,tsx}
alwaysApply: true
---

# HTML Tag Semantics & Formatting Rules (HTML 标签语义与格式化规范)

## 1. Primary Directive (核心原则)

When generating HTML/Vue template code, you MUST:

1. **Use semantically correct HTML tags** based on content type and context
2. **Respect HTML nesting rules** (e.g., `<p>` cannot contain block-level elements)
3. **Avoid formatting conflicts** between Prettier and ESLint by choosing appropriate tags
4. **Preserve code readability** while maintaining valid HTML structure

## 2. Tag Selection Guide (标签选择指南)

### 2.1 `<code>` Tag Usage (代码标签使用)

**✅ CORRECT Usage:**

1. **Code blocks (代码块)** - MUST use with `<pre>`:

   ```vue
   <pre class="m-0 bg-muted/50 p-padding-md fs-sm">
     <code class="text-foreground">
       &lt;div class="example"&gt;Content&lt;/div&gt;
     </code>
   </pre>
   ```

2. **Inline code snippets (内联代码片段)** - Use `<span>` instead (see below)

**❌ FORBIDDEN:**

- Using `<code>` alone for inline text styling (causes formatting issues)
- Using `<code>` inside `<p>` tags without `<pre>` wrapper
- Splitting closing tag across lines: `<code>content</code` + `>` (invalid HTML)

**Why avoid standalone `<code>`?**

- Prettier's `singleAttributePerLine: true` causes verbose formatting
- ESLint Vue rules conflict with Prettier formatting
- Can lead to syntax errors when closing tags are split

### 2.2 `<span>` Tag Usage (内联元素使用)

**✅ CORRECT Usage:**

1. **Inline text styling (内联文本样式)** - Use `<span>` for styled inline content:

   ```vue
   <p class="text-muted-foreground fs-sm">
     基于 <span class="bg-muted px-padding-xs rounded">fontSizeBase</span> 与
     <span class="bg-muted px-padding-xs rounded">FONT_SCALE_RATIOS</span> 动态计算
   </p>
   ```

2. **Inside `<p>` tags** - MUST use `<span>` (not `<div>`):

   ```vue
   <p>
     使用账号 <span>admin / 123456</span> 登录
   </p>
   ```

3. **Simple inline containers** - When you need inline styling:
   ```vue
   <div class="flex items-center gap-sm">
     <span class="font-mono fs-sm text-foreground">{{ key }}:class</span>
   </div>
   ```

**Rules:**

- `<span>` is an **inline element** - use for text-level styling
- Can be nested inside `<p>`, `<div>`, `<h1-h6>`, etc.
- Perfect for inline code-like styling without semantic code meaning

### 2.3 `<div>` Tag Usage (块级元素使用)

**✅ CORRECT Usage:**

1. **Block-level containers (块级容器)** - Use `<div>` for layout/structure:

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

2. **Clickable code-like blocks** - Use `<div>` when you need block-level click handlers:
   ```vue
   <div
     class="bg-muted p-padding-sm rounded-scale-sm fs-sm cursor-pointer"
     @click="copyToClipboard('fs-{scale}')"
   >
     fs-{scale}
   </div>
   ```

**❌ FORBIDDEN:**

- Using `<div>` inside `<p>` tags (invalid HTML - causes parsing errors):

  ```vue
  <!-- ❌ WRONG -->
  <p>
    基于 <div class="bg-muted">fontSizeBase</div> 计算
  </p>

  <!-- ✅ CORRECT -->
  <p>
    基于 <span class="bg-muted">fontSizeBase</span> 计算
  </p>
  ```

**Rules:**

- `<div>` is a **block-level element** - creates new block formatting context
- Cannot be nested inside `<p>` (HTML spec violation)
- Use for layout containers, clickable blocks, or when you need block-level behavior

### 2.4 `<pre>` Tag Usage (预格式化标签使用)

**✅ CORRECT Usage:**

- **Code blocks** - MUST use `<pre><code>` combination:
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
- Always use with `<code>` for semantic code blocks
- This is the ONLY correct way to display code snippets

## 3. HTML Nesting Rules (HTML 嵌套规则)

### 3.1 Block vs Inline Elements (块级 vs 内联元素)

**Block-level elements** (cannot be inside `<p>`):

- `<div>`, `<section>`, `<article>`, `<header>`, `<footer>`
- `<h1>`-`<h6>`, `<ul>`, `<ol>`, `<li>`, `<table>`, `<form>`
- `<pre>`, `<blockquote>`, `<p>` itself

**Inline elements** (can be inside `<p>`):

- `<span>`, `<a>`, `<strong>`, `<em>`, `<code>` (when used correctly)
- `<button>`, `<input>`, `<label>`, `<img>`, `<br>`

### 3.2 Common Nesting Violations (常见嵌套错误)

**❌ FORBIDDEN Patterns:**

```vue
<!-- ❌ Block element inside <p> -->
<p>
  文本 <div class="bg-muted">内容</div> 更多文本
</p>

<!-- ❌ Multiple <p> tags nested -->
<p>
  <p>嵌套段落</p>
</p>

<!-- ❌ Block element inside inline element -->
<span>
  <div>块级内容</div>
</span>
```

**✅ CORRECT Patterns:**

```vue
<!-- ✅ Inline element inside <p> -->
<p>
  文本 <span class="bg-muted">内容</span> 更多文本
</p>

<!-- ✅ Block elements at same level -->
<div>
  <p>段落一</p>
  <p>段落二</p>
</div>

<!-- ✅ Inline elements nested -->
<span>
  <strong>粗体</strong> 和 <em>斜体</em>
</span>
```

## 4. Formatting Conflict Resolution (格式化冲突解决)

### 4.1 Prettier vs ESLint (格式化工具冲突)

**Problem:**

- Prettier formats code based on `printWidth` and `singleAttributePerLine`
- ESLint Vue rules enforce specific formatting (e.g., `vue/singleline-html-element-content-newline`)
- Conflicts cause formatting to revert on save

**Solution:**

1. **Use appropriate tags** - Choose tags that work well with both formatters:
   - Use `<span>` for inline styling (avoids `<code>` formatting issues)
   - Use `<div>` for block-level containers (but not inside `<p>`)

2. **ESLint ignores** - Certain tags are ignored by Vue formatting rules:
   - `pre`, `textarea`, `code` (when used correctly)
   - `td`, `th`, `span`, `p`, `h1-h6`, `div`, `label`, `button`

3. **Rule severity** - Vue formatting rules are set to `warn` (not `error`) to allow Prettier to format first

### 4.2 Tag Selection Decision Tree (标签选择决策树)

```
需要显示代码/代码样式？
├─ 是代码块（多行，需要保留格式）？
│  └─ ✅ 使用 <pre><code> 组合
│
├─ 是内联代码样式（单行，在段落中）？
│  ├─ 在 <p> 标签内？
│  │  └─ ✅ 使用 <span class="...">（NOT <code>）
│  │
│  └─ 在块级容器中？
│     ├─ 需要点击交互？
│     │  └─ ✅ 使用 <div class="..." @click="...">
│     │
│     └─ 仅样式展示？
│        └─ ✅ 使用 <span class="...">
│
└─ 是普通文本样式？
   └─ ✅ 使用 <span> 或直接使用类名
```

## 5. Common Patterns & Examples (常见模式与示例)

### 5.1 Inline Code Styling (内联代码样式)

**❌ WRONG:**

```vue
<p>
  使用 <code class="bg-muted px-padding-xs rounded">fontSizeBase</code> 计算
</p>
```

**✅ CORRECT:**

```vue
<p>
  使用 <span class="bg-muted px-padding-xs rounded">fontSizeBase</span> 计算
</p>
```

### 5.2 Clickable Code Blocks (可点击代码块)

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

### 5.3 Code Blocks (代码块)

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

### 5.4 Paragraph Content (段落内容)

**❌ WRONG:**

```vue
<p class="text-muted-foreground fs-sm">
  基于 <div class="bg-muted px-padding-xs rounded">fontSizeBase</div> 计算
</p>
```

**✅ CORRECT:**

```vue
<p class="text-muted-foreground fs-sm">
  基于 <span class="bg-muted px-padding-xs rounded">fontSizeBase</span> 计算
</p>
```

## 6. Quick Reference Checklist (快速参考检查清单)

Before generating code, check:

- [ ] **Is this code content?**
  - Yes → Use `<pre><code>` for blocks, `<span>` for inline
  - No → Continue

- [ ] **Is this inside a `<p>` tag?**
  - Yes → MUST use `<span>` (not `<div>` or standalone `<code>`)
  - No → Can use `<div>` or `<span>` based on layout needs

- [ ] **Does this need click interaction?**
  - Yes → Use `<div>` with `@click` (not `<code>`)
  - No → Use `<span>` for inline, `<div>` for block

- [ ] **Is this a code block (multi-line, formatted)?**
  - Yes → MUST use `<pre><code>` combination
  - No → Use `<span>` or `<div>` based on context

## 7. Anti-Patterns (反模式)

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

## 8. Summary (总结)

**Key Rules:**

1. ✅ **`<pre><code>`** - ONLY for code blocks (multi-line, formatted)
2. ✅ **`<span>`** - For inline styling, especially inside `<p>` tags
3. ✅ **`<div>`** - For block-level containers and clickable blocks (NOT inside `<p>`)
4. ❌ **Standalone `<code>`** - Avoid for styling (use `<span>` instead)
5. ❌ **`<div>` inside `<p>`** - Invalid HTML, causes parsing errors

**Remember:**

- Choose tags based on **semantic meaning** and **HTML nesting rules**
- Avoid formatting conflicts by using tags that work well with Prettier/ESLint
- When in doubt, use `<span>` for inline content and `<div>` for block content
- Always respect HTML nesting rules (no block elements inside `<p>`)
