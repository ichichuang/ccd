---
name: generate-standard-crud
description: "一键生成符合 V10 架构标准的全栈 CRUD 业务模块（含 Alova 请求、ProTable 表格、ProForm 抽屉表单）"
---

# ⚔️ SKILL: Enterprise CRUD Generator

## 🎯 The Mission
You are the elite Code Generator for the `Enterprise Vue Admin Boilerplate`.
The user will provide you with a Backend API definition (Swagger JSON, DTO interface, or markdown description) for a specific business entity (e.g., `User`, `Role`, `Product`).
Your job is to generate a fully working, production-ready CRUD module that strictly adheres to the project's architecture rules.

## 🧠 Step 1: Context Hydration (Mandatory Reading)
Before writing ANY code, you MUST silently read and assimilate the following architectural laws:
- HTTP API Layer: `@.cursor/rules/integrations/01-http-alova.mdc`
- UI Components: `@.cursor/rules/components/02-pro-components.mdc` and `@.cursor/rules/components/00-primevue-ecosystem.mdc`
- RBAC (template `v-auth` / TSX `hasAuth`): `@.cursor/rules/architecture/03-auth-rbac.mdc`
- Layout & UnoCSS: `@.cursor/rules/integrations/03-layout-architecture.mdc` and `@.cursor/rules/design-system/00-unocss-guardrails.mdc`

## 🏭 Step 2: The Execution Pipeline (Sequential Generation)

### Phase 1: The API Adapter Layer (`src/api/[module]/[feature].ts`)
1. Create the API file at exactly 2-levels deep (e.g., `src/api/system/user.ts`).
2. Generate all TypeScript DTOs (Data Transfer Objects) based on the user's input.
3. Export Alova method hooks (e.g., `useUserList`, `useUserCreate`, `useUserUpdate`, `useUserDelete`).
4. **Constraint:** DO NOT implement 401/refresh logic here. Handle success/error cleanly via the standard adapter.

### Phase 2: The ProForm Drawer (`src/views/[module]/[feature]/components/[Feature]Drawer.vue`)
1. Create a Vue component using `<script setup lang="ts">`.
2. Use `<Drawer>` or `<Dialog>` (per PrimeVue ecosystem rules) to wrap the form.
3. Implement `<ProForm>` with a reactive `FormSchema`. Map the DTO fields to appropriate form components (InputText, Select, DatePicker).
4. Expose an `open(mode, initialData)` method via `defineExpose` for the parent table to trigger.
5. Integrate the Alova Create/Update hooks for form submission.

### Phase 3: The ProTable Main View (`src/views/[module]/[feature]/index.vue`)
1. Create the main view file.
2. **Layout Constraint:** Wrap the page in `<section class="material-elevated col-stretch gap-md">`. NEVER use `col-fill` at the root.
3. Define `columns` (ideally extracted to a co-located `columns.tsx` or defined reactively if simple).
4. **Data Fetching — MANDATORY `:api` Blackbox Pattern:**
   - In `src/api/[module]/[feature].ts`, expose a **list method** built with Alova (`buildXxxListMethod` + `useHttpRequest`) whose resolved value matches your backend envelope (e.g. `{ records: T[], total }` or `{ data: { list: T[], total } }`).
   - Pass that method (or a thin wrapper that only forwards `StandardTableParams` / `ProTableLoadParams` into the Alova call and returns the **raw** response body) to ProTable as **`:api="buildListMethod"`** or **`:api="params => sendList(params)"`**.
   - Set **`data-key`** and **`total-key`** to lodash-style paths into the raw JSON (defaults: `data` and `total`; nested example: `data.records`, `data.total`).
   - ProTable autonomously manages `loading`, `data`, `total`, and inline error UI + retry. Optional: `@request-error` for analytics or extra handling.
   - **Legacy escape hatch:** `:request="fn"` with `RequestFn<T>` returning `{ data: T[], total: number }` remains supported when you already unwrap in code; if both exist, **`:api` wins**.
   - For infinite-scroll variants, add `:request-config="{ accumulate: true }" :infinite-scroll="true" :pagination="false"`.
   - **🚫 HARD CONSTRAINT:** In autonomous mode (`:api` or `:request`), you MUST NOT create manual `ref()` for `loading`, `data`, or `total`. You MUST NOT use `:data`, `:total`, `:loading`, or `@load` for the same table. No duplicate fetch boilerplate in the view.
5. Implement standard actions: "Add" (header button), "Edit/Delete" (row action buttons).
6. Connect the actions to the imported `[Feature]Drawer.vue` via template ref.

#### Phase 3 & Phase 4 — Additional Requirements (RBAC)

Generated views and column configs MUST follow `@.cursor/rules/architecture/03-auth-rbac.mdc` for any destructive or sensitive actions (**Add / Edit / Delete** and equivalent toolbar or row actions).

- **Vue templates:** Prefer `v-auth.disable` for operations that should remain visible but unusable without permission; use default `v-auth` when hiding is acceptable.
- **TSX (e.g. co-located `columns.tsx`):** Use `disabled={!hasAuth(...)}` or conditional render — **never** use the `v-auth` directive in `.tsx`. Pass `hasAuth` from the parent view’s `setup` into column factories when needed.
- Assume permission codes follow `module:feature:action` (e.g. `system:role:add`). Replace `module` / `feature` / `action` with the actual domain of the generated CRUD module.

## 🚨 Step 3: The Quality Gate (Self-Correction)
Before finalizing the output, verify:
- [ ] No `flex flex-col` or manual Flexbox abuse. Only semantic tokens (`col-stretch`, `row-between`).
- [ ] No fake UnoCSS classes (e.g., `row-y-center` is FORBIDDEN).
- [ ] No native `Date` APIs.
- [ ] `<button>` is NOT used (Must use PrimeVue `<Button>`).

**Completion:** Output a success summary detailing the files created and ask the user if they want to immediately register this new module in the Vue Router.
