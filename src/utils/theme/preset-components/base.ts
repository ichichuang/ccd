/**
 * PrimeVue Preset - Base Components
 * scrollpanel, virtualscroller, accordion, panel, card, fieldset, stepper
 */

export function buildBaseComponents(): Record<string, unknown> {
  return {
    scrollpanel: {
      root: {
        transitionDuration: 'var(--transition-md)',
      },
      bar: {
        size: 'var(--spacing-xs)',
        borderRadius: 'var(--radius-sm)',
        focusRing: {
          width: 'calc(var(--spacing-xs) / 2)',
          style: 'solid',
          color: 'rgb(var(--ring))',
          offset: 'calc(var(--spacing-xs) / 2)',
          shadow: 'none',
        },
      },
      colorScheme: {
        light: {
          bar: {
            background: 'rgb(var(--muted))',
          },
        },
        dark: {
          bar: {
            background: 'rgb(var(--muted))',
          },
        },
      },
    },
    virtualscroller: {
      loader: {
        mask: {
          background: 'rgb(var(--background))',
          color: 'rgb(var(--muted-foreground))',
        },
        icon: {
          size: 'var(--font-size-md)',
        },
      },
    },
    accordion: {
      root: {
        borderRadius: 'var(--radius-md)',
      },
      header: {
        padding: 'var(--spacing-md) var(--spacing-sm)',
        color: 'rgb(var(--muted-foreground))',
        hoverColor: 'rgb(var(--foreground))',
        activeColor: 'rgb(var(--foreground))',
        activeHoverColor: 'rgb(var(--foreground))',
        hoverBackground: 'rgb(var(--primary-hover)/0.4)',
        activeBackground: 'rgb(var(--primary)/0.4)',
        activeHoverBackground: 'rgb(var(--primary)/0.4)',
      },
      content: {
        padding: 'var(--spacing-sm) var(--spacing-md)',
      },
    },
    panel: {
      colorScheme: {
        light: {
          header: {
            background: 'rgb(var(--background))',
            borderColor: 'rgb(var(--border))',
            color: 'rgb(var(--foreground))',
          },
          content: {
            background: 'rgb(var(--background))',
            borderColor: 'rgb(var(--border))',
            color: 'rgb(var(--foreground))',
          },
        },
        dark: {
          header: {
            background: 'rgb(var(--background))',
            borderColor: 'rgb(var(--border))',
            color: 'rgb(var(--foreground))',
          },
          content: {
            background: 'rgb(var(--background))',
            borderColor: 'rgb(var(--border))',
            color: 'rgb(var(--foreground))',
          },
        },
      },
    },
    card: {
      colorScheme: {
        light: {
          root: {
            background: 'rgb(var(--background))',
            borderColor: 'rgb(var(--border))',
            color: 'rgb(var(--foreground))',
          },
          title: {
            color: 'rgb(var(--foreground))',
          },
          subtitle: {
            color: 'rgb(var(--muted-foreground))',
          },
          content: {
            color: 'rgb(var(--foreground))',
          },
          body: {
            color: 'rgb(var(--foreground))',
          },
        },
        dark: {
          root: {
            background: 'rgb(var(--background))',
            borderColor: 'rgb(var(--border))',
            color: 'rgb(var(--foreground))',
          },
          title: {
            color: 'rgb(var(--foreground))',
          },
          subtitle: {
            color: 'rgb(var(--muted-foreground))',
          },
          content: {
            color: 'rgb(var(--foreground))',
          },
          body: {
            color: 'rgb(var(--foreground))',
          },
        },
      },
    },
    fieldset: {
      colorScheme: {
        light: {
          legend: {
            background: 'rgb(var(--background))',
            borderColor: 'rgb(var(--border))',
            color: 'rgb(var(--foreground))',
          },
          content: {
            borderColor: 'rgb(var(--border))',
            color: 'rgb(var(--foreground))',
          },
        },
        dark: {
          legend: {
            background: 'rgb(var(--background))',
            borderColor: 'rgb(var(--border))',
            color: 'rgb(var(--foreground))',
          },
          content: {
            borderColor: 'rgb(var(--border))',
            color: 'rgb(var(--foreground))',
          },
        },
      },
    },
    stepper: {
      step: {
        borderColor: 'rgb(var(--border))',
      },
      stepNumber: {
        background: 'rgb(var(--secondary))',
        color: 'rgb(var(--foreground))',
        activeBackground: 'rgb(var(--primary))',
        activeColor: 'rgb(var(--primary-foreground))',
      },
      stepTitle: {
        color: 'rgb(var(--muted-foreground))',
        activeColor: 'rgb(var(--primary))',
      },
    },
  }
}
