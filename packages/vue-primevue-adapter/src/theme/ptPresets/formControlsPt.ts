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

const GOLDEN_SINGLE_INPUT_ROOT =
  'border border-solid border-input bg-background text-foreground shadow-sm shadow-foreground/10 dark:shadow-foreground/20 transition-[background-color,border-color,box-shadow,color] duration-md ease-smooth hover:border-primary focus:outline-none focus:border-primary focus:shadow-[0_0_0_var(--spacing-xs)_rgb(var(--primary)/0.16)] ring-focus-focus'
const GOLDEN_COMPOUND_INPUT_ROOT =
  '!rounded-md !border !border-solid !border-input !bg-background text-foreground shadow-none transition-[background-color,border-color,box-shadow,color] duration-md ease-smooth hover:!border-primary focus-within:!outline-none focus-within:!border-primary focus-within:hover:!border-primary focus-within:![box-shadow:0_0_0_var(--spacing-xs)_rgb(var(--primary)/0.16)] overflow-hidden'
const GOLDEN_COMPOUND_INPUT_TEXT_RESET =
  'w-full !border-0 !shadow-none !rounded-none !bg-transparent !ring-0 !outline-none focus:!border-0 focus:!ring-0 focus:!outline-none focus-visible:!ring-0 focus-visible:!ring-offset-0'
const GOLDEN_COMPOUND_ACTION_RESET =
  '!border-0 !rounded-none !bg-transparent !shadow-none !ring-0 !outline-none hover:!bg-transparent focus:!bg-transparent active:!bg-transparent focus-visible:!ring-0 focus-visible:!ring-offset-0'

export const OVERLAY_GLASS_CLASS = 'glass-panel transform-gpu will-change-transform'
export const OVERLAY_GLASS_COMPACT_CLASS =
  'backdrop-blur-sm md:backdrop-blur-xl bg-card/60 md:bg-card/36 dark:bg-card/70 md:dark:bg-card/40 border border-solid border-border/15 dark:border-border/30 shadow-sm dark:shadow-[inset_0_1px_0_0_rgb(var(--foreground)/0.05)] transform-gpu will-change-transform'
export const OPTION_TRANSITION_CLASS = 'transition-[background-color,color] duration-md ease-smooth'
// Governance: PT layer owns visuals/motion only.
// Density (padding/gap/radius) must be controlled by semantic/components tokens.
// Compound controls with nested pcInputText must have a single visible shell.
// Do not reuse single-input shell classes directly on compound roots.

export const formControlsPt = {
  inputtext: {
    root: { class: GOLDEN_SINGLE_INPUT_ROOT },
  },
  inputnumber: {
    root: { class: GOLDEN_COMPOUND_INPUT_ROOT },
    pcInputText: {
      root: { class: GOLDEN_COMPOUND_INPUT_TEXT_RESET },
    },
    buttonGroup: { class: '!border-0 !bg-transparent' },
    incrementButton: {
      class: `${GOLDEN_COMPOUND_ACTION_RESET} hover:!bg-muted/20`,
    },
    decrementButton: {
      class: `${GOLDEN_COMPOUND_ACTION_RESET} hover:!bg-muted/20`,
    },
  },
  inputchips: {
    root: { class: GOLDEN_SINGLE_INPUT_ROOT },
  },
  textarea: {
    root: { class: GOLDEN_SINGLE_INPUT_ROOT },
  },
  datepicker: {
    root: { class: GOLDEN_COMPOUND_INPUT_ROOT },
    pcInputText: {
      root: { class: GOLDEN_COMPOUND_INPUT_TEXT_RESET },
    },
    dropdown: {
      class: `${GOLDEN_COMPOUND_ACTION_RESET} hover:!bg-muted/20 !border-l !border-l-input`,
    },
    panel: { class: OVERLAY_GLASS_CLASS },
  },
  select: {
    root: { class: GOLDEN_SINGLE_INPUT_ROOT },
    overlay: { class: OVERLAY_GLASS_COMPACT_CLASS },
    option: { class: OPTION_TRANSITION_CLASS },
  },
  multiselect: {
    root: { class: GOLDEN_SINGLE_INPUT_ROOT },
    overlay: { class: OVERLAY_GLASS_COMPACT_CLASS },
    option: { class: OPTION_TRANSITION_CLASS },
  },
  autocomplete: {
    root: { class: GOLDEN_COMPOUND_INPUT_ROOT },
    pcInputText: {
      root: { class: GOLDEN_COMPOUND_INPUT_TEXT_RESET },
    },
    dropdown: {
      class: GOLDEN_COMPOUND_ACTION_RESET,
    },
    overlay: { class: OVERLAY_GLASS_COMPACT_CLASS },
    option: { class: OPTION_TRANSITION_CLASS },
  },
  treeselect: {
    root: { class: GOLDEN_SINGLE_INPUT_ROOT },
    panel: { class: OVERLAY_GLASS_COMPACT_CLASS },
    overlay: { class: OVERLAY_GLASS_COMPACT_CLASS },
    pcTree: {
      nodeContent: { class: OPTION_TRANSITION_CLASS },
    },
  },
  password: {
    root: { class: GOLDEN_COMPOUND_INPUT_ROOT },
    pcInputText: {
      root: { class: GOLDEN_COMPOUND_INPUT_TEXT_RESET },
    },
    panel: { class: OVERLAY_GLASS_CLASS },
    overlay: { class: OVERLAY_GLASS_CLASS },
  },
  // 104-anti-flicker-ring-less: no ring/border on hover; use bg for feedback
  selectbutton: {
    button: (opts: { context?: { active?: boolean } }) => {
      const active = opts?.context?.active ?? false
      return {
        class: [
          '!border-0 ring-0 focus-visible:ring-2 focus-visible:ring-ring',
          'transition-[background-color,color,box-shadow] duration-sm',
          active
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted/40 dark:bg-muted/20 hover:bg-muted/60 dark:hover:bg-muted/40',
        ],
      }
    },
  },
} as const
