/**
 * PrimeVue Preset - Menu, Navigation & Misc Components
 * menu, menubar, breadcrumb, paginator, tieredmenu, panelmenu, tabmenu, steps,
 * message, tag, chip, badge, togglebutton, splitbutton
 */

export function buildMenuNavMiscComponents(): Record<string, unknown> {
  return {
    menu: {
      root: {
        background: 'rgb(var(--popover))',
        borderColor: 'rgb(var(--border))',
        color: 'rgb(var(--popover-foreground))',
        borderRadius: 'var(--radius-md)',
      },
      item: {
        color: 'rgb(var(--popover-foreground))',
        focusBackground: 'rgb(var(--primary-light))',
        focusColor: 'rgb(var(--primary-light-foreground))',
      },
    },
    menubar: {
      root: {
        background: 'transparent',
        borderColor: 'transparent',
        borderRadius: '0',
        color: 'rgb(var(--foreground))',
        gap: 'var(--spacing-sm)',
        padding: '0 var(--spacing-md)',
      },
      baseItem: {
        borderRadius: 'var(--radius-md)',
        padding: 'var(--spacing-xs) var(--spacing-sm)',
      },
      item: {
        focusBackground: 'transparent',
        activeBackground: 'transparent',
        focusColor: 'transparent',
        activeColor: 'transparent',
        color: 'rgb(var(--muted-foreground))',
        padding: '0',
        borderRadius: 'var(--radius-md)',
        gap: 'var(--spacing-sm)',
        icon: {
          color: 'rgb(var(--muted-foreground))',
          focusColor: 'transparent',
          activeColor: 'transparent',
        },
      },
      submenu: {
        padding: 'var(--spacing-sm)',
        gap: 'var(--spacing-sm)',
        background: 'rgb(var(--card))',
        borderColor: 'rgb(var(--border))',
        borderWidth: '1px',
        borderRadius: 'var(--radius-md)',
        shadow:
          '0 10px 15px -3px rgb(var(--foreground) / 0.08), 0 4px 6px -4px rgb(var(--foreground) / 0.06)',
        mobileIndent: 'var(--spacing-md)',
        icon: {
          size: 'var(--font-size-sm)',
          color: 'rgb(var(--muted-foreground))',
          focusColor: 'transparent',
          activeColor: 'transparent',
        },
      },
      separator: {
        borderColor: 'rgb(var(--border))',
      },
      mobileButton: {
        borderRadius: '50%',
        size: 'var(--spacing-xl)',
        color: 'rgb(var(--muted-foreground))',
        hoverColor: 'rgb(var(--foreground))',
        hoverBackground: 'rgb(var(--muted))',
        focusRing: {
          width: 'calc(var(--spacing-xs) / 2)',
          style: 'solid',
          color: 'rgb(var(--ring))',
          offset: 'calc(var(--spacing-xs) / 2)',
          shadow: 'none',
        },
      },
    },
    breadcrumb: {
      root: {
        background: 'transparent',
      },
      item: {
        color: 'rgb(var(--muted-foreground))',
      },
      itemLink: {
        color: 'rgb(var(--foreground))',
        hoverColor: 'rgb(var(--primary-hover))',
      },
      separator: {
        color: 'rgb(var(--muted-foreground))',
      },
    },
    paginator: {
      root: {
        background: 'transparent',
        borderColor: 'rgb(var(--border))',
      },
      current: {
        background: 'rgb(var(--secondary))',
        color: 'rgb(var(--secondary-foreground))',
      },
    },
    tieredmenu: {
      root: {
        background: 'rgb(var(--card))',
        borderColor: 'rgb(var(--border))',
        color: 'rgb(var(--foreground))',
        borderRadius: 'var(--radius-md)',
      },
      list: {
        padding: 'var(--spacing-xs)',
        gap: 'var(--spacing-xs)',
      },
      item: {
        focusBackground: 'transparent',
        activeBackground: 'transparent',
        highlightBackground: 'transparent',
        highlightColor: 'inherit',
        color: 'rgb(var(--foreground))',
        focusColor: 'inherit',
        activeColor: 'inherit',
        padding: 'var(--spacing-sm) var(--spacing-md)',
        borderRadius: 'var(--radius-sm)',
        gap: 'var(--spacing-sm)',
        icon: {
          color: 'rgb(var(--foreground))',
          focusColor: 'inherit',
          activeColor: 'inherit',
        },
      },
      submenuIcon: {
        color: 'rgb(var(--foreground))',
        focusColor: 'inherit',
        activeColor: 'inherit',
      },
      separator: {
        borderColor: 'rgb(var(--border))',
      },
    },
    panelmenu: {
      root: {
        gap: 'var(--spacing-xs)',
      },
      panel: {
        background: 'transparent',
        borderColor: 'transparent',
        borderWidth: '0',
      },
      header: {
        background: 'transparent',
        borderColor: 'transparent',
        borderWidth: '0',
        color: 'rgb(var(--foreground))',
        hoverBackground: 'transparent',
        hoverColor: 'inherit',
        focusBackground: 'transparent',
        activeBackground: 'transparent',
        highlightBackground: 'transparent',
        highlightColor: 'inherit',
        activeColor: 'inherit',
        borderRadius: 'var(--radius-md)',
      },
      content: {
        background: 'transparent',
        borderColor: 'transparent',
        color: 'rgb(var(--foreground))',
        padding: 'var(--spacing-xs) var(--spacing-sm)',
      },
      rootList: {
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-xs)',
      },
      submenu: {
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-xs)',
      },
      item: {
        color: 'rgb(var(--foreground))',
        focusBackground: 'transparent',
        focusColor: 'inherit',
        activeBackground: 'transparent',
        activeColor: 'inherit',
        highlightBackground: 'transparent',
        highlightColor: 'inherit',
        borderWidth: '0',
        borderColor: 'transparent',
        icon: {
          color: 'rgb(var(--foreground))',
          focusColor: 'inherit',
          activeColor: 'inherit',
        },
      },
    },
    tabmenu: {
      root: {
        background: 'transparent',
        borderColor: 'rgb(var(--border))',
      },
      tablist: {
        borderRadius: 'var(--radius-md)',
      },
      item: {
        background: 'transparent',
        borderColor: 'transparent',
        color: 'rgb(var(--muted-foreground))',
        hoverBackground: 'rgb(var(--primary-hover) / 0.15)',
        hoverColor: 'rgb(var(--foreground))',
        activeBackground: 'transparent',
        activeBorderColor: 'rgb(var(--accent))',
        activeColor: 'rgb(var(--accent))',
        borderRadius: 'var(--radius-sm)',
      },
    },
    steps: {
      root: {
        background: 'transparent',
        borderRadius: 'var(--radius-md)',
      },
      separator: {
        borderColor: 'rgb(var(--border))',
      },
    },
    message: {
      root: {
        borderColor: 'rgb(var(--border))',
      },
      text: {
        color: 'rgb(var(--foreground))',
      },
      icon: {
        color: 'rgb(var(--foreground))',
      },
    },
    tag: {
      root: {
        color: 'rgb(var(--primary-foreground))',
      },
    },
    chip: {
      colorScheme: {
        light: {
          root: {
            background: 'rgb(var(--secondary))',
            color: 'rgb(var(--secondary-foreground))',
          },
          icon: {
            color: 'rgb(var(--secondary-foreground))',
          },
          removeIcon: {
            color: 'rgb(var(--secondary-foreground))',
          },
        },
        dark: {
          root: {
            background: 'rgb(var(--secondary))',
            color: 'rgb(var(--secondary-foreground))',
          },
          icon: {
            color: 'rgb(var(--secondary-foreground))',
          },
          removeIcon: {
            color: 'rgb(var(--secondary-foreground))',
          },
        },
      },
    },
    badge: {
      root: {
        color: 'rgb(var(--primary-foreground))',
      },
    },
    togglebutton: {
      colorScheme: {
        light: {
          root: {
            background: 'rgb(var(--secondary))',
            borderColor: 'rgb(var(--input))',
            color: 'rgb(var(--secondary-foreground))',
            hoverBackground: 'rgb(var(--primary-hover) / 0.2)',
            hoverBorderColor: 'rgb(var(--primary-hover))',
            checkedBackground: 'rgb(var(--primary))',
            checkedBorderColor: 'rgb(var(--primary))',
            checkedColor: 'rgb(var(--primary-foreground))',
            checkedHoverBackground: 'rgb(var(--primary-hover))',
          },
          icon: {
            color: 'rgb(var(--secondary-foreground))',
            hoverColor: 'rgb(var(--foreground))',
            checkedColor: 'rgb(var(--primary-foreground))',
          },
          content: {
            checkedBackground: 'transparent',
          },
        },
        dark: {
          root: {
            background: 'rgb(var(--secondary))',
            borderColor: 'rgb(var(--input))',
            color: 'rgb(var(--foreground))',
            hoverBackground: 'rgb(var(--primary-hover) / 0.15)',
            hoverBorderColor: 'rgb(var(--border))',
            hoverColor: 'rgb(var(--foreground))',
            checkedBackground: 'rgb(var(--primary))',
            checkedBorderColor: 'rgb(var(--primary))',
            checkedColor: 'rgb(var(--primary-foreground))',
            checkedHoverBackground: 'rgb(var(--primary-hover))',
          },
          icon: {
            color: 'rgb(var(--foreground))',
            hoverColor: 'rgb(var(--foreground))',
            checkedColor: 'rgb(var(--primary-foreground))',
          },
          content: {
            color: 'rgb(var(--muted-foreground))',
            hoverColor: 'rgb(var(--foreground))',
            checkedColor: 'rgb(var(--primary-foreground))',
            checkedBackground: 'transparent',
          },
        },
      },
    },
    splitbutton: {
      root: {
        borderRadius: 'var(--radius-md)',
      },
    },
  }
}
