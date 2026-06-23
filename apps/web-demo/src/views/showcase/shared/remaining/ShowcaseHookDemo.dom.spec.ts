// @vitest-environment jsdom

import { readFileSync } from 'node:fs'
import { mount, type VueWrapper } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ShowcaseHookDemo from './ShowcaseHookDemo.vue'

const hookMocks = vi.hoisted(() => ({
  hasAuth: vi.fn(() => true),
  switchLocale: vi.fn(async () => {}),
  toggleThemeWithAnimation: vi.fn(async () => {}),
}))

const i18n = createI18n({
  legacy: false,
  locale: 'en-US',
  fallbackLocale: 'en-US',
  missingWarn: false,
  fallbackWarn: false,
  messages: {
    'en-US': {
      showcase: {
        remaining: {
          hooks: {
            permissionAllowed: 'Allowed',
            permissionLimited: 'Limited',
            themeMode: 'Theme mode',
            transitionMode: 'Transition mode',
            locale: 'Locale',
            layoutMode: 'Layout mode',
            deviceType: 'Device type',
            breakpoint: 'Breakpoint',
            orientation: 'Orientation',
            permission: 'Permission',
            toggleTheme: 'Toggle theme',
            toggleLocale: 'Toggle locale',
            toolbarTitle: 'Hook actions',
            toolbarDescription: 'Run local controls.',
            readOnlyTitle: 'Read-only runtime signal',
            readOnlyDescription: 'State is visible without mutation.',
            intentDescription: 'Hook contract stays visible.',
            stateTitle: 'State and result',
            stateDescription: 'Runtime values stay readable.',
            contractTitle: 'Hook contract',
            contractDescription: 'Pages consume public APIs only.',
            contractRuntimeTitle: 'Runtime ownership',
            contractRuntimeDescription: 'Runtime modules keep ownership.',
            contractStateTitle: 'Composable API',
            contractStateDescription: 'Return values remain visible.',
            contractEvidenceTitle: 'Source evidence',
            contractEvidenceDescription: 'Source paths wrap below.',
            badges: {
              'theme-switching': 'Theme switching',
              'locale-switching': 'Locale switching',
              'http-flow': 'Request flow',
              'auth-permission': 'Auth and permission',
              'layout-runtime': 'Layout runtime',
              'responsive-device': 'Responsive device',
            },
            'theme-switching': {
              title: 'Theme switching state',
              description: 'Theme changes update runtime state.',
            },
            'locale-switching': {
              title: 'Locale switching state',
              description: 'Locale changes update visible copy.',
            },
            'http-flow': {
              title: 'Request-flow boundary',
              description: 'Request state stays behind app capability.',
            },
            'auth-permission': {
              title: 'Permission readout',
              description: 'Permission checks are UI state.',
            },
            'layout-runtime': {
              title: 'Layout runtime readout',
              description: 'Layout state comes from runtime.',
            },
            'responsive-device': {
              title: 'Responsive device readout',
              description: 'Device state drives responsive behavior.',
            },
          },
          tags: {
            technical: 'Technical',
          },
        },
      },
    },
  },
})

function getButton(wrapper: VueWrapper, testId: string) {
  return wrapper.get(`[data-testid="${testId}"]`)
}

function mountDemo(kind = 'hook-theme-switching'): VueWrapper {
  return mount(ShowcaseHookDemo, {
    global: {
      plugins: [i18n],
      stubs: {
        Button: {
          props: ['label', 'icon', 'severity', 'loading', 'pt'],
          emits: ['click'],
          template:
            '<button type="button" v-bind="$attrs" @click="$emit(\'click\', $event)">{{ label }}</button>',
        },
        EmptyState: {
          props: ['icon', 'title', 'description', 'actionLabel'],
          emits: ['action'],
          template:
            '<section v-bind="$attrs" class="empty-state-stub"><span>{{ title }}</span><span>{{ description }}</span><button v-if="actionLabel" type="button" @click="$emit(\'action\')">{{ actionLabel }}</button></section>',
        },
        Icons: {
          props: ['name', 'size'],
          template: '<span class="icon-stub" :data-name="name" />',
        },
        Tag: {
          props: ['value', 'severity'],
          template: '<span class="tag-stub" :data-severity="severity">{{ value }}</span>',
        },
      },
    },
    props: {
      kind,
    },
  })
}

