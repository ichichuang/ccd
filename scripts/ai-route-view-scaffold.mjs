import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const cwd = process.cwd()
const allowedKinds = new Set(['table', 'form', 'detail'])

const args = process.argv.slice(2)
const options = {
  kind: 'table',
  icon: 'i-lucide-layout-grid',
  parent: 'default',
  rank: '99',
  force: false,
  dryRun: false,
}

for (let index = 0; index < args.length; index += 1) {
  const arg = args[index]
  if (arg === '--') continue
  if (!arg.startsWith('--')) continue
  const key = arg.slice(2)
  if (key === 'force' || key === 'dry-run') {
    options[key === 'dry-run' ? 'dryRun' : key] = true
    continue
  }
  const next = args[index + 1]
  if (!next || next.startsWith('--')) {
    throw new Error(`missing value for --${key}`)
  }
  options[toCamelKey(key)] = next
  index += 1
}

if (!options.segment) {
  throw new Error('missing required --segment, e.g. --segment system/user')
}
if (!options.titleKey) {
  throw new Error('missing required --title-key, e.g. --title-key router.system.user.index')
}
if (!allowedKinds.has(options.kind)) {
  throw new Error(`invalid --kind "${options.kind}"; expected one of: ${[...allowedKinds].join(', ')}`)
}

const segment = normalizeSegment(options.segment)
const segmentParts = segment.split('/')
const routePath = `/${segment}`
const routeName = options.name ?? toPascalCase(segmentParts)
const pageComponentName = `${routeName}Page`
const hookName = `use${routeName}Page`
const hookDir = segmentParts.length > 1 ? path.posix.join('apps/web-demo/src/hooks/modules', ...segmentParts.slice(0, -1)) : 'apps/web-demo/src/hooks/modules'
const hookFile = path.posix.join(hookDir, `${hookName}.ts`)
const routeFile = path.posix.join('apps/web-demo/src/router/modules', options.routeFile ?? `${segmentParts.join('-')}.ts`)
const viewFile = path.posix.join('apps/web-demo/src/views', segment, 'index.vue')
const stateKey = options.stateKey ?? `${segmentParts.join('-')}-page`
const titleLabel = options.title ?? toTitleCase(segmentParts[segmentParts.length - 1])
const description = options.description ?? defaultDescription(options.kind, titleLabel)
const routeParent = options.parent === 'default' ? undefined : options.parent

const viewImportPath = `@/hooks/modules/${segmentParts.length > 1 ? `${segmentParts.slice(0, -1).join('/')}/` : ''}${hookName}`

const files = [
  {
    relPath: hookFile,
    content: renderHook({
      kind: options.kind,
      routeName,
      hookName,
      titleLabel,
      description,
      stateKey,
    }),
  },
  {
    relPath: viewFile,
    content: renderView({
      kind: options.kind,
      pageComponentName,
      hookName,
      viewImportPath,
      stateKey,
    }),
  },
  {
    relPath: routeFile,
    content: renderRouteModule({
      routePath,
      routeName,
      viewFile,
      titleKey: options.titleKey,
      icon: options.icon,
      parent: routeParent,
      rank: Number(options.rank),
    }),
  },
]

for (const file of files) {
  const absPath = path.join(cwd, file.relPath)
  if (!options.force && fs.existsSync(absPath)) {
    throw new Error(`target already exists: ${file.relPath} (re-run with --force to overwrite)`)
  }
}

console.log('AI route/view scaffold')
console.log('======================')
console.log(`segment: ${segment}`)
console.log(`kind: ${options.kind}`)
console.log(`route: ${routePath} -> ${routeName}`)

for (const file of files) {
  if (options.dryRun) {
    console.log(`[DRY-RUN] ${file.relPath}`)
    continue
  }
  fs.mkdirSync(path.dirname(path.join(cwd, file.relPath)), { recursive: true })
  fs.writeFileSync(path.join(cwd, file.relPath), file.content)
  console.log(`[WRITE] ${file.relPath}`)
}

console.log('Next steps: run pnpm ai:guard && pnpm ai:doctor')

function normalizeSegment(input) {
  const normalized = input
    .trim()
    .replace(/^\/+|\/+$/g, '')
    .replace(/\\/g, '/')
    .replace(/\/+/g, '/')
  if (!normalized) throw new Error('segment must not be empty')
  return normalized
}

function toCamelKey(key) {
  return key.replace(/-([a-z])/g, (_, char) => char.toUpperCase())
}

function toPascalCase(parts) {
  return parts
    .map(part => part.replace(/[:_-]+(.)/g, (_, char) => char.toUpperCase()))
    .map(part => part.replace(/^[a-z]/, char => char.toUpperCase()))
    .join('')
}

function toTitleCase(value) {
  return value
    .split(/[-_]/g)
    .filter(Boolean)
    .map(token => token.charAt(0).toUpperCase() + token.slice(1))
    .join(' ')
}

