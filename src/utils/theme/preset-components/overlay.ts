/**
 * PrimeVue Preset - Overlay Components
 * dialog, drawer, popover, confirmpopup, tooltip, overlaypanel
 */

export function buildOverlayComponents(): Record<string, unknown> {
  return {
    dialog: {
      colorScheme: {
        light: {
          root: {
            background: 'rgb(var(--popover))',
            borderColor: 'rgb(var(--border))',
          },
          header: {
            background: 'rgb(var(--popover))',
            color: 'rgb(var(--popover-foreground))',
          },
          content: {
            background: 'rgb(var(--popover))',
            color: 'rgb(var(--popover-foreground))',
          },
          footer: {
            background: 'rgb(var(--popover))',
          },
        },
        dark: {
          root: {
            background: 'rgb(var(--popover))',
            borderColor: 'rgb(var(--border))',
          },
          header: {
            background: 'rgb(var(--popover))',
            color: 'rgb(var(--popover-foreground))',
          },
          content: {
            background: 'rgb(var(--popover))',
            color: 'rgb(var(--popover-foreground))',
          },
          footer: {
            background: 'rgb(var(--popover))',
          },
        },
      },
    },
    drawer: {
      colorScheme: {
        light: {
          root: {
            background: 'rgb(var(--background))',
            borderColor: 'rgb(var(--border))',
          },
          header: {
            background: 'rgb(var(--background))',
            color: 'rgb(var(--foreground))',
          },
          content: {
            background: 'rgb(var(--background))',
            color: 'rgb(var(--foreground))',
          },
        },
        dark: {
          root: {
            background: 'rgb(var(--background))',
            borderColor: 'rgb(var(--border))',
          },
          header: {
            background: 'rgb(var(--background))',
            color: 'rgb(var(--foreground))',
          },
          content: {
            background: 'rgb(var(--background))',
            color: 'rgb(var(--foreground))',
          },
        },
      },
    },
    popover: {
      colorScheme: {
        light: {
          root: {
            background: 'rgb(var(--popover))',
            borderColor: 'rgb(var(--border))',
            color: 'rgb(var(--popover-foreground))',
          },
          content: {
            background: 'rgb(var(--popover))',
            color: 'rgb(var(--popover-foreground))',
          },
        },
        dark: {
          root: {
            background: 'rgb(var(--popover))',
            borderColor: 'rgb(var(--border))',
            color: 'rgb(var(--popover-foreground))',
          },
          content: {
            background: 'rgb(var(--popover))',
            color: 'rgb(var(--popover-foreground))',
          },
        },
      },
    },
    confirmpopup: {
      root: {
        background: 'rgb(var(--popover))',
        borderColor: 'rgb(var(--border))',
        color: 'rgb(var(--popover-foreground))',
        borderRadius: 'var(--radius-md)',
      },
      content: {
        background: 'rgb(var(--popover))',
        color: 'rgb(var(--popover-foreground))',
      },
      icon: {
        color: 'rgb(var(--popover-foreground))',
      },
      footer: {
        padding: 'var(--spacing-md) var(--spacing-md)',
      },
    },
    tooltip: {
      root: {
        background: 'rgb(var(--primary))',
        color: 'rgb(var(--primary-foreground))',
      },
    },
    overlaypanel: {
      root: {
        background: 'rgb(var(--popover))',
        borderColor: 'rgb(var(--border))',
        color: 'rgb(var(--popover-foreground))',
        borderRadius: 'var(--radius-md)',
      },
    },
  }
}
