/**
 * 表单控件全局 PassThrough 配置
 *
 * Premium Borderless UI：无实线边框，使用 bg-muted/30 背景 + interactive-item 焦点 shadow。
 * 符合 101-premium-ui.mdc 与 29-focus-outline-styling.mdc。
 *
 * PT Merge 契约 (PrimeVue v4, mergeProps: true, mergeSections: true):
 * - 全局 PT 类与组件级 :pt 类合并（非替换）
 * - 使用 !important 的全局 PT 属性无法被局部 :pt 覆盖
 * - ⚠️ HMR 不生效：修改此文件后需全页面刷新
 */

const PREMIUM_INPUT_ROOT =
  '!border-0 !shadow-none bg-muted/30 hover:bg-muted/40 transition-colors duration-md ease-smooth rounded-md'

const PREMIUM_OVERLAY = ' rounded-md'

export const formControlsPt = {
  inputtext: {
    root: { class: PREMIUM_INPUT_ROOT },
  },
  inputnumber: {
    root: { class: PREMIUM_INPUT_ROOT },
    buttonGroup: { class: '!border-0 !bg-transparent' },
    incrementButton: {
      class: '!border-0 !bg-transparent hover:!bg-muted/20 behavior-hover-transition',
    },
    decrementButton: {
      class: '!border-0 !bg-transparent hover:!bg-muted/20 behavior-hover-transition',
    },
  },
  inputchips: {
    root: { class: PREMIUM_INPUT_ROOT },
  },
  password: {
    root: { class: PREMIUM_INPUT_ROOT },
  },
  textarea: {
    root: { class: PREMIUM_INPUT_ROOT },
  },
  datepicker: {
    root: { class: PREMIUM_INPUT_ROOT },
    panel: { class: PREMIUM_OVERLAY },
  },
  select: {
    root: { class: PREMIUM_INPUT_ROOT },
    overlay: { class: PREMIUM_OVERLAY },
  },
  multiselect: {
    root: { class: PREMIUM_INPUT_ROOT },
    overlay: { class: PREMIUM_OVERLAY },
  },
  autocomplete: {
    root: { class: PREMIUM_INPUT_ROOT },
    overlay: { class: PREMIUM_OVERLAY },
    list: { class: PREMIUM_OVERLAY },
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
