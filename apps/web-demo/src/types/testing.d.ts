import 'vue'

/** E2E selectors used by Playwright specs. */
declare module '@vue/runtime-dom' {
  interface HTMLAttributes {
    'data-testid'?: string
  }

  interface ButtonHTMLAttributes {
    'data-testid'?: string
    'data-icon-name'?: string
  }
}

declare module 'vue' {
  interface ComponentCustomProps {
    'data-testid'?: string
    dataTestid?: string
  }
}
