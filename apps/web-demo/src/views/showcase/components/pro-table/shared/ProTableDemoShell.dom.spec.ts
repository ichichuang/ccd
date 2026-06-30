// @vitest-environment jsdom

import { mount } from '@vue/test-utils'
import { createI18n } from 'vue-i18n'
import { describe, expect, it } from 'vitest'
import enUSCore from '../../../../../locales/lang/core/en-US'
import zhCNCore from '../../../../../locales/lang/core/zh-CN'
import enUSConsole from '../../../../../locales/lang/console/en-US'
import ProTableDemoShell from './ProTableDemoShell.vue'

type ProTableDemoShellMode =
  | 'api-events'
  | 'basic'
  | 'columns'
  | 'inline-editing'
  | 'server-request'
  | 'selection'
  | 'sorting-filtering'
  | 'states'

interface ShellMountOptions {
  id: `components-pro-table-${string}`
  mode: ProTableDemoShellMode
}

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
      name: 'ProTable',
      props: ['title', 'columns', 'data', 'editMode'],
      emits: ['cell-edit-complete'],
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
}

function mountShell({ id, mode }: ShellMountOptions) {
  return mount(ProTableDemoShell, {
    global: globalMountOptions,
    props: {
      id,
      mode,
    },
  })
}

describe('ProTableDemoShell visual foundation', () => {
  it('renders shared showcase primitives around the table workspace', () => {
    const wrapper = mountShell({
      id: 'components-pro-table-basic',
      mode: 'basic',
    })

    expect(wrapper.find('[data-testid="showcase-pro-table-shell"]').exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'ShowcaseHero' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'ShowcaseDemoPanel' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'ShowcaseToolbar' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'ShowcaseSourceLinks' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'ShowcaseEvidencePanel' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'ShowcaseEmptyState' }).exists()).toBe(true)
    expect(wrapper.find('[data-testid="showcase-pro-table-action-toolbar"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="showcase-pro-table-demo-region"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="showcase-pro-table-state-area"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="showcase-pro-table-source-area"]').exists()).toBe(true)
  })

  it('preserves action toolbar, table content, state result, and source evidence areas', () => {
    const wrapper = mountShell({
      id: 'components-pro-table-basic',
      mode: 'basic',
    })

    expect(wrapper.text()).toContain('Table actions')
    expect(wrapper.text()).toContain('Use the controls to call ProTable exposed methods')
    expect(wrapper.text()).toContain('Reload')
    expect(wrapper.text()).toContain('Basic capability rows')
    expect(wrapper.find('.pro-table-stub').exists()).toBe(true)
    expect(wrapper.find('.empty-state-stub').exists()).toBe(true)
    expect(wrapper.text()).toContain('Table state')
    expect(wrapper.text()).toContain('Fetch state')
    expect(wrapper.text()).toContain('Selection and row focus')
    expect(wrapper.text()).toContain(
      'apps/web-demo/src/views/showcase/components/pro-table/shared/ProTableDemoShell.vue'
    )
    expect(wrapper.text()).toContain('packages/vue-ui/src/ProTable/engine/types/props.ts')
  })

  it('documents column controls and valueEnum behavior on the columns route', () => {
    const wrapper = mountShell({
      id: 'components-pro-table-columns',
      mode: 'columns',
    })

    expect(wrapper.text()).toContain('Column controls')
    expect(wrapper.text()).toContain('Hide owner')
    expect(wrapper.text()).toContain('Plain column objects')
    expect(wrapper.text()).toContain('Value enum rendering')
    expect(wrapper.text()).toContain('Status cells render through valueEnum')
  })

  it('proves inline editing updates local demo rows through the emitted event', async () => {
    const wrapper = mountShell({
      id: 'components-pro-table-inline-editing',
      mode: 'inline-editing',
    })

    const table = wrapper.findComponent({ name: 'ProTable' })
    expect(table.props('editMode')).toBe('cell')

    const rows = table.props('data') as Array<Record<string, unknown>>
    const columns = table.props('columns') as Array<Record<string, unknown>>
    table.vm.$emit('cell-edit-complete', {
      row: rows[0],
      rowKey: rows[0].id,
      column: columns[0],
      field: 'capability',
      oldValue: rows[0].capability,
      newValue: 'Edited capability',
      primeEvent: {
        originalEvent: new Event('keydown'),
        data: rows[0],
        newData: { ...rows[0], capability: 'Edited capability' },
        value: rows[0].capability,
        newValue: 'Edited capability',
        field: 'capability',
        index: 0,
        type: 'enter',
      },
    })
    await wrapper.vm.$nextTick()

    const updatedRows = wrapper.findComponent({ name: 'ProTable' }).props('data') as Array<
      Record<string, unknown>
    >
    expect(updatedRows[0].capability).toBe('Edited capability')
    expect(wrapper.text()).toContain('cell-edit-complete: capability: Edited capability')
  })

  it('renders the API event result area and readable wrapping source paths', () => {
    const wrapper = mountShell({
      id: 'components-pro-table-api-events',
      mode: 'api-events',
    })

    expect(wrapper.text()).toContain('Event log')
    expect(wrapper.text()).toContain('No table events yet')
    expect(wrapper.text()).toContain('Injected API executor')
    expect(wrapper.text()).toContain('ProTable package API')

    const codeBlocks = wrapper.findAll('code')
    expect(codeBlocks.length).toBeGreaterThan(1)
    expect(
      codeBlocks.every(
        code => code.classes().includes('break-all') && code.classes().includes('select-all')
      )
    ).toBe(true)
  })
})

describe('ProTable column-filter i18n contract (PT-UI-03 polish)', () => {
  // ProTable.vue resolves these labels via t('proTable.columnFilter*'); the host app
  // (web-demo core locales) must register them so the per-column header filter UI renders
  // localized labels instead of falling back to English and emitting [intlify] missing-key
  // warnings. Direct property access also makes this a compile-time presence guard.
  it('registers the column-filter labels in en-US core, with {column} interpolation', () => {
    expect(enUSCore.proTable.columnFilterAria).toContain('{column}')
    expect(enUSCore.proTable.columnFilterPlaceholder.length).toBeGreaterThan(0)
    expect(enUSCore.proTable.columnFilterClear.length).toBeGreaterThan(0)
  })

  it('registers the column-filter labels in zh-CN core, with {column} interpolation', () => {
    expect(zhCNCore.proTable.columnFilterAria).toContain('{column}')
    expect(zhCNCore.proTable.columnFilterPlaceholder.length).toBeGreaterThan(0)
    expect(zhCNCore.proTable.columnFilterClear.length).toBeGreaterThan(0)
  })
})