describe('ShowcaseHookDemo', () => {
  beforeEach(() => {
    hookMocks.hasAuth.mockClear()
    hookMocks.switchLocale.mockClear()
    hookMocks.toggleThemeWithAnimation.mockClear()
    vi.stubGlobal('useAuth', () => ({
      hasAuth: hookMocks.hasAuth,
    }))
    vi.stubGlobal('useLayoutRuntime', () => ({
      breakpoint: { value: 'xl' },
      deviceType: { value: 'desktop' },
      effectiveMode: { value: 'side' },
      orientation: { value: 'landscape' },
    }))
    vi.stubGlobal('useLocale', () => ({
      locale: { value: 'zh-CN' },
      switchLocale: hookMocks.switchLocale,
    }))
    vi.stubGlobal('useThemeSwitch', () => ({
      isAnimating: { value: false },
      mode: { value: 'light' },
      toggleThemeWithAnimation: hookMocks.toggleThemeWithAnimation,
      transitionMode: { value: 'fade' },
    }))
  })

  it('renders the Phase 2C Hooks structure with shared showcase primitives', () => {
    const wrapper = mountDemo()

    expect(wrapper.get('[data-testid="showcase-hooks-demo"]').text()).toContain('Hook actions')
    expect(wrapper.get('[data-testid="showcase-hooks-action-toolbar"]').text()).toContain(
      'Theme changes update runtime state.'
    )
    expect(wrapper.get('[data-testid="showcase-hooks-intent-card"]').text()).toContain(
      'Theme switching state'
    )
    expect(wrapper.get('[data-testid="showcase-hooks-state-panel"]').text()).toContain(
      'State and result'
    )
    expect(wrapper.get('[data-testid="showcase-hooks-state-theme"]').text()).toContain('light')
    expect(wrapper.get('[data-testid="showcase-hooks-state-locale"]').text()).toContain('zh-CN')
    expect(wrapper.get('[data-testid="showcase-hooks-state-device"]').text()).toContain('desktop')
    expect(wrapper.get('[data-testid="showcase-hooks-contract"]').text()).toContain('Hook contract')
  })

  it('preserves theme and locale action semantics', async () => {
    const themeWrapper = mountDemo('hook-theme-switching')
    await getButton(themeWrapper, 'showcase-hooks-toggle-theme').trigger('click')
    expect(hookMocks.toggleThemeWithAnimation).toHaveBeenCalledTimes(1)

    const localeWrapper = mountDemo('hook-locale-switching')
    await getButton(localeWrapper, 'showcase-hooks-toggle-locale').trigger('click')
    expect(hookMocks.switchLocale).toHaveBeenCalledWith('en-US')
  })

  it('renders read-only hook routes without action buttons', () => {
    const wrapper = mountDemo('hook-http-flow')

    expect(wrapper.find('[data-testid="showcase-hooks-toggle-theme"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="showcase-hooks-toggle-locale"]').exists()).toBe(false)
    expect(wrapper.get('[data-testid="showcase-hooks-readonly-actions"]').text()).toContain(
      'Read-only runtime signal'
    )
  })

  it('keeps changed Hooks sources free of hardcoded colors and inline styles', () => {
    const changedHookFiles = [
      'apps/web-demo/src/views/showcase/shared/remaining/ShowcaseHookDemo.vue',
      'e2e/phase2c-hooks-ui.spec.ts',
    ]
    const hardcodedColorPattern =
      /#[0-9a-fA-F]{3,8}\b|\b(?:rgb|rgba|hsl|hsla)\(|\b(?:bg|text|border)-(?:white|black|gray|slate|red|blue|green|yellow|orange|purple|neutral|zinc|stone)(?:\b|-)/
    const inlineStylePattern = /\b:?style=/

    const violations = changedHookFiles.flatMap(file => {
      const source = readFileSync(file, 'utf8')
      return [
        hardcodedColorPattern.test(source) ? `${file}: hardcoded color` : null,
        inlineStylePattern.test(source) ? `${file}: inline style` : null,
      ].filter((entry): entry is string => Boolean(entry))
    })

    expect(violations).toEqual([])
  })
})
