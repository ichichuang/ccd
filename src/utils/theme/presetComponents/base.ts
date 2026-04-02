/**
 * PrimeVue Preset - Base Components
 * scrollpanel, virtualscroller, accordion, panel, card, fieldset, splitter, stepper
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
        padding: 'var(--spacing-sm) var(--spacing-md)',
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
      header: {
        padding: 'var(--spacing-sm) var(--spacing-md)',
      },
      toggleableHeader: {
        padding: 'var(--spacing-xs) var(--spacing-md)',
      },
      content: {
        padding: '0 var(--spacing-md) var(--spacing-md) var(--spacing-md)',
      },
      footer: {
        padding: '0 var(--spacing-md) var(--spacing-md) var(--spacing-md)',
      },
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
      body: {
        padding: 'var(--spacing-md)',
        gap: 'var(--spacing-sm)',
      },
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
      root: {
        padding: '0 var(--spacing-md) var(--spacing-md) var(--spacing-md)',
      },
      legend: {
        padding: 'var(--spacing-xs) var(--spacing-sm)',
        gap: 'var(--spacing-xs)',
      },
      content: {
        padding: '0',
      },
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
    splitter: {
      root: {
        background: 'rgb(var(--card))',
        borderColor: 'rgb(var(--border))',
        borderWidth: '1px',
        color: 'rgb(var(--foreground))',
        borderRadius: 'var(--radius-md)',
        transitionDuration: 'var(--transition-md)',
      },
      gutter: {
        background: 'rgb(var(--accent))',
      },
      handle: {
        size: 'var(--spacing-md)',
        background: 'transparent',
        borderRadius: 'var(--radius-sm)',
        focusRing: {
          width: '1px',
          style: 'solid',
          color: 'rgb(var(--ring))',
          offset: '0',
          shadow: 'none',
        },
      },
    },
    stepper: {
      root: {
        transitionDuration: 'var(--transition-md)',
      },
      separator: {
        background: 'rgb(var(--border))',
        activeBackground: 'rgb(var(--primary))',
        size: '2px',
      },
      step: {
        padding: 'var(--spacing-xs)',
        gap: 'var(--spacing-sm)',
        borderColor: 'rgb(var(--border))',
      },
      stepHeader: {
        gap: 'var(--spacing-xs)',
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
      steppanels: {
        padding: 'var(--spacing-sm) var(--spacing-xs) var(--spacing-md) var(--spacing-xs)',
      },
      steppanel: {
        background: 'transparent',
        color: 'rgb(var(--foreground))',
        padding: '0',
        indent: 'var(--spacing-md)',
      },
    },
  }
}
