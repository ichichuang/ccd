import type { InjectionKey } from 'vue'
import type { ScrollbarMemoryProvider } from './types'

export const scrollbarMemoryProviderKey: InjectionKey<ScrollbarMemoryProvider> = Symbol(
  'CScrollbarMemoryProvider'
)
