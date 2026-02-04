# TypeScript & Linting (SSOT)

本文档描述 TS 项目引用关系、生成类型文件的纳入方式，以及 ESLint 如何与自动导入协作，确保“ref 不需要 import 也不报错”。

## 1. TS 项目引用（Project References）

- `tsconfig.json` 使用 references：
  - `tsconfig.app.json`（应用/业务代码）
  - `tsconfig.node.json`（构建脚本/配置文件）

目的：

- app 与 node 分离，避免 Vue 解析与类型感知互相干扰
- build/ 能安全地通过 `@` 引用 src 内 SSOT（constants/theme metadata 等）

## 2. tsconfig.app.json（业务侧）

关键点：

- include 明确包含自动生成类型：
  - `src/types/auto-imports.d.ts`
  - `src/types/components.d.ts`
  - `src/types/env.d.ts`
- paths：
  - `@/*` → `src/*`
  - `@!/*` → `src/api/*`
  - `@&/*` → `src/layouts/components/*`
- `vueCompilerOptions.strictTemplates = true`：模板类型更严格

结论：

- 自动导入生成的 `.d.ts` 在 TS 视角是“第一公民”，不会被漏掉

## 3. tsconfig.node.json（构建侧）

关键点：

- include 覆盖：
  - `build/**/*`
  - `vite.config.ts`、`uno.config.ts`、`eslint.config.ts` 等配置
  - `src/constants/**/*.ts`、`src/utils/theme/**/*.ts`（允许 build/uno.config 通过 `@` 引 SSOT）

结论：

- build 侧对 SSOT 的引用是受 TS 项目引用保护的

## 4. ESLint 与自动导入（eslint.config.ts）

关键点：

- 从 `./.eslintrc-auto-import.json` 读取 auto-import globals，并注入到 `languageOptions.globals`
- 忽略自动生成类型文件：
  - `src/types/components.d.ts`
  - `src/types/auto-imports.d.ts`
- 对 Vue 文件使用 `vue-eslint-parser`，并将类型感知 linting 限制在纯 TS 文件，避免 Vue 解析器被 projectService 干扰

结论：

- “ref/computed 等不 import 也能用”不会触发 `no-undef`
- 自动生成的 `.d.ts` 不会被 ESLint 无意义地报错
