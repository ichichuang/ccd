// @vitest-environment jsdom

import { readFileSync } from 'node:fs'
import { mount, type VueWrapper } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import enUSConsole from '../../../../locales/lang/console/en-US'
import type { RemainingShowcaseId } from '../../data/showcaseDemoContent'
import ShowcaseCapabilityPage from '../ShowcaseCapabilityPage.vue'
import ShowcaseDesignDemo from './ShowcaseDesignDemo.vue'

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

function mountDemo(kind = 'design-tokens'): VueWrapper {
  return mount(ShowcaseDesignDemo, {
    global: globalMountOptions,
    props: {
      kind,
    },
  })
}

function mountCapabilityPage(id: RemainingShowcaseId = 'design-tokens'): VueWrapper {
  return mount(ShowcaseCapabilityPage, {
    global: globalMountOptions,
    props: {
      id,
    },
  })
}

function getButton(wrapper: VueWrapper, testId: string) {
  return wrapper.get(`[data-testid="${testId}"]`)
}

describe('ShowcaseDesignDemo', () => {
  beforeEach(() => {
    vi.stubGlobal('useLayoutRuntime', () => ({
      breakpoint: { value: 'xl' },
      deviceType: { value: 'desktop' },
    }))
    vi.stubGlobal('useSizeStore', () => ({
      sizeName: 'comfortable',
    }))
    vi.stubGlobal('useThemeSwitch', () => ({
      mode: { value: 'light' },
      transitionMode: { value: 'fade' },
    }))
  })

  it('renders the Design page family with shared Phase 2B showcase primitives', () => {
    const wrapper = mountCapabilityPage()

    expect(wrapper.findComponent({ name: 'ShowcaseHero' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'ShowcaseSection' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'ShowcaseCard' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'ShowcaseToolbar' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'ShowcaseEvidencePanel' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'ShowcaseEmptyState' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'ShowcaseSourceLinks' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'ShowcaseDemoPanel' }).exists()).toBe(true)
    expect(wrapper.get('[data-testid="showcase-design-demo"]').text()).toContain(
      'Design preview controls'
    )
    expect(wrapper.get('[data-testid="showcase-design-sample-panel"]').text()).toContain(
      'Token and sample preview'
    )
    expect(wrapper.get('[data-testid="showcase-design-source-area"]').text()).toContain(
      'Design source evidence'
    )
  })

  it('keeps local sample actions usable without changing runtime owners', async () => {
    const wrapper = mountDemo('design-material')

    expect(wrapper.get('[data-testid="showcase-design-run-count"]').text()).toBe('1')
    expect(wrapper.get('[data-testid="showcase-design-last-action"]').text()).toContain('Ready')
    expect(wrapper.get('[data-testid="showcase-design-active-sample"]').text()).toContain('Solid')

    await getButton(wrapper, 'showcase-design-inspect-sample').trigger('click')
    expect(wrapper.get('[data-testid="showcase-design-run-count"]').text()).toBe('2')
    expect(wrapper.get('[data-testid="showcase-design-last-action"]').text()).toContain(
      'Sample inspected'
    )
    expect(wrapper.get('[data-testid="showcase-design-active-sample"]').text()).toContain(
      'Elevated'
    )

    await getButton(wrapper, 'showcase-design-reset-sample').trigger('click')
    expect(wrapper.get('[data-testid="showcase-design-run-count"]').text()).toBe('1')
    expect(wrapper.get('[data-testid="showcase-design-last-action"]').text()).toContain(
      'Sample reset'
    )
    expect(wrapper.get('[data-testid="showcase-design-active-sample"]').text()).toContain('Solid')
  })

  it('preserves theme, density, layout, and preview readouts', () => {
    const wrapper = mountDemo('design-density')

    expect(wrapper.get('[data-testid="showcase-design-state-densityMode"]').text()).toBe(
      'comfortable'
    )
    expect(wrapper.get('[data-testid="showcase-design-state-breakpoint"]').text()).toBe('xl')
    expect(wrapper.get('[data-testid="showcase-design-state-deviceType"]').text()).toBe('desktop')
    expect(wrapper.get('[data-testid="showcase-design-state-activeRoute"]').text()).toBe(
      '/showcase/design/density'
    )
    expect(wrapper.get('[data-testid="showcase-design-preview-compact"]').text()).toContain(
      'p-sm + gap-xs'
    )
    expect(wrapper.get('[data-testid="showcase-design-preview-loose"]').text()).toContain(
      'p-lg + gap-md'
    )
  })

  it('keeps source evidence selectable and readable', () => {
    const wrapper = mountDemo('design-tokens')

    expect(wrapper.get('[data-testid="showcase-design-source-area"]').text()).toContain(
      'packages/design-tokens/src/**'
    )
    const evidenceCode = wrapper
      .findAll('code')
      .find(code => code.text().includes('packages/design-tokens/src/**'))

    expect(evidenceCode?.classes()).toContain('break-all')
    expect(evidenceCode?.classes()).toContain('select-all')
  })

  it('keeps changed Design sources free of hardcoded colors and raw inline styles', () => {
    const changedDesignFiles = [
      'apps/web-demo/src/views/showcase/shared/remaining/ShowcaseDesignDemo.vue',
      'apps/web-demo/src/views/showcase/shared/remaining/ShowcaseDesignDemo.dom.spec.ts',
      'apps/web-demo/src/locales/lang/console/en-US.ts',
      'apps/web-demo/src/locales/lang/console/zh-CN.ts',
      'e2e/phase2c-design-ui.spec.ts',
    ]
    const hardcodedColorPattern =
      /#[0-9a-fA-F]{3,8}\b|\b(?:rgb|rgba|hsl|hsla)\(|\b(?:bg|text|border)-(?:white|black|gray|slate|red|blue|green|yellow|orange|purple|neutral|zinc|stone)(?:\b|-)/
    const inlineStylePattern = new RegExp(String.raw`\b:?sty` + 'le=')

    const violations = changedDesignFiles.flatMap(file => {
      const source = readFileSync(file, 'utf8')
      return [
        hardcodedColorPattern.test(source) ? `${file}: hardcoded color` : null,
        inlineStylePattern.test(source) ? `${file}: raw inline style` : null,
      ].filter((entry): entry is string => Boolean(entry))
    })

    expect(violations).toEqual([])
  })
})
