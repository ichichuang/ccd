/**
 * 样式快捷方式
 */
export const styleShortcuts = {
  'c-cp': 'cursor-pointer',

  'c-border': 'border border-solid border-bg300',
  'c-border-primary': 'border border-solid border-primary200',
  'c-border-accent': 'border border-solid border-accent200',
  'c-border-danger': 'border border-solid border-dangerColor',
  'c-border-success': 'border border-solid border-successColor',
  'c-border-warning': 'border border-solid border-warnColor',

  'c-shadow': 'shadow-[0_1px_3px_0_var(--bg300),0_1px_2px_-1px_var(--bg300)]',
  'c-shadow-primary': 'shadow-[0_1px_3px_0_var(--primary200),0_1px_2px_-1px_var(--primary200)]',
  'c-shadow-accent': 'shadow-[0_1px_3px_0_var(--accent200),0_1px_2px_-1px_var(--accent200)]',
  'c-shadow-danger': 'shadow-[0_1px_3px_0_var(--danger-color),0_1px_2px_-1px_var(--danger-color)]',
  'c-shadow-success':
    'shadow-[0_1px_3px_0_var(--success-color),0_1px_2px_-1px_var(--success-color)]',
  'c-shadow-warning': 'shadow-[0_1px_3px_0_var(--warn-color),0_1px_2px_-1px_var(--warn-color)]',

  /* 过渡动画 */
  'c-transitions': 'transition-all duration-260 transition-ease-linear',
  'c-transition': 'transition-all duration-400 transition-ease-linear',
  'c-transitionx': 'transition-all duration-600 transition-ease-linear',
  'c-transitionl': 'transition-all duration-800 transition-ease-linear',

  /* 卡片组 */
  'c-card':
    'center gap-gap p-padding rounded-rounded bg-bg200 color-text100 c-border border-tm hover:c-shadow c-transitions',
  // 强调色
  'c-card-accent':
    'c-cp center c-shadow gap-gap p-padding rounded-rounded bg-bg200 color-text100 c-border border-tm hover:color-accent100 hover:c-shadow-accent  active:color-accent100 active:border-color-accent100 active:c-shadow-primary c-transitions',
  // 强调色激活
  'c-card-accent-active':
    'c-cp center c-shadow gap-gap p-padding rounded-rounded bg-bg200 color-text100 c-border border-tm hover:color-accent100 hover:c-shadow-accent  color-accent100 border-color-accent100 c-shadow-accent c-transitions',
  // 主题色
  'c-card-primary':
    'c-cp center c-shadow gap-gap p-padding rounded-rounded bg-bg200 color-text100 c-border border-tm hover:color-primary100 hover:c-shadow-primary  active:color-primary200 active:border-color-primary100 active:c-shadow-primary c-transitions',
  // 主题色激活
  'c-card-primary-active':
    'c-cp center c-shadow gap-gap p-padding rounded-rounded bg-bg200 color-text100 c-border border-tm hover:color-primary100 hover:c-shadow-primary  color-primary100 border-color-primary100 c-shadow-primary c-transitions',
  // 危险色
  'c-card-danger':
    'c-cp center c-shadow gap-gap p-padding rounded-rounded bg-bg200 color-text100 c-border border-tm hover:color-danger-hover-color hover:c-shadow-danger  active:color-danger-color active:border-color-danger-hover-color active:c-shadow-danger c-transitions',
  // 危险色激活
  'c-card-danger-active':
    'c-cp center c-shadow gap-gap p-padding rounded-rounded bg-bg200 color-text100 c-border border-tm hover:color-danger-hover-color hover:c-shadow-danger  color-danger-color border-color-danger-hover-color c-shadow-danger c-transitions',
  // 成功色
  'c-card-success':
    'c-cp center c-shadow gap-gap p-padding rounded-rounded bg-bg200 color-text100 c-border border-tm hover:color-success-hover-color hover:c-shadow-success  active:color-success-color active:border-color-success-hover-color active:c-shadow-success c-transitions',
  // 成功色激活
  'c-card-success-active':
    'c-cp center c-shadow gap-gap p-padding rounded-rounded bg-bg200 color-text100 c-border border-tm hover:color-success-hover-color hover:c-shadow-success  color-success-color border-color-success-hover-color c-shadow-success c-transitions',
  // 警告色
  'c-card-warning':
    'c-cp center c-shadow gap-gap p-padding rounded-rounded bg-bg200 color-text100 c-border border-tm hover:color-warnHoverColor hover:c-shadow-warning  active:color-warnColor active:border-color-warnHoverColor active:c-shadow-warning c-transitions',
  // 警告色激活
  'c-card-warning-active':
    'c-cp center c-shadow gap-gap p-padding rounded-rounded bg-bg200 color-text100 c-border border-tm hover:color-warnHoverColor hover:c-shadow-warning  color-warnColor border-color-warnHoverColor c-shadow-warning c-transitions',
}
