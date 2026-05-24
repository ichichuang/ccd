/**
 * 表单控件全局 PassThrough 配置
 *
 * Enterprise Input UI：PT 层统一 PrimeVue 表单控件的可见 shell、动作区与 overlay 语义。
 *
 * PT Merge 契约 (PrimeVue v4, mergeProps: true, mergeSections: true):
 * - 全局 PT 类与组件级 :pt 类合并（非替换）
 * - 使用 !important 的全局 PT 属性无法被局部 :pt 覆盖
 * - ⚠️ HMR 不生效：修改此文件后需全页面刷新
 */

const FORM_CONTROL_SHELL =
  'border border-solid border-input bg-background text-foreground rounded-md shadow-sm shadow-foreground/10 dark:shadow-foreground/20 transition-[background-color,border-color,box-shadow,color] duration-md ease-smooth'
const FORM_CONTROL_FOCUS_VISIBLE =
  'focus-visible:!outline-none focus-visible:!border-primary focus-visible:[box-shadow:var(--p-form-field-focus-ring-shadow)]'
const FORM_CONTROL_FOCUS_WITHIN =
  'focus-within:!outline-none focus-within:!border-primary focus-within:[box-shadow:var(--p-form-field-focus-ring-shadow)]'
const FORM_CONTROL_INNER_FOCUS_RESET =
  'focus:!outline-none focus:!ring-0 focus:!shadow-none focus:!border-0 focus-visible:!outline-none focus-visible:!ring-0 focus-visible:!shadow-none focus-visible:!ring-offset-0'
const FORM_CONTROL_SINGLE_ROOT = `${FORM_CONTROL_SHELL} ${FORM_CONTROL_FOCUS_VISIBLE}`
const FORM_CONTROL_COMPOUND_ROOT = `${FORM_CONTROL_SHELL} ${FORM_CONTROL_FOCUS_WITHIN} overflow-hidden`
const FORM_CONTROL_INNER_INPUT = `w-full !border-0 !shadow-none !rounded-none !bg-transparent !ring-0 !outline-none ${FORM_CONTROL_INNER_FOCUS_RESET}`
const FORM_CONTROL_ACTION = `!border-0 !rounded-none !bg-transparent !text-muted-foreground !shadow-none !ring-0 !outline-none transition-[background-color,color] duration-md ease-smooth hover:!bg-muted/60 hover:!text-primary ${FORM_CONTROL_INNER_FOCUS_RESET}`
const FORM_CONTROL_ACTION_ICON = '!text-muted-foreground group-hover:!text-primary'
const FORM_CONTROL_OVERLAY = 'transform-gpu will-change-transform'
const FORM_CONTROL_OPTION = 'transition-[background-color,color] duration-md ease-smooth'
const FORM_CONTROL_INVALID = 'border-danger focus:border-danger focus-visible:ring-danger/30'
const FORM_CONTROL_DISABLED =
  'opacity-100 bg-muted text-muted-foreground cursor-not-allowed pointer-events-none'
const FORM_CONTROL_INNER_INPUT_STYLE = {
  border: '0',
  background: 'transparent',
  boxShadow: 'none',
  borderRadius: '0',
  outline: '0',
} as const
const FORM_CONTROL_ACTION_STYLE = {
  border: '0',
  background: 'transparent',
  boxShadow: 'none',
  borderRadius: '0',
  outline: '0',
} as const

export const OVERLAY_GLASS_CLASS = FORM_CONTROL_OVERLAY
export const OVERLAY_GLASS_COMPACT_CLASS = FORM_CONTROL_OVERLAY
export const OPTION_TRANSITION_CLASS = FORM_CONTROL_OPTION
// Compound controls render nested pcInputText/action parts; only the root may own the visible shell.
// Nested inputs/buttons are reset here so PrimeVue defaults cannot create split borders or detached chrome.
// Density (padding/gap/radius) remains controlled by semantic/component tokens.

