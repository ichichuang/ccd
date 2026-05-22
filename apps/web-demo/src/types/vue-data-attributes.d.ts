import type {} from '@vue/runtime-dom'

declare module '@vue/runtime-dom' {
  interface HTMLAttributes {
    [key: `data-${string}`]: string | number | boolean | undefined
  }
}

export {}
