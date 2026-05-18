import 'vue'

declare module 'vue' {
  interface HTMLAttributes {
    'data-testid'?: string
  }

  interface ComponentCustomProps {
    'data-testid'?: string
    dataTestid?: string
  }
}
