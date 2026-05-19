/**
 * ProForm 引擎全局默认配置 (Engine Defaults Registry)
 * 作为单一数据源 (SSOT)，供引擎内部回退使用，并对外暴露以供查阅。
 */
export const PRO_FORM_DEFAULTS = {
  /**
   * 默认表单布局模式
   *
   * - 'vertical': 标签在上方，字段垂直排列
   * - 'horizontal': 标签在左侧，字段在右侧
   *
   * 该值作为 ProForm 组件未显式传入 layout 时的回退。
   */
  layout: 'vertical',

  /**
   * 默认表单主轴间距 (gap)
   *
   * 推荐使用设计系统中的 CSS 变量，而不是固定 px/rem。
   * 此处默认值为中等间距，对应中等密度表单。
   */
  gap: '0',

  /**
   * 默认标签宽度
   *
   * - 'auto': 由浏览器根据内容自动计算宽度；
   * - 业务侧可通过字符串变量（如 'var(--spacing-3xl)'）进行统一控制；
   *
   * 注意：ProForm 内部仅在传入 string 时才会应用到样式中，避免 px/rem 魔法数。
   */
  labelWidth: 'auto',

  /**
   * 默认标签对齐方式
   *
   * - 'left': 左对齐（适合大多数场景）
   * - 'center' / 'right': 可用于特殊布局需求
   *
   * 仅在 horizontal 布局下生效。
   */
  labelAlign: 'left',

  /**
   * 默认栅格占据列数 (Grid Span)
   *
   * ProForm 使用 12 栅格布局：
   * - 12 表示整行占满
   * - 6 表示半行
   *
   * 当字段或分组未单独配置 span，或解析结果无效（<=0）时，将回退到该值。
   */
  gridSpan: 12,
} as const

export const PRO_FORM_LAYOUT_DEFAULTS = {
  /**
   * 当字段或分组未单独配置 span，或解析结果无效（<=0）时的回退列数
   */
  gridSpan: 12,
  /**
   * ResizeObserver / 容器宽度返回 0 时的回退宽度
   */
  responsiveFallbackWidth: 1024,
} as const

export const PRO_FORM_TIMING_DEFAULTS = {
  /**
   * 表单容器尺寸变化的防抖时间（毫秒）。
   *
   * 影响面：
   * - `index.vue` 内部对 ResizeObserver 回调做节流/防抖，避免窗口拖拽或容器抖动时频繁触发 `resize()`。
   *
   * 设计意图：
   * - 该值越小：响应更快，但会增加渲染/布局计算频率；
   * - 该值越大：更省性能，但会带来 UI 更新延迟。
   */
  resizeDebounceMs: 100,

  /**
   * 校验触发的防抖时间（毫秒）。
   *
   * 影响面：
   * - `ValidationEngine` 内部对字段校验排队执行，避免输入过程中每次变更都触发同步/异步规则计算。
   *
   * 设计意图：
   * - 平衡“输入体验（不打断）”与“尽快给出错误反馈”。
   */
  validationDebounceMs: 200,

  /**
   * 异步 options（如下拉/多选远程选项）的防抖时间（毫秒）。
   *
   * 影响面：
   * - `FormController` 触发异步 options 解析/加载时使用，减少依赖字段频繁变化导致的重复请求或重复计算。
   *
   * 注意：
   * - 这里只是“触发层”防抖；真实的请求取消/并发控制应由具体 options loader / 请求层负责。
   */
  asyncOptionsDebounceMs: 200,

  /**
   * 草稿自动保存的防抖时间（毫秒）。
   *
   * 影响面：
   * - `FormController` 在启用草稿持久化（DraftStorage / autoSave）时使用，避免每次键入都写入存储介质。
   *
   * 设计意图：
   * - 降低 localStorage（或其它存储）写入频率，同时确保用户停止输入后能较快落盘。
   */
  autoSaveDebounceMs: 500,
} as const

export const PRO_FORM_COMPONENT_DEFAULTS = {
  /**
   * `ProSlider` 在 schema 未提供范围时的默认取值区间（[min, max]）。
   *
   * 影响面：
   * - `renderers/components/ProSlider.vue` 会用该范围初始化 Slider 的最小/最大值兜底，避免组件出现 NaN 或不可交互状态。
   *
   * 注意：
   * - 该值只作为“缺省兜底”，业务侧应在字段 schema 中明确 `min/max` 以表达真实语义范围。
   */
  sliderDefaultRange: [0, 100] as [number, number],

  /**
   * `ProInputNumber` 的默认最大小数位数（maximumFractionDigits）。
   *
   * 影响面：
   * - `renderers/components/ProInputNumber.vue` 的 `Intl.NumberFormat` 会使用该值作为缺省上限，避免在未知精度场景被意外截断。
   *
   * 设计意图：
   * - 作为“上限兜底”更安全：真实业务精度应由 schema/字段 props 明确声明。
   */
  inputNumberMaxFractionDigits: 20,

  /**
   * 预览/只读态空值占位文本（结构性兜底）。
   *
   * 影响面：
   * - 多个字段渲染器在 modelValue 为空（null/undefined/''/空数组等）时回退为该占位，避免 UI 出现空白断层。
   */
  emptyTextFallback: '-',

  /**
   * Select/MultiSelect options 的默认 label 字段名（数据结构兜底）。
   */
  defaultLabelField: 'label',

  /**
   * Select/MultiSelect options 的默认 value 字段名（数据结构兜底）。
   */
  defaultValueField: 'value',
} as const

export const PRO_FORM_TEXT_DEFAULTS = {
  /**
   * Tabs 分组默认标题前缀的 i18n key。
   *
   * 影响面：
   * - `ProFormNode.vue` 在 schema 未提供 tab label 时，使用 `t(tabPrefixKey)` 生成“Tab {n}”一类的回退标题。
   */
  tabPrefixKey: 'proForm.tab.title',

  /**
   * Steps 分组默认标题前缀的 i18n key。
   *
   * 影响面：
   * - `ProFormNode.vue` 在 schema 未提供 step label 时，使用 `t(stepPrefixKey)` 生成“Step {n}”一类的回退标题。
   */
  stepPrefixKey: 'proForm.step.title',

  /**
   * 预览/只读态 boolean 为 true/false 时的默认显示文案 i18n key。
   *
   * 影响面：
   * - `ProCheckbox` / `ProSwitch` 在预览/展示逻辑中作为兜底（可被字段 attrs 覆盖）。
   */
  booleanTrueKey: 'proForm.common.yes',
  booleanFalseKey: 'proForm.common.no',
} as const
