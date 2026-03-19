---
description: Strict TypeScript & Vue 3 Generics/TSX standards to prevent compiler panics.
globs: src/**/*.{vue,ts,tsx}
alwaysApply: true
---

# Vue 3 & TypeScript Strict Mode Protocols

<context>
This enterprise architecture heavily utilizes Vue 3 `<script setup>`, complex Generic Wrappers, and Vue TSX. AI must strictly follow these typing rules to prevent `ts-plugin` errors, generic mismatches, and build failures.
</context>

<constraints>
## 1. Vue TSX Strictness (No React Habits)
- **FORBIDDEN:** Do NOT use `JSX.Element` as a return type in Vue `.tsx` files.
- **REQUIRED:** Always import and use `VNode` from `'vue'` for TSX component return types.
- **REQUIRED:** Props in TSX must strictly follow camelCase as defined by the component (e.g., use `paginatorJustifyContent`, NOT `paginatorjustifycontent`).

## 2. Component Props & `withDefaults` (The Index Signature Trap)

- **FORBIDDEN:** NEVER mix exact prop definitions with index signatures (e.g., `[key: string]: unknown`) inside `defineProps<{}>` when using `withDefaults`. This crashes the Vue compiler's `InferDefaults`.
- **SOLUTION:** For wrapper components (e.g., `WrappedDatePicker`), define explicit props in `defineProps`. For unknown passthrough attributes, rely on Vue's native `$attrs` or `useAttrs()` instead of hacking the prop interface.

## 3. Type Narrowing & Defense (No `unknown` blind spots)

- **FORBIDDEN:** NEVER access methods on variables typed as `unknown` or general `object` (e.g., calling `date.getTime()` on an `unknown` variable).
- **REQUIRED:** Always use Type Guards before access. (e.g., `if (val instanceof Date) { val.getTime() }`).
- **REQUIRED:** When dealing with dynamic form models (`Record<string, unknown>`), use explicit type assertions (`as UserTableRowModel`) only when absolutely certain, or runtime checks. **Such assertions are allowed ONLY inside <script setup> or in .ts/.tsx files—NEVER inside <template> (see §6).**

## 4. Composable Return Types (Exported Definitions)

- **FORBIDDEN:** Do not rely on implicit return types for complex composables (e.g., `export function useAdminTabs() { ... }`). This causes TS error: "inferred type cannot be named".
- **REQUIRED:** Always explicitly define the return interface for hooks. (e.g., `export function useAdminTabs(): AdminTabsReturn { ... }`).

## 5. Generic Propagation

- When passing generics down multiple layers, ensure the generic constraint `TValues extends Record<string, unknown>` is preserved explicitly in all intermediate functions. Do not let it silently degrade to `any` or `unknown`.

## 6. Vue Template & TypeScript Boundary (CRITICAL)

- **ABSOLUTELY FORBIDDEN:** You must NEVER use TypeScript syntax, especially inline type assertions (e.g., `as string`, `as MyType`, `as const`), generic type arguments (`<T>`), or explicit type annotations (`: Type`) directly inside Vue `<template>` blocks (including bindings like `:prop="val"`, `@click="fn"`, or interpolations `{{ }}`). This strictly includes dynamic components (<component :is="comp as Component" />), slot scopes ({{ (slotData as User).name }}), and event emitters (@click="$emit('update', val as number)").
- **CORRECT PATTERN:** If a value in the template has a type mismatch, you MUST resolve it inside `<script setup>`:
  1. Create a strongly-typed `computed` property.
  2. Create a strongly-typed helper function.
  3. Narrow the type of the `ref`/`reactive` directly.
- _Never try to satisfy the "Strict TypeScript" rules by injecting `as` into the HTML template._
  </constraints>

<communication>
If the user asks you to fix a TS error involving `withDefaults`, index signatures, or generic mismatches, explain the Vue compiler limitation in Chinese before applying the fix.
</communication>
