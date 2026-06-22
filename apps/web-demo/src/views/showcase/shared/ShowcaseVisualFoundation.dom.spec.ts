// @vitest-environment jsdom

import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { describe, expect, it } from 'vitest'
import ShowcaseCatalogGrid from './ShowcaseCatalogGrid.vue'
import ShowcaseEvidencePanel from './ShowcaseEvidencePanel.vue'
import ShowcaseHero from './ShowcaseHero.vue'
import ShowcasePageShell from './ShowcasePageShell.vue'
import ShowcaseToolbar from './ShowcaseToolbar.vue'
import type { ShowcaseCatalogGroup, ShowcaseCatalogItem } from '../data/types'

const foundationItem: ShowcaseCatalogItem = {
  id: 'foundation-test',
  groupId: 'components',
  path: '/showcase/components/foundation-test',
  name: 'ShowcaseFoundationTest',
  titleKey: 'router.showcase.foundationTest',
  localeBaseKey: 'showcase.pages.foundationTest',
  icon: 'i-lucide-sparkles',
  rank: 1,
  kind: 'demo',
  demoLevel: 'preview',
  componentKey: 'foundation-test',
  sourcePaths: ['apps/web-demo/src/views/showcase/shared/ShowcasePageShell.vue'],
  tags: ['foundation'],
}

const catalogGroups: ShowcaseCatalogGroup[] = [
  {
    id: 'tables',
    titleKey: 'showcase.groups.tables.title',
    descriptionKey: 'showcase.groups.tables.description',
    icon: 'i-lucide-table-2',
    rank: 1,
  },
  {
    id: 'runtime',
    titleKey: 'showcase.groups.runtime.title',
    descriptionKey: 'showcase.groups.runtime.description',
    icon: 'i-lucide-cpu',
    rank: 2,
  },
]

const catalogItems: ShowcaseCatalogItem[] = [
  {
    id: 'components-pro-table-basic',
    groupId: 'tables',
    path: '/showcase/components/pro-table/basic',
    name: 'ShowcaseComponentsProTableBasic',
    titleKey: 'router.showcase.components.proTable.basic',
    localeBaseKey: 'showcase.pages.proTableBasic',
    icon: 'i-lucide-table-2',
    rank: 1,
    kind: 'table',
    demoLevel: 'complete',
    componentKey: 'components-pro-table-basic',
    sourcePaths: ['apps/web-demo/src/views/showcase/components/pro-table/basic/index.vue'],
    tags: ['table'],
  },
  {
    id: 'runtime-overview',
    groupId: 'runtime',
    path: '/showcase/runtime/overview',
    name: 'ShowcaseRuntimeOverview',
    titleKey: 'router.showcase.runtime.overview',
    localeBaseKey: 'showcase.pages.runtimeOverview',
    icon: 'i-lucide-cpu',
    rank: 2,
    kind: 'overview',
    demoLevel: 'preview',
    componentKey: 'runtime-overview',
    sourcePaths: ['apps/web-demo/src/views/showcase/runtime/overview/index.vue'],
    tags: ['runtime'],
  },
]

const i18n = createI18n({
  legacy: false,
  locale: 'en-US',
  fallbackLocale: 'en-US',
  missingWarn: false,
  fallbackWarn: false,
  messages: {
    'en-US': {
      showcase: {
        shell: {
          heroActions: 'Showcase actions',
          source: {
            title: 'Source',
            description: 'Implementation evidence.',
            empty: 'No source path is registered.',
          },
          related: {
            title: 'Related pages',
            description: 'Nearby showcase routes.',
          },
          demoLevels: {
            complete: 'Complete',
            preview: 'Preview',
          },
          kinds: {
            overview: 'Overview',
            table: 'Table',
            demo: 'Demo',
          },
        },
        groups: {
          tables: {
            title: 'Tables',
            description: 'Table routes.',
          },
          runtime: {
            title: 'Runtime',
            description: 'Runtime routes.',
          },
        },
        pages: {
          foundationTest: {
            eyebrow: 'Foundation',
            title: 'Showcase foundation',
            description: 'Shared page shell description.',
          },
          proTableBasic: {
            description: 'Basic table route description.',
          },
          runtimeOverview: {
            description: 'Runtime overview route description.',
          },
        },
        hero: {
          openBasic: 'Open basic table',
        },
      },
      router: {
        showcase: {
          foundationTest: 'Foundation test',
          components: {
            proTable: {
              basic: 'Basic Table',
            },
          },
          runtime: {
            overview: 'Runtime Overview',
          },
        },
      },
    },
  },
})

