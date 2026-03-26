# 🧠 Project Context & AI Directives

## 🎯 Architectural Overview

This project is a pristine, enterprise-grade boilerplate built on **Vue 3 + Vite + TypeScript**.
All redundant business examples have been stripped away. The codebase retains only the essential system infrastructure (Router/Pinia/Axios/Layout) and our two proprietary, top-tier rendering engines: `ProTable` and `ProForm`.

## ⚙️ Core Engines (The Heavyweights)

The core competency of this project lies in its highly abstracted form and table engines. All business feature development MUST be built upon these foundations:

1. **`ProTable` (Dual-Engine Data Grid):**
   - Seamlessly integrates PrimeVue's `DataTable` with Virtual Scrolling.
   - Enforces End-to-End (E2E) generic propagation (`T`), ensuring absolute type safety for column definitions and data sources.

2. **`ProForm` (Fully Generic Super Form):**
   - Utilizes strict `InjectionKey` bindings and `useFormContext<TValues>()` to achieve flawless generic propagation across the entire recursive rendering tree.
   - Demands extreme type safety, strictly prohibiting `any` type pollution.

## ⚠️ Absolute Directives for AI (Code Generation Rules)

When generating code within this project, you (the AI Agent) **MUST STRICTLY OBEY** the following architectural constraints:

1. **Single Source of Truth (SSOT) Mandate:**
   - **NEVER** hardcode magic numbers in components (e.g., `gridSpan: 12`, `debounce: 200`).
   - **NEVER** hardcode fallback localization strings in components (e.g., `'CNY'`, `'Yes'`, `'No'`).
   - **ALWAYS** import the relevant `DEFAULTS` constants from `src/components/ProForm/engine/config.ts` or `src/components/ProTable/engine/config.ts`.

2. **Generics & Absolute Type Safety:**
   - **NEVER** use the `any` type. If type inference fails, resolve it using generic inheritance or explicit Type Assertions.
   - When creating new form wrappers or nodes, you **MUST** use the `<script setup lang="ts" generic="TValues extends Record<string, unknown>">` macro to propagate types downward.

3. **Dependency Injection Standard:**
   - **NEVER** use raw strings as keys for `Provide/Inject`.
   - **ALWAYS** import strongly typed `InjectionKey` symbols from `engine/constants.ts`.

4. **Logging Protocol:**
   - **NEVER** use native `console.log`, `console.warn`, or `console.error` in business or engine code.
   - **ALWAYS** use the globally encapsulated `ProFormLogger` (or the project's centralized Logger utility) for all output.

---

_💡 AI Acknowledgment Protocol: If you have read and internalized this architectural constitution, you must begin your first response with "Architecture directives loaded" and strictly apply these rules to all subsequent code generation._
