import type { InjectionKey } from 'vue'

export interface PrimeDialogRuntimeConfig {
  translate?: (key: string) => string
  isDialogDraggable?: () => boolean
}

export const PRIME_DIALOG_RUNTIME_CONFIG_KEY: InjectionKey<PrimeDialogRuntimeConfig> = Symbol(
  'PrimeDialogRuntimeConfig'
)

export const DEFAULT_PRIME_DIALOG_RUNTIME_CONFIG: Required<PrimeDialogRuntimeConfig> = {
  translate: key => key,
  isDialogDraggable: () => true,
}
