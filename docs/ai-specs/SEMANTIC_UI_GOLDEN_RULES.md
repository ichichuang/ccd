# Semantic UI Golden Rules (Phase 13.0)

> **目标读者：AI**。本文档为语义化 UI 的**最高纲领**，适用于所有页面（尤其是系统配置视图）的结构、布局、交互与排版。与 `.cursor/rules/101-premium-ui.mdc` 及 `104-anti-flicker-ring-less.mdc` 共同构成单一事实来源。

**Core principle:** Structure belongs to Archetype; details belong to Semantic Shortcuts; magic numbers are FORBIDDEN.

---

## 1. Pillar One — Structural Integrity (结构与骨架)

### 1.1 Mandatory data-archetype

- **EVERY** page root element MUST declare `data-archetype` with a value from `ARCHETYPE_SPEC.md` (A1–A5).
- When a same-directory `page.state.ts` exists, the archetype MUST match the state file to avoid drift (see `.cursor/rules/30-drift-check.mdc`).

**Example (correct):**

```vue
<template>
  <div data-archetype="A3-stats-grid">
    <div class="col-stack-xl layout-content-wide">
      <!-- content -->
    </div>
  </div>
</template>
```

**FORBIDDEN:** A page root without `data-archetype`, or with an archetype not defined in ARCHETYPE_SPEC.

### 1.2 Transparent Root Policy

- The page root wrapper MUST provide **structure only**: e.g. `h-full flex flex-col overflow-hidden`. It MUST NOT set `bg-card`, `bg-background`, `bg-surface-ground`, `bg-surface-elevated`, or any `surface-*` / `bg-*` on the root.
- Background and elevation belong to **nested** containers: use `surface-elevated`, `glass-surface`, or `shadow-soft` on inner cards/panels only.

### 1.3 Scroll model

- **Choose the scroll model based on `ARCHETYPE_SPEC.md` and `page.state.ts`.**
- Each archetype (A1–A5) defines a SCROLL MODEL (e.g. content owns scroll via `<CScrollbar>`, table virtual scroll only, body scroll only). Implement exactly that; do not invent custom scroll behavior.

**Reference:** `@./ARCHETYPE_SPEC.md`, `@./UI_STATE_CONTRACT.md`, `@./INTENT_PROFILES.md`

---

## 2. Pillar Two — Absolute Semantic Layout (绝对语义化布局)

### 2.1 No magic units

- **FORBIDDEN:** `rem`, `em`, or `px` in business `.vue` / `.tsx` code (including Tailwind-style atomics like `p-4`, `gap-4`, `text-sm` when the project defines semantic equivalents).
- **MUST:** Use only semantic tokens and shortcuts from `uno.config.ts` and the design system.

### 2.2 Macro fluid layout

- **Width:** MUST use one of `layout-content-narrow`, `layout-content`, or `layout-content-wide` (vw-based). FORBIDDEN: `max-w-7xl`, `max-w-2xl`, or any rem-based max-width for the main content area.
- **Height (charts / large blocks):** Use viewport-relative units (e.g. `min-h-[50vh]`) or semantic shortcuts such as `min-h-kpi-card`, `layout-scroll-panel` when defined in `uno.config.ts`.

### 2.3 Micro layout (spacing & alignment)

- **Spacing:** MUST use semantic tokens: `gap-xl`, `gap-lg`, `p-padding-md`, `px-padding-lg`, etc. FORBIDDEN: raw `p-4`, `gap-4`, `m-2`.
- **Alignment:** MUST use layout shortcuts: `row-between`, `center`, `col-stack-{xs|sm|md|lg|xl}`, `layout-stack`, `row-center`, `row-y-center`, etc. FORBIDDEN: hand-written long flex atomics (e.g. `flex flex-row items-center justify-between`) when a shortcut exists. NOTE: `column-stack` does NOT exist — use `col-stack-{size}` instead.

**Example (correct):**

```vue
<div class="col-stack-xl layout-content-wide">
  <header class="col-stack-sm">
    <h1 class="fs-2xl font-bold text-foreground m-0">Title</h1>
    <p class="fs-sm text-muted-foreground m-0">Subtitle</p>
  </header>
  <div class="grid grid-cols-1 lg:grid-cols-4 gap-lg">
    <!-- cards -->
  </div>
</div>
```

