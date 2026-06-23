// @vitest-environment jsdom

import { readFileSync } from 'node:fs'
import { mount, type DOMWrapper, type VueWrapper } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ShowcaseUtilityDemo from './ShowcaseUtilityDemo.vue'

const i18n = createI18n({
  legacy: false,
  locale: 'en-US',
  fallbackLocale: 'en-US',
  missingWarn: false,
  fallbackWarn: false,
  messages: {
    'en-US': {
      common: {
        no: 'No',
        yes: 'Yes',
      },
      showcase: {
        remaining: {
          tags: {
            technical: 'Technical',
          },
          utils: {
            toolbarTitle: 'Utility preview controls',
            toolbarDescription: 'Re-run deterministic samples.',
            runSample: 'Run sample',
            resetSample: 'Reset sample',
            runCount: 'Preview runs',
            lastAction: 'Last action',
            sampleTitle: 'Sample input',
            sampleDescription: 'Read the exact payload.',
            outputTitle: 'Utility output',
            outputDescription: 'Result values stay readable.',
            outputEmptyTitle: 'No utility output',
            outputEmptyDescription: 'No result rows.',
            runtimeTitle: 'Locale and timezone runtime',
            runtimeDescription: 'Date utilities expose runtime state.',
            contractTitle: 'Utility contract',
            contractDescription: 'Pages consume utility APIs.',
            contractUtilityTitle: 'Utility API',
            contractUtilityDescription: 'Existing utility modules own behavior.',
            contractRuntimeTitle: 'App-owned boundary',
            contractRuntimeDescription: 'Runtime behavior stays app-owned.',
            contractEvidenceTitle: 'Source evidence',
            contractEvidenceDescription: 'Source paths wrap below.',
            dateFormat: 'Formatted date',
            dateSmart: 'Smart date',
            workingDay: 'Working day',
            encodedLength: 'Encoded length',
            decodedScope: 'Decoded scope',
            decodedMode: 'Decoded mode',
            codec: 'Codec',
            restoredTheme: 'Restored theme',
            restoredScope: 'Restored scope',
            initialized: 'Initialized',
            locale: 'Locale',
            timezone: 'Timezone',
            badges: {
              overview: 'Utils overview',
              date: 'Date utility',
              'safe-storage': 'Safe storage',
              'state-persistence': 'State persistence',
            },
            boolean: {
              yes: 'yes',
              no: 'no',
            },
            actionStatus: {
              ready: 'Ready',
              rerun: 'Sample re-run',
              reset: 'Sample reset',
            },
            overview: {
              description: 'Compare utility helpers.',
              note: 'Utility routes group helpers.',
              samplePrimaryLabel: 'Utility scope',
              samplePrimaryValue: 'date + safeStorage + persistence',
              sampleSecondaryLabel: 'Route family',
              sampleSecondaryValue: '/showcase/utils/*',
              sampleTertiaryLabel: 'Ownership',
              sampleTertiaryValue: 'app utility modules only',
            },
            date: {
              description: 'Format a fixed timestamp.',
              note: 'Date helpers format visible copy.',
              samplePrimaryLabel: 'Input timestamp',
              samplePrimaryValue: '2026-06-18T09:30:00+08:00',
              sampleSecondaryLabel: 'Format policy',
              sampleSecondaryValue: 'YYYY-MM-DD HH:mm + smart system format',
              sampleTertiaryLabel: 'Calendar check',
              sampleTertiaryValue: 'working-day evaluation',
            },
            'safe-storage': {
              description: 'Encode and restore preferences.',
              note: 'Safe storage previews restored preference state.',
              samplePrimaryLabel: 'Payload scope',
              samplePrimaryValue: 'showcase',
              sampleSecondaryLabel: 'Payload mode',
              sampleSecondaryValue: 'comfortable',
              sampleTertiaryLabel: 'Payload theme',
              sampleTertiaryValue: 'system',
            },
            'state-persistence': {
              description: 'Exercise the sync codec.',
              note: 'State persistence uses the same codec path.',
              samplePrimaryLabel: 'Codec path',
              samplePrimaryValue: 'safeStorageCodecs.sync',
              sampleSecondaryLabel: 'Restored fields',
              sampleSecondaryValue: 'theme + scope',
              sampleTertiaryLabel: 'Persistence role',
              sampleTertiaryValue: 'preference-state serializer evidence',
            },
          },
        },
      },
    },
  },
})

function getButton(wrapper: VueWrapper, label: string): DOMWrapper<Element> {
  const button = wrapper.findAll('button').find(candidate => candidate.text() === label)
  if (!button) throw new Error(`Missing button: ${label}`)
  return button
}

