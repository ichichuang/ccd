import { BREAKPOINTS } from '@ccd/design-tokens'
import type { DialogOptions } from './types'

const DEFAULT_DIALOG_CLOSE_DELAY_MS = 320

/**
 * 对话框响应式 breakpoints
 * SSOT: src/constants/breakpoints.ts (BREAKPOINTS)
 * 与 device store 的 isMobileLayout/isTabletLayout/isPCLayout 对齐
 *
 * @deprecated DIALOG_BREAKPOINTS is not wired into defaultDialogProps.breakpoints;
 *   no runtime consumer exists. Remove in a future major version.
 */
export const DIALOG_BREAKPOINTS: Record<string, string> = {
  [`${BREAKPOINTS['5xl']}px`]: '46%',
  [`${BREAKPOINTS['2xl']}px`]: '50%',
  [`${BREAKPOINTS.xl}px`]: '60%',
  [`${BREAKPOINTS.lg}px`]: '80%',
  [`${BREAKPOINTS.md}px`]: '96vw',
}

export const defaultDialogProps: Partial<DialogOptions> = {
  visible: false,
  header: '',
  sizeClass: 'w-[92vw] sm:w-[88vw] md:w-[82vw] lg:w-[60vw] xl:w-[50vw] 2xl:w-[48vw] max-h-90vh',
  draggable: false,
  modal: true,
  position: 'center',
  appendTo: 'body',
  maximizable: false,
  minimizable: false,
  closeOnEscape: true,
  closeOnMask: true,
  closable: true,
  hideFooter: false,
  hideHeader: false,
  hideClose: false,
  sureBtnLoading: false,
  openDelay: 0,
  /** @deprecated closeDelay is unused — removal is handled by after-hide emit. Remove in a future major version. */
  closeDelay: DEFAULT_DIALOG_CLOSE_DELAY_MS,
}
