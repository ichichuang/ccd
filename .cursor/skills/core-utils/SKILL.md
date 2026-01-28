# 通用工具系统 (Core Utils) — 任务指引

当用户要求**日期时间处理**、**ID/UUID 生成**、**字符串命名转换**、**深拷贝/合并/比较/摘字段**、**防抖/节流**、**浏览器能力检测**等通用功能，或你判断某段逻辑应抽到全局工具层复用时，使用本技能。

## 文件角色

| 文件                    | 职责                                                                                                                                                                                                                                                                                                                                 |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/utils/browser.ts`  | 浏览器/环境能力检测工具。目前提供 `getSystemColorMode()`（SSR 安全地检测系统 `prefers-color-scheme`，返回 `'light' \| 'dark'`），未来可扩展其它浏览器能力检测逻辑。                                                                                                                                                                  |
| `src/utils/date.ts`     | 全局日期时间引擎：基于 dayjs 的封装。导出类型与常量（`DateInput`、`Timestamp*`、`DATE_FORMATS`、`DATE_RANGES` 等）、`DateUtils` 类（格式化、解析、智能解析、节假日/工作日、时区、批量处理、缓存、时间段分析等）以及 `dayjs` 实例。所有复杂日期逻辑应优先通过这里实现。                                                               |
| `src/utils/ids.ts`      | ID/UUID 生成工具：`generateUniqueId()`（随机 v4）与 `generateIdFromKey(key)`（基于固定命名空间的 v5 稳定 UUID，失败/空值时回退 v4）。用于生成随机 ID 或基于 key 的稳定 ID。                                                                                                                                                          |
| `src/utils/strings.ts`  | 字符串命名/格式转换工具：目前提供 `toKebabCase(str, start?, end?)` 将驼峰命名转换为中划线命名（可带前后缀），常用于生成 CSS 变量名、class 名等。适合作为未来更多 string 工具的归属地。                                                                                                                                               |
| `src/utils/lodashes.ts` | lodash-es 防腐层与集合/对象工具：按需引入并封装 `cloneDeep`、`isEqual`、`merge`、`pick`、`omit`，对外暴露 `deepClone`、`deepEqual`、`deepMerge`、`objectPick`、`objectOmit` 等；同时提供 `debounceFn` / `throttleFn`（适合在 store/纯 TS 逻辑中使用）。组件内交互防抖/节流建议优先使用 VueUse 的 `useDebounceFn` / `useThrottleFn`。 |

> 若发现项目中直接 `import dayjs` / `lodash-es` / `uuid` / `matchMedia` 等第三方依赖并手写重复逻辑，优先考虑抽取或迁移到上述 utils 文件中统一管理。

## 工具选择策略（复用优先）

### 日期时间、节假日、时区等

- **需求示例**：
  - 格式化时间戳/日期（含多语言、本地化、时区支持）。
  - 判断节假日/工作日、获取下一个工作日。
  - 批量格式化日期、分析一组日期的时间分布。
  - 智能解析多种格式的时间字符串。
- **推荐使用**：
  - 从 `@/utils/date` 导入 `DateUtils` 或 `dayjs`：
    - 格式化：`DateUtils.format` / `formatTimestamp` / `formatTimestampAdvanced` / `formatSmart` / `formatI18n`。
    - 解析：`DateUtils.safeParse` / `smartParse`。
    - 节假日/工作日：`DateUtils.isHoliday` / `isWorkingDay` / `isWeekday` / `nextWorkingDay` 等。
    - 时区：`DateUtils.getAvailableTimezones` / `getTimezoneOffset` / `loadTzdbSafely`。
- **避免**：
  - 在业务代码中直接 `import dayjs` 并重复实现类似功能。

### 唯一 ID / 稳定 ID

- **需求示例**：
  - 生成列表项 key、客户端临时 ID、基于业务 key 的稳定 ID。
- **推荐使用**：
  - 从 `@/utils/ids` 导入：
    - `generateUniqueId()`：需要随机 UUID 时。
    - `generateIdFromKey(key)`：需要基于某个 key 生成稳定且可复现的 ID 时。
- **避免**：
  - 在组件/store 内使用 `Math.random`、时间戳拼接，或重复封装 uuid。

### 字符串命名/格式转换

- **需求示例**：
  - 将 camelCase 转为 kebab-case，用于 CSS 变量名或类名。
  - 未来扩展：snake_case、PascalCase 等命名转换。
- **推荐使用**：
  - 从 `@/utils/strings` 导入 `toKebabCase`。
- **避免**：
  - 在多个地方手写正则进行命名风格转换。

### 集合/对象工具 & 防腐层

- **需求示例**：
  - 深拷贝复杂对象、深比较两个对象、合并配置对象。
  - 从对象中摘取/剔除若干字段。
  - 在 store/纯 TS 逻辑中对函数做防抖/节流。
- **推荐使用**：
  - 从 `@/utils/lodashes` 导入：
    - `deepClone` / `deepEqual` / `deepMerge` / `objectPick` / `objectOmit`。
    - `debounceFn` / `throttleFn`（仅适合非组件生命周期敏感逻辑，例如 store 内部、工具函数内部）。
- **避免**：
  - 在业务代码中直接 `import { cloneDeep } from 'lodash-es'` 等。
  - 在组件内大量使用 `debounceFn` / `throttleFn` 而非 VueUse，在组件卸载时可能遗留定时器。

### 浏览器/环境能力检测

- **需求示例**：
  - 检测系统是否偏好 dark/light 模式（`prefers-color-scheme`）。
  - 未来扩展：检测特定 API 能力、SSR 安全判断。
- **推荐使用**：
  - 从 `@/utils/browser` 导入 `getSystemColorMode()`。
- **避免**：
  - 在组件内部直接 `window.matchMedia('(prefers-color-scheme: dark)')` 到处写。

## 新增工具函数策略（放在哪 / 何时新建模块）

当你需要实现一个新的工具函数时，请按以下步骤决策：

1. **判断是否为通用工具**：
   - 是否与具体业务无关、可在多个模块/页面/Store 中复用？
   - 若答案是否定的（仅服务于某个页面的小逻辑），可以就近写在对应组件/Hook 内，而**不必**放入 utils。
2. **若是通用工具，选择归属模块**：
   - 日期/时间/节假日/工作日/时区相关 → 放入 `src/utils/date.ts`，尽量作为 `DateUtils` 的方法或配套类型/常量。
   - ID/UUID 相关 → 放入 `src/utils/ids.ts`。
   - 字符串命名/解析/格式转换 → 放入 `src/utils/strings.ts`。
   - 集合/对象操作、深拷贝/比较/合并、防抖/节流 → 放入 `src/utils/lodashes.ts`。
   - 浏览器/环境能力检测 → 放入 `src/utils/browser.ts`。
3. **若现有模块都不适合，但功能仍是通用工具**：
   - 可以新建 `src/utils/<domain>.ts`（例如 `src/utils/url.ts`、`src/utils/files.ts`），并：
     - 将第三方库依赖集中在该文件实现“防腐层”；
     - 对外暴露有限而稳定的 API。

> 简化策略：**能复用的通用逻辑优先放入 utils；能挂到现有文件的就不要新建文件；确实属于新的通用领域再新建模块。**

## 排错与重构建议

1. 若在代码中发现多处重复的日期/ID/字符串/对象操作逻辑，应考虑抽取到对应 utils 文件。
2. 若某处直接新引入了 `dayjs`、`lodash-es`、`uuid` 等第三方库，且用途与现有 utils 职责重叠，应优先改为使用 `@/utils/...` 的封装。
3. 若组件内存在复杂的防抖/节流逻辑，优先考虑迁移到 VueUse；仅在 store/工具层保留 `debounceFn` / `throttleFn` 的使用。
