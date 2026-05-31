import type { Component } from 'vue'
import CheckIcon from '@primevue/icons/check'
import InfoCircleIcon from '@primevue/icons/infocircle'
import ExclamationTriangleIcon from '@primevue/icons/exclamationtriangle'
import TimesCircleIcon from '@primevue/icons/timescircle'
import MinusIcon from '@primevue/icons/minus'

export const PRIMEVUE_TOAST_SEVERITY_ICONS: Record<string, Component> = {
  success: CheckIcon,
  info: InfoCircleIcon,
  warn: ExclamationTriangleIcon,
  error: TimesCircleIcon,
  secondary: InfoCircleIcon,
  contrast: MinusIcon,
}

export const PRIMEVUE_TOAST_FALLBACK_ICON = InfoCircleIcon
