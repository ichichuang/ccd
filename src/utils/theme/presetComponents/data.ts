/**
 * PrimeVue Preset - Data Components
 * datatable, listbox, multiselect, cascadeselect, tree, treeselect, autocomplete, orderlist, picklist
 */

export function buildDataComponents(): Record<string, unknown> {
  return {
    datatable: {
      headerCell: {
        background: 'color-mix(in srgb, rgb(var(--card)) 60%, rgb(var(--muted)) 40%)',
        borderColor: 'rgb(var(--border))',
        color: 'rgb(var(--foreground))',
      },
      bodyCell: {
        borderColor: 'rgb(var(--border))',
        color: 'rgb(var(--foreground))',
      },
      row: {
        background: 'rgb(var(--card))',
      },
      footerCell: {
        background: 'rgb(var(--muted))',
        borderColor: 'rgb(var(--border))',
        color: 'rgb(var(--foreground))',
      },
      footer: {
        borderColor: 'rgb(var(--border))',
      },
      filter: {
        overlaySelect: {
          background: 'rgb(var(--popover))',
          borderColor: 'rgb(var(--border))',
          borderRadius: 'var(--radius-md)',
          color: 'rgb(var(--popover-foreground))',
          shadow:
            '0 4px 6px -1px rgb(var(--foreground)/0.08), 0 2px 4px -2px rgb(var(--foreground)/0.06)',
        },
        overlayPopover: {
          background: 'rgb(var(--popover))',
          borderColor: 'rgb(var(--border))',
          borderRadius: 'var(--radius-md)',
          color: 'rgb(var(--popover-foreground))',
          shadow:
            '0 4px 6px -1px rgb(var(--foreground)/0.08), 0 2px 4px -2px rgb(var(--foreground)/0.06)',
          padding: 'var(--spacing-sm)',
          gap: 'var(--spacing-xs)',
        },
        rule: {
          borderColor: 'rgb(var(--border))',
        },
        constraintList: {
          padding: 'var(--spacing-xs)',
          gap: 'var(--spacing-xs)',
        },
        constraint: {
          focusBackground: 'rgb(var(--accent))',
          selectedBackground: 'rgb(var(--primary))',
          selectedFocusBackground: 'rgb(var(--primary))',
          color: 'rgb(var(--popover-foreground))',
          focusColor: 'rgb(var(--accent-foreground))',
          selectedColor: 'rgb(var(--primary-foreground))',
          selectedFocusColor: 'rgb(var(--primary-foreground))',
          separator: {
            borderColor: 'rgb(var(--border))',
          },
          padding: 'var(--spacing-xs) var(--spacing-sm)',
          borderRadius: 'var(--radius-sm)',
        },
      },
      colorScheme: {
        light: {
          row: {
            stripedBackground:
              'color-mix(in srgb, rgb(var(--card)) 98%, rgb(var(--foreground)) 2%)',
            hoverBackground: 'color-mix(in srgb, rgb(var(--card)) 95%, rgb(var(--primary)) 5%)',
            selectedBackground: 'color-mix(in srgb, rgb(var(--card)) 90%, rgb(var(--primary)) 10%)',
            selectedHoverBackground:
              'color-mix(in srgb, rgb(var(--card)) 85%, rgb(var(--primary)) 15%)',
            selectedColor: 'rgb(var(--foreground))',
          },
          bodyCell: {},
        },
        dark: {
          row: {
            stripedBackground:
              'color-mix(in srgb, rgb(var(--card)) 97%, rgb(var(--foreground)) 3%)',
            hoverBackground: 'color-mix(in srgb, rgb(var(--card)) 92%, rgb(var(--primary)) 8%)',
            selectedBackground: 'color-mix(in srgb, rgb(var(--card)) 85%, rgb(var(--primary)) 15%)',
            selectedHoverBackground:
              'color-mix(in srgb, rgb(var(--card)) 80%, rgb(var(--primary)) 20%)',
            selectedColor: 'rgb(var(--foreground))',
          },
          bodyCell: {},
        },
      },
    },
    listbox: {
      root: {
        background: 'rgb(var(--popover))',
        borderColor: 'rgb(var(--border))',
        color: 'rgb(var(--popover-foreground))',
      },
      option: {
        color: 'rgb(var(--popover-foreground))',
        focusBackground: 'rgb(var(--primary-light))',
        focusColor: 'rgb(var(--primary-light-foreground))',
        selectedBackground: 'rgb(var(--primary))',
        selectedColor: 'rgb(var(--primary-foreground))',
        selectedFocusBackground: 'rgb(var(--primary))',
        selectedFocusColor: 'rgb(var(--primary-foreground))',
      },
      optionGroup: {
        background: 'rgb(var(--popover))',
        color: 'rgb(var(--muted-foreground))',
      },
    },
    multiselect: {
      root: {
        background: 'rgb(var(--background))',
        borderColor: 'rgb(var(--input))',
        hoverBorderColor: 'rgb(var(--primary-hover))',
        focusBorderColor: 'rgb(var(--ring))',
        color: 'rgb(var(--foreground))',
        disabledBackground: 'rgb(var(--muted))',
        disabledColor: 'rgb(var(--muted-foreground))',
      },
      overlay: {
        background: 'rgb(var(--popover))',
        borderColor: 'rgb(var(--border))',
        color: 'rgb(var(--popover-foreground))',
        borderRadius: 'var(--radius-md)',
      },
      option: {
        color: 'rgb(var(--popover-foreground))',
        focusBackground: 'rgb(var(--primary-light))',
        focusColor: 'rgb(var(--primary-light-foreground))',
        selectedBackground: 'rgb(var(--primary))',
        selectedColor: 'rgb(var(--primary-foreground))',
      },
      optionGroup: {
        background: 'rgb(var(--popover))',
        color: 'rgb(var(--muted-foreground))',
      },
    },
    cascadeselect: {
      root: {
        background: 'rgb(var(--background))',
        borderColor: 'rgb(var(--input))',
        hoverBorderColor: 'rgb(var(--primary-hover))',
        focusBorderColor: 'rgb(var(--ring))',
        color: 'rgb(var(--foreground))',
        disabledBackground: 'rgb(var(--muted))',
        disabledColor: 'rgb(var(--muted-foreground))',
      },
      overlay: {
        background: 'rgb(var(--popover))',
        borderColor: 'rgb(var(--border))',
        color: 'rgb(var(--popover-foreground))',
        borderRadius: 'var(--radius-md)',
      },
      list: {
        background: 'rgb(var(--popover))',
        borderColor: 'rgb(var(--border))',
      },
      option: {
        color: 'rgb(var(--popover-foreground))',
        focusBackground: 'rgb(var(--primary-light))',
        focusColor: 'rgb(var(--primary-light-foreground))',
      },
    },
    tree: {
      root: {
        padding: 'var(--spacing-xs)',
      },
      node: {
        padding: '0.25rem 0.5rem',
        borderRadius: '{content.border.radius}',
        hoverBackground: '{content.hover.background}',
        selectedBackground: '{highlight.background}',
        color: '{text.color}',
        hoverColor: '{text.hover.color}',
        selectedColor: '{highlight.color}',
        focusRing: {
          width: '{focus.ring.width}',
          style: '{focus.ring.style}',
          color: '{focus.ring.color}',
          offset: '-1px',
          shadow: '{focus.ring.shadow}',
        },
      },
    },
    treeselect: {
      root: {
        background: 'rgb(var(--background))',
        borderColor: 'rgb(var(--input))',
        hoverBorderColor: 'rgb(var(--primary-hover))',
        focusBorderColor: 'rgb(var(--ring))',
        color: 'rgb(var(--foreground))',
        disabledBackground: 'rgb(var(--muted))',
        disabledColor: 'rgb(var(--muted-foreground))',
      },
      overlay: {
        background: 'rgb(var(--popover))',
        borderColor: 'rgb(var(--border))',
        color: 'rgb(var(--popover-foreground))',
        borderRadius: 'var(--radius-md)',
      },
      tree: {
        root: {
          background: 'rgb(var(--popover))',
        },
        node: {
          color: 'rgb(var(--popover-foreground))',
          hoverBackground: 'rgb(var(--primary-hover) / 0.15)',
          selectedBackground: 'rgb(var(--primary))',
          selectedColor: 'rgb(var(--primary-foreground))',
        },
      },
    },
    autocomplete: {
      root: {
        background: 'rgb(var(--background))',
        borderColor: 'rgb(var(--input))',
        hoverBorderColor: 'rgb(var(--primary-hover))',
        focusBorderColor: 'rgb(var(--ring))',
        color: 'rgb(var(--foreground))',
        disabledBackground: 'rgb(var(--muted))',
        disabledColor: 'rgb(var(--muted-foreground))',
      },
      overlay: {
        background: 'rgb(var(--popover))',
        borderColor: 'rgb(var(--border))',
        color: 'rgb(var(--popover-foreground))',
        borderRadius: 'var(--radius-md)',
      },
      list: {
        background: 'rgb(var(--popover))',
        borderColor: 'rgb(var(--border))',
      },
      option: {
        color: 'rgb(var(--popover-foreground))',
        focusBackground: 'rgb(var(--primary-light))',
        focusColor: 'rgb(var(--primary-light-foreground))',
        selectedBackground: 'rgb(var(--primary))',
        selectedColor: 'rgb(var(--primary-foreground))',
      },
      colorScheme: {
        light: {
          dropdown: {
            background: 'rgb(var(--background))',
            hoverBackground: 'rgb(var(--muted))',
            activeBackground: 'rgb(var(--muted))',
            color: 'rgb(var(--muted-foreground))',
            hoverColor: 'rgb(var(--foreground))',
            activeColor: 'rgb(var(--foreground))',
          },
        },
        dark: {
          dropdown: {
            background: 'rgb(var(--background))',
            hoverBackground: 'rgb(var(--muted))',
            activeBackground: 'rgb(var(--muted))',
            color: 'rgb(var(--muted-foreground))',
            hoverColor: 'rgb(var(--foreground))',
            activeColor: 'rgb(var(--foreground))',
          },
        },
      },
    },
    orderlist: {
      root: {
        background: 'transparent',
      },
      controls: {
        background: 'transparent',
      },
      list: {
        background: 'rgb(var(--background))',
        borderColor: 'rgb(var(--border))',
        color: 'rgb(var(--foreground))',
      },
      header: {
        background: 'rgb(var(--muted))',
        borderColor: 'rgb(var(--border))',
        color: 'rgb(var(--foreground))',
        padding: 'var(--spacing-xs) var(--spacing-sm)',
      },
      option: {
        color: 'rgb(var(--foreground))',
        focusBackground: 'rgb(var(--primary-light))',
        focusColor: 'rgb(var(--primary-light-foreground))',
      },
    },
    picklist: {
      root: {
        background: 'transparent',
      },
      list: {
        background: 'rgb(var(--background))',
        borderColor: 'rgb(var(--border))',
        color: 'rgb(var(--foreground))',
      },
      header: {
        background: 'rgb(var(--muted))',
        borderColor: 'rgb(var(--border))',
        color: 'rgb(var(--foreground))',
        padding: 'var(--spacing-xs) var(--spacing-sm)',
      },
      option: {
        color: 'rgb(var(--foreground))',
        focusBackground: 'rgb(var(--primary-light))',
        focusColor: 'rgb(var(--primary-light-foreground))',
      },
      controls: {
        background: 'transparent',
      },
    },
  }
}
