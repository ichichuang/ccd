import { BREAKPOINTS } from '@/constants/breakpoints'
import { TRANSITION_SCALE_VALUES } from '@/constants/sizeScale'
import type { DialogOptions } from './types'

/**
 * 对话框响应式 breakpoints
 * SSOT: src/constants/breakpoints.ts (BREAKPOINTS)
 * 与 device store 的 isMobileLayout/isTabletLayout/isPCLayout 对齐
 */
export const DIALOG_BREAKPOINTS: Record<string, string> = {
  [`${BREAKPOINTS.lg}px`]: '50%',
  [`${BREAKPOINTS.md}px`]: '80vw',
  [`${BREAKPOINTS.xs}px`]: '95vw',
}

export const defaultDialogProps: Partial<DialogOptions> = {
  visible: false,
  header: '',
  width: '50%',
  height: 'auto',
  breakpoints: DIALOG_BREAKPOINTS,
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
  closeDelay: TRANSITION_SCALE_VALUES.md,
}
