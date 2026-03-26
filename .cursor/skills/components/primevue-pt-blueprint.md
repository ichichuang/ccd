# PrimeVue Pass-Through Blueprint

A practical reference for safely customizing PrimeVue components using the Pass-Through (PT) system in this project.

---

## Why PT, Not Scoped Styles

This project uses PrimeVue **Styled Mode** with a custom preset (`createCustomPreset`) that maps our CSS variable design tokens onto PrimeVue's internal theme contract. All components already inherit correct colors, spacing, and dark mode variants from this system.

When you need to go beyond the preset, the **only safe mechanism is the `:pt` prop**. PT injects classes or attributes at specific internal slots of a component without fighting specificity or breaking the CSS variable cascade. Scoped `<style>` overrides targeting `.p-*` classes are permanently forbidden — they cannot respond to `[data-theme="dark"]` and silently defeat the theme engine.

---

## Step 0: Check Global PTs Before Writing Local Ones

Global pass-through presets are registered at app startup and cover the most common components:

```
src/utils/theme/ptPresets/
  formControlsPt.ts     ← InputText, Textarea, Select, MultiSelect, DatePicker, etc.
  buttonPt.ts           ← Button variants
  dataTablePt.ts        ← DataTable rows, headers, pagination
  ...
```

Open the relevant file before writing a local `:pt`. If the global preset already styles the slot you need, you're done — no local PT required. If your use case is a genuine one-off, write the local PT as shown below.

---

## Basic Examples

### `<InputText>` — Custom Background & Hover

```vue
<template>
  <InputText
    v-model="searchQuery"
    placeholder="Search..."
    :pt="{
      root: {
        class: 'bg-muted/30 hover:bg-muted/40 rounded-md transition-all duration-md text-sm'
      }
    }"
  />
</template>
```

**Why this is safe:**
- `bg-muted/30` resolves to `rgb(var(--muted) / 0.30)` — updates automatically in dark mode
- `hover:bg-muted/40` uses the same variable at higher opacity — no hardcoded color
- `rounded-md` maps to `var(--radius-md)` from our spacing scale
- `duration-md` maps to `var(--duration-md)` — never `duration-200`

---

### `<Select>` — Full Panel Customization

```vue
<template>
  <Select
    v-model="selectedRegion"
    :options="regions"
    option-label="name"
    placeholder="Select region"
    :pt="{
      root: {
        class: 'w-full rounded-md'
      },
      label: {
        class: 'text-foreground text-sm'
      },
      panel: {
        class: 'bg-card shadow-md rounded-md border-none'
      },
      item: {
        class: 'text-sm text-foreground hover:bg-primary-light px-md py-sm cursor-pointer'
      },
      emptyMessage: {
        class: 'text-muted-foreground text-sm px-md py-sm'
      }
    }"
  />
</template>
```

**Key slots explained:**
- `root` — the outer trigger element
- `label` — the selected value display
- `panel` — the floating dropdown container
- `item` — each option row
- `emptyMessage` — shown when options list is empty

---

### `<InputText>` with Focus Ring

```vue
<template>
  <InputText
    v-model="email"
    type="email"
    :pt="{
      root: {
        class: 'bg-background rounded-md focus-ring transition-all duration-md'
      }
    }"
  />
</template>
```

`focus-ring` is a semantic shortcut defined in `semanticShortcuts.ts`. It applies the correct `ring-ring` color with the right offset — always use it instead of writing raw `focus:ring-*` utilities.

---

## PT Token Quick Reference

Use only semantic tokens inside PT class strings. Raw Tailwind colors (`text-blue-500`, `bg-gray-100`) and hardcoded hex values are forbidden.

| Visual Need           | Token to Use                                   |
| --------------------- | ---------------------------------------------- |
| Input / control bg    | `bg-background`, `bg-muted/30`                 |
| Hover state           | `hover:bg-muted/40`, `hover:bg-primary-light`  |
| Dropdown / panel bg   | `bg-card`                                      |
| Elevation             | `shadow-sm`, `shadow-md`                       |
| Primary text          | `text-foreground`                              |
| Secondary / hint text | `text-muted-foreground`                        |
| Brand color text      | `text-primary`                                 |
| Focus indicator       | `focus-ring` shortcut                          |
| Disabled appearance   | `opacity-50 cursor-not-allowed`                |
| Spacing               | `px-md`, `py-sm`, `p-sm`, `gap-sm`             |
| Border radius         | `rounded-sm`, `rounded-md`, `rounded-lg`       |
| Transition            | `transition-all duration-md ease-out`          |

---

## Common PT Slot Maps

| Component   | Key Slots                                                         |
| ----------- | ----------------------------------------------------------------- |
| `InputText` | `root`                                                            |
| `Textarea`  | `root`                                                            |
| `Select`    | `root`, `label`, `overlay`, `panel`, `list`, `item`, `emptyMessage` |
| `MultiSelect` | `root`, `label`, `panel`, `item`, `token`, `header`             |
| `DatePicker` | `root`, `panel`, `header`, `day`, `month`, `year`               |
| `Button`    | `root`, `label`, `icon`, `loadingIcon`                           |
| `DataTable` | `root`, `header`, `thead`, `tbody`, `row`, `column`, `footer`   |
| `Dialog`    | `root`, `header`, `title`, `content`, `footer`, `closeButton`   |
| `Drawer`    | `root`, `header`, `title`, `content`, `footer`                  |
| `Tabs`      | `root`, `tablist`, `tab`, `tabpanel`, `activeBar`               |
| `Tag`       | `root`, `label`, `icon`                                          |
| `Badge`     | `root`                                                            |

For the complete slot map of any component, consult the PrimeVue v4 Pass-Through documentation.

---

## Anti-Patterns (Do Not Do This)

```vue
<!-- FORBIDDEN: hardcoded color -->
<InputText :pt="{ root: { class: 'bg-white text-black' } }" />

<!-- FORBIDDEN: raw hex via style -->
<Select :style="{ background: '#f8f9fa' }" />

<!-- FORBIDDEN: scoped style override -->
<style scoped>
.p-select-panel { background: white !important; }
</style>

<!-- FORBIDDEN: Tailwind raw color in PT -->
<Button :pt="{ root: { class: 'bg-blue-600 hover:bg-blue-700' } }" />
```

All of the above defeat dark mode and the central theme engine. Use semantic tokens exclusively.