**Reference:** `uno.config.ts` shortcuts (§ layout, density, flex), `.cursor/rules/101-premium-ui.mdc` §3 / §3a

---

## 3. Pillar Three — Physical Interaction (物理感交互)

### 3.1 Card-level hover

- Cards or tiles that afford click/hover MUST use the `interactive-hover-card` or `interactive-hover-tile` shortcut (displacement + shadow diffusion, no ring/border).
- **FORBIDDEN:** `hover:ring-*`, `hover:border-*` for card hover.

### 3.2 List / row-level hover

- List items or table-like rows MUST use `surface-item` for base background and `behavior-hover-transition` with `hover:bg-foreground/5` for hover. Do NOT use card-level lift (`-translate-y-1`) on list rows.

### 3.3 Shadows

- All elevation shadows MUST be theme-tinted (Phase 12): light mode `rgb(var(--foreground)/…)`, dark mode `rgb(var(--background)/…)`. Use shortcuts `shadow-soft`, `shadow-float`, `interactive-hover-card`, `interactive-hover-tile` from `uno.config.ts`. **FORBIDDEN:** `rgba(0,0,0,x)` or hardcoded black/white in box-shadow.

**Reference:** `.cursor/rules/104-anti-flicker-ring-less.mdc` (authoritative for ring/outline/border prohibition and shadow/hover rules); do not duplicate those rules here.

---

## 4. Pillar Four — Typography Hierarchy (文本层级)

### 4.1 Secondary text

- All secondary or auxiliary copy (subtitles, captions, hints, timestamps) MUST use `text-muted` or `text-secondary` (or the semantic equivalents `text-muted-foreground`, `text-secondary-foreground`).
- **FORBIDDEN:** Raw gray classes (e.g. `text-gray-500`) or hardcoded colors for secondary text.

### 4.2 Container constraint (lists / cards)

- Description text inside list items or cards that may be long MUST use `text-single-line-ellipsis` so that overflow is truncated with ellipsis and layout is not broken.

**Example (correct):**

```vue
<span class="text-muted text-single-line-ellipsis fs-xs">{{ item.description }}</span>
<span class="text-secondary fs-xs">{{ item.time }}</span>
```

**Reference:** `uno.config.ts` — `text-single-line-ellipsis`, `text-muted`, `text-secondary`

---

## 5. Summary Checklist (AI self-check)

Before delivering any page or system-configuration view:

- [ ] Page root has `data-archetype` and matches ARCHETYPE_SPEC + page.state.ts (if present).
- [ ] Scroll model is chosen from ARCHETYPE_SPEC and page.state.ts.
- [ ] Root wrapper is transparent (no `bg-*` / `surface-*` on root).
- [ ] No `rem`/`em`/`px` or magic atomics; macro layout uses `layout-content-*` and vh/semantic height; micro uses `gap-*`, `p-padding-*`, and layout shortcuts.
- [ ] Cards use `interactive-hover-card` (or `interactive-hover-tile`); list rows use `surface-item` + `behavior-hover-transition` + `hover:bg-foreground/5`.
- [ ] Shadows are theme-tinted (shortcuts only).
- [ ] Secondary text uses `text-muted` / `text-secondary`; list descriptions use `text-single-line-ellipsis`.

---

## 6. Related docs

| Doc                                            | Role                                                      |
| ---------------------------------------------- | --------------------------------------------------------- |
| `ARCHETYPE_SPEC.md`                            | A1–A5 structure, scroll model, component map              |
| `UI_STATE_CONTRACT.md`                         | UIDesignState, archetype derivation                       |
| `INTENT_PROFILES.md`                           | intent → derived state lookup                             |
| `.cursor/rules/101-premium-ui.mdc`             | Premium UI + Phase 13.0 rule summary                      |
| `.cursor/rules/104-anti-flicker-ring-less.mdc` | Shadow-only, no ring; hover/focus details                 |
| `uno.config.ts`                                | Semantic shortcuts (layout, density, surface, typography) |
