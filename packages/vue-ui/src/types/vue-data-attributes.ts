import 'vue'
import 'vue'

type VueDataAttributeValue = string | number | boolean | null | undefined

declare module '@vue/runtime-dom' {
  interface HTMLAttributes {
    [key: `data-${string}`]: VueDataAttributeValue
  }

  interface SVGAttributes {
    [key: `data-${string}`]: VueDataAttributeValue
  }
}

declare module 'vue' {
  interface ComponentCustomProps {
    [key: `data-${string}`]: VueDataAttributeValue
  }
}

export {}
