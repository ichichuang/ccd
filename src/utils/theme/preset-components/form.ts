/**
 * PrimeVue Preset - Form Components
 * button, checkbox, radiobutton, toggleswitch, inputtext, inputnumber, inputchips,
 * colorpicker, slider, select, password, datepicker
 */

import type { ColorAdapter } from '../color-adapter'
import { initComponentButtonColorSchemeOptionsItems } from '../color-adapter'

export function buildFormComponents(colors: ColorAdapter): Record<string, unknown> {
  return {
    button: {
      colorScheme: {
        light: {
          root: initComponentButtonColorSchemeOptionsItems(colors, 'root'),
          outlined: initComponentButtonColorSchemeOptionsItems(colors, 'outlined'),
          text: initComponentButtonColorSchemeOptionsItems(colors, 'text'),
          link: initComponentButtonColorSchemeOptionsItems(colors, 'link'),
        },
        dark: {
          root: initComponentButtonColorSchemeOptionsItems(colors, 'root'),
          outlined: initComponentButtonColorSchemeOptionsItems(colors, 'outlined'),
          text: initComponentButtonColorSchemeOptionsItems(colors, 'text'),
          link: initComponentButtonColorSchemeOptionsItems(colors, 'link'),
        },
      },
    },
    checkbox: {
      colorScheme: {
        light: {
          root: {
            background: colors.getBackground,
            borderColor: 'rgb(var(--input))',
            hoverBorderColor: colors.getPrimaryHover,
            checkedBackground: colors.getPrimary,
            checkedBorderColor: colors.getPrimary,
            checkedHoverBackground: colors.getPrimaryHover,
          },
          icon: {
            color: colors.getPrimaryForeground,
          },
        },
        dark: {
          root: {
            background: colors.getBackground,
            borderColor: 'rgb(var(--input))',
            hoverBorderColor: colors.getPrimaryHover,
            checkedBackground: colors.getPrimary,
            checkedBorderColor: colors.getPrimary,
            checkedHoverBackground: colors.getPrimaryHover,
          },
          icon: {
            color: colors.getPrimaryForeground,
          },
        },
      },
    },
    radiobutton: {
      colorScheme: {
        light: {
          root: {
            background: colors.getBackground,
            borderColor: 'rgb(var(--input))',
            hoverBorderColor: colors.getPrimaryHover,
            checkedBackground: colors.getPrimary,
            checkedBorderColor: colors.getPrimary,
          },
          icon: {
            background: colors.getPrimary,
            checkedHoverBackground: colors.getPrimaryHover,
          },
        },
        dark: {
          root: {
            background: colors.getBackground,
            borderColor: 'rgb(var(--input))',
            hoverBorderColor: colors.getPrimaryHover,
            checkedBackground: colors.getPrimary,
            checkedBorderColor: colors.getPrimary,
          },
          icon: {
            background: colors.getPrimary,
            checkedHoverBackground: colors.getPrimaryHover,
          },
        },
      },
    },
    toggleswitch: {
      colorScheme: {
        light: {
          root: {
            background: 'rgb(var(--background))',
            hoverBackground: 'rgb(var(--background))',
            disabledBackground: 'rgb(var(--input))',
            borderColor: 'rgb(var(--border))',
            hoverBorderColor: 'rgb(var(--border))',
            checkedBorderColor: 'rgb(var(--primary))',
            checkedHoverBorderColor: 'rgb(var(--primary-hover))',
            checkedBackground: 'rgb(var(--primary))',
            checkedHoverBackground: 'rgb(var(--primary-hover))',
          },
          handle: {
            background: 'rgb(var(--input))',
            hoverBackground: 'rgb(var(--border))',
            checkedBackground: 'rgb(var(--background))',
            checkedHoverBackground: 'rgb(var(--background))',
          },
        },
        dark: {
          root: {
            background: 'rgb(var(--card))',
            hoverBackground: 'rgb(var(--card))',
            disabledBackground: 'rgb(var(--input))',
            borderColor: 'rgb(var(--border))',
            hoverBorderColor: 'rgb(var(--border))',
            checkedBackground: 'rgb(var(--primary))',
            checkedHoverBackground: 'rgb(var(--primary-hover))',
          },
          handle: {
            background: 'rgb(var(--input))',
            hoverBackground: 'rgb(var(--border))',
            checkedBackground: 'rgb(var(--background))',
            checkedHoverBackground: 'rgb(var(--background))',
          },
        },
      },
    },
    inputtext: {
      root: {
        background: 'rgb(var(--background))',
        borderColor: 'rgb(var(--input))',
        hoverBorderColor: 'rgb(var(--primary-hover))',
        focusBorderColor: 'rgb(var(--ring))',
        color: 'rgb(var(--foreground))',
        placeholderColor: 'rgb(var(--muted-foreground))',
        disabledBackground: 'rgb(var(--muted))',
        disabledColor: 'rgb(var(--muted-foreground))',
      },
    },
    inputnumber: {
      root: {
        background: 'rgb(var(--background))',
        borderColor: 'rgb(var(--input))',
        hoverBorderColor: 'rgb(var(--primary-hover))',
        focusBorderColor: 'rgb(var(--ring))',
        color: 'rgb(var(--foreground))',
        placeholderColor: 'rgb(var(--muted-foreground))',
        disabledBackground: 'rgb(var(--muted))',
        disabledColor: 'rgb(var(--muted-foreground))',
      },
      colorScheme: {
        light: {
          button: {
            background: 'transparent',
            hoverBackground: 'rgb(var(--muted))',
            activeBackground: 'rgb(var(--muted))',
            borderColor: 'rgb(var(--input))',
            hoverBorderColor: 'rgb(var(--input))',
            activeBorderColor: 'rgb(var(--input))',
            color: 'rgb(var(--muted-foreground))',
            hoverColor: 'rgb(var(--foreground))',
            activeColor: 'rgb(var(--foreground))',
          },
        },
        dark: {
          button: {
            background: 'transparent',
            hoverBackground: 'rgb(var(--muted))',
            activeBackground: 'rgb(var(--muted))',
            borderColor: 'rgb(var(--input))',
            hoverBorderColor: 'rgb(var(--input))',
            activeBorderColor: 'rgb(var(--input))',
            color: 'rgb(var(--muted-foreground))',
            hoverColor: 'rgb(var(--foreground))',
            activeColor: 'rgb(var(--foreground))',
          },
        },
      },
    },
    inputchips: {
      root: {
        background: 'rgb(var(--background))',
        borderColor: 'rgb(var(--input))',
        hoverBorderColor: 'rgb(var(--primary-hover))',
        focusBorderColor: 'rgb(var(--ring))',
        color: 'rgb(var(--foreground))',
        disabledBackground: 'rgb(var(--muted))',
        disabledColor: 'rgb(var(--muted-foreground))',
      },
      colorScheme: {
        light: {
          chip: {
            background: 'rgb(var(--secondary))',
            color: 'rgb(var(--secondary-foreground))',
          },
        },
        dark: {
          chip: {
            background: 'rgb(var(--secondary))',
            color: 'rgb(var(--secondary-foreground))',
          },
        },
      },
      chip: {
        borderRadius: 'var(--radius-md)',
      },
    },
    colorpicker: {
      root: {
        background: 'rgb(var(--background))',
        borderColor: 'rgb(var(--input))',
        color: 'rgb(var(--foreground))',
        disabledBackground: 'rgb(var(--muted))',
        disabledColor: 'rgb(var(--muted-foreground))',
      },
      preview: {
        background: 'rgb(var(--background))',
        borderColor: 'rgb(var(--input))',
      },
      panel: {
        background: 'rgb(var(--popover))',
        borderColor: 'rgb(var(--border))',
      },
      handle: {
        color: 'rgb(var(--foreground))',
      },
    },
    slider: {
      track: {
        background: 'rgb(var(--input))',
        disabledBackground: 'rgb(var(--muted))',
        size: 'var(--spacing-xs)',
        borderRadius: 'var(--radius-md)',
      },
      range: {
        background: 'rgb(var(--primary))',
        borderRadius: 'var(--radius-md)',
      },
      handle: {
        background: 'rgb(var(--background))',
        hoverBackground: 'rgb(var(--primary-light))',
        disabledBackground: 'rgb(var(--muted))',
        width: 'var(--spacing-lg)',
        height: 'var(--spacing-lg)',
        borderRadius: '50%',
        content: {
          background: 'rgb(var(--primary))',
          hoverBackground: 'rgb(var(--primary-hover))',
          disabledBackground: 'rgb(var(--muted))',
          width: 'var(--spacing-md)',
          height: 'var(--spacing-md)',
          borderRadius: '50%',
        },
      },
      colorScheme: {
        light: {
          handle: {
            content: {
              background: 'rgb(var(--primary))',
            },
          },
        },
        dark: {
          handle: {
            content: {
              background: 'rgb(var(--primary))',
            },
          },
        },
      },
    },
    select: {
      root: {
        background: 'rgb(var(--background))',
        borderColor: 'rgb(var(--input))',
        hoverBorderColor: 'rgb(var(--primary-hover))',
        focusBorderColor: 'rgb(var(--ring))',
        color: 'rgb(var(--foreground))',
        disabledBackground: 'rgb(var(--muted))',
        disabledColor: 'rgb(var(--muted-foreground))',
      },
      dropdown: {
        background: 'rgb(var(--background))',
        borderColor: 'rgb(var(--input))',
        color: 'rgb(var(--muted-foreground))',
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
        selectedFocusBackground: 'rgb(var(--primary))',
        selectedFocusColor: 'rgb(var(--primary-foreground))',
      },
      optionGroup: {
        background: 'rgb(var(--popover))',
        color: 'rgb(var(--muted-foreground))',
      },
    },
    password: {
      root: {
        borderColor: 'rgb(var(--input))',
        hoverBorderColor: 'rgb(var(--primary-hover))',
        focusBorderColor: 'rgb(var(--ring))',
        disabledBackground: 'rgb(var(--muted))',
        disabledColor: 'rgb(var(--muted-foreground))',
      },
      overlay: {
        background: 'rgb(var(--popover))',
        borderColor: 'rgb(var(--border))',
        color: 'rgb(var(--popover-foreground))',
      },
      strengthMeter: {
        background: 'rgb(var(--muted))',
      },
    },
    datepicker: {
      root: {
        background: 'rgb(var(--background))',
        borderColor: 'rgb(var(--input))',
        hoverBorderColor: 'rgb(var(--primary-hover))',
        focusBorderColor: 'rgb(var(--ring))',
        color: 'rgb(var(--foreground))',
        disabledBackground: 'rgb(var(--muted))',
        disabledColor: 'rgb(var(--muted-foreground))',
      },
      panel: {
        background: 'rgb(var(--popover))',
        borderColor: 'rgb(var(--border))',
        color: 'rgb(var(--popover-foreground))',
      },
      header: {
        background: 'rgb(var(--popover))',
        borderColor: 'rgb(var(--border))',
        color: 'rgb(var(--popover-foreground))',
      },
      dayView: {
        header: {
          color: 'rgb(var(--muted-foreground))',
        },
      },
      date: {
        color: 'rgb(var(--popover-foreground))',
        hoverBackground: 'rgb(var(--primary-hover) / 0.15)',
        hoverColor: 'rgb(var(--foreground))',
        selectedBackground: 'rgb(var(--primary))',
        selectedColor: 'rgb(var(--primary-foreground))',
      },
    },
  }
}
