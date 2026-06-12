export interface ConsoleStatusItem {
  label: string
  value: string
  severity: 'success' | 'info' | 'warn' | 'danger' | 'secondary'
}

export interface ConsoleStat {
  label: string
  value: string
  detail: string
  icon: string
}

export interface ConsoleCapability {
  title: string
  description: string
  icon: string
  status: string
  bullets: string[]
}

export interface ConsoleEvidence {
  label: string
  value: string
  detail: string
}

export interface ConsoleCommand {
  command: string
  description: string
}

export interface ConsoleSection {
  title: string
  description: string
  items: ConsoleEvidence[]
}

export interface ConsolePageModel {
  id: string
  eyebrow: string
  title: string
  description: string
  status: ConsoleStatusItem[]
  stats: ConsoleStat[]
  capabilities: ConsoleCapability[]
  evidence: ConsoleEvidence[]
  commands: ConsoleCommand[]
  sections: ConsoleSection[]
}

const baseStatus: ConsoleStatusItem[] = [
  { label: 'Topology', value: 'contracts -> core -> apps', severity: 'success' },
  { label: 'Runtime', value: 'App-owned adapters', severity: 'info' },
  { label: 'P4', value: 'Guarded', severity: 'warn' },
]

const packageStats: ConsoleStat[] = [
  {
    label: 'Public packages',
    value: '10',
    detail: '@ccd package exports remain governed',
    icon: 'i-lucide-package-check',
  },
  {
    label: 'Apps',
    value: '2',
    detail: 'web-demo and desktop own runtime adapters',
    icon: 'i-lucide-panels-top-left',
  },
  {
    label: 'Validation gate',
    value: '1',
    detail: 'governance:gate is the architecture gate',
    icon: 'i-lucide-shield-check',
  },
]

