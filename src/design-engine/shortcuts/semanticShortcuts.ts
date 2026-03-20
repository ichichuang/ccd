/**
 * Pure semantic shortcut object for UnoCSS.
 *
 * NO dynamic regex here. All dynamic/validated generation lives in `src/design-engine/rules/**`.
 */
export const semanticShortcuts = {
  // Flex 9-grid (9个高频 flex 定位语义)
  center: 'flex justify-center items-center',
  'row-center': 'flex flex-row items-center justify-center',
  'row-between': 'flex flex-row items-center justify-between',
  'row-start': 'flex flex-row items-start justify-start',
  'row-end': 'flex flex-row items-center justify-end',
  'col-center': 'flex flex-col items-center justify-center',
  'col-between': 'flex flex-col justify-between',
  'col-stretch': 'flex flex-col items-stretch',
  'col-fill': 'flex-1 min-h-0 flex flex-col overflow-hidden',

  // Positioning
  'absolute-center': 'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',

  // Interactions (shadow-only focus / hover-lift)
  'hover-lift':
    'transition-all duration-scale-md ease-out hover:-translate-y-1 hover:shadow-md dark:hover:shadow-[0_8px_30px_rgb(var(--background)/0.85)]',
  'active-shrink': 'active:scale-95 transition-transform duration-scale-md',

  /**
   * Focus ring:
   * - No `ring-*` / `outline` / `border` focus hacks.
   * - Use a theme-tinted box-shadow via `--primary`.
   */
  'focus-ring': 'focus-visible:shadow-[0_0_0_2px_rgb(var(--primary)/0.35)]',

  // Typography truncation
  ['text-ellipsis-1']: 'overflow-hidden whitespace-nowrap text-ellipsis',
  ['text-ellipsis-2']: 'line-clamp-2 overflow-hidden',

  // Scrollbars
  'scrollbar-none':
    'scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',

  // Backward-compatible aliases (used by existing templates)
  'interactive-hover': 'hover-lift',
  'interactive-click': 'active-shrink',
  'interactive-focus': 'focus-ring',
  'interactive-focus-ring': 'focus-ring',
} as const