function defaultDescription(kind, titleLabel) {
  if (kind === 'form') return `${titleLabel} form page assembled on top of ProForm.`
  if (kind === 'detail') return `${titleLabel} detail page assembled from readonly sections.`
  return `${titleLabel} table page assembled on top of ProTable.`
}

function renderRouteModule({ routePath, routeName, viewFile, titleKey, icon, parent, rank }) {
  const viewImport = `@/${viewFile.replace(/^src\//, '')}`
  const parentLine = parent ? `\n      parent: '${parent}',` : ''
  return `const ${routeName.charAt(0).toLowerCase() + routeName.slice(1)}Route: RouteConfig = {
  path: '${routePath}',
  name: '${routeName}',
  component: () => import('${viewImport}'),
  meta: {
    titleKey: '${titleKey}',
    icon: '${icon}',${parentLine}
    rank: ${Number.isFinite(rank) ? rank : 99},
  },
}

export default ${routeName.charAt(0).toLowerCase() + routeName.slice(1)}Route
`
}

function renderView({ kind, pageComponentName, hookName, viewImportPath, stateKey }) {
  if (kind === 'form') {
    return `<script setup lang="ts">
import { ${hookName} } from '${viewImportPath}'

defineOptions({ name: '${pageComponentName}' })

const { title, description, schema, initialValues, handleSubmit } = ${hookName}()
</script>

<template>
  <div
    data-archetype="A1-toolbar-content"
    class="flex flex-col gap-md min-w-0"
  >
    <header class="glass-panel col-stretch gap-sm min-w-0 shrink-0">
      <div class="row-between gap-md min-w-0 flex-wrap">
        <div class="col-stretch gap-xs min-w-0">
          <span class="text-lg font-bold text-foreground text-no-wrap">{{ title }}</span>
          <span class="text-sm text-muted-foreground text-ellipsis-2">{{ description }}</span>
        </div>
      </div>
    </header>

    <section class="flex-1 min-h-0">
      <div class="material-elevated h-full p-md">
        <ProForm
          :schema="schema"
          :initial-values="initialValues"
          @submit="handleSubmit"
        />
      </div>
    </section>
  </div>
</template>
`
  }

  if (kind === 'detail') {
    return `<script setup lang="ts">
import { ${hookName} } from '${viewImportPath}'

defineOptions({ name: '${pageComponentName}' })

const { title, description, sections } = ${hookName}()
</script>

<template>
  <div
    data-archetype="A2-sidebar-inspector"
    class="flex flex-col gap-md min-w-0"
  >
    <header class="glass-panel col-stretch gap-sm min-w-0 shrink-0">
      <span class="text-lg font-bold text-foreground text-no-wrap">{{ title }}</span>
      <span class="text-sm text-muted-foreground text-ellipsis-2">{{ description }}</span>
    </header>

    <section class="grid grid-cols-1 gap-md xl:grid-cols-2">
      <article
        v-for="section in sections"
        :key="section.id"
        class="material-elevated col-stretch gap-sm p-md"
      >
        <div class="row-between gap-sm min-w-0">
          <span class="text-sm font-semibold text-foreground text-no-wrap">{{ section.label }}</span>
        </div>
        <div class="col-stretch gap-sm min-w-0">
          <div
            v-for="item in section.items"
            :key="item.label"
            class="row-between gap-sm min-w-0"
          >
            <span class="text-sm text-muted-foreground text-no-wrap">{{ item.label }}</span>
            <span class="text-sm font-medium text-foreground text-right">{{ item.value }}</span>
          </div>
        </div>
      </article>
    </section>
  </div>
</template>
`
  }

  return `<script setup lang="ts">
import { ${hookName} } from '${viewImportPath}'

defineOptions({ name: '${pageComponentName}' })

const { title, description, columns, rows } = ${hookName}()
</script>

<template>
  <div
    data-archetype="A1-toolbar-content"
    class="flex flex-col gap-md min-w-0"
  >
    <header class="glass-panel col-stretch gap-sm min-w-0 shrink-0">
      <div class="row-between gap-md min-w-0 flex-wrap">
        <div class="col-stretch gap-xs min-w-0">
          <span class="text-lg font-bold text-foreground text-no-wrap">{{ title }}</span>
          <span class="text-sm text-muted-foreground text-ellipsis-2">{{ description }}</span>
        </div>
      </div>
    </header>

    <section class="flex-1 min-h-0">
      <div class="material-elevated h-full">
        <ProTable
          state-key="${escapeTemplateLiteral(stateKey)}"
          :columns="columns"
          :data="rows"
          row-key="id"
          height-mode="fill"
          :pagination="{ pageSize: 10 }"
          :row-hover="true"
        />
      </div>
    </section>
  </div>
</template>
`
}

