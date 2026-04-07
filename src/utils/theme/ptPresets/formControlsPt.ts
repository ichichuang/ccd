/**
 * 表单控件全局 PassThrough 配置
 *
 * Enterprise Input UI：保留语义边框与焦点 ring（避免 !important 破坏组件级覆盖与主题 focus 语义）。
 *
 * PT Merge 契约 (PrimeVue v4, mergeProps: true, mergeSections: true):
 * - 全局 PT 类与组件级 :pt 类合并（非替换）
 * - 使用 !important 的全局 PT 属性无法被局部 :pt 覆盖
 * - ⚠️ HMR 不生效：修改此文件后需全页面刷新
 */

const GOLDEN_INPUT_ROOT =
  'border border-border bg-background text-foreground rounded-md shadow-sm shadow-foreground/10 dark:shadow-foreground/20 transition-all duration-md ease-smooth hover:border-primary/50 focus:outline-none focus:border-primary/50 ring-focus-focus'

export const OVERLAY_GLASS_CLASS = 'glass-panel transform-gpu will-change-transform'
export const OPTION_TRANSITION_CLASS = 'transition-colors! duration-sm ease-smooth'

export const formControlsPt = {
  inputtext: {
    root: { class: GOLDEN_INPUT_ROOT },
  },
  inputnumber: {
    root: { class: GOLDEN_INPUT_ROOT },
    buttonGroup: { class: '!border-0 !bg-transparent' },
    incrementButton: {
      class: '!border-0 !bg-transparent hover:!bg-muted/20 ',
    },
    decrementButton: {
      class: '!border-0 !bg-transparent hover:!bg-muted/20 ',
    },
  },
  inputchips: {
    root: { class: GOLDEN_INPUT_ROOT },
  },
  textarea: {
    root: { class: GOLDEN_INPUT_ROOT },
  },
  datepicker: {
    root: { class: GOLDEN_INPUT_ROOT },
    panel: { class: OVERLAY_GLASS_CLASS },
  },
  select: {
    root: { class: GOLDEN_INPUT_ROOT },
    overlay: { class: OVERLAY_GLASS_CLASS },
    item: { class: OPTION_TRANSITION_CLASS },
  },
  multiselect: {
    root: { class: GOLDEN_INPUT_ROOT },
    overlay: { class: OVERLAY_GLASS_CLASS },
    list: { class: 'p-0' },
    item: { class: OPTION_TRANSITION_CLASS },
  },
  autocomplete: {
    root: { class: GOLDEN_INPUT_ROOT },
    overlay: { class: OVERLAY_GLASS_CLASS },
    item: { class: OPTION_TRANSITION_CLASS },
  },
  treeselect: {
    root: { class: GOLDEN_INPUT_ROOT },
    panel: { class: OVERLAY_GLASS_CLASS },
    overlay: { class: OVERLAY_GLASS_CLASS },
    content: { class: OPTION_TRANSITION_CLASS },
  },
  password: {
    root: { class: GOLDEN_INPUT_ROOT },
    panel: { class: OVERLAY_GLASS_CLASS },
    overlay: { class: OVERLAY_GLASS_CLASS },
  },
  // 104-anti-flicker-ring-less: no ring/border on hover; use bg for feedback
  selectbutton: {
    button: (opts: { context?: { active?: boolean } }) => {
      const active = opts?.context?.active ?? false
      return {
        class: [
          '!border-0 !ring-0',
          'transition-all duration-sm',
          active
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted/40 dark:bg-muted/20 hover:bg-muted/60 dark:hover:bg-muted/40',
        ],
      }
    },
  },
} as const
