type ButtonPassThroughOptions = {
  props?: {
    raised?: boolean
  }
}

const RAISED_BUTTON_CLASS =
  'shadow-md shadow-foreground/10 dark:shadow-xl dark:shadow-foreground/30 dark:ring-1 dark:ring-border/40'

export const buttonPt = {
  button: {
    root: (opts: ButtonPassThroughOptions) => {
      const raised = opts?.props?.raised ?? false
      return raised
        ? {
            class: RAISED_BUTTON_CLASS,
            'data-ccd-button-raised': 'true',
          }
        : undefined
    },
  },
} as const