function renderHook({ kind, routeName, hookName, titleLabel, description, stateKey }) {
  if (kind === 'form') {
    const returnTypeName = `${routeName}PageState`
    return `import type { FormSchema } from '@/components/ProForm'

interface ${returnTypeName} {
  title: string
  description: string
  schema: FormSchema
  initialValues: Record<string, unknown>
  handleSubmit: (values: Record<string, unknown>) => Promise<void>
}

export function ${hookName}(): ${returnTypeName} {
  const title = '${titleLabel}'
  const description = '${description}'

  const schema = reactive<FormSchema>({
    layout: { type: 'grid', gap: 'var(--spacing-md)' },
    fields: [
      {
        type: 'card',
        name: '${toKebabCase(routeName)}-profile',
        label: '${titleLabel} profile',
        layout: { type: 'grid', gap: 'var(--spacing-md)', span: { xs: 12, sm: 6 } },
        children: [
          {
            name: 'name',
            component: 'input',
            label: 'Name',
            required: true,
            span: { xs: 12, sm: 6 },
            props: { placeholder: 'Enter a name' },
          },
          {
            name: 'owner',
            component: 'input',
            label: 'Owner',
            span: { xs: 12, sm: 6 },
            props: { placeholder: 'Owner or team' },
          },
          {
            name: 'status',
            component: 'select',
            label: 'Status',
            span: { xs: 12, sm: 6 },
            props: {
              placeholder: 'Select status',
              options: [
                { label: 'Draft', value: 'draft' },
                { label: 'Active', value: 'active' },
              ],
            },
          },
          {
            name: 'summary',
            component: 'textarea',
            label: 'Summary',
            span: 12,
            props: { rows: 4, placeholder: 'Short summary for ${titleLabel.toLowerCase()}' },
          },
        ],
      },
    ],
  })

  const initialValues = reactive<Record<string, unknown>>({
    name: '${titleLabel}',
    owner: 'Architecture Team',
    status: 'draft',
    summary: '',
  })

  async function handleSubmit(values: Record<string, unknown>): Promise<void> {
    console.info('[${hookName}] submit placeholder', values)
    window.$toast?.infoIn('top-right', '${titleLabel}', 'Replace the scaffold submit handler with real business logic.')
  }

  return {
    title,
    description,
    schema,
    initialValues,
    handleSubmit,
  }
}
`
  }

  if (kind === 'detail') {
    const returnTypeName = `${routeName}PageState`
    return `interface ${routeName}DetailItem {
  label: string
  value: string
}

interface ${routeName}DetailSection {
  id: string
  label: string
  items: ${routeName}DetailItem[]
}

interface ${returnTypeName} {
  title: string
  description: string
  sections: readonly ${routeName}DetailSection[]
}

const sections = [
  {
    id: 'overview',
    label: 'Overview',
    items: [
      { label: 'Name', value: '${titleLabel}' },
      { label: 'Owner', value: 'Architecture Team' },
      { label: 'Status', value: 'Active' },
    ],
  },
  {
    id: 'operations',
    label: 'Operations',
    items: [
      { label: 'Region', value: 'Global' },
      { label: 'Updated At', value: '2026-04-20 09:00' },
      { label: 'Notes', value: 'Replace scaffold values with hook-backed business data.' },
    ],
  },
] as const satisfies ${routeName}DetailSection[]

export function ${hookName}(): ${returnTypeName} {
  const title = '${titleLabel}'
  const description = '${description}'

  return {
    title,
    description,
    sections,
  }
}
`
  }

  return `import type { ProTableColumn } from '@/components/ProTable'
import type { ComputedRef, Ref } from 'vue'

interface ${routeName}Row extends Record<string, unknown> {
  id: string
  name: string
  owner: string
  status: 'draft' | 'active'
  updatedAt: string
}

interface ${routeName}PageState {
  title: string
  description: string
  stateKey: string
  columns: ComputedRef<ProTableColumn<${routeName}Row>[]>
  rows: Ref<${routeName}Row[]>
}

const rows = ref<${routeName}Row[]>([
  {
    id: '${routeName}-001',
    name: '${titleLabel} Alpha',
    owner: 'Architecture Team',
    status: 'active',
    updatedAt: '2026-04-20 09:00',
  },
  {
    id: '${routeName}-002',
    name: '${titleLabel} Beta',
    owner: 'Delivery Team',
    status: 'draft',
    updatedAt: '2026-04-19 16:30',
  },
])

const columns = computed<ProTableColumn<${routeName}Row>[]>(() => [
  {
    id: 'name',
    title: 'Name',
    field: 'name',
    minWidth: '220px',
  },
  {
    id: 'owner',
    title: 'Owner',
    field: 'owner',
    minWidth: '180px',
  },
  {
    id: 'status',
    title: 'Status',
    field: 'status',
    width: '140px',
  },
  {
    id: 'updatedAt',
    title: 'Updated At',
    field: 'updatedAt',
    minWidth: '180px',
  },
])

export function ${hookName}(): ${routeName}PageState {
  const title = '${titleLabel}'
  const description = '${description}'

  return {
    title,
    description,
    stateKey: '${stateKey}',
    columns,
    rows,
  }
}
`
}

function toKebabCase(value) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[_\s]+/g, '-')
    .toLowerCase()
}

function escapeTemplateLiteral(value) {
  return value.replace(/`/g, '\\`')
}
