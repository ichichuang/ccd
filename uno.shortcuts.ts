import type { UserShortcuts } from 'unocss'

// Keep-list shortcuts: pure layout/behavior semantics.
// Values are translated to native UnoCSS utilities (p-*/m-*/gap-*/text-*/rounded-*/duration-*).
export const shortcuts = {
  // density
  'density-compact': 'gap-sm p-sm',
  'density-normal': 'gap-md p-md',
  'density-comfortable': 'gap-lg p-lg',
  'density-responsive': 'density-compact md:density-normal',

  // flex base
  center: 'flex justify-center items-center',
  row: 'flex flex-row',
  column: 'flex flex-col',

  // justify-content
  'main-start': 'justify-start',
  'main-center': 'justify-center',
  'main-end': 'justify-end',
  'main-between': 'justify-between',
  'main-around': 'justify-around',
  'main-evenly': 'justify-evenly',

  // align-items
  'cross-start': 'items-start',
  'cross-center': 'items-center',
  'cross-end': 'items-end',
  'cross-stretch': 'items-stretch',

  // high-frequency combos
  'row-center': 'flex flex-row items-center justify-center',
  'row-between': 'flex flex-row items-center justify-between',
  'row-start': 'flex flex-row items-start justify-start',
  'column-center': 'flex flex-col items-center justify-center',
  'column-between': 'flex flex-col justify-between',
  'col-fill': 'flex-1 min-h-0 flex flex-col overflow-hidden',
  'row-y-center': 'flex flex-row items-center',
  'row-end': 'flex flex-row items-center justify-end',

  'col-stack-xs': 'flex flex-col gap-xs',
  'col-stack-sm': 'flex flex-col gap-sm',
  'col-stack-md': 'flex flex-col gap-md',
  'col-stack-lg': 'flex flex-col gap-lg',
  'col-stack-xl': 'flex flex-col gap-xl',

  // typography helpers
  'text-single-line-ellipsis': 'overflow-hidden whitespace-nowrap text-ellipsis',
  'text-two-line-ellipsis': 'line-clamp-2 overflow-hidden',
  'text-muted': 'text-muted-foreground',
  'text-secondary': 'text-secondary-foreground',

  // interactions
  'behavior-hover-transition': 'transition-all duration-md',
  'hover-elevated': 'hover:shadow-md',
  'interactive-hover': 'behavior-hover-transition hover-elevated',
  'interactive-click':
    'cursor-pointer select-none active:scale-95 transition-transform duration-md',
  'interactive-focus-ring':
    'focus-visible:shadow-[0_0_0_2px_rgb(var(--primary)/0.3)] focus-visible:outline-none',

  // token aliases
  'bg-interactive': 'bg-primary-hover',
  'bg-brand': 'bg-primary',
  'text-interactive': 'text-primary-hover',

  // tiny alignment
  'pt-hairline': 'pt-px',

  // elevation tokens
  'shadow-soft':
    'shadow-[0_1px_3px_rgb(var(--foreground)/0.10),0_2px_8px_rgb(var(--foreground)/0.08)] dark:shadow-[0_0_0_1px_rgb(var(--foreground)/0.12),0_1px_3px_rgb(var(--background)/0.7),0_2px_8px_rgb(var(--background)/0.5)]',
  'shadow-float':
    'shadow-[0_4px_12px_rgb(var(--foreground)/0.14),0_8px_24px_rgb(var(--foreground)/0.10)] dark:shadow-[0_0_0_1px_rgb(var(--foreground)/0.12),0_4px_12px_rgb(var(--background)/0.9),0_8px_24px_rgb(var(--background)/0.7)]',

  // surfaces
  'surface-base': 'bg-background',
  'surface-elevated': 'bg-card shadow-soft',
  'surface-sunken': 'bg-muted',
  'surface-item': 'bg-muted/60 dark:bg-muted',
  'brand-primary': 'text-primary',
} satisfies UserShortcuts
