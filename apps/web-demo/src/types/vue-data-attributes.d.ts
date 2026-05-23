import type {} from 'vue'

declare module 'vue' {
  interface HTMLAttributes {
    [key: `data-${string}`]: string | number | boolean | undefined
  }
}

export {}
