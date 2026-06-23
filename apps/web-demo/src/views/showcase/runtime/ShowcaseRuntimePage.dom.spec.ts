// @vitest-environment jsdom

import { readFileSync } from 'node:fs'
import { mount, type VueWrapper } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import enUSConsole from '../../../locales/lang/console/en-US'
import ShowcaseRuntimePage from './ShowcaseRuntimePage.vue'

type RuntimePageId =
  | 'runtime-browser'
  | 'runtime-http'
  | 'runtime-layout'
  | 'runtime-overview'
  | 'runtime-state-ownership'

const runtimeMocks = vi.hoisted(() => ({
  hasAuth: vi.fn(() => true),
}))

const i18n = createI18n({
  legacy: false,
  locale: 'en-US',
  fallbackLocale: 'en-US',
  missingWarn: false,
  fallbackWarn: false,
  messages: {
    'en-US': enUSConsole,
  },
})

const globalMountOptions = {
  plugins: [i18n],
  stubs: {
    Button: {
      props: ['label', 'icon', 'severity', 'outlined', 'pt'],
      emits: ['click'],
      template:
        '<button type="button" v-bind="$attrs" @click="$emit(\'click\', $event)">{{ label }}</button>',
    },
    CScrollbar: {
      template: '<div class="c-scrollbar-stub"><slot /></div>',
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
    RouterLink: {
      props: ['to'],
      template: '<a class="router-link-stub" :href="to"><slot /></a>',
    },
    Tag: {
      props: ['value', 'severity'],
      template: '<span class="tag-stub" :data-severity="severity">{{ value }}</span>',
    },
  },
}

function mountPage(id: RuntimePageId = 'runtime-http'): VueWrapper {
  return mount(ShowcaseRuntimePage, {
    global: globalMountOptions,
    props: {
      id,
    },
  })
}

function getButton(wrapper: VueWrapper, testId: string) {
  return wrapper.get(`[data-testid="${testId}"]`)
}

describe('ShowcaseRuntimePage', () => {
  beforeEach(() => {
    runtimeMocks.hasAuth.mockClear()
    vi.stubGlobal('useAuth', () => ({
      hasAuth: runtimeMocks.hasAuth,
    }))
    vi.stubGlobal('useLayoutRuntime', () => ({
      breakpoint: { value: 'xl' },
      deviceType: { value: 'PC' },
      effectiveMode: { value: 'side' },
      orientation: { value: 'landscape' },
      sidebarMode: { value: 'inline' },
      useDrawer: { value: false },
    }))
    vi.stubGlobal('useLocale', () => ({
      locale: { value: 'en-US' },
    }))
    vi.stubGlobal('useThemeSwitch', () => ({
      mode: { value: 'light' },
    }))
  })

  it('renders the Runtime page family with shared Phase 2B showcase primitives', () => {
    const wrapper = mountPage()

    expect(wrapper.find('[data-testid="showcase-runtime-page"]').exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'ShowcaseHero' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'ShowcaseSection' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'ShowcaseCard' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'ShowcaseToolbar' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'ShowcaseEvidencePanel' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'ShowcaseEmptyState' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'ShowcaseSourceLinks' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'ShowcaseDemoPanel' }).exists()).toBe(true)
    expect(wrapper.find('[data-testid="showcase-runtime-action-toolbar"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="showcase-runtime-state-panel"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="showcase-runtime-result-panel"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="showcase-runtime-source-area"]').exists()).toBe(true)
  })

  it('keeps demo actions usable while only updating local showcase state', async () => {
    const wrapper = mountPage('runtime-state-ownership')

    expect(wrapper.get('[data-testid="showcase-runtime-run-count"]').text()).toBe('1')
    expect(wrapper.get('[data-testid="showcase-runtime-last-action"]').text()).toContain('Ready')

    await getButton(wrapper, 'showcase-runtime-run-check').trigger('click')
    expect(wrapper.get('[data-testid="showcase-runtime-run-count"]').text()).toBe('2')
    expect(wrapper.get('[data-testid="showcase-runtime-last-action"]').text()).toContain(
      'Boundary checked'
    )

    await getButton(wrapper, 'showcase-runtime-reset-check').trigger('click')
    expect(wrapper.get('[data-testid="showcase-runtime-run-count"]').text()).toBe('1')
    expect(wrapper.get('[data-testid="showcase-runtime-last-action"]').text()).toContain(
      'Check reset'
    )
  })

  it('keeps runtime state/result panels and source evidence readable', () => {
    const wrapper = mountPage('runtime-layout')

    expect(wrapper.get('[data-testid="showcase-runtime-state-layoutMode"]').text()).toBe('side')
    expect(wrapper.get('[data-testid="showcase-runtime-state-sidebarMode"]').text()).toBe('inline')
    expect(wrapper.get('[data-testid="showcase-runtime-result-panel"]').text()).toContain(
      '/showcase/runtime/layout'
    )
    expect(wrapper.text()).toContain(
      'apps/web-demo/src/views/showcase/runtime/ShowcaseRuntimePage.vue'
    )
    expect(wrapper.text()).toContain('apps/web-demo/src/hooks/layout/useLayoutRuntime.ts')

    const evidenceCode = wrapper
      .findAll('code')
      .find(code =>
        code.text().includes('apps/web-demo/src/views/showcase/runtime/ShowcaseRuntimePage.vue')
      )
    expect(evidenceCode?.classes()).toContain('break-all')
    expect(evidenceCode?.classes()).toContain('select-all')
  })

  it('does not import or modify runtime implementations through the Runtime page shell', () => {
    const source = readFileSync(
      'apps/web-demo/src/views/showcase/runtime/ShowcaseRuntimePage.vue',
      'utf8'
    )

    expect(source).not.toMatch(/from ['"]@\/(?:adapters|api|stores|utils)\//)
    expect(source).not.toMatch(/from ['"]@!\//)
    expect(source).not.toContain('ShowcaseCapabilityPage')
    expect(source).not.toContain('ShowcaseRuntimeDemo')
  })

  it('reuses every required Phase 2B primitive in the Runtime shell source', () => {
    const source = readFileSync(
      'apps/web-demo/src/views/showcase/runtime/ShowcaseRuntimePage.vue',
      'utf8'
    )
    const requiredPrimitives = [
      'ShowcaseHero',
      'ShowcaseSection',
      'ShowcaseCard',
      'ShowcaseToolbar',
      'ShowcaseEvidencePanel',
      'ShowcaseEmptyState',
      'ShowcaseSourceLinks',
      'ShowcaseDemoPanel',
    ]

    expect(requiredPrimitives.filter(primitive => !source.includes(primitive))).toEqual([])
  })

  it('keeps changed Runtime sources free of hardcoded colors and raw inline styles', () => {
    const changedRuntimeFiles = [
      'apps/web-demo/src/views/showcase/runtime/ShowcaseRuntimePage.vue',
      'apps/web-demo/src/views/showcase/runtime/ShowcaseRuntimePage.dom.spec.ts',
      'apps/web-demo/src/views/showcase/runtime/browser-runtime/index.vue',
      'apps/web-demo/src/views/showcase/runtime/http/index.vue',
      'apps/web-demo/src/views/showcase/runtime/layout/index.vue',
      'apps/web-demo/src/views/showcase/runtime/overview/index.vue',
      'apps/web-demo/src/views/showcase/runtime/state-ownership/index.vue',
      'apps/web-demo/src/locales/lang/console/en-US.ts',
      'apps/web-demo/src/locales/lang/console/zh-CN.ts',
      'e2e/phase2c-runtime-ui.spec.ts',
    ]
    const hardcodedColorPattern =
      /#[0-9a-fA-F]{3,8}\b|\b(?:rgb|rgba|hsl|hsla)\(|\b(?:bg|text|border)-(?:white|black|gray|slate|red|blue|green|yellow|orange|purple|neutral|zinc|stone)(?:\b|-)/
    const inlineStylePattern = new RegExp(String.raw`\b:?sty` + 'le=')

    const violations = changedRuntimeFiles.flatMap(file => {
      const source = readFileSync(file, 'utf8')
      return [
        hardcodedColorPattern.test(source) ? `${file}: hardcoded color` : null,
        inlineStylePattern.test(source) ? `${file}: raw inline style` : null,
      ].filter((entry): entry is string => Boolean(entry))
    })

    expect(violations).toEqual([])
  })
})
