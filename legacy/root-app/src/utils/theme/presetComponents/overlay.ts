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
            background: 'rgb(var(--card))',
            borderColor: 'rgb(var(--border))',
          },
          header: {
            background: 'rgb(var(--card))',
            color: 'rgb(var(--card-foreground))',
          },
          content: {
            background: 'rgb(var(--card))',
            color: 'rgb(var(--card-foreground))',
          },
          footer: {
            background: 'rgb(var(--card))',
          },
        },
        dark: {
          root: {
            background: 'rgb(var(--card))',
            borderColor: 'rgb(var(--border))',
          },
          header: {
            background: 'rgb(var(--card))',
            color: 'rgb(var(--card-foreground))',
          },
          content: {
            background: 'rgb(var(--card))',
            color: 'rgb(var(--card-foreground))',
          },
          footer: {
            background: 'rgb(var(--card))',
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
            padding: '{overlay.popover.padding}',
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
            padding: '{overlay.popover.padding}',
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
        padding: '{overlay.popover.padding}',
      },
      icon: {
        color: 'rgb(var(--popover-foreground))',
      },
      footer: {
        padding: '0 {overlay.popover.padding} {overlay.popover.padding} {overlay.popover.padding}',
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
      content: {
        padding: '{overlay.popover.padding}',
      },
    },
  }
}
