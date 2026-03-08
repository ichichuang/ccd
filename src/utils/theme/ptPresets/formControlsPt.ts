/**
 * 表单控件全局 PassThrough 配置
 *
 * Premium Borderless UI：无实线边框，使用 bg-muted/30 背景 + interactive-focus-ring 焦点环。
 * 符合 101-premium-ui.mdc 与 29-focus-outline-styling.mdc。
 */

const PREMIUM_INPUT_ROOT =
  '!border-0 !shadow-none outline-none bg-muted/30 hover:bg-muted/40 transition-colors duration-scale-sm rounded-scale-md interactive-focus-ring'

const PREMIUM_OVERLAY = 'surface-elevated rounded-scale-md'

export const formControlsPt = {
  inputtext: {
    root: { class: PREMIUM_INPUT_ROOT },
  },
  inputnumber: {
    root: { class: PREMIUM_INPUT_ROOT },
    button: { class: '!border-0' },
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
} as const
