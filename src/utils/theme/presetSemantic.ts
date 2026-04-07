/**
 * PrimeVue Preset - Semantic Layer
 * 使用 colorScheme 结构，用 Token 引用代替硬编码 CSS 变量
 */

export function buildSemanticLayer(): Record<string, unknown> {
  return {
    transitionDuration: 'var(--transition-md)',
    focusRing: {
      width: '0',
      style: 'none',
      color: 'transparent',
      offset: '0',
      shadow: '0 0 0 2px rgb(var(--ring) / 0.5)',
    },
    disabledOpacity: '0.6',
    iconSize: 'var(--font-size-md)',
    anchorGutter: '0',

    formField: {
      paddingX: 'var(--spacing-sm)',
      paddingY: 'var(--spacing-xs)',
      borderRadius: 'var(--radius-md)',
      fontSize: 'var(--font-size-md)',
      focusRing: {
        width: '0',
        style: 'none',
        color: 'transparent',
        offset: '0',
        shadow: '0 0 0 2px rgb(var(--ring) / 0.5)',
      },
      transitionDuration: 'var(--transition-md)',
      sm: {
        fontSize: 'var(--font-size-sm)',
        paddingX: 'var(--spacing-xs)',
        paddingY: 'calc(var(--spacing-xs) / 2)',
      },
      lg: {
        fontSize: 'var(--font-size-lg)',
        paddingX: 'var(--spacing-md)',
        paddingY: 'var(--spacing-sm)',
      },
    },

    list: {
      padding: 'var(--spacing-xs)',
      gap: 'var(--spacing-xs)',
      header: {
        padding: 'var(--spacing-xs) var(--spacing-sm)',
      },
      option: {
        padding: 'var(--spacing-xs) var(--spacing-sm)',
        borderRadius: 'var(--radius-sm)',
      },
      optionGroup: {
        padding: 'var(--spacing-xs) var(--spacing-sm)',
      },
    },

    overlay: {
      select: {
        borderRadius: 'var(--radius-md)',
      },
      popover: {
        borderRadius: 'var(--radius-md)',
        padding: 'var(--spacing-md)',
      },
      modal: {
        padding: 'var(--spacing-md)',
      },
    },

    content: {
      borderRadius: 'var(--radius-md)',
    },

    mask: {
      transitionDuration: 'var(--transition-md)',
    },
    navigation: {
      list: {
        padding: 'var(--spacing-xs) var(--spacing-sm)',
        gap: 'var(--spacing-xs)',
      },
      item: {
        padding: 'var(--spacing-xs) var(--spacing-sm)',
        borderRadius: 'var(--radius-sm)',
        gap: 'var(--spacing-sm)',
      },
      submenuLabel: {
        padding: 'var(--spacing-xs) var(--spacing-sm)',
      },
      submenuIcon: {
        size: 'var(--font-size-md)',
      },
    },

    primary: {
      50: '{brand.50}',
      100: '{brand.100}',
      200: '{brand.200}',
      300: '{brand.300}',
      400: '{brand.400}',
      500: '{brand.500}',
      600: '{brand.600}',
      700: '{brand.700}',
      800: '{brand.800}',
      900: '{brand.900}',
      950: '{brand.950}',
    },

    colorScheme: {
      light: {
        surface: {
          0: 'rgb(var(--background))',
          50: '{neutral.50}',
          100: '{neutral.100}',
          200: '{neutral.200}',
          300: '{neutral.300}',
          400: '{neutral.400}',
          500: '{neutral.500}',
          600: '{neutral.600}',
          700: '{neutral.700}',
          800: '{neutral.800}',
          900: '{neutral.900}',
          950: '{neutral.950}',
        },
        primary: {
          color: '{brand.500}',
          contrastColor: 'rgb(var(--primary-foreground))',
          hoverColor: '{brand.600}',
          activeColor: '{brand.700}',
        },
        formField: {
          background: '{surface.0}',
          disabledBackground: 'rgb(var(--muted))',
          filledBackground: '{surface.50}',
          filledHoverBackground: '{surface.50}',
          filledFocusBackground: '{surface.50}',
          borderColor: '{surface.300}',
          hoverBorderColor: '{surface.400}',
          focusBorderColor: 'rgb(var(--ring))',
          invalidBorderColor: '{error.500}',
          invalidPlaceholderColor: '{error.600}',
          color: '{surface.700}',
          disabledColor: 'rgb(var(--muted-foreground))',
          placeholderColor: '{surface.500}',
          iconColor: 'rgb(var(--muted-foreground))',
          shadow: 'none',
        },
        text: {
          color: 'rgb(var(--foreground))',
          hoverColor: 'rgb(var(--foreground))',
          mutedColor: 'rgb(var(--muted-foreground))',
          hoverMutedColor: 'rgb(var(--muted-foreground))',
        },
        content: {
          background: 'rgb(var(--background))',
          hoverBackground: 'rgb(var(--muted))',
          borderColor: 'rgb(var(--border))',
          color: '{text.color}',
          hoverColor: '{text.hover.color}',
        },
      },
      dark: {
        surface: {
          0: 'rgb(var(--background))',
          50: '{neutral.50}',
          100: '{neutral.100}',
          200: '{neutral.200}',
          300: '{neutral.300}',
          400: '{neutral.400}',
          500: '{neutral.500}',
          600: '{neutral.600}',
          700: '{neutral.700}',
          800: '{neutral.800}',
          900: '{neutral.900}',
          950: '{neutral.950}',
        },
        primary: {
          color: '{brand.400}',
          contrastColor: 'rgb(var(--primary-foreground))',
          hoverColor: '{brand.300}',
          activeColor: '{brand.200}',
        },
        formField: {
          background: 'rgb(var(--background))',
          disabledBackground: 'rgb(var(--muted))',
          filledBackground: '{surface.800}',
          filledHoverBackground: '{surface.800}',
          filledFocusBackground: '{surface.800}',
          borderColor: 'rgb(var(--border))',
          hoverBorderColor: 'rgb(var(--primary-hover))',
          focusBorderColor: 'rgb(var(--ring))',
          invalidBorderColor: '{error.400}',
          invalidPlaceholderColor: '{error.600}',
          color: 'rgb(var(--foreground))',
          disabledColor: 'rgb(var(--muted-foreground))',
          placeholderColor: '{surface.400}',
          iconColor: 'rgb(var(--muted-foreground))',
          shadow: 'none',
        },
        text: {
          color: 'rgb(var(--foreground))',
          hoverColor: 'rgb(var(--foreground))',
          mutedColor: 'rgb(var(--muted-foreground))',
          hoverMutedColor: 'rgb(var(--muted-foreground))',
        },
        content: {
          background: 'rgb(var(--background))',
          hoverBackground: 'rgb(var(--muted))',
          borderColor: 'rgb(var(--border))',
          color: '{text.color}',
          hoverColor: '{text.hover.color}',
        },
      },
    },
  }
}
