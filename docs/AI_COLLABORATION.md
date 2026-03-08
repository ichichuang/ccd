# Skills & Workflows: Cursor + Antigravity

> **Target reader: AI**. This doc is for AI task execution: it defines the standard two-step workflow and common prompts (prompt examples below are in Chinese for developers to copy).

## Scenario: Implement «User List» feature

### Step 1: Cursor (logic)

Run in Cursor (you can @-reference rules and docs):

```
基于 @./ai-specs/PROJECT_PROTOCOL.md 和 @.cursor/rules/12-api-layer.mdc，为「用户列表」功能开发逻辑：
1. 先创建 src/api/user/list.ts（module=user, feature=list，仅两级；DTO + buildUserListMethod）
2. 再创建 src/hooks/modules/useUserList.ts，用 useHttpRequest 调用 API
3. 包含分页和加载状态
4. 参考 @./ai-specs/GOLDEN_SAMPLES/useFeatureLogic.ts，不要生成 UI 代码。
```

### Step 2: Antigravity (UI)

Run in Antigravity:

```
读取 @src/hooks/modules/useUserList.ts、@./ai-specs/GOLDEN_SAMPLES/UIComponent.vue 和 @./ai-specs/DataTable_COMPONENT.md。
创建 UserList.vue（可放在 src/views/ 或指定目录）。
使用项目的 DataTable（@/components/DataTable）展示数据，配置 api 属性对接 useUserList、分页、排序等；勿裸用 PrimeVue DataTable。
UnoCSS 美化，移动端适配，内容区用 CScrollbar 包裹。
绑定逻辑层的数据和事件，不要修改 script 中的业务逻辑。
```

---

## Other common prompts

| 场景                | 工具        | Prompt 要点                                                                                                                                                                                                                                |
| ------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **只修逻辑**        | Cursor      | 「只修 [具体问题]。CRITICAL：不修改现有 template 和 class，只动 `<script setup>`。」                                                                                                                                                       |
| **只改样式**        | Antigravity | 「只改 [组件] 的布局/样式。CRITICAL：保持所有 @click、v-model 不变，只改 class 或 pt。」                                                                                                                                                   |
| **生成新功能逻辑**  | Cursor      | 「基于 @./ai-specs/PROJECT_PROTOCOL.md 和 @.cursor/rules/12-api-layer.mdc，为 [功能名] 开发逻辑。先创建 src/api/<module>/<feature>.ts，再创建 src/hooks/modules/useXxx.ts，参考 @./ai-specs/GOLDEN_SAMPLES/useFeatureLogic.ts，不写 UI。」 |
| **根据逻辑组装 UI** | Antigravity | 「读取 [逻辑文件] 和 @./ai-specs/GOLDEN_SAMPLES/UIComponent.vue。为 [Component].vue 做响应式 UI，UnoCSS + PrimeVue，绑定逻辑层状态与事件。若为列表/表格场景，使用 DataTable 并参考 @./ai-specs/DataTable_COMPONENT.md。」                  |
| **多字段表单**      | Cursor      | 「使用 SchemaForm + useSchemaForm，参考 @docs/SCHEMA_FORM_COMPONENT.md。定义 Schema（columns、layout、rules、steps/sections 等），不手写 PrimeVue 表单拼装。」                                                                             |

---

## Usage tips

- At the start of each complex task, @-reference `./ai-specs/PROJECT_PROTOCOL.md` or the relevant golden sample in Cursor / Antigravity before sending the concrete instruction.
- Logic layer goes to Cursor (composables, types, Store); UI and layout go to Antigravity (template, class, pt).