function mountDemo(kind = 'utils-date'): VueWrapper {
  return mount(ShowcaseUtilityDemo, {
    global: {
      plugins: [i18n],
      stubs: {
        Button: {
          props: ['label', 'icon', 'severity', 'outlined', 'pt'],
          emits: ['click'],
          template:
            '<button type="button" v-bind="$attrs" @click="$emit(\'click\')">{{ label }}</button>',
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

describe('ShowcaseUtilityDemo', () => {
  beforeEach(() => {
    vi.stubGlobal('useDateUtils', () => ({
      currentLocale: { value: 'zh-CN' },
      currentTimezone: { value: 'Asia/Shanghai' },
      isInitialized: { value: true },
    }))
  })

  it('renders the Phase 2C Utils structure with shared showcase primitives', () => {
    const wrapper = mountDemo()

    expect(wrapper.get('[data-testid="showcase-utils-demo"]').text()).toContain(
      'Utility preview controls'
    )
    expect(wrapper.get('[data-testid="showcase-utils-action-toolbar"]').text()).toContain(
      'Format a fixed timestamp.'
    )
    expect(wrapper.get('[data-testid="showcase-utils-sample-panel"]').text()).toContain(
      'Input timestamp'
    )
    expect(wrapper.get('[data-testid="showcase-utils-output-panel"]').text()).toContain(
      'Utility output'
    )
    expect(wrapper.get('[data-testid="showcase-utils-runtime-panel"]').text()).toContain(
      'Asia/Shanghai'
    )
    expect(wrapper.get('[data-testid="showcase-utils-contract"]').text()).toContain(
      'Utility contract'
    )
  })

  it('keeps utility sample actions usable without changing utility contracts', async () => {
    const wrapper = mountDemo('utils-safe-storage')

    expect(wrapper.get('[data-testid="showcase-utils-run-count"]').text()).toBe('1')
    expect(wrapper.get('[data-testid="showcase-utils-last-action"]').text()).toContain('Ready')

    await getButton(wrapper, 'Run sample').trigger('click')
    expect(wrapper.get('[data-testid="showcase-utils-run-count"]').text()).toBe('2')
    expect(wrapper.get('[data-testid="showcase-utils-last-action"]').text()).toContain(
      'Sample re-run'
    )

    await getButton(wrapper, 'Reset sample').trigger('click')
    expect(wrapper.get('[data-testid="showcase-utils-run-count"]').text()).toBe('1')
    expect(wrapper.get('[data-testid="showcase-utils-last-action"]').text()).toContain(
      'Sample reset'
    )
  })

  it('preserves demonstrated safeStorage and state persistence outputs', () => {
    const safeStorageWrapper = mountDemo('utils-safe-storage')
    expect(safeStorageWrapper.get('[data-testid="showcase-utils-output-decoded"]').text()).toBe(
      'showcase'
    )
    expect(safeStorageWrapper.get('[data-testid="showcase-utils-output-mode"]').text()).toBe(
      'comfortable'
    )

    const persistenceWrapper = mountDemo('utils-state-persistence')
    expect(persistenceWrapper.get('[data-testid="showcase-utils-output-codec"]').text()).toBe(
      'safeStorageCodecs.sync'
    )
    expect(persistenceWrapper.get('[data-testid="showcase-utils-output-theme"]').text()).toBe(
      'system'
    )
  })

  it('keeps changed Utils sources free of hardcoded colors and inline styles', () => {
    const changedUtilityFiles = [
      'apps/web-demo/src/locales/lang/console/en-US.ts',
      'apps/web-demo/src/locales/lang/console/zh-CN.ts',
      'apps/web-demo/src/views/showcase/shared/remaining/ShowcaseUtilityDemo.vue',
      'apps/web-demo/src/views/showcase/shared/remaining/ShowcaseUtilityDemo.dom.spec.ts',
      'e2e/phase2c-utils-ui.spec.ts',
    ]
    const hardcodedColorPattern =
      /#[0-9a-fA-F]{3,8}\b|\b(?:rgb|rgba|hsl|hsla)\(|\b(?:bg|text|border)-(?:white|black|gray|slate|red|blue|green|yellow|orange|purple|neutral|zinc|stone)(?:\b|-)/
    const inlineStylePattern = new RegExp(String.raw`\b:?sty` + 'le=')

    const violations = changedUtilityFiles.flatMap(file => {
      const source = readFileSync(file, 'utf8')
      return [
        hardcodedColorPattern.test(source) ? `${file}: hardcoded color` : null,
        inlineStylePattern.test(source) ? `${file}: inline style` : null,
      ].filter((entry): entry is string => Boolean(entry))
    })

    expect(violations).toEqual([])
  })
})