export const formControlsPt = {
  inputtext: {
    root: { class: FORM_CONTROL_SINGLE_ROOT },
  },
  inputmask: {
    root: { class: FORM_CONTROL_SINGLE_ROOT },
  },
  inputnumber: {
    root: { class: FORM_CONTROL_COMPOUND_ROOT },
    pcInputText: {
      root: { class: FORM_CONTROL_INNER_INPUT, style: FORM_CONTROL_INNER_INPUT_STYLE },
    },
    buttonGroup: { class: 'border-0 bg-transparent' },
    incrementButton: {
      class: FORM_CONTROL_ACTION,
      style: FORM_CONTROL_ACTION_STYLE,
    },
    decrementButton: {
      class: FORM_CONTROL_ACTION,
      style: FORM_CONTROL_ACTION_STYLE,
    },
  },
  inputchips: {
    root: { class: FORM_CONTROL_SINGLE_ROOT },
  },
  textarea: {
    root: { class: FORM_CONTROL_SINGLE_ROOT },
  },
  datepicker: {
    root: { class: FORM_CONTROL_COMPOUND_ROOT },
    pcInputText: {
      root: { class: FORM_CONTROL_INNER_INPUT, style: FORM_CONTROL_INNER_INPUT_STYLE },
    },
    dropdown: {
      class: FORM_CONTROL_ACTION,
      style: FORM_CONTROL_ACTION_STYLE,
    },
    dropdownIcon: {
      class: FORM_CONTROL_ACTION_ICON,
    },
    panel: { class: FORM_CONTROL_OVERLAY },
  },
  select: {
    root: { class: FORM_CONTROL_SINGLE_ROOT },
    dropdown: { class: FORM_CONTROL_ACTION },
    dropdownIcon: { class: FORM_CONTROL_ACTION_ICON },
    overlay: { class: FORM_CONTROL_OVERLAY },
    option: { class: FORM_CONTROL_OPTION },
  },
  multiselect: {
    root: { class: FORM_CONTROL_SINGLE_ROOT },
    dropdown: { class: FORM_CONTROL_ACTION },
    dropdownIcon: { class: FORM_CONTROL_ACTION_ICON },
    overlay: { class: FORM_CONTROL_OVERLAY },
    option: { class: FORM_CONTROL_OPTION },
  },
  autocomplete: {
    root: { class: FORM_CONTROL_COMPOUND_ROOT },
    pcInputText: {
      root: { class: FORM_CONTROL_INNER_INPUT, style: FORM_CONTROL_INNER_INPUT_STYLE },
    },
    dropdown: {
      class: FORM_CONTROL_ACTION,
      style: FORM_CONTROL_ACTION_STYLE,
    },
    dropdownIcon: {
      class: FORM_CONTROL_ACTION_ICON,
    },
    overlay: { class: FORM_CONTROL_OVERLAY },
    option: { class: FORM_CONTROL_OPTION },
  },
  treeselect: {
    root: { class: FORM_CONTROL_SINGLE_ROOT },
    dropdown: { class: FORM_CONTROL_ACTION },
    dropdownIcon: { class: FORM_CONTROL_ACTION_ICON },
    panel: { class: FORM_CONTROL_OVERLAY },
    overlay: { class: FORM_CONTROL_OVERLAY },
    pcTree: {
      nodeContent: { class: FORM_CONTROL_OPTION },
    },
  },
  password: {
    root: { class: FORM_CONTROL_COMPOUND_ROOT },
    pcInputText: {
      root: { class: FORM_CONTROL_INNER_INPUT, style: FORM_CONTROL_INNER_INPUT_STYLE },
    },
    maskIcon: { class: FORM_CONTROL_ACTION_ICON },
    unmaskIcon: { class: FORM_CONTROL_ACTION_ICON },
    panel: { class: FORM_CONTROL_OVERLAY },
    overlay: { class: FORM_CONTROL_OVERLAY },
  },
  // 104-anti-flicker-ring-less: no ring/border on hover; use bg for feedback
  selectbutton: {
    button: (opts: { context?: { active?: boolean; disabled?: boolean; invalid?: boolean } }) => {
      const active = opts?.context?.active ?? false
      const disabled = opts?.context?.disabled ?? false
      const invalid = opts?.context?.invalid ?? false
      return {
        class: [
          '!border-0 ring-0 focus-visible:ring-2 focus-visible:ring-ring',
          'transition-[background-color,color,box-shadow] duration-sm',
          invalid ? FORM_CONTROL_INVALID : '',
          disabled ? FORM_CONTROL_DISABLED : '',
          active
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted/40 dark:bg-muted/20 hover:bg-muted/60 dark:hover:bg-muted/40',
        ],
      }
    },
  },
} as const
