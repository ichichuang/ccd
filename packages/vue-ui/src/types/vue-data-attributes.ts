import type {} from 'vue'

type VueDataAttributeValue = string | number | boolean | null | undefined

declare module 'vue' {
  interface HTMLAttributes {
    [key: `data-${string}`]: VueDataAttributeValue
  }

  interface SVGAttributes {
    [key: `data-${string}`]: VueDataAttributeValue
  }

  interface ComponentCustomProps {
    [key: `data-${string}`]: VueDataAttributeValue
  }
}

export {}