export const consolePages: Record<string, ConsolePageModel> = {
  ArchitectureTopology: {
    id: 'ArchitectureTopology',
    eyebrow: 'Architecture',
    title: 'Monorepo Topology',
    description:
      'The active CCD topology is a deterministic pnpm and Turbo workspace with contracts and core kept runtime-neutral.',
    status: baseStatus,
    stats: packageStats,
    capabilities: [
      {
        title: '@ccd/contracts',
        description: 'Interfaces, DTOs, and cross-runtime contracts only.',
        icon: 'i-lucide-file-type',
        status: 'Runtime-neutral',
        bullets: ['No Vue', 'No browser APIs', 'No storage or network runtime'],
      },
      {
        title: '@ccd/core',
        description: 'Runtime-neutral orchestration over injected adapter contracts.',
        icon: 'i-lucide-cpu',
        status: 'Depends only on contracts',
        bullets: ['No UI', 'No HTTP runtime', 'No safeStorage runtime'],
      },
      {
        title: 'apps/*',
        description:
          'Applications own routes, views, stores, adapters, and concrete runtime integration.',
        icon: 'i-lucide-app-window',
        status: 'Runtime owner',
        bullets: ['web-demo owns browser runtime', 'desktop owns Tauri runtime'],
      },
    ],
    evidence: [
      {
        label: 'Package direction',
        value: 'packages/contracts -> packages/core -> apps/*',
        detail: 'Documented in wiki and enforced by dependency-cruiser plus boundary scripts.',
      },
      {
        label: 'Source of truth',
        value: 'wiki/** and .ai/**',
        detail: 'README remains a thin portal into the maintained wiki.',
      },
    ],
    commands: [
      { command: 'pnpm arch:boundaries', description: 'Validate workspace dependency direction.' },
      {
        command: 'pnpm governance:gate',
        description: 'Run the single architecture governance gate.',
      },
    ],
    sections: [],
  },
  ArchitecturePackageBoundaries: {
    id: 'ArchitecturePackageBoundaries',
    eyebrow: 'Architecture',
    title: 'Package Boundaries',
    description:
      'Each package has a public posture and a forbidden promotion rule; app runtime is not promoted into shared packages.',
    status: baseStatus,
    stats: packageStats,
    capabilities: [
      {
        title: 'UI primitives',
        description:
          '@ccd/vue-ui owns reusable primitives such as ProForm, ProTable, Icons, CScrollbar, and dialog primitives.',
        icon: 'i-lucide-component',
        status: 'Public package',
        bullets: ['Public API via package exports', 'No app query behavior'],
      },
      {
        title: 'PrimeVue adapter',
        description:
          '@ccd/vue-primevue-adapter owns PrimeVue theme, PT presets, and service facades.',
        icon: 'i-lucide-plug',
        status: 'Adapter package',
        bullets: ['PrimeVue remains approved', 'No Reka UI migration in this lane'],
      },
      {
        title: 'App-local candidates',
        description:
          'web-demo shared candidates stay app-local until a separate extraction lane proves ownership and rollback.',
        icon: 'i-lucide-map',
        status: 'Not extracted',
        bullets: ['HTTP runtime stays app-owned', 'safeStorage runtime stays app-owned'],
      },
    ],
    evidence: [
      {
        label: 'Matrix',
        value: 'wiki/canonical/architecture/package-responsibility-matrix.md',
        detail: 'Owner boundary and forbidden moves are documented there.',
      },
      {
        label: 'Candidate ledger',
        value: 'wiki/canonical/architecture/app-local-shared-candidates.md',
        detail:
          'App-local candidates are evidence for future lanes, not current extraction approval.',
      },
    ],
    commands: [
      { command: 'pnpm api:report', description: 'Check public package export surface drift.' },
      { command: 'pnpm arch:boundaries', description: 'Reject cross-layer or deep-import drift.' },
    ],
    sections: [],
  },
  ArchitectureRuntimeBoundaries: {
    id: 'ArchitectureRuntimeBoundaries',
    eyebrow: 'Architecture',
    title: 'Runtime Boundaries',
    description:
      'Runtime APIs belong in app adapters or exact approved app-owned infrastructure, never in contracts or core.',
    status: baseStatus,
    stats: [
      ...packageStats,
      {
        label: 'Runtime scans',
        value: 'strict',
        detail: 'contracts and core reject browser, Node, Tauri, timers, and network runtime',
        icon: 'i-lucide-radar',
      },
    ],
    capabilities: [
      {
        title: 'Browser app boundary',
        description:
          'apps/web-demo owns browser entry, routes, stores, views, plugins, HTTP, and safeStorage.',
        icon: 'i-lucide-globe-2',
        status: 'Web runtime',
        bullets: ['alova stays app-owned', 'safeStorage facade stays app-owned'],
      },
      {
        title: 'Desktop adapter boundary',
        description: 'apps/desktop owns Tauri adapters and src-tauri backend boundary.',
        icon: 'i-lucide-monitor',
        status: 'Read-only here',
        bullets: ['No invoke in packages', 'No desktop refactor in this lane'],
      },
    ],
    evidence: [
      {
        label: 'Policy',
        value: '.ai/governance/policies/runtime.json',
        detail: 'Machine-readable runtime surfaces, classifications, and allowances.',
      },
    ],
    commands: [
      { command: 'pnpm arch:runtime', description: 'Run runtime leak detection.' },
      { command: 'pnpm codex:preflight', description: 'Check AI/governance adapter preflight.' },
    ],
    sections: [],
  },
  ArchitectureGovernance: {
    id: 'ArchitectureGovernance',
    eyebrow: 'Architecture',
    title: 'Governance And Route Metadata',
    description:
      'Route metadata, RBAC, wiki validation, and AI guardrails make the web-demo surface explainable and testable.',
    status: [
      { label: 'Route metadata', value: 'titleKey required', severity: 'success' },
      { label: 'i18n', value: 'en-US + zh-CN', severity: 'info' },
      { label: 'Ledger', value: 'P4 visible', severity: 'warn' },
    ],
    stats: [
      {
        label: 'Target routes',
        value: '23',
        detail: 'Business route records after retiring the 99-record example museum',
        icon: 'i-lucide-route',
      },
      {
        label: 'Legacy example',
        value: '0',
        detail: 'No canonical legacy example menu entries after migration',
        icon: 'i-lucide-archive-x',
      },
      {
        label: 'Route tests',
        value: 'intentional',
        detail: 'New spec asserts route signatures and locale coverage',
        icon: 'i-lucide-list-checks',
      },
    ],
    capabilities: [
      {
        title: 'RBAC metadata',
        description:
          'Route roles and auths stay declarative in route metadata and v-auth owns element control.',
        icon: 'i-lucide-badge-check',
        status: 'Centralized',
        bullets: ['No manual route add/remove', 'No store-owned navigation'],
      },
      {
        title: 'Wiki as source portal',
        description:
          'Architecture updates land under wiki/canonical and generated evidence updates are refreshed.',
        icon: 'i-lucide-book-open',
        status: 'Maintained',
        bullets: ['README stays thin', 'No docs tree revival'],
      },
    ],
    evidence: [
      {
        label: 'Validation',
        value: 'wiki:refresh -> wiki:validate -> wiki:commands',
        detail: 'Documentation command references remain script-backed.',
      },
      {
        label: 'P4 guardrails',
        value: 'Strategic only',
        detail:
          'No Reka UI, TanStack Query, design-system repository, starter, or HTTP/core promotion.',
      },
    ],
    commands: [
      {
        command: 'pnpm wiki:commands',
        description: 'Validate wiki command references against package scripts.',
      },
      {
        command: 'pnpm ai:doctor --open',
        description: 'Keep P4 guardrails visible while actionable work closes.',
      },
    ],
    sections: [],
  },
  RuntimeHttp: {
    id: 'RuntimeHttp',
    eyebrow: 'Runtime',
    title: 'HTTP And Alova Runtime',
    description:
      'web-demo owns the concrete alova runtime, interceptors, refresh coordination, policies, and useHttpRequest consumption path.',
    status: baseStatus,
    stats: [
      {
        label: 'Runtime owner',
        value: 'apps/web-demo',
        detail: 'HTTP runtime is not promoted to core or shared-utils',
        icon: 'i-lucide-webhook',
      },
      {
        label: 'Client',
        value: 'alova',
        detail: 'Axios, raw fetch, and XMLHttpRequest remain forbidden in business code',
        icon: 'i-lucide-network',
      },
    ],
    capabilities: [
      {
        title: 'API builders',
        description: 'API modules expose typed method builders and keep stores out of API files.',
        icon: 'i-lucide-file-code',
        status: 'Typed',
        bullets: ['DTO triple pattern', 'No default API exports'],
      },
      {
        title: 'Request hooks',
        description:
          'Views consume methods through useHttpRequest so global loading, retry, and normalized errors remain consistent.',
        icon: 'i-lucide-refresh-cw',
        status: 'Hook-owned',
        bullets: ['No duplicate 401 handling', 'No duplicate global toasts'],
      },
    ],
    evidence: [
      {
        label: 'Runtime path',
        value: 'apps/web-demo/src/utils/http/**',
        detail: 'Concrete alova runtime, policies, validation, and upload manager live here.',
      },
      {
        label: 'Guardrail',
        value: 'P4-HttpCore-Blocked',
        detail: 'HTTP runtime promotion is explicitly blocked without a future approved lane.',
      },
    ],
    commands: [{ command: 'pnpm arch:runtime', description: 'Catch forbidden runtime leakage.' }],
    sections: [],
  },
  RuntimeSafeStorage: {
    id: 'RuntimeSafeStorage',
    eyebrow: 'Runtime',
    title: 'safeStorage Runtime',
    description:
      'safeStorage encryption, compression, serializer, migration, maintenance, and facade code remain app-owned.',
    status: baseStatus,
    stats: [
      {
        label: 'Runtime owner',
        value: 'apps/web-demo',
        detail: 'Concrete storage behavior stays in the browser app',
        icon: 'i-lucide-lock-keyhole',
      },
      {
        label: 'Shared-utils',
        value: 'blocked',
        detail: 'No crypto/compression/runtime facade promotion',
        icon: 'i-lucide-ban',
      },
    ],
    capabilities: [
      {
        title: 'Pinia persistence',
        description:
          'Sensitive and preference stores use encrypted serializers where policy requires them.',
        icon: 'i-lucide-database-zap',
        status: 'Encrypted',
        bullets: ['User store', 'Permission store', 'Layout and size preferences'],
      },
      {
        title: 'First-paint exceptions',
        description:
          'Theme and locale plaintext exceptions are narrow bootstrap allowances, not general storage permission.',
        icon: 'i-lucide-sun-medium',
        status: 'Scoped',
        bullets: ['theme-mode', 'locale', 'Vite preload reload flag'],
      },
    ],
    evidence: [
      {
        label: 'Runtime path',
        value: 'apps/web-demo/src/utils/safeStorage/**',
        detail: 'Crypto, lzstring, facade, serializer, and maintenance code remain here.',
      },
      {
        label: 'Guardrail',
        value: 'P4-SafeStorageShared-Blocked',
        detail: 'Concrete safeStorage promotion is blocked without a future approved lane.',
      },
    ],
    commands: [
      { command: 'pnpm ai:guard', description: 'Reject raw storage access in business code.' },
    ],
    sections: [],
  },
  RuntimeBrowser: {
    id: 'RuntimeBrowser',
    eyebrow: 'Runtime',
    title: 'Browser Runtime Integration',
    description:
      'Device, locale, theme, size, date, and visual-E2E readiness are app runtime concerns wired through plugins, stores, and hooks.',
    status: baseStatus,
    stats: [
      {
        label: 'Device runtime',
        value: 'singleton',
        detail: 'Viewport and breakpoint state are initialized once',
        icon: 'i-lucide-smartphone',
      },
      {
        label: 'Layout runtime',
        value: 'SSOT',
        detail: 'Renderers consume finalized runtime state',
        icon: 'i-lucide-layout-panel-top',
      },
    ],
    capabilities: [
      {
        title: 'Theme and size',
        description:
          'Token variables, first-paint preload, and adaptive sizing are coordinated by app runtime.',
        icon: 'i-lucide-palette',
        status: 'Token-first',
        bullets: ['No raw theme colors', 'No ad hoc layout media queries'],
      },
      {
        title: 'Visual readiness',
        description: 'E2E visual mode relies on deterministic runtime signals instead of sleeps.',
        icon: 'i-lucide-camera',
        status: 'Deterministic',
        bullets: ['Native preloader readiness', 'Runtime loading idle', 'Theme switch stability'],
      },
    ],
    evidence: [
      {
        label: 'Runtime constants',
        value: 'apps/web-demo/src/constants/runtime.ts',
        detail: 'Visual E2E mode keys and readiness events are centralized.',
      },
    ],
    commands: [
      {
        command: 'pnpm e2e:visual',
        description: 'Validate first-paint and visual token regressions.',
      },
    ],
    sections: [],
  },
  RuntimeState: {
    id: 'RuntimeState',
    eyebrow: 'Runtime',
    title: 'State Ownership And Utilities',
    description:
      'Stores own persistent system state while component-local state remains local; utility demos are now summarized by ownership, not split by helper.',
    status: baseStatus,
    stats: [
      {
        label: 'Store owners',
        value: 'single',
        detail: 'Each piece of state has one owner store',
        icon: 'i-lucide-database',
      },
      {
        label: 'Utilities',
        value: 'merged',
        detail: 'Lodash, IDs, strings, and casters become evidence rows',
        icon: 'i-lucide-wrench',
      },
    ],
    capabilities: [
      {
        title: 'Store matrix',
        description:
          'User, permission, layout, theme, size, locale, device, and table drawer stores have documented owners.',
        icon: 'i-lucide-table-properties',
        status: 'Bounded',
        bullets: ['No API calls in stores', 'No router pushes from stores'],
      },
      {
        title: 'Utility policy',
        description:
          'Business casts go through typeCasters and deep operations go through governed helpers.',
        icon: 'i-lucide-shapes',
        status: 'Auditable',
        bullets: ['No business any', 'No inline generic utility functions'],
      },
    ],
    evidence: [
      {
        label: 'State boundary',
        value: 'src/api -> hooks -> stores -> views',
        detail: 'The immutable data-flow law remains the operating model.',
      },
    ],
    commands: [
      {
        command: 'pnpm ai:guard',
        description: 'Run architecture guard checks over business surfaces.',
      },
    ],
    sections: [],
  },
  UiPrimeVueAdapter: {
    id: 'UiPrimeVueAdapter',
    eyebrow: 'UI',
    title: 'PrimeVue Adapter',
    description:
      'PrimeVue v4 remains the approved ecosystem, with global PT presets and CCD wrappers used instead of raw scattered styling.',
    status: baseStatus,
    stats: [
      {
        label: 'UI ecosystem',
        value: 'PrimeVue',
        detail: 'No Reka UI replacement in this lane',
        icon: 'i-lucide-component',
      },
      {
        label: 'Styling',
        value: 'PT-first',
        detail: 'Semantic token classes and global presets own visual state',
        icon: 'i-lucide-paintbrush',
      },
    ],
    capabilities: [
      {
        title: 'Adapter package',
        description:
          '@ccd/vue-primevue-adapter owns theme preset, PT presets, and service facades.',
        icon: 'i-lucide-plug',
        status: 'Package-owned',
        bullets: ['Button PT', 'Form controls PT', 'Menu PT'],
      },
      {
        title: 'App registration',
        description:
          'web-demo plugin bootstrap registers PrimeVue, ProForm, ProTable, toast, dialog, and scrollbar integration.',
        icon: 'i-lucide-cable',
        status: 'App-wired',
        bullets: ['No package deep imports', 'No raw Toast in business views'],
      },
    ],
    evidence: [
      {
        label: 'Adapter package',
        value: 'packages/vue-primevue-adapter/**',
        detail: 'Reusable PrimeVue integration belongs in the package.',
      },
      {
        label: 'App plugin',
        value: 'apps/web-demo/src/plugins/modules/primevue.ts',
        detail: 'Application bootstrap remains app-owned.',
      },
    ],
    commands: [
      {
        command: 'pnpm lint:check',
        description: 'Catch component and import contract violations.',
      },
    ],
    sections: [],
  },
  UiProForm: {
    id: 'UiProForm',
    eyebrow: 'UI',
    title: 'ProForm Capability',
    description:
      'The old nine-route ProForm museum is consolidated into one page that shows schema, validation, and reactions as architecture capabilities.',
    status: baseStatus,
    stats: [
      {
        label: 'Legacy routes',
        value: '9 -> 1',
        detail: 'Basic, grouping, validation, DAG, reactions, plugins, and events are merged',
        icon: 'i-lucide-form-input',
      },
      {
        label: 'Engine',
        value: 'Schema',
        detail: 'Form behavior remains declarative and typed',
        icon: 'i-lucide-workflow',
      },
    ],
    capabilities: [
      {
        title: 'Schema-driven form',
        description:
          'Fields, dependencies, options, and validation live in schema instead of scattered template logic.',
        icon: 'i-lucide-list-tree',
        status: 'Demonstrated below',
        bullets: ['Input', 'Select', 'Switch', 'Textarea'],
      },
    ],
    evidence: [
      {
        label: 'Package',
        value: 'packages/vue-ui/src/ProForm/**',
        detail: 'Reusable engine and PrimeVue renderers remain package-owned.',
      },
    ],
    commands: [
      {
        command: 'pnpm --filter @ccd/web-demo type-check',
        description: 'Check app SFC and schema typing.',
      },
    ],
    sections: [],
  },
  UiProTable: {
    id: 'UiProTable',
    eyebrow: 'UI',
    title: 'ProTable Capability',
    description:
      'The old table route spread is consolidated into one page that demonstrates typed columns, row data, toolbar, and pagination posture.',
    status: baseStatus,
    stats: [
      {
        label: 'Legacy routes',
        value: '8 -> 1',
        detail: 'Basic, server, virtual, infinite, columns, and events are merged',
        icon: 'i-lucide-table',
      },
      {
        label: 'Boundary',
        value: 'Headless engine',
        detail: 'Business HTTP still enters through app request adapters',
        icon: 'i-lucide-brackets',
      },
    ],
    capabilities: [
      {
        title: 'Typed columns',
        description:
          'Column definitions, value enums, row keys, and pagination stay in typed ProTable inputs.',
        icon: 'i-lucide-columns-3',
        status: 'Demonstrated below',
        bullets: ['No raw DataTable in business page', 'No native table markup'],
      },
    ],
    evidence: [
      {
        label: 'Package',
        value: 'packages/vue-ui/src/ProTable/**',
        detail: 'Reusable table engine remains package-owned; app query behavior stays app-owned.',
      },
    ],
    commands: [
      { command: 'pnpm test:run', description: 'Run package builds plus Vitest coverage.' },
    ],
    sections: [],
  },
  UiCharts: {
    id: 'UiCharts',
    eyebrow: 'UI',
    title: 'Chart Runtime',
    description:
      'Chart demos now focus on the CCD chart runtime: UseEcharts, useChartTheme, responsive paint recovery, and tokenized themes.',
    status: baseStatus,
    stats: [
      {
        label: 'Chart wrapper',
        value: 'UseEcharts',
        detail: 'Views do not initialize ECharts directly',
        icon: 'i-lucide-chart-no-axes-combined',
      },
      {
        label: 'Theme',
        value: 'Reactive',
        detail: 'Chart options receive token-aware theme merging',
        icon: 'i-lucide-swatch-book',
      },
    ],
    capabilities: [
      {
        title: 'Rendering guard',
        description:
          'The shared wrapper owns DOM-size gating, visibility recovery, and KeepAlive repaint behavior.',
        icon: 'i-lucide-scan-eye',
        status: 'Demonstrated below',
        bullets: ['No raw echarts.init', 'No hardcoded chart colors'],
      },
    ],
    evidence: [
      {
        label: 'Package',
        value: 'packages/vue-charts/**',
        detail: 'Shared chart runtime and useChartTheme helpers live in the chart package.',
      },
    ],
    commands: [
      {
        command: 'pnpm e2e:visual',
        description: 'Validate visual token and chart stability paths.',
      },
    ],
    sections: [],
  },
  UiFeedback: {
    id: 'UiFeedback',
    eyebrow: 'UI',
    title: 'Feedback And Empty States',
    description:
      'Dialog, toast, empty state, icons, and CScrollbar examples are merged into a small capability page instead of separate museum stops.',
    status: baseStatus,
    stats: [
      {
        label: 'Feedback',
        value: 'Central',
        detail: 'Toast and dialog behavior route through CCD abstractions',
        icon: 'i-lucide-message-circle',
      },
      {
        label: 'Empty states',
        value: 'Reusable',
        detail: 'EmptyState stays in @ccd/vue-ui',
        icon: 'i-lucide-circle-dashed',
      },
    ],
    capabilities: [
      {
        title: 'UX primitives',
        description:
          'Icons, EmptyState, PrimeDialog, Toast, and CScrollbar stay reusable and token-aware.',
        icon: 'i-lucide-sparkles',
        status: 'Merged',
        bullets: ['No raw alert or confirm', 'No broad overflow-auto containers'],
      },
    ],
    evidence: [
      {
        label: 'Package',
        value: 'packages/vue-ui/**',
        detail: 'Reusable primitives stay package-owned while page composition stays app-local.',
      },
    ],
    commands: [
      { command: 'pnpm lint:check', description: 'Validate business view component contracts.' },
    ],
    sections: [],
  },
  SystemTheme: {
    id: 'SystemTheme',
    eyebrow: 'System',
    title: 'Theme System',
    description:
      'Theme controls are represented as architecture evidence over token families, PrimeVue preset mapping, and first-paint behavior.',
    status: baseStatus,
    stats: [
      {
        label: 'Tokens',
        value: 'semantic',
        detail: 'Canvas, text, brand, status, and sidebar token families',
        icon: 'i-lucide-palette',
      },
      {
        label: 'Contrast',
        value: 'validated',
        detail: 'validate:tokens owns semantic contrast thresholds',
        icon: 'i-lucide-contrast',
      },
    ],
    capabilities: [
      {
        title: 'Token-first UI',
        description:
          'Templates use semantic UnoCSS classes and CSS variables instead of raw colors.',
        icon: 'i-lucide-paintbrush-2',
        status: 'Active',
        bullets: ['No raw hex', 'No Tailwind palette classes'],
      },
    ],
    evidence: [
      {
        label: 'Design tokens',
        value: 'packages/design-tokens/**',
        detail: 'Shared token source and pure derivation live in the package.',
      },
    ],
    commands: [
      { command: 'pnpm validate:tokens', description: 'Validate semantic token contrast.' },
    ],
    sections: [],
  },
  SystemSizeBreakpoints: {
    id: 'SystemSizeBreakpoints',
    eyebrow: 'System',
    title: 'Size And Breakpoints',
    description:
      'The size and breakpoint system owns density presets, pixel-ratio-aware sizing, and responsive layout variables.',
    status: baseStatus,
    stats: [
      {
        label: 'Density',
        value: '3 modes',
        detail: 'compact, comfortable, and loose',
        icon: 'i-lucide-maximize',
      },
      {
        label: 'Breakpoints',
        value: 'runtime',
        detail: 'Device store feeds layout runtime and size engine',
        icon: 'i-lucide-monitor-smartphone',
      },
    ],
    capabilities: [
      {
        title: 'Adaptive sizing',
        description:
          'Root font size and layout dimensions resolve from device, breakpoint, preset, and pixel ratio.',
        icon: 'i-lucide-ruler',
        status: 'Centralized',
        bullets: ['No local media-query shell logic', 'No ad hoc rem/em sizing'],
      },
    ],
    evidence: [
      {
        label: 'Runtime',
        value: 'apps/web-demo/src/utils/theme/sizeEngine.ts',
        detail: 'App-owned first-paint and runtime size application remain in web-demo.',
      },
    ],
    commands: [{ command: 'pnpm check', description: 'Run fast workspace validation.' }],
    sections: [],
  },
  SystemLayout: {
    id: 'SystemLayout',
    eyebrow: 'System',
    title: 'Layout Runtime',
    description:
      'LayoutAdmin remains the shell owner for header, sidebar, breadcrumbs, tabs, footer, drawer, context menu, loading, and refresh behavior.',
    status: baseStatus,
    stats: [
      {
        label: 'Runtime SSOT',
        value: 'layoutRuntime',
        detail: 'Renderers consume finalized state',
        icon: 'i-lucide-layout-dashboard',
      },
      {
        label: 'Shell',
        value: 'preserved',
        detail: 'No layout runtime rewrite in this lane',
        icon: 'i-lucide-panel-top',
      },
    ],
    capabilities: [
      {
        title: 'Admin shell',
        description:
          'The architecture console uses existing shell behavior rather than introducing a new app frame.',
        icon: 'i-lucide-panels-top-left',
        status: 'Compatible',
        bullets: ['Fixed dashboard tab', 'Sidebar menu generation', 'Route keepAlive support'],
      },
    ],
    evidence: [
      {
        label: 'Runtime path',
        value: 'apps/web-demo/src/layouts/runtime/layoutRuntime.ts',
        detail: 'Finalized responsive shell state remains centralized.',
      },
    ],
    commands: [{ command: 'pnpm e2e:layout', description: 'Validate layout geometry behavior.' }],
    sections: [],
  },
  SystemUnocss: {
    id: 'SystemUnocss',
    eyebrow: 'System',
    title: 'UnoCSS And Design Engine',
    description:
      'UnoCSS is used as a closed semantic shortcut registry with token-backed classes and guardrails against invented utilities.',
    status: baseStatus,
    stats: [
      {
        label: 'Shortcuts',
        value: 'closed',
        detail: 'semanticShortcuts.ts is the audited registry',
        icon: 'i-lucide-list-check',
      },
      {
        label: 'Raw styles',
        value: 'guarded',
        detail: 'No raw hex, rem/em sizing, or raw z-index values',
        icon: 'i-lucide-shield',
      },
    ],
    capabilities: [
      {
        title: 'Semantic composition',
        description:
          'Page shells prefer existing shortcuts and move repeated geometry into local app components.',
        icon: 'i-lucide-blocks',
        status: 'Token-first',
        bullets: ['No internal glass primitive direct use', 'No dynamic class strings'],
      },
    ],
    evidence: [
      {
        label: 'Preset',
        value: 'packages/unocss-preset/src/shortcuts/semanticShortcuts.ts',
        detail: 'Shortcut registry remains package-owned and closed.',
      },
    ],
    commands: [
      { command: 'pnpm ci:smoke:unocss-tokens', description: 'Validate token class generation.' },
    ],
    sections: [],
  },
  DesktopBoundary: {
    id: 'DesktopBoundary',
    eyebrow: 'Desktop',
    title: 'Desktop Boundary Mirror',
    description:
      'This page is a read-only mirror of the Tauri boundary: desktop adapters and src-tauri remain untouched in the web-demo UI lane.',
    status: [
      { label: 'Desktop code', value: 'untouched', severity: 'success' },
      { label: 'Tauri APIs', value: 'adapter-only', severity: 'info' },
      { label: 'P4 backend', value: 'deferred', severity: 'warn' },
    ],
    stats: [
      {
        label: 'Adapter path',
        value: 'apps/desktop',
        detail: 'Desktop runtime capabilities are owned by the desktop app',
        icon: 'i-lucide-monitor',
      },
      {
        label: 'Updater/deep-link',
        value: 'blocked',
        detail: 'Disabled until a desktop trust model is approved',
        icon: 'i-lucide-lock',
      },
    ],
    capabilities: [
      {
        title: 'Tauri v2 boundary',
        description:
          'Tauri imports and invoke calls stay inside desktop adapters and Rust backend boundaries.',
        icon: 'i-lucide-terminal',
        status: 'Read-only',
        bullets: ['No desktop refactor', 'No capability mutation'],
      },
      {
        title: 'Strategic guardrails',
        description:
          'Rust command handlers, structured Rust errors, updater, and deep-link runtime remain future lanes.',
        icon: 'i-lucide-signpost',
        status: 'P4 deferred',
        bullets: ['Owner approval required', 'Security model required'],
      },
    ],
    evidence: [
      {
        label: 'Wiki',
        value: 'wiki/canonical/application-boundaries/desktop-role.md',
        detail: 'Desktop role and security baseline stay documented in the wiki.',
      },
    ],
    commands: [
      {
        command: 'pnpm sync:desktop-config',
        description: 'Only needed when desktop config changes.',
      },
      { command: 'pnpm check:drift', description: 'Only needed when desktop invariants change.' },
    ],
    sections: [],
  },
}

export function getConsolePage(routeName: unknown): ConsolePageModel {
  if (typeof routeName === 'string' && routeName in consolePages) {
    return consolePages[routeName]
  }
  return consolePages.ArchitectureTopology
}
