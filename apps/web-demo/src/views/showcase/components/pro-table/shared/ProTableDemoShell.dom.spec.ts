// @vitest-environment jsdom

import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { describe, expect, it } from 'vitest'
import ProTableDemoShell from './ProTableDemoShell.vue'

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
          technical: {
            title: 'Technical notes',
          },
          demoLevels: {
            complete: 'Complete',
            preview: 'Preview',
          },
        },
        pages: {
          components: {
            proTable: {
              basic: {
                eyebrow: 'Table',
                title: 'Basic Table',
                description: 'Basic table route description.',
                try: 'Try the table',
              },
            },
          },
        },
        proTable: {
          badges: {
            proTableOnly: 'ProTable only',
          },
          modes: {
            basic: {
              label: 'Basic',
              demo: 'Baseline table demo.',
              tableTitle: 'Basic rows',
            },
          },
          toolbar: {
            title: 'Table actions',
            description:
              'Run table methods and inspect state feedback without leaving the data surface.',
          },
          controls: {
            reload: 'Reload',
            clearSelection: 'Clear selection',
            getState: 'Get state',
            getFetchState: 'Get fetch state',
            exportPage: 'Export page',
            exportSelected: 'Export selected',
          },
          actions: {
            ready: 'Ready for table actions.',
          },
          empty: {
            title: 'No rows',
            description: 'The table has no rows.',
          },
          state: {
            title: 'State',
            empty: 'No state read yet.',
            none: 'None',
          },
          fetch: {
            title: 'Fetch',
            empty: 'No fetch state read yet.',
          },
          selection: {
            title: 'Selection',
            summary: '{count} selected, active row {row}.',
          },
          rows: {
            none: 'No active row',
          },
        },
      },
    },
  },
})

describe('ProTableDemoShell visual foundation', () => {
  it('preserves the table action area and source evidence panel', () => {
    const wrapper = mount(ProTableDemoShell, {
      global: {
        plugins: [i18n],
        stubs: {
          Button: {
            props: ['label', 'icon', 'severity', 'outlined', 'size'],
            template: '<button type="button">{{ label }}</button>',
          },
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
          ProTable: {
            props: ['title'],
            template:
              '<section class="pro-table-stub"><strong>{{ title }}</strong><slot name="empty" /></section>',
          },
          RouterLink: {
            props: ['to'],
            template: '<a class="router-link-stub" :href="to"><slot /></a>',
          },
          Select: {
            props: ['modelValue', 'options', 'optionLabel', 'optionValue'],
            template: '<div class="select-stub" />',
          },
          Tag: {
            props: ['value', 'severity'],
            template: '<span class="tag-stub" :data-severity="severity">{{ value }}</span>',
          },
          ToggleSwitch: {
            props: ['modelValue'],
            template: '<span class="toggle-stub" />',
          },
        },
      },
      props: {
        id: 'components-pro-table-basic',
        mode: 'basic',
      },
    })

    expect(wrapper.text()).toContain('Table actions')
    expect(wrapper.text()).toContain('Ready for table actions.')
    expect(wrapper.text()).toContain('Reload')
    expect(wrapper.text()).toContain('Basic rows')
    expect(wrapper.find('.pro-table-stub').exists()).toBe(true)
    expect(wrapper.find('.empty-state-stub').exists()).toBe(true)
    expect(wrapper.text()).toContain(
      'apps/web-demo/src/views/showcase/components/pro-table/shared/ProTableDemoShell.vue'
    )
  })
})