const globalMountOptions = {
  plugins: [i18n],
  stubs: {
    CScrollbar: {
      template: '<div class="c-scrollbar-stub"><slot /></div>',
    },
    EmptyState: {
      props: ['icon', 'title', 'description', 'actionLabel'],
      template:
        '<section class="empty-state-stub"><span>{{ title }}</span><span>{{ description }}</span><span>{{ actionLabel }}</span></section>',
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

describe('showcase visual foundation primitives', () => {
  it('renders page title, description, content slot, and source evidence', () => {
    const wrapper = mount(ShowcasePageShell, {
      global: globalMountOptions,
      props: {
        item: foundationItem,
        relatedIds: ['missing-related-id'],
      },
      slots: {
        demo: '<div data-test="demo-slot">Demo slot content</div>',
      },
    })

    expect(wrapper.find('h1').text()).toBe('Showcase foundation')
    expect(wrapper.text()).toContain('Shared page shell description.')
    expect(wrapper.text()).toContain('Demo slot content')
    expect(wrapper.text()).toContain('Implementation evidence.')
    expect(wrapper.text()).toContain(
      'apps/web-demo/src/views/showcase/shared/ShowcasePageShell.vue'
    )
  })

  it('renders hero actions with preserved navigation targets', () => {
    const wrapper = mount(ShowcaseHero, {
      global: globalMountOptions,
      props: {
        title: 'Hero title',
        description: 'Hero description',
        actions: [
          {
            id: 'basic',
            to: '/showcase/components/pro-table/basic',
            labelKey: 'showcase.hero.openBasic',
            icon: 'i-lucide-arrow-right',
          },
        ],
      },
    })

    const action = wrapper.get('a.router-link-stub')
    expect(action.text()).toContain('Open basic table')
    expect(action.attributes('href')).toBe('/showcase/components/pro-table/basic')
  })

  it('keeps catalog card navigation targets intact', () => {
    const wrapper = mount(ShowcaseCatalogGrid, {
      global: globalMountOptions,
      props: {
        groups: catalogGroups,
        items: catalogItems,
      },
    })

    const targets = wrapper.findAll('a.router-link-stub').map(link => link.attributes('href'))
    expect(targets).toEqual(['/showcase/components/pro-table/basic', '/showcase/runtime/overview'])
    expect(wrapper.text()).toContain('Basic table route description.')
    expect(wrapper.text()).toContain('Runtime overview route description.')
  })

  it('renders source paths as readable selectable evidence', () => {
    const wrapper = mount(ShowcaseEvidencePanel, {
      global: globalMountOptions,
      props: {
        title: 'Source',
        description: 'Implementation evidence.',
        emptyText: 'No source path is registered.',
        sourcePaths: ['apps/web-demo/src/views/showcase/shared/ShowcaseEvidencePanel.vue'],
      },
    })

    const code = wrapper.get('code')
    expect(code.text()).toBe('apps/web-demo/src/views/showcase/shared/ShowcaseEvidencePanel.vue')
    expect(code.classes()).toContain('break-all')
    expect(code.classes()).toContain('select-all')
  })

  it('renders toolbar copy, action slot, and summary', () => {
    const wrapper = mount(ShowcaseToolbar, {
      global: globalMountOptions,
      props: {
        title: 'Table actions',
        description: 'Run table methods.',
        summary: 'Ready.',
      },
      slots: {
        actions: '<span data-test="toolbar-action">Reload</span>',
      },
    })

    expect(wrapper.text()).toContain('Table actions')
    expect(wrapper.text()).toContain('Run table methods.')
    expect(wrapper.text()).toContain('Ready.')
    expect(wrapper.get('[data-test="toolbar-action"]').text()).toBe('Reload')
  })
})
