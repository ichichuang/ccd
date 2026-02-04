# Skills & Workflows: Cursor + Antigravity

> 标准化的「两步走」流程与常用 Prompt，供 Cursor 与 Antigravity 分别执行时参考。

## 场景：开发「用户列表」功能

### 第一步：Cursor（做逻辑）

在 Cursor 中执行（可 @ 引用规则与文档）：

```
基于 @docs/PROJECT_PROTOCOL.md 和 @.cursor/rules/00-core-architecture.mdc，为「用户列表」功能开发逻辑：
1. 创建 src/hooks/useUserList.ts
2. 使用 Alova（useHttpRequest 或 alovaInstance）定义请求
3. 包含分页和加载状态
4. 参考 @docs/GOLDEN_SAMPLES/useFeatureLogic.ts，不要生成 UI 代码。
```

### 第二步：Antigravity（画页面）

在 Antigravity 中执行：

```
读取 @src/hooks/useUserList.ts 和 @docs/GOLDEN_SAMPLES/UIComponent.vue。
创建 UserList.vue（可放在 src/views/ 或指定目录）。
使用 PrimeVue 的 DataTable 展示数据，UnoCSS 美化，移动端适配。
绑定逻辑层的数据和事件，不要修改 script 中的业务逻辑。
```

---

## 其他常用 Prompt

| 场景                | 工具        | Prompt 要点                                                                                                                            |
| ------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **只修逻辑**        | Cursor      | 「只修 [具体问题]。CRITICAL：不修改现有 template 和 class，只动 `<script setup>`。」                                                   |
| **只改样式**        | Antigravity | 「只改 [组件] 的布局/样式。CRITICAL：保持所有 @click、v-model 不变，只改 class 或 pt。」                                               |
| **生成新功能逻辑**  | Cursor      | 「基于 @docs/PROJECT_PROTOCOL.md，为 [功能名] 开发逻辑。创建 useXxx.ts，参考 @docs/GOLDEN_SAMPLES/useFeatureLogic.ts，不写 UI。」      |
| **根据逻辑组装 UI** | Antigravity | 「读取 [逻辑文件] 和 @docs/GOLDEN_SAMPLES/UIComponent.vue。为 [Component].vue 做响应式 UI，UnoCSS + PrimeVue，绑定逻辑层状态与事件。」 |

---

## 使用建议

- 每次复杂任务开始时，在 Cursor / Antigravity 中先 **@ 引用** `docs/PROJECT_PROTOCOL.md` 或对应黄金示例，再发具体指令。
- 逻辑层一律交给 Cursor（composables、types、Store）；UI/布局交给 Antigravity（template、class、pt）。
