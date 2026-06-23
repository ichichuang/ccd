interface ConsoleLocaleTree {
  [key: string]: string | ConsoleLocaleTree
}

const showcasePageTitles = {
  overview: 'Overview',
  'components-root': 'Components',
  'components-primevue-adapter': 'PrimeVue Adapter',
  'components-empty-state': 'Empty State',
  'components-icons': 'Icons',
  'components-c-scrollbar': 'CScrollbar',
  'components-pro-table-overview': 'ProTable Overview',
  'components-pro-table-basic': 'Basic Table',
  'components-pro-table-columns': 'Columns',
  'components-pro-table-sorting-filtering': 'Sorting and Filtering',
  'components-pro-table-pagination': 'Pagination',
  'components-pro-table-server-request': 'Server Request',
  'components-pro-table-states': 'Table States',
  'components-pro-table-selection': 'Selection',
  'components-pro-table-toolbar-density': 'Toolbar and Density',
  'components-pro-table-virtual-infinite': 'Virtual and Infinite',
  'components-pro-table-export-refresh': 'Export and Refresh',
  'components-pro-table-cell-rendering': 'Cell Rendering',
  'components-pro-table-form-composition': 'Form Composition',
  'components-pro-table-api-events': 'API and Events',
  'components-pro-form-overview': 'ProForm Overview',
  'components-pro-form-basic-schema': 'Basic Schema',
  'components-pro-form-grouped-layout': 'Grouped Layout',
  'components-pro-form-validation': 'Validation',
  'components-pro-form-dependencies-computed': 'Dependencies and Computed',
  'components-pro-form-conditional-visibility': 'Conditional Visibility',
  'components-pro-form-reactions': 'Reactions',
  'components-pro-form-async-data': 'Async Data',
  'components-pro-form-field-arrays': 'Field Arrays',
  'components-pro-form-plugins-draft': 'Plugins and Draft',
  'components-pro-form-submit-states': 'Submit States',
  'components-pro-form-api-events': 'API and Events',
  'components-charts-overview': 'Charts Overview',
  'components-charts-theme': 'Chart Theme',
  'components-charts-responsive': 'Responsive Charts',
  'components-charts-states': 'Chart States',
  'components-charts-events': 'Chart Events',
  'components-charts-dashboard-preview': 'Dashboard Preview',
  'feedback-dialog-toast': 'Dialog and Toast',
  'hooks-overview': 'Hooks Overview',
  'hooks-theme-switching': 'Theme Switching',
  'hooks-locale-switching': 'Locale Switching',
  'hooks-http-flow': 'HTTP Flow',
  'hooks-auth-permission': 'Auth and Permission',
  'hooks-layout-runtime': 'Layout Runtime',
  'hooks-responsive-device': 'Responsive Device',
  'utils-overview': 'Utils Overview',
  'utils-date': 'Date Utilities',
  'utils-safe-storage': 'safeStorage',
  'utils-state-persistence': 'State Persistence',
  'runtime-overview': 'Runtime Overview',
  'runtime-http': 'HTTP Runtime',
  'runtime-browser': 'Browser Runtime',
  'runtime-layout': 'Layout Runtime',
  'runtime-state-ownership': 'State Ownership',
  'design-tokens': 'Design Tokens',
  'design-unocss': 'UnoCSS',
  'design-material': 'Material',
  'design-density': 'Density',
  'design-motion': 'Motion',
  governance: 'Governance',
  'desktop-boundary': 'Desktop Boundary',
} as const

interface ShowcasePageLocaleOverride {
  eyebrow?: string
  description?: string
  try?: string
  source?: string
  technical?: string
}

const showcasePageLocaleOverrides: Record<string, ShowcasePageLocaleOverride> = {
  'components-pro-table-overview': {
    eyebrow: 'ProTable showcase',
    description:
      'A guided map of ProTable table behavior, typed inputs, request boundaries, and state evidence.',
    try: 'Inspect the capability map.',
    source: 'Source paths include the route module and the shared ProTable demo shell.',
    technical: 'Technical notes explain the typed column model and showcase wiring.',
  },
  'components-pro-table-basic': {
    eyebrow: 'ProTable showcase',
    description:
      'A complete baseline table with typed columns, local rows, toolbar search, pagination, and empty-state copy.',
    try: 'Try the basic table.',
    source: 'Source paths show the catalog page and shared typed table configuration.',
    technical: 'Technical notes focus on ProTable-only rendering and deterministic local data.',
  },
  'components-pro-table-columns': {
    eyebrow: 'ProTable showcase',
    description:
      'Column visibility, value enums, alignment, widths, and state reads are demonstrated without render callbacks.',
    try: 'Inspect column behavior.',
    source: 'Source paths show where page routing and shared columns are owned.',
    technical: 'Technical notes call out plain column objects and no TSX renderers.',
  },
  'components-pro-table-sorting-filtering': {
    eyebrow: 'ProTable showcase',
    description:
      'Sorting, global search, and a PrimeVue status filter show how table state stays inspectable.',
    try: 'Try sorting and filtering.',
    source: 'Source paths show the catalog page and shared deterministic rows.',
    technical: 'Technical notes describe table-state evidence and localized filter copy.',
  },
  'components-pro-table-pagination': {
    eyebrow: 'ProTable showcase',
    description:
      'Pagination controls, page-size changes, sortable metrics, and exposed state reads are shown in one route.',
    try: 'Inspect pagination.',
    source: 'Source paths show the catalog page and shared ProTable shell.',
    technical: 'Technical notes focus on ProTable pagination props and state reads.',
  },
  'components-pro-table-server-request': {
    eyebrow: 'ProTable showcase',
    description:
      'A complete local request-mode demo exercises ProTable request pagination, search, sort, reload, and fetch state.',
    try: 'Try request mode.',
    source: 'Source paths include the request adapter over deterministic local data.',
    technical: 'Technical notes explain the injected request boundary and no raw fetch.',
  },
  'components-pro-table-states': {
    eyebrow: 'ProTable showcase',
    description:
      'A complete state route demonstrates loading, empty, selection, row focus, and state/fetch inspection copy.',
    try: 'Toggle table states.',
    source: 'Source paths show the state controls and shared shell.',
    technical: 'Technical notes explain local state ownership and ProTable slots.',
  },
  'components-pro-table-selection': {
    eyebrow: 'ProTable showcase',
    description:
      'Checkbox selection, selected export, clear-selection, and state reads are collected in a preview-ready page.',
    try: 'Try row selection.',
    source: 'Source paths show the route page and shared selection behavior.',
    technical: 'Technical notes focus on exposed selection methods and local summaries.',
  },
  'components-pro-table-toolbar-density': {
    eyebrow: 'ProTable showcase',
    description:
      'Toolbar search, density control, refresh, export, and state controls are presented as one table workflow.',
    try: 'Inspect toolbar density.',
    source: 'Source paths show the toolbar route and shared table shell.',
    technical: 'Technical notes describe ProTable toolbar ownership and localized copy.',
  },
  'components-pro-table-virtual-infinite': {
    eyebrow: 'ProTable showcase',
    description:
      'Virtual rows and infinite request loading are demonstrated through supported ProTable props only.',
    try: 'Switch scroll modes.',
    source: 'Source paths show the virtual/infinite route and local request adapter.',
    technical:
      'Technical notes explain the mutual-exclusion model for virtual, infinite, and pagination.',
  },
  'components-pro-table-export-refresh': {
    eyebrow: 'ProTable showcase',
    description:
      'Refresh, page export, selected export, selection clearing, and table-state reads are available in-page.',
    try: 'Try export and refresh.',
    source: 'Source paths show the route and shared exposed-method controls.',
    technical: 'Technical notes focus on browser-triggered export and local state copy.',
  },
  'components-pro-table-cell-rendering': {
    eyebrow: 'ProTable showcase',
    description:
      'Cell presentation uses valueEnum, alignment, numeric fields, and plain data instead of custom renderers.',
    try: 'Inspect cell presentation.',
    source: 'Source paths show the route and plain column presets.',
    technical: 'Technical notes explain why no Vue h or TSX renderer is needed.',
  },
  'components-pro-table-form-composition': {
    eyebrow: 'ProTable showcase',
    description:
      'PrimeVue filter controls compose around ProTable without turning this route into a ProForm page.',
    try: 'Try composed filters.',
    source: 'Source paths show page composition and shared row data.',
    technical: 'Technical notes keep form behavior out of this ProTable-only lane.',
  },
  'components-pro-table-api-events': {
    eyebrow: 'ProTable showcase',
    description:
      'An injected apiExecutor demo records row, sort, filter, page, refresh, and request events in local state.',
    try: 'Inspect API events.',
    source: 'Source paths include the apiExecutor adapter and shared shell.',
    technical: 'Technical notes explain the app-injected API boundary.',
  },
  'components-pro-form-overview': {
    eyebrow: 'ProForm showcase',
    description:
      'A guided form capability map for request intake, pricing logic, validation feedback, and visible state summaries.',
    try: 'Explore the form capability map.',
    source: 'Source paths include the route page and shared ProForm demo shell.',
    technical: 'Technical notes explain the typed schema model and shared demo wiring.',
  },
  'components-pro-form-basic-schema': {
    eyebrow: 'ProForm showcase',
    description:
      'A complete baseline form shows how product copy, field labels, defaults, helper text, and local submit feedback fit together.',
    try: 'Try the basic schema form.',
    source: 'Source paths show the route page and shared schema factory.',
    technical: 'Technical notes focus on typed schema inputs and wrapper-only form rendering.',
  },
  'components-pro-form-grouped-layout': {
    eyebrow: 'ProForm showcase',
    description:
      'Grouped sections keep request details and planning details understandable before the form grows.',
    try: 'Inspect grouped layout.',
    source: 'Source paths show the grouped route and shared layout schema.',
    technical: 'Technical notes explain schema groups and responsive span ownership.',
  },
  'components-pro-form-validation': {
    eyebrow: 'ProForm showcase',
    description:
      'A complete validation route makes missing inputs, resolver feedback, submit status, and state reads visible in the page.',
    try: 'Try validation rules.',
    source: 'Source paths include the validation route, schema factory, and shared shell.',
    technical: 'Technical notes explain field rules, resolver output, and exposed state reads.',
  },
  'components-pro-form-dependencies-computed': {
    eyebrow: 'ProForm showcase',
    description:
      'Dependent fields compute plan pricing and monthly cost while keeping the calculation easy to inspect.',
    try: 'Change plan and seat count.',
    source: 'Source paths show the dependency and computed-field schema.',
    technical: 'Technical notes focus on declared deps and computed values.',
  },
  'components-pro-form-conditional-visibility': {
    eyebrow: 'ProForm showcase',
    description:
      'Approval and mitigation fields appear, disable, or become required only when the request actually needs them.',
    try: 'Toggle approval conditions.',
    source: 'Source paths show the conditional-logic route and shared schema.',
    technical: 'Technical notes explain visible, disabled, and required logic.',
  },
  'components-pro-form-reactions': {
    eyebrow: 'ProForm showcase',
    description:
      'A complete reaction demo updates follow-up copy as readiness and contact preference change.',
    try: 'Trigger form reactions.',
    source: 'Source paths show the reaction route and shared schema reactions.',
    technical: 'Technical notes explain declarative reaction effects and state feedback.',
  },
  'components-pro-form-async-data': {
    eyebrow: 'ProForm showcase',
    description:
      'Region changes load local assignee options asynchronously without leaving the page or depending on a remote service.',
    try: 'Switch regions.',
    source: 'Source paths show the async option loader in the schema factory.',
    technical: 'Technical notes explain local option loading and dependency updates.',
  },
  'components-pro-form-field-arrays': {
    eyebrow: 'ProForm showcase',
    description:
      'A milestone list can add, remove, and reorder items while staying part of the same form value.',
    try: 'Edit milestones.',
    source: 'Source paths include the field-array route, shared shell, and field-array controls.',
    technical: 'Technical notes explain the field-array hook and form context.',
  },
  'components-pro-form-plugins-draft': {
    eyebrow: 'ProForm showcase',
    description:
      'Draft controls show how a form can save, restore, and clear in-progress work through the approved draft layer.',
    try: 'Save and restore a draft.',
    source: 'Source paths show the draft route and plugin-ready shared shell.',
    technical: 'Technical notes explain the plugin registry and draft storage API.',
  },
  'components-pro-form-submit-states': {
    eyebrow: 'ProForm showcase',
    description:
      'Submit state is kept local so reviewers can see idle, submitting, success, and error outcomes without a network call.',
    try: 'Try submit states.',
    source: 'Source paths show local submit-state handling in the shared shell.',
    technical: 'Technical notes explain local result state and exposed submit behavior.',
  },
  'components-pro-form-api-events': {
    eyebrow: 'ProForm showcase',
    description:
      'Visible controls call form APIs and record validation, values, state, and submit events in page copy.',
    try: 'Inspect form API events.',
    source: 'Source paths show the API-events route and shared method controls.',
    technical: 'Technical notes explain exposed method reads and event logging.',
  },
}

function ensureLocaleBranch(root: ConsoleLocaleTree, key: string): ConsoleLocaleTree {
  const existing = root[key]
  if (typeof existing === 'object' && existing !== null) return existing

  const next: ConsoleLocaleTree = {}
  root[key] = next
  return next
}

function createNestedLocaleRecord(
  entries: readonly (readonly [string, string])[]
): ConsoleLocaleTree {
  const root: ConsoleLocaleTree = {}

  entries.forEach(([path, value]) => {
    const segments = path.split('.')
    let cursor = root

    segments.slice(0, -1).forEach(segment => {
      cursor = ensureLocaleBranch(cursor, segment)
    })

    const leafKey = segments.at(-1)
    if (leafKey) cursor[leafKey] = value
  })

  return root
}

function createShowcasePageLocale(): ConsoleLocaleTree {
  return Object.fromEntries(
    Object.entries(showcasePageTitles).map(([id, title]) => [
      id,
      {
        eyebrow: 'Showcase',
        title,
        description: `${title} is a catalog-backed capability page with a focused demo, product value, and source context.`,
        try: `Try the ${title} capability.`,
        source: 'Source paths show the route page and shared showcase implementation.',
        technical: 'Technical notes explain the runtime boundary and reusable page contract.',
        ...(showcasePageLocaleOverrides[id] ?? {}),
      },
    ])
  )
}

const showcaseRouterLocale = createNestedLocaleRecord([
  ['root', 'Showcase'],
  ['overview', 'Overview'],
  ['components.root', 'Components'],
  ['components.primevueAdapter', 'PrimeVue Adapter'],
  ['components.emptyState', 'Empty State'],
  ['components.icons', 'Icons'],
  ['components.cScrollbar', 'CScrollbar'],
  ['components.proTable.root', 'ProTable'],
  ['components.proTable.overview', 'ProTable Overview'],
  ['components.proTable.basic', 'Basic Table'],
  ['components.proTable.columns', 'Columns'],
  ['components.proTable.sortingFiltering', 'Sorting and Filtering'],
  ['components.proTable.pagination', 'Pagination'],
  ['components.proTable.serverRequest', 'Server Request'],
  ['components.proTable.states', 'Table States'],
  ['components.proTable.selection', 'Selection'],
  ['components.proTable.toolbarDensity', 'Toolbar and Density'],
  ['components.proTable.virtualInfinite', 'Virtual and Infinite'],
  ['components.proTable.exportRefresh', 'Export and Refresh'],
  ['components.proTable.cellRendering', 'Cell Rendering'],
  ['components.proTable.formComposition', 'Form Composition'],
  ['components.proTable.apiEvents', 'API and Events'],
  ['components.proForm.root', 'ProForm'],
  ['components.proForm.overview', 'ProForm Overview'],
  ['components.proForm.basicSchema', 'Basic Schema'],
  ['components.proForm.groupedLayout', 'Grouped Layout'],
  ['components.proForm.validation', 'Validation'],
  ['components.proForm.dependenciesComputed', 'Dependencies and Computed'],
  ['components.proForm.conditionalVisibility', 'Conditional Visibility'],
  ['components.proForm.reactions', 'Reactions'],
  ['components.proForm.asyncData', 'Async Data'],
  ['components.proForm.fieldArrays', 'Field Arrays'],
  ['components.proForm.pluginsDraft', 'Plugins and Draft'],
  ['components.proForm.submitStates', 'Submit States'],
  ['components.proForm.apiEvents', 'API and Events'],
  ['components.charts.root', 'Charts'],
  ['components.charts.overview', 'Charts Overview'],
  ['components.charts.theme', 'Chart Theme'],
  ['components.charts.responsive', 'Responsive Charts'],
  ['components.charts.states', 'Chart States'],
  ['components.charts.events', 'Chart Events'],
  ['components.charts.dashboardPreview', 'Dashboard Preview'],
  ['feedback.dialogToast', 'Dialog and Toast'],
  ['hooks.root', 'Hooks'],
  ['hooks.overview', 'Hooks Overview'],
  ['hooks.themeSwitching', 'Theme Switching'],
  ['hooks.localeSwitching', 'Locale Switching'],
  ['hooks.httpFlow', 'HTTP Flow'],
  ['hooks.authPermission', 'Auth and Permission'],
  ['hooks.layoutRuntime', 'Layout Runtime'],
  ['hooks.responsiveDevice', 'Responsive Device'],
  ['utils.root', 'Utils'],
  ['utils.overview', 'Utils Overview'],
  ['utils.date', 'Date Utilities'],
  ['utils.safeStorage', 'safeStorage'],
  ['utils.statePersistence', 'State Persistence'],
  ['runtime.root', 'Runtime'],
  ['runtime.overview', 'Runtime Overview'],
  ['runtime.http', 'HTTP Runtime'],
  ['runtime.browser', 'Browser Runtime'],
  ['runtime.layout', 'Layout Runtime'],
  ['runtime.stateOwnership', 'State Ownership'],
  ['design.root', 'Design System'],
  ['design.tokens', 'Design Tokens'],
  ['design.unocss', 'UnoCSS'],
  ['design.material', 'Material'],
  ['design.density', 'Density'],
  ['design.motion', 'Motion'],
  ['governance.root', 'Governance'],
  ['desktopBoundary.root', 'Desktop Boundary'],
])

const enUSConsole = {
  router: {
    showcase: showcaseRouterLocale,
    console: {
      architecture: {
        root: 'Product Foundation',
        topology: 'How CCD Is Organized',
        packageBoundaries: 'Reusable Package Roles',
        runtimeBoundaries: 'Where Runtime Work Lives',
        governance: 'Delivery Rules',
      },
      runtime: {
        root: 'Runtime',
        http: 'HTTP / Alova',
        safeStorage: 'safeStorage',
        browser: 'Browser Runtime',
        state: 'State Ownership',
      },
      ui: {
        root: 'UI',
        primevueAdapter: 'PrimeVue Adapter',
        proForm: 'ProForm',
        proTable: 'ProTable',
        charts: 'Charts',
        feedback: 'Feedback',
      },
      system: {
        root: 'System',
        theme: 'Theme',
        sizeBreakpoints: 'Size & Breakpoints',
        layout: 'Layout Runtime',
        unocss: 'UnoCSS',
        globalSettings: 'Global Settings',
      },
      desktop: {
        root: 'Desktop Boundary',
      },
    },
  },
  showcase: {
    pages: createShowcasePageLocale(),
    groups: {
      overview: {
        title: 'Start here',
        description: 'The public entry point for the showcase map and design intent.',
      },
      components: {
        title: 'Components',
        description: 'Reusable UI primitives and adapter-backed component capabilities.',
      },
      tables: {
        title: 'Tables',
        description: 'ProTable workflows for data reading, state, and request boundaries.',
      },
      forms: {
        title: 'Forms',
        description: 'ProForm schema flows for validation, dependencies, and submission states.',
      },
      charts: {
        title: 'Charts',
        description: 'Theme-aware chart demos built on the approved chart adapter.',
      },
      feedback: {
        title: 'Feedback',
        description: 'Dialog, toast, empty-state, and user feedback patterns.',
      },
      hooks: {
        title: 'Hooks',
        description: 'Composable runtime behavior exposed through governed hooks.',
      },
      utils: {
        title: 'Utilities',
        description: 'Shared app utilities with safe formatting and persistence boundaries.',
      },
      runtime: {
        title: 'Runtime',
        description: 'HTTP, browser, layout, and state ownership boundaries.',
      },
      design: {
        title: 'Design system',
        description: 'Tokens, material, density, motion, and UnoCSS governance.',
      },
      governance: {
        title: 'Delivery confidence',
        description:
          'Review readiness, source context, and checks that keep shared capabilities understandable.',
      },
      desktopBoundary: {
        title: 'Desktop boundary',
        description: 'Tauri and desktop access patterns kept behind app-owned adapters.',
      },
    },
    dashboard: {
      hero: {
        eyebrow: 'CCD product system',
        title: 'Build consistent app experiences from one reusable capability set.',
        description:
          'CCD brings together UI components, runtime boundaries, design tokens, and delivery checks so teams can ship coherent web and desktop experiences without rebuilding the same foundations.',
        primaryAction: 'Start exploring',
        secondaryAction: 'Open governance story',
      },
      benefits: {
        buildingBlocks: {
          title: 'Reusable building blocks',
          description:
            'Start from proven page, component, feedback, and layout patterns instead of recreating common app surfaces.',
        },
        themes: {
          title: 'Consistent themes',
          description:
            'Design tokens, density, material, and icon rules keep the product recognizable across light, dark, desktop, and mobile views.',
        },
        dataWorkflows: {
          title: 'Reliable data workflows',
          description:
            'Table experiences stay predictable with loading, empty, pagination, toolbar, and row-state behavior already shaped.',
        },
        guidedInput: {
          title: 'Smart input flows',
          description:
            'Schema-driven form patterns make validation, dependent fields, and submit states easier to reason about.',
        },
        responsiveUx: {
          title: 'Responsive multilingual UX',
          description:
            'Navigation, layout, and copy are designed for multiple screen sizes and language contexts from the start.',
        },
        runtimeSafety: {
          title: 'Runtime boundaries',
          description:
            'Browser, HTTP, persistence, and desktop access stay behind clear app-owned adapters instead of leaking into shared logic.',
        },
      },
      capabilities: {
        eyebrow: 'Explore the catalog',
        title: 'Choose the capability you want to inspect.',
        description:
          'Open focused demos for tables, forms, charts, design, runtime behavior, and delivery confidence.',
        catalogTag: 'Focused routes',
        dataTables: {
          eyebrow: 'Data',
          title: 'Explore data tables',
          description:
            'See the compact table foundation for readable rows, clear states, and predictable data actions.',
          preview: 'Open table capability',
        },
        smartForms: {
          eyebrow: 'Input',
          title: 'Try smart forms',
          description:
            'Review validation-focused form behavior without embedding a large form demo on the homepage.',
          preview: 'Open form capability',
        },
        charts: {
          eyebrow: 'Insight',
          title: 'View chart-ready dashboards',
          description:
            'Inspect theme-aware chart presentation through the dedicated showcase route, not a heavy homepage chart.',
          preview: 'Open chart capability',
        },
        designSystem: {
          eyebrow: 'Design',
          title: 'Browse the design system',
          description:
            'Trace tokens, materials, density, and motion rules that keep CCD interfaces consistent.',
          preview: 'Open design tokens',
        },
        runtime: {
          eyebrow: 'Runtime',
          title: 'See runtime features',
          description:
            'Understand how app experiences keep browser and desktop capabilities cleanly separated.',
          preview: 'Open runtime overview',
        },
        delivery: {
          eyebrow: 'Delivery',
          title: 'Open the governance story',
          description:
            'See how CCD keeps reusable capabilities understandable, reviewable, and ready to ship.',
          preview: 'Open delivery story',
        },
      },
      preview: {
        table: {
          title: 'Tables are linked, not embedded',
          description:
            'The homepage shows a small visual cue and sends detailed table behavior to the showcase.',
        },
        form: {
          title: 'Forms stay lightweight here',
          description:
            'Validation and field behavior live on their dedicated pages so this route stays fast and public.',
        },
        chart: {
          title: 'Charts are previewed safely',
          description:
            'Chart exploration is available one click away without loading a large canvas into the landing page.',
        },
      },
      story: {
        eyebrow: 'How CCD helps',
        title: 'A product system for teams that need consistency and speed.',
        description:
          'CCD is not a single demo. It is a reusable foundation for building app surfaces that look, behave, and ship as one product.',
        align: {
          title: 'Align the experience',
          description:
            'Shared language and reusable UI patterns reduce drift between dashboards, settings, data pages, and desktop surfaces.',
        },
        adapt: {
          title: 'Adapt per runtime',
          description:
            'Apps can keep platform-specific work in the right place while shared capabilities stay portable.',
        },
        ship: {
          title: 'Ship with confidence',
          description:
            'Catalog routes, bilingual copy, layout checks, and source metadata make each capability easier to review.',
        },
      },
    },
    shell: {
      heroActions: 'Showcase actions',
      source: {
        title: 'Source',
        description: 'Files behind this demo for developers who want the implementation trail.',
        empty: 'No source path is registered for this catalog item.',
      },
      related: {
        title: 'Related pages',
        description: 'Nearby showcase routes from the same catalog group.',
      },
      technical: {
        title: 'Technical notes',
      },
      demoLevels: {
        complete: 'Complete',
        preview: 'Preview',
      },
      kinds: {
        overview: 'Overview',
        table: 'Table',
        form: 'Form',
        chart: 'Chart',
        demo: 'Demo',
        technical: 'Technical',
      },
    },
    placeholder: {
      description: 'This route is ready for its dedicated showcase page.',
      sources: 'Planned sources',
      what: {
        title: 'What this is',
      },
      why: {
        title: 'Why it matters',
        description: 'This route is part of the public showcase catalog.',
      },
      try: {
        title: 'What to try',
      },
      source: {
        title: 'Where the source lives',
      },
      demo: {
        title: 'Preview shell',
        description: 'The dedicated demo is not implemented yet, but the route is loadable.',
        stateTitle: 'Fallback is active',
        stateDescription:
          'This page keeps navigation, catalog metadata, related links, and source references available.',
      },
      catalog: {
        title: 'More in this group',
        description: 'Use the catalog cards to move through nearby showcase pages.',
      },
    },
    remaining: {
      tags: {
        value: 'Value',
        explanation: 'Why',
        technical: 'Technical',
      },
      demos: {
        'catalog-overview': {
          description:
            'Browse the core capability routes that carry the product demo, design system, runtime, and delivery story.',
        },
        'catalog-components': {
          description:
            'Scan component, table, form, chart, and feedback routes from one group entry before opening a focused demo.',
        },
        'catalog-single-group': {
          description:
            'Review nearby routes in this capability group and jump to the focused implementation that matches your task.',
        },
        'component-primevue-adapter': {
          description:
            'Adjust severity, size, and disabled state to see PrimeVue controls stay aligned with the app theme.',
        },
        'component-empty-state': {
          description:
            'Trigger the EmptyState action and confirm that empty outcomes still explain the next useful step.',
        },
        'component-icons': {
          description:
            'Switch between approved icon names and compare how icons support recognition without replacing copy.',
        },
        'component-c-scrollbar': {
          description:
            'Inspect a fixed-height CScrollbar region with stable rows, local scrolling, and token-aware affordances.',
        },
        'feedback-dialog-toast': {
          description:
            'Open a dialog, message, toast, empty state, icon header, and scrollable event log from one feedback surface.',
        },
        'chart-overview': {
          description:
            'Use the shared chart wrapper with data-only options to compare adoption and confidence signals.',
        },
        'chart-theme': {
          description:
            'Inspect a themed chart that follows the active token palette without hardcoded series colors.',
        },
        'chart-responsive': {
          description:
            'Toggle compact width and confirm the chart remains readable as the container changes.',
        },
        'chart-states': {
          description:
            'Toggle loading state while preserving chart layout, labels, and surrounding product copy.',
        },
        'chart-events': {
          description:
            'Watch ready and finished counters update from wrapper events without direct chart runtime access.',
        },
        'chart-dashboard-preview': {
          description:
            'Preview dashboard readiness as a compact chart rather than embedding a heavy dashboard page.',
        },
        'hook-theme-switching': {
          description:
            'Toggle theme runtime state and verify the page keeps local content stable during the change.',
        },
        'hook-locale-switching': {
          description:
            'Switch locale from the demo control and confirm visible state reads update in place.',
        },
        'hook-http-flow': {
          description:
            'Read the request-flow boundary as product-facing state without making a remote call from the view.',
        },
        'hook-auth-permission': {
          description:
            'Inspect permission state as a read-only page signal for gated UI decisions.',
        },
        'hook-layout-runtime': {
          description:
            'Review layout mode and breakpoint signals that drive the app shell at runtime.',
        },
        'hook-responsive-device': {
          description:
            'Compare responsive device signals used by layouts, charts, and capability pages.',
        },
        'utils-date': {
          description:
            'Inspect date formatting, smart labels, and working-day checks through the approved date utility.',
        },
        'utils-safe-storage': {
          description:
            'Preview encoded preference data and restored values through the safe storage codec path.',
        },
        'utils-state-persistence': {
          description:
            'Compare persistence codec output with restored state fields used by app preferences.',
        },
        'runtime-overview': {
          description:
            'Review browser, request, layout, and state ownership boundaries without invoking platform APIs.',
        },
        'runtime-http': {
          description:
            'Inspect the app-owned request boundary as a product capability rather than a transport detail.',
        },
        'runtime-browser': {
          description:
            'Confirm browser-specific behavior stays in the web app and remains separate from desktop capability.',
        },
        'runtime-layout': {
          description:
            'Review how finalized layout signals are consumed by shell renderers and feature pages.',
        },
        'runtime-state-ownership': {
          description:
            'Inspect which state belongs to stores, pages, and runtime adapters before adding new behavior.',
        },
        'runtime-governance': {
          description:
            'Review delivery discipline as visible product evidence: ownership, source context, and review readiness.',
        },
        'runtime-desktop-boundary': {
          description:
            'Read the desktop boundary as a web-only mirror with no direct desktop API usage in this page.',
        },
        'design-tokens': {
          description:
            'Inspect semantic token families and how status surfaces stay readable across themes.',
        },
        'design-unocss': {
          description:
            'Review semantic utility usage as a closed visual language for page composition.',
        },
        'design-material': {
          description:
            'Compare solid, elevated, and panel materials so layering supports the content hierarchy.',
        },
        'design-density': {
          description:
            'Read density as a product rhythm for compact, comfortable, and spacious workflows.',
        },
        'design-motion': {
          description:
            'Review motion as state feedback, with restrained transitions and reduced-motion awareness.',
        },
      },
      cards: {
        adapterOwnership: {
          title: 'Adapter ownership',
          description:
            'Runtime-specific behavior stays behind app-owned adapters and page-level injection.',
        },
        authPermission: {
          title: 'Permission signal',
          description:
            'Permission state is visible as a UI signal without coupling the page to navigation logic.',
        },
        browserRuntime: {
          title: 'Browser runtime',
          description:
            'Browser-only capabilities remain readable while platform-specific work stays separate.',
        },
        catalogMap: {
          title: 'Catalog map',
          description:
            'Routes, titles, source paths, and related pages all come from the showcase catalog.',
        },
        chartEvents: {
          title: 'Chart events',
          description:
            'Wrapper events are surfaced as page feedback without reaching into chart internals.',
        },
        chartStates: {
          title: 'Chart states',
          description:
            'Loading and empty-style states are shown next to the chart instead of hidden in code.',
        },
        chartWrapper: {
          title: 'Chart wrapper',
          description:
            'Charts render through the shared wrapper with data-only options and theme merging.',
        },
        componentAdapter: {
          title: 'Component adapter',
          description: 'PrimeVue controls stay behind the app styling and service conventions.',
        },
        dashboardPreview: {
          title: 'Dashboard preview',
          description:
            'Dashboard signals are summarized without loading a full dashboard experience.',
        },
        dateFormatting: {
          title: 'Date formatting',
          description:
            'Date copy flows through the date utility so locale and timezone behavior stays consistent.',
        },
        deliveryDiscipline: {
          title: 'Delivery discipline',
          description:
            'Each route carries visible value, source context, and review-oriented notes.',
        },
        densityScale: {
          title: 'Density scale',
          description:
            'Density choices keep scan rhythm explicit for compact and comfortable workflows.',
        },
        desktopBoundary: {
          title: 'Desktop boundary',
          description:
            'Desktop behavior is presented as read-only context with no direct platform calls.',
        },
        deviceSignals: {
          title: 'Device signals',
          description: 'Responsive state is read as a runtime signal, not guessed inside the view.',
        },
        dialogFacade: {
          title: 'Dialog facade',
          description:
            'Dialogs open through the shared feedback path so overlay behavior stays consistent.',
        },
        emptyStateReady: {
          title: 'Empty-state ready',
          description: 'Empty states include action copy and visible recovery paths.',
        },
        feedbackLoop: {
          title: 'Feedback loop',
          description:
            'Interactions write visible page feedback so reviewers can see what changed.',
        },
        hookScenario: {
          title: 'Hook scenario',
          description:
            'Hook output is presented through product state instead of developer-only traces.',
        },
        httpBoundary: {
          title: 'Request boundary',
          description:
            'Request capability is described through app behavior, not raw transport calls.',
        },
        iconLanguage: {
          title: 'Icon language',
          description: 'Icons support recognition while text remains the source of meaning.',
        },
        layoutRuntime: {
          title: 'Layout runtime',
          description: 'Layout state is finalized before page components consume it.',
        },
        layoutSignals: {
          title: 'Layout signals',
          description: 'Breakpoint, density, and shell mode readouts stay visible for review.',
        },
        localeRuntime: {
          title: 'Locale runtime',
          description: 'Locale switching updates copy and supporting date behavior together.',
        },
        materialRules: {
          title: 'Material rules',
          description: 'Materials explain hierarchy without turning dense content into decoration.',
        },
        motionRules: {
          title: 'Motion rules',
          description: 'Motion is reserved for state feedback and avoids layout shift.',
        },
        noRawRuntime: {
          title: 'No raw runtime calls',
          description: 'Views avoid direct platform, network, and persistence primitives.',
        },
        plainCopy: {
          title: 'Plain copy',
          description: 'Page text explains the user value before source details appear.',
        },
        primeControls: {
          title: 'PrimeVue controls',
          description: 'Interactive controls use the approved PrimeVue component surface.',
        },
        productEntry: {
          title: 'Product entry',
          description: 'The first screen introduces what to try and why the capability matters.',
        },
        reducedMotion: {
          title: 'Reduced motion',
          description: 'Motion remains restrained and can be removed without losing meaning.',
        },
        resizeAware: {
          title: 'Resize aware',
          description:
            'Charts and layouts respond to container size changes through shared runtime support.',
        },
        safePersistence: {
          title: 'Safe persistence',
          description:
            'Preference data is encoded and restored through the approved persistence path.',
        },
        scrollRegion: {
          title: 'Local scroll region',
          description: 'Scrollable demos use CScrollbar in fixed-height regions.',
        },
        semanticShortcuts: {
          title: 'Semantic shortcuts',
          description:
            'Visual structure is built from semantic utility classes, not one-off styling.',
        },
        sourceTrace: {
          title: 'Source trace',
          description: 'Source links are placed last so product behavior stays first.',
        },
        stateOwnership: {
          title: 'State ownership',
          description: 'Store, page, and adapter responsibilities remain separate and visible.',
        },
        stateRestore: {
          title: 'State restore',
          description:
            'Restored values are shown as readable state rather than hidden persistence output.',
        },
        themeAware: {
          title: 'Theme aware',
          description: 'Controls and demos follow the active theme without local color overrides.',
        },
        themeRuntime: {
          title: 'Theme runtime',
          description:
            'Theme mode is a runtime signal that updates UI without remounting the page.',
        },
        tokenFamilies: {
          title: 'Token families',
          description: 'Canvas, text, brand, and status roles stay semantic across surfaces.',
        },
        toastMessage: {
          title: 'Toast message',
          description:
            'Toast feedback is routed through the app facade with clear title and detail copy.',
        },
      },
      controls: {
        primary: 'Primary',
        success: 'Success',
        warn: 'Warning',
        small: 'Small',
        normal: 'Normal',
        large: 'Large',
        sparkles: 'Sparkles',
        layout: 'Layout',
        storage: 'Storage',
        shield: 'Shield',
        severity: 'Severity',
        size: 'Size',
        disabled: 'Disabled',
        adapterAction: 'Adapter action',
        adapterTag: 'Adapter tag',
        icon: 'Icon',
      },
      component: {
        emptyTitle: 'Nothing needs attention',
        emptyDescription:
          'The empty state keeps the recovery action visible without adding extra page chrome.',
        emptyAction: 'Record action',
        emptyActionMessage: 'Empty-state action recorded.',
        emptyCount: 'Recorded actions: {count}',
        scrollTitle: 'Fixed-height scroll region',
        scrollDescription: 'Rows stay inside a local CScrollbar so the page layout remains stable.',
        scrollItem: 'Scrollable row {index}',
      },
      chart: {
        controlsTitle: 'Chart controls',
        controlsDescription:
          'Wrapper-owned controls stay beside the chart without reaching into ECharts internals.',
        readinessTitle: 'Readiness and options',
        readinessDescription:
          'Chart state, route context, and option ownership remain visible next to the demo.',
        optionTitle: 'Option summary',
        optionDescription:
          'The route supplies data-only chart options and lets the adapter merge theme runtime.',
        optionRoute: 'Route',
        optionSource: 'Option source',
        wrapperStateTitle: 'Wrapper state',
        wrapperStateDescription:
          'Ready, finished, and loading signals are page feedback from the approved wrapper.',
        eventsEmptyTitle: 'Waiting for chart events',
        eventsEmptyDescription:
          'The wrapper will replace this empty state once ready or finished events arrive.',
        evidenceTitle: 'Source and wrapper evidence',
        evidenceDescription:
          'Long paths wrap inside copyable evidence panels so source ownership stays inspectable.',
        wrapperEvidenceTitle: 'Wrapper evidence',
        wrapperEvidenceDescription:
          'The chart adapter and option helper are the approved boundary for this showcase family.',
        regionLabel: '{title} chart region',
        wrapperDriven: 'Wrapper driven',
        readyCount: 'Ready {count}',
        finishedCount: 'Finished {count}',
        compactWidth: 'Compact width',
        loading: 'Loading',
        kind: {
          overview: 'Overview',
          theme: 'Theme',
          responsive: 'Responsive',
          states: 'States',
          events: 'Events',
          'dashboard-preview': 'Dashboard preview',
        },
        overview: {
          note: 'The overview chart compares adoption and confidence from data-only series.',
        },
        theme: {
          note: 'Theme mode changes are handled by the chart wrapper and token runtime.',
        },
        responsive: {
          note: 'Compact mode changes the container while the wrapper preserves rendering.',
        },
        states: {
          note: 'Loading state is controlled by the wrapper so the chart surface stays stable.',
        },
        events: {
          note: 'Ready and finished events are recorded as local page feedback.',
        },
        'dashboard-preview': {
          note: 'The radar preview summarizes dashboard readiness without loading a full dashboard.',
        },
      },
      feedback: {
        stageTitle: 'Feedback demo stage',
        stageDescription:
          'Dialog, message, toast, and empty-state feedback share one governed local surface.',
        actionsTitle: 'Feedback actions',
        actionsDescription:
          'Trigger dialog, message, toast, and empty-state feedback from one action group.',
        toolbarTitle: 'Feedback type controls',
        toolbarDescription: 'Run each feedback channel without leaving the showcase route.',
        stageCardTitle: 'Overlay and feedback channels',
        stageCardDescription:
          'The stage keeps dialog, message, and toast contracts visible before events are recorded.',
        openDialog: 'Open dialog',
        showMessage: 'Show message',
        showToast: 'Show toast',
        dialogTitle: 'Feedback dialog',
        dialogMessage: 'The dialog opened through the shared feedback path.',
        messageTitle: 'Message sent',
        messageBody: 'The message facade produced local feedback.',
        toastTitle: 'Toast sent',
        toastBody: 'The toast facade produced local feedback.',
        emptyTitle: 'Feedback starts empty',
        emptyDescription: 'Use the controls to add dialog, message, toast, and empty-state events.',
        emptyAction: 'Add empty-state event',
        emptyActionTitle: 'Empty-state action',
        emptyActionBody: 'The empty-state action wrote feedback to the log.',
        logTitle: 'Feedback event log',
        logDescription:
          'Newest events appear first while the log keeps long feedback text readable.',
        noLogsTitle: 'No feedback yet',
        noLogsDescription: 'Trigger a control to populate this scrollable log.',
        dialogOpened: 'Dialog opened',
        messageShown: 'Message shown',
        toastShown: 'Toast shown',
        emptyActionLogged: 'Empty-state action recorded',
        contractTitle: 'Local feedback contract',
        contractDescription:
          'The page records reviewable feedback events while app-owned facades keep overlay behavior centralized.',
        dialogContractTitle: 'Dialog bridge',
        dialogContractDescription:
          'Dialog actions call the shared bridge and append a local event after opening.',
        messageContractTitle: 'Message facade',
        messageContractDescription: 'Message feedback stays routed through the app-owned adapter.',
        toastContractTitle: 'Toast facade',
        toastContractDescription:
          'Toast feedback uses the same adapter with the fixed top-right demo position.',
      },
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
        toolbarDescription:
          'Run the local showcase action when this hook exposes one; read-only hooks keep their runtime state visible.',
        readOnlyTitle: 'Read-only runtime signal',
        readOnlyDescription:
          'This route demonstrates current hook state without mutating global runtime modules.',
        intentDescription:
          'The demo keeps the hook contract visible as product-facing state instead of a developer-only trace.',
        stateTitle: 'State and result',
        stateDescription:
          'Shared runtime values stay readable while theme, locale, layout, device, and permission state update.',
        contractTitle: 'Hook contract',
        contractDescription:
          'Hooks stay as app-owned runtime access points while showcase pages only consume their public API.',
        contractRuntimeTitle: 'Runtime ownership',
        contractRuntimeDescription:
          'Theme, locale, auth, and layout state remain owned by their existing stores and runtime helpers.',
        contractStateTitle: 'Composable API',
        contractStateDescription:
          'The page reads the same composable return values used by production surfaces.',
        contractEvidenceTitle: 'Source evidence',
        contractEvidenceDescription:
          'Source paths below remain selectable and wrap long hook implementation paths.',
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
          description: 'Theme changes update runtime state while the page keeps its local content.',
        },
        'locale-switching': {
          title: 'Locale switching state',
          description: 'Locale changes update visible copy and dependent formatting in one flow.',
        },
        'http-flow': {
          title: 'Request-flow boundary',
          description:
            'Request state is modeled as app capability and not as direct view transport.',
        },
        'auth-permission': {
          title: 'Permission readout',
          description: 'Permission checks are consumed as UI state for gated behavior.',
        },
        'layout-runtime': {
          title: 'Layout runtime readout',
          description: 'Effective mode and breakpoint come from the layout runtime.',
        },
        'responsive-device': {
          title: 'Responsive device readout',
          description: 'Device state helps pages and charts adapt without local guesses.',
        },
      },
      utils: {
        toolbarTitle: 'Utility preview controls',
        toolbarDescription:
          'Re-run deterministic samples while keeping utility contracts and source boundaries unchanged.',
        runSample: 'Run sample',
        resetSample: 'Reset sample',
        runCount: 'Preview runs',
        lastAction: 'Last action',
        sampleTitle: 'Sample input',
        sampleDescription:
          'Read the exact payload or policy that feeds the utility preview before comparing output.',
        outputTitle: 'Utility output',
        outputDescription:
          'Result values are produced by the existing app utility path and stay readable across layouts.',
        outputEmptyTitle: 'No utility output',
        outputEmptyDescription: 'The current utility sample has no result rows to display.',
        runtimeTitle: 'Locale and timezone runtime',
        runtimeDescription:
          'Date utilities expose initialization, locale, and timezone state through the approved hook.',
        contractTitle: 'Utility contract',
        contractDescription:
          'Showcase pages consume utility APIs without rewriting implementations or route records.',
        contractUtilityTitle: 'Utility API',
        contractUtilityDescription:
          'Formatting, encoding, and restoration behavior comes from the existing utility modules.',
        contractRuntimeTitle: 'App-owned boundary',
        contractRuntimeDescription:
          'Storage and date runtime behavior stays in the web app utility layer, not packages or routes.',
        contractEvidenceTitle: 'Source evidence',
        contractEvidenceDescription:
          'Source paths remain selectable and wrap instead of hiding the utility ownership trail.',
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
          description:
            'Compare date, safe storage, and state persistence helpers as one governed utility family.',
          note: 'Utility routes group deterministic helpers by user-facing responsibility.',
          samplePrimaryLabel: 'Utility scope',
          samplePrimaryValue: 'date + safeStorage + persistence',
          sampleSecondaryLabel: 'Route family',
          sampleSecondaryValue: '/showcase/utils/*',
          sampleTertiaryLabel: 'Ownership',
          sampleTertiaryValue: 'app utility modules only',
        },
        date: {
          description:
            'Format a fixed timestamp through DateUtils while exposing locale and timezone runtime state.',
          note: 'Date helpers format visible copy through one shared date policy.',
          samplePrimaryLabel: 'Input timestamp',
          samplePrimaryValue: '2026-06-18T09:30:00+08:00',
          sampleSecondaryLabel: 'Format policy',
          sampleSecondaryValue: 'YYYY-MM-DD HH:mm + smart system format',
          sampleTertiaryLabel: 'Calendar check',
          sampleTertiaryValue: 'working-day evaluation',
        },
        'safe-storage': {
          description:
            'Encode and restore a preference payload through the safe storage compression and encryption path.',
          note: 'Safe storage previews show encoded and restored preference state.',
          samplePrimaryLabel: 'Payload scope',
          samplePrimaryValue: 'showcase',
          sampleSecondaryLabel: 'Payload mode',
          sampleSecondaryValue: 'comfortable',
          sampleTertiaryLabel: 'Payload theme',
          sampleTertiaryValue: 'system',
        },
        'state-persistence': {
          description:
            'Exercise the sync codec used by persistence serializers and read restored preference fields.',
          note: 'State persistence uses the same codec path shown in the restored values.',
          samplePrimaryLabel: 'Codec path',
          samplePrimaryValue: 'safeStorageCodecs.sync',
          sampleSecondaryLabel: 'Restored fields',
          sampleSecondaryValue: 'theme + scope',
          sampleTertiaryLabel: 'Persistence role',
          sampleTertiaryValue: 'preference-state serializer evidence',
        },
      },
      runtime: {
        http: {
          title: 'Request runtime',
          description: 'Requests enter through app-owned adapters and reusable hooks.',
          focusTitle: 'Request runtime focus',
          focusDescription: 'Keep request behavior injectable and visible at the app boundary.',
        },
        browser: {
          title: 'Browser runtime',
          description: 'Browser capability stays in the web app runtime and supporting adapters.',
          focusTitle: 'Browser runtime focus',
          focusDescription: 'Keep browser-only work separate from desktop capability.',
        },
        layout: {
          title: 'Layout runtime',
          description: 'Layout mode, breakpoint, and density are finalized before rendering.',
          focusTitle: 'Layout runtime focus',
          focusDescription: 'Page components consume layout state without owning the shell.',
        },
        stateOwnership: {
          title: 'State ownership',
          description: 'Persistent state has clear store owners; page state stays local.',
        },
        overview: {
          focusTitle: 'Runtime overview focus',
          focusDescription: 'Review the boundary map before adding a new runtime capability.',
        },
        'state-ownership': {
          focusTitle: 'State ownership focus',
          focusDescription: 'Choose store, page, or adapter ownership before wiring behavior.',
        },
        governance: {
          focusTitle: 'Delivery focus',
          focusDescription: 'Capability pages carry source context and review-ready product copy.',
        },
        'desktop-boundary': {
          focusTitle: 'Desktop boundary focus',
          focusDescription:
            'This web page mirrors desktop ownership without importing desktop APIs.',
        },
      },
      design: {
        rows: {
          primary: {
            title: 'Primary',
            description: 'Brand emphasis for selected actions and important states.',
          },
          success: {
            title: 'Success',
            description: 'Positive completion state with readable contrast.',
          },
          warn: {
            title: 'Warning',
            description: 'Attention state for recoverable risk.',
          },
          info: {
            title: 'Info',
            description: 'Neutral guidance for secondary product context.',
          },
          solid: {
            title: 'Solid',
            description: 'Stable surface for dense reading and repeated content.',
          },
          elevated: {
            title: 'Elevated',
            description: 'Foreground surface for focused demos and grouped controls.',
          },
          panel: {
            title: 'Panel',
            description: 'Overlay-style material used only where layering explains context.',
          },
        },
        semantic: {
          title: 'Semantic composition',
          description: 'Pages use semantic classes so theme changes keep the same meaning.',
        },
        density: {
          title: 'Density rhythm',
          description: 'Spacing and control sizes support scanning without crowding content.',
        },
        motion: {
          title: 'Motion restraint',
          description: 'Motion explains state change and remains safe to reduce.',
        },
      },
    },
    proTable: {
      badges: {
        proTableOnly: 'ProTable only',
      },
      intent: {
        title: 'Demo intent',
        description:
          'Each route keeps the table behavior under review first, then exposes the surrounding state, source, and package evidence.',
      },
      table: {
        title: 'Table workspace',
        description:
          'Controls, ProTable toolbar actions, and the live table stay in one scan-friendly work area.',
        regionLabel: '{title} table demo',
      },
      stateArea: {
        title: 'Interaction evidence',
        description:
          'Method calls, fetch state, row focus, selection, and event feedback remain visible outside the table chrome.',
      },
      capabilities: {
        title: 'Capability notes',
        description:
          'These notes keep the route intent, preserved behavior, and implementation boundaries close to the demo.',
      },
      source: {
        title: 'Source and package evidence',
        description:
          'Route, shell, data, column, and package API paths are rendered as selectable wrapping text.',
      },
      evidence: {
        apiTitle: 'ProTable package API',
        apiDescription:
          'The showcase consumes the existing ProTable component, props, toolbar, request, and exposed-method contracts without package edits.',
      },
      modes: {
        overview: {
          label: 'Overview',
          demo: 'A compact capability map shows how the ProTable demos share typed rows, columns, source links, and exposed API controls.',
          tableTitle: 'ProTable capability map',
        },
        basic: {
          label: 'Basic',
          demo: 'A baseline ProTable route with local data, toolbar search, pagination, empty state, and source-backed copy.',
          tableTitle: 'Basic capability rows',
        },
        columns: {
          label: 'Columns',
          demo: 'Column controls hide and reveal the owner column while state reads show the resulting hidden-column count.',
          tableTitle: 'Column configuration',
        },
        'sorting-filtering': {
          label: 'Sorting and filtering',
          demo: 'Sort column headers, use global search, and narrow rows with a PrimeVue status filter.',
          tableTitle: 'Sortable filtered rows',
        },
        pagination: {
          label: 'Pagination',
          demo: 'Page-size changes and page navigation remain visible through the ProTable state reader.',
          tableTitle: 'Paginated metrics',
        },
        'server-request': {
          label: 'Server request',
          demo: 'Request mode uses an async local adapter over deterministic data and honors page, page size, global search, and sort.',
          tableTitle: 'Request-mode rows',
        },
        states: {
          label: 'States',
          demo: 'Toggle loading and empty states while keeping the table, empty slot, and method summaries visible.',
          tableTitle: 'State demo rows',
        },
        selection: {
          label: 'Selection',
          demo: 'Checkbox selection, clear selection, selected export, and row focus are all reflected in local page copy.',
          tableTitle: 'Selectable rows',
        },
        'toolbar-density': {
          label: 'Toolbar and density',
          demo: 'The ProTable toolbar owns search, density, refresh, fullscreen, export, and column settings in one surface.',
          tableTitle: 'Toolbar density rows',
        },
        'virtual-infinite': {
          label: 'Virtual and infinite',
          demo: 'Switch between virtual rows and infinite request loading. Pagination stays disabled for both scroll modes.',
          tableTitle: 'Scrolling rows',
        },
        'export-refresh': {
          label: 'Export and refresh',
          demo: 'Use page export, selected export, refresh, clear selection, and state reads without console output.',
          tableTitle: 'Exportable rows',
        },
        'cell-rendering': {
          label: 'Cell rendering',
          demo: 'Cell presentation uses valueEnum status chips, alignment, numeric fields, and text columns without custom renderers.',
          tableTitle: 'Cell presentation rows',
        },
        'form-composition': {
          label: 'Form composition',
          demo: 'A PrimeVue owner filter composes around ProTable while this page remains a ProTable showcase, not a ProForm route.',
          tableTitle: 'Composed filter rows',
        },
        'api-events': {
          label: 'API and events',
          demo: 'apiExecutor mode records row, sort, filter, page, refresh, and request events in local state.',
          tableTitle: 'API executor rows',
        },
      },
      columns: {
        capability: 'Capability',
        owner: 'Owner',
        status: 'Status',
        priority: 'Priority',
        records: 'Records',
        workflow: 'Recommended action',
        signal: 'User value',
      },
      status: {
        guarded: 'Guarded',
        preview: 'Preview',
        ready: 'Ready',
        request: 'Request',
      },
      owners: {
        adapter: 'App adapter',
        catalog: 'Showcase catalog',
        core: 'Runtime-neutral core',
        vueUi: 'CCD Vue UI package',
        webDemo: 'web-demo view',
      },
      filters: {
        status: 'Status filter',
        owner: 'Owner filter',
        scrollMode: 'Scroll mode',
        allStatuses: 'All statuses',
        allOwners: 'All owners',
      },
      virtualModes: {
        virtual: 'Virtual scroll',
        infinite: 'Infinite request',
      },
      controls: {
        loading: 'Loading state',
        empty: 'Empty state',
        columns: 'Column controls',
        hideOwner: 'Hide owner',
        showOwner: 'Show owner',
        reload: 'Reload',
        clearSelection: 'Clear selection',
        getState: 'Get state',
        getFetchState: 'Get fetch state',
        exportPage: 'Export page',
        exportSelected: 'Export selected',
      },
      toolbar: {
        title: 'Table actions',
        description:
          'Run table methods and inspect state feedback without leaving the data surface.',
      },
      actions: {
        ready: 'Use the controls to call ProTable exposed methods and inspect the result here.',
        reloaded:
          'reload() was called. Request-mode tables re-run the adapter; local tables emit refresh.',
        selectionCleared: 'clearSelection() was called and the local selected-row copy was reset.',
        stateRead:
          'getState() was called. The state summary below now reflects pagination, filter, sort, and columns.',
        fetchRead:
          'getFetchState() was called. The fetch summary below reflects the current request state.',
        exportedPage: 'exportData("page") was called for the current visible rows.',
        exportedSelected: 'exportData("selected") was called for {count} selected rows.',
        ownerColumnShown: 'The owner column is visible again.',
        ownerColumnHidden: 'The owner column is hidden through toggleColumnVisibility().',
      },
      state: {
        title: 'Table state',
        empty: 'State has not been read yet.',
        none: 'none',
        summary:
          'Page {page}, size {pageSize}, total {total}, sort {sort}, hidden columns {hidden}, filter {filter}.',
      },
      fetch: {
        title: 'Fetch state',
        empty: 'Fetch state has not been read yet.',
        noError: 'No request error',
        summary: 'Loading {loading}, error {error}, has more {hasMore}, message: {message}.',
      },
      booleans: {
        yes: 'yes',
        no: 'no',
      },
      selection: {
        title: 'Selection and row focus',
        summary: '{count} selected. Last focused row: {row}.',
      },
      events: {
        title: 'Event log',
        description:
          'Recent ProTable refresh, row, sort, filter, page, and request events are shown as readable local evidence.',
        emptyTitle: 'No table events yet',
        empty: 'Interact with the table to record events here.',
        manual: 'manual refresh',
        refresh: 'refresh: {detail}',
        rowClick: 'row-click: {detail}',
        sort: 'sort-change: {detail}',
        filter: 'filter-change: {detail}',
        page: 'page-change: {detail}',
        requestError: 'request-error: {detail}',
      },
      empty: {
        title: 'No ProTable rows match',
        description:
          'Clear filters or disable the empty-state toggle to restore the deterministic demo rows.',
      },
      rows: {
        none: 'No row focused',
        'typed-columns': {
          capability: 'Reusable table setup',
          workflow: 'Start with typed columns and stable row fields before adding richer behavior.',
          signal: 'Teams get a predictable table foundation that is easier to extend safely.',
        },
        'local-data': {
          capability: 'Reliable demo content',
          workflow:
            'Use stable sample rows to compare table states without changing the data story.',
          signal: 'Reviewers can inspect behavior without wondering whether the data shifted.',
        },
        toolbar: {
          capability: 'Table toolbar',
          workflow:
            'Keep search, refresh, export, density, and column settings close to the table.',
          signal: 'Users can complete common table tasks without leaving the table context.',
        },
        pagination: {
          capability: 'Page-by-page review',
          workflow: 'Offer predictable page sizes for scanning medium-sized result sets.',
          signal: 'Users stay oriented while moving through dense data.',
        },
        'server-request': {
          capability: 'Server-style loading',
          workflow:
            'Load only the current page and preserve search and sort choices across reloads.',
          signal: 'Large datasets feel responsive without exposing implementation details.',
        },
        'state-slots': {
          capability: 'Clear table states',
          workflow: 'Show loading and empty outcomes with copy that explains what changed.',
          signal: 'Users understand whether the table is waiting, empty, or ready for action.',
        },
        selection: {
          capability: 'Bulk-ready selection',
          workflow: 'Let users select rows, clear the set, and export only the items they chose.',
          signal: 'Bulk workflows remain explicit and reversible.',
        },
        density: {
          capability: 'Adjustable density',
          workflow: 'Let users choose the scan rhythm that fits the table they are reading.',
          signal:
            'Compact and comfortable reading modes stay available without changing the whole app.',
        },
        'virtual-scroll': {
          capability: 'Long-list scanning',
          workflow:
            'Use virtual scrolling when users need to scan many rows in one continuous surface.',
          signal: 'Large row counts remain practical without heavy page chrome.',
        },
        'infinite-scroll': {
          capability: 'Progressive loading',
          workflow: 'Append additional rows as users continue down the table.',
          signal: 'Users can keep momentum when the result set is exploratory.',
        },
        'export-refresh': {
          capability: 'Refresh and share',
          workflow: 'Refresh the visible data and export the current page or selected rows.',
          signal: 'Users can move table results into follow-up work without hidden steps.',
        },
        'value-enum': {
          capability: 'Readable status cells',
          workflow: 'Present status values as clear labels with consistent severity treatment.',
          signal: 'Users can identify readiness and request states at a glance.',
        },
        'form-filters': {
          capability: 'Focused filter controls',
          workflow: 'Place simple filters near the table when a full form flow would be too heavy.',
          signal: 'Users can narrow the table quickly while staying in the table view.',
        },
        'api-events': {
          capability: 'Visible interaction feedback',
          workflow: 'Show row, sort, filter, page, refresh, and request events as page feedback.',
          signal: 'Users can see that table interactions produced a real state change.',
        },
        'source-links': {
          capability: 'Source transparency',
          workflow: 'Keep nearby pages and implementation links available after the demo.',
          signal: 'Developers can move from product behavior to source context when needed.',
        },
        governance: {
          capability: 'Release readiness',
          workflow: 'Review the page in the same flow a product team uses before sharing it.',
          signal: 'The showcase stays understandable for product review and developer follow-up.',
        },
      },
      features: {
        typedRows: {
          title: 'Typed rows first',
          description:
            'Rows, columns, status values, and owner filters are typed before they reach the template.',
          tag: 'Types',
        },
        toolbar: {
          title: 'Toolbar owned by ProTable',
          description:
            'Search, refresh, density, fullscreen, export, and column settings remain inside ProTable.',
          tag: 'Toolbar',
        },
        stateEvidence: {
          title: 'State is inspectable',
          description:
            'The demo calls getState() and getFetchState() and renders the results in local page copy.',
          tag: 'State',
        },
        catalogSource: {
          title: 'Catalog-linked page',
          description:
            'Every page resolves through the existing showcase catalog source path and related-route model.',
          tag: 'Catalog',
        },
        pagination: {
          title: 'Pagination contract',
          description:
            'Page and page-size changes use ProTable pagination props and stay visible through state reads.',
          tag: 'Paging',
        },
        columns: {
          title: 'Plain column objects',
          description:
            'Column presets use field, width, alignment, sortable, and valueEnum instead of Vue render helpers.',
          tag: 'Columns',
        },
        cellValueEnum: {
          title: 'Value enum rendering',
          description:
            'Status cells render through valueEnum labels and severities while the page stays renderer-free.',
          tag: 'Cells',
        },
        filters: {
          title: 'Filter composition',
          description:
            'PrimeVue Select controls narrow local rows while ProTable global search remains available.',
          tag: 'Filters',
        },
        request: {
          title: 'Request boundary',
          description:
            'Request examples use async local adapters or apiExecutor injection, never raw fetch in the view.',
          tag: 'Request',
        },
        apiEvents: {
          title: 'Events stay visible',
          description:
            'Row, sort, filter, page, refresh, and request events are recorded in page state.',
          tag: 'Events',
        },
        states: {
          title: 'Complete states',
          description:
            'Loading and empty states are driven by local controls and the approved ProTable empty slot.',
          tag: 'States',
        },
        selection: {
          title: 'Selection methods',
          description:
            'Selection uses checkbox mode, v-model:selected, clearSelection(), and selected-row export.',
          tag: 'Selection',
        },
        exportRefresh: {
          title: 'Export and refresh',
          description:
            'Visible controls call reload() and exportData() while summaries stay on the page.',
          tag: 'Actions',
        },
        virtualInfinite: {
          title: 'Scroll modes',
          description:
            'Virtual and infinite demos use only the supported virtualScroll and infiniteScroll props.',
          tag: 'Scroll',
        },
        formComposition: {
          title: 'Composition without ProForm',
          description:
            'This page shows small PrimeVue controls around a table without implementing a ProForm route.',
          tag: 'Composition',
        },
        apiExecutor: {
          title: 'Injected API executor',
          description:
            'apiUrl mode delegates to an app-owned executor over local data so ProTable stays runtime-neutral.',
          tag: 'API',
        },
      },
      technical: {
        proTableOnly: {
          title: 'ProTable wrapper only',
          description:
            'The showcase pages use ProTable and do not reach for raw DataTable or Column in view code.',
        },
        i18nCopy: {
          title: 'Localized visible copy',
          description:
            'Page titles, controls, row labels, feature cards, and technical notes are locale-backed.',
        },
        catalogSource: {
          title: 'Catalog source paths',
          description:
            'Each route keeps its catalog source path and adds shared shell, data, and column files to source links.',
        },
        noRenderers: {
          title: 'No Vue h or TSX renderers',
          description:
            'Column presentation relies on valueEnum, alignments, and plain fields instead of custom render functions.',
        },
        stateEvidence: {
          title: 'Exposed API evidence',
          description:
            'reload, clearSelection, getState, getFetchState, and exportData are exercised from visible controls.',
        },
        apiBoundary: {
          title: 'Injected request boundary',
          description:
            'Request and apiExecutor demos operate on deterministic local data and do not use raw fetch.',
        },
      },
    },
    proForm: {
      badges: {
        proFormOnly: 'ProForm wrapper',
      },
      modes: {
        overview: {
          label: 'Overview',
          demo: 'A compact intake form shows schema fields, computed pricing, visible feedback, and source-linked follow-up in one place.',
        },
        'basic-schema': {
          label: 'Basic schema',
          demo: 'A baseline request form combines labels, helper text, defaults, field rules, and a local submit summary.',
        },
        'grouped-layout': {
          label: 'Grouped layout',
          demo: 'Request fields and planning fields are grouped so longer forms remain readable before technical details appear.',
        },
        validation: {
          label: 'Validation',
          demo: 'Submit or validate the form to see required fields, resolver messages, and state summaries update in the page.',
        },
        'dependencies-computed': {
          label: 'Dependencies and computed',
          demo: 'Change the plan or seat count to see dependent price fields compute monthly cost automatically.',
        },
        'conditional-visibility': {
          label: 'Conditional visibility',
          demo: 'Toggle approval and risk to reveal fields, mark them required, or disable follow-up inputs only when needed.',
        },
        reactions: {
          label: 'Reactions',
          demo: 'Readiness and contact preference update the follow-up field through form reactions and page event feedback.',
        },
        'async-data': {
          label: 'Async data',
          demo: 'Changing region loads local assignee options asynchronously while the form stays interactive.',
        },
        'field-arrays': {
          label: 'Field arrays',
          demo: 'Milestones can be added, removed, and reordered while remaining part of the submitted form value.',
        },
        'plugins-draft': {
          label: 'Plugins and draft',
          demo: 'Draft controls save, restore, and clear unfinished form copy through the approved draft API.',
        },
        'submit-states': {
          label: 'Submit states',
          demo: 'A local result switch lets reviewers compare idle, submitting, success, and error feedback without a network call.',
        },
        'api-events': {
          label: 'API and events',
          demo: 'Visible method controls read values, validate, submit, and record event feedback in the page.',
        },
      },
      controls: {
        validate: 'Validate',
        getValues: 'Get values',
        getFormState: 'Get form state',
        submitApi: 'Call submit',
        saveDraft: 'Save draft',
        readDraft: 'Read draft',
        clearDraft: 'Clear draft',
        submit: 'Submit request',
      },
      toolbar: {
        title: 'Form actions',
        description:
          'Validate, inspect, submit, and run draft controls from the same visible work area.',
      },
      form: {
        title: 'Schema-driven form',
        description:
          'The ProForm wrapper owns fields, layout spans, validation, conditions, reactions, and submit handling.',
      },
      feedback: {
        title: 'Local feedback',
        description:
          'State, values, submit result, and event records stay visible on the page after each action.',
      },
      actions: {
        ready:
          'Use the controls to validate, submit, and inspect the form without opening developer tools.',
        valid: 'Validation passed. The form is ready to submit.',
        invalid:
          'Validation found missing or incomplete fields. The messages are shown next to the inputs.',
        valuesRead: 'Current form values were read and summarized below.',
        stateRead: 'Form state was read and summarized below.',
        submitCalled: 'The exposed submit method was called from the page controls.',
        draftSaved: 'The current draft was saved.',
        draftLoaded: 'The saved draft was restored into the form.',
        draftCleared: 'The saved draft was cleared.',
        submitting: 'Submitting local form values: {fields}.',
        submitted: 'Submitted locally with fields: {fields}.',
        submitFailed: 'Local submit returned an error state. No remote request was made.',
      },
      submitState: {
        title: 'Submit result preview',
        shortTitle: 'Submit state',
        description:
          'Toggle the error path to compare result feedback while keeping all state local.',
        forceError: 'Use error result',
        idle: 'Idle',
        submitting: 'Submitting',
        success: 'Success',
        error: 'Error',
      },
      state: {
        title: 'Form state',
        empty: 'Form state has not been read yet.',
        valid: 'Valid',
        invalid: 'Invalid',
        summary: 'Dirty {dirty}, valid {valid}, submitting {submitting}, error fields {errors}.',
      },
      values: {
        title: 'Current values',
        empty: 'Values have not been read yet.',
        none: 'none',
        summary: 'Current populated fields: {fields}.',
      },
      draft: {
        empty: 'No draft action has run yet.',
        pluginInstalled: 'Draft plugin registered for this demo route.',
        pluginReady: 'Draft plugin is already available.',
        saved: 'Draft saved for the current form values.',
        loaded: 'Draft restored into the form.',
        cleared: 'Draft cleared.',
      },
      booleans: {
        yes: 'yes',
        no: 'no',
      },
      events: {
        title: 'Event log',
        description: 'Recent method calls and submit events appear as readable page evidence.',
        emptyTitle: 'No form events yet',
        empty: 'Interact with the form to record events here.',
        validate: 'validate: {detail}',
        values: 'getValues: {detail}',
        state: 'getFormState valid: {detail}',
        submitApi: 'submit method: {detail}',
        submit: 'submit: {detail}',
      },
      fieldArray: {
        title: 'Milestones',
        description: 'Use the list controls to manage repeated fields in the same form.',
        moveUp: 'Move milestone up',
        moveDown: 'Move milestone down',
        remove: 'Remove milestone',
        placeholder: 'Add a milestone',
        add: 'Add milestone',
      },
      groups: {
        request: 'Request details',
        planning: 'Planning details',
      },
      options: {
        owners: {
          product: 'Product',
          support: 'Support',
          operations: 'Operations',
        },
        priorities: {
          high: 'High',
          medium: 'Medium',
          low: 'Low',
        },
        regions: {
          americas: 'Americas',
          emea: 'EMEA',
          apac: 'APAC',
        },
        plans: {
          starter: 'Starter',
          growth: 'Growth',
          scale: 'Scale',
        },
        risks: {
          low: 'Low',
          medium: 'Medium',
          high: 'High',
        },
        events: {
          email: 'Email follow-up',
          review: 'Review meeting',
          call: 'Customer call',
        },
      },
      fields: {
        requestName: {
          label: 'Request name',
          description: 'Name the user-facing change clearly.',
          placeholder: 'Quarterly launch readiness',
        },
        ownerTeam: {
          label: 'Owner team',
          description: 'Choose the team that will act on this request.',
        },
        priority: {
          label: 'Priority',
          description: 'Set the review urgency.',
        },
        audience: {
          label: 'Audience',
          description: 'Describe who benefits from the change.',
          placeholder: 'Customer success managers',
        },
        summary: {
          label: 'Summary',
          description: 'Explain the desired outcome in plain language.',
          placeholder: 'Help teams prepare customer-facing release notes.',
        },
        needsApproval: {
          label: 'Needs approval',
          description: 'Show approval notes only when the work needs review.',
        },
        riskLevel: {
          label: 'Risk level',
          description: 'High risk makes the approval note required.',
        },
        approvalNote: {
          label: 'Approval note',
          description: 'Capture the reason a reviewer should approve the request.',
          placeholder: 'Explain the approval context and expected decision.',
        },
        mitigation: {
          label: 'Mitigation plan',
          description: 'Enabled only when risk is high.',
          placeholder: 'Describe what reduces the launch risk.',
        },
        plan: {
          label: 'Plan',
          description: 'Plan selection drives the calculated unit price.',
        },
        seatCount: {
          label: 'Seats',
          description: 'Seat count feeds the monthly cost.',
        },
        seatPrice: {
          label: 'Seat price',
          description: 'Computed from the selected plan.',
        },
        monthlyCost: {
          label: 'Monthly cost',
          description: 'Computed from seats and price.',
        },
        region: {
          label: 'Region',
          description: 'Region controls the local assignee list.',
        },
        assignee: {
          label: 'Assignee',
          description: 'Options load after the selected region changes.',
        },
        publishReady: {
          label: 'Ready to publish',
          description: 'When enabled, follow-up copy updates automatically.',
        },
        eventPreference: {
          label: 'Follow-up channel',
          description: 'Channel changes update the follow-up prompt.',
        },
        followUp: {
          label: 'Follow-up message',
          description: 'Reactions keep this copy aligned with the selected workflow.',
          placeholder: 'Write the next customer-facing step.',
        },
        milestones: {
          label: 'Milestones',
          description: 'Repeated fields stay attached to the same form value.',
        },
        draftTitle: {
          label: 'Draft title',
          description: 'Edit this field, save a draft, then restore it.',
          placeholder: 'Draft customer update',
        },
        draftSummary: {
          label: 'Draft summary',
          description: 'This draft content can be saved and restored locally.',
          placeholder: 'Capture the work-in-progress summary.',
        },
      },
      defaults: {
        requestName: 'Release readiness intake',
        audience: 'Customer-facing teams',
        summary: 'Prepare a clear request that is easy to validate and submit.',
        deliveryWindow: 'This quarter',
        followUp: 'Send a concise update after review.',
        readyFollowUp: 'Publish the update and notify the selected audience.',
        draftTitle: 'Customer update draft',
        draftSummary: 'This draft can be saved, restored, and cleared from the demo page.',
      },
      validation: {
        requestNameRequired: 'Request name is required.',
        audienceRequired: 'Audience is required.',
        summaryLength: 'Summary needs at least 12 characters.',
        approvalNoteRequired: 'High-risk work needs an approval note with at least 10 characters.',
        milestonesRequired: 'Each milestone needs at least 3 characters.',
      },
      reactionPlaceholders: {
        email: 'Write the email follow-up.',
        review: 'Summarize the review meeting agenda.',
        call: 'Prepare the customer call note.',
      },
      features: {
        schemaBasics: {
          title: 'Schema describes the form',
          description:
            'Fields, labels, helper text, defaults, layout spans, and rules come from typed schema data.',
          tag: 'Schema',
        },
        groupedLayout: {
          title: 'Readable grouping',
          description:
            'Related fields are grouped so users can scan the form by task instead of by implementation.',
          tag: 'Layout',
        },
        validation: {
          title: 'Validation is visible',
          description:
            'Field rules and resolver results appear beside inputs and in the page summaries.',
          tag: 'Validation',
        },
        dependenciesComputed: {
          title: 'Dependencies drive values',
          description:
            'Declared dependencies update computed fields without extra watchers in the view.',
          tag: 'Logic',
        },
        conditionalLogic: {
          title: 'Fields appear when useful',
          description: 'Visibility, disabled state, and required state respond to user choices.',
          tag: 'Conditions',
        },
        reactions: {
          title: 'Reactions update copy',
          description:
            'Declarative reactions keep downstream field values and props aligned with upstream changes.',
          tag: 'Reactions',
        },
        asyncOptions: {
          title: 'Async choices stay local',
          description: 'Option loaders demonstrate delayed data without remote requests.',
          tag: 'Options',
        },
        fieldArrays: {
          title: 'Repeated fields stay manageable',
          description:
            'Milestones can be added, removed, and reordered while remaining part of one form.',
          tag: 'Arrays',
        },
        draftPlugin: {
          title: 'Drafts preserve progress',
          description:
            'Draft controls make unfinished form copy recoverable without adding a separate page.',
          tag: 'Draft',
        },
        submitStates: {
          title: 'Result states are explicit',
          description:
            'Submitting, success, and error outcomes are visible and reversible for review.',
          tag: 'Submit',
        },
        apiEvents: {
          title: 'Form APIs are inspectable',
          description:
            'Method controls read values, state, validation, and submit outcomes into page copy.',
          tag: 'API',
        },
        localFeedback: {
          title: 'Feedback stays on the page',
          description: 'Users can see what changed without opening a console or leaving the route.',
          tag: 'Feedback',
        },
      },
      technical: {
        proFormOnly: {
          title: 'Wrapper-owned form surface',
          description:
            'Multi-field demos render through the CCD ProForm wrapper instead of raw business form controls.',
        },
        schemaContracts: {
          title: 'Typed schema contracts',
          description:
            'The shared schema factory returns FormSchema values with declared deps, computed values, and conditions.',
        },
        validationResolver: {
          title: 'Resolver contract',
          description:
            'Validation pages use a ValidationResolver so field errors and form validity share one result shape.',
        },
        exposedApis: {
          title: 'Exposed API controls',
          description:
            'submit, validate, getValues, and getFormState are exercised through visible page controls.',
        },
        localOnly: {
          title: 'No remote dependency',
          description:
            'Async options and submit states use deterministic local timing and do not call a remote service.',
        },
        fieldArrayHook: {
          title: 'Field-array context',
          description: 'The milestone controls use useFieldArray inside the form provider context.',
        },
        pluginApi: {
          title: 'Plugin registry',
          description:
            'The draft route installs a small ProFormPlugins entry to demonstrate plugin registration.',
        },
        draftStorage: {
          title: 'Draft storage API',
          description: 'Draft actions use DraftStorage through the app-configured draft adapter.',
        },
      },
    },
  },
  console: {
    shared: {
      evidence: {
        title: 'Source context',
        description: 'Repository paths and supporting facts for developers who want more detail.',
      },
      commands: {
        title: 'Optional technical checks',
        description:
          'Developer scripts are listed last so product behavior stays first and technical verification remains available.',
      },
    },
    routeEvidence: {
      title: 'Navigation details for developers',
      description:
        'Pages keep stable names, icons, and language-ready labels so navigation stays predictable.',
      modules: 'Modules',
      modulesValue: 'top-level',
      modulesDetail: 'Route modules stay under apps/web-demo/src/router/modules.',
      metadata: 'Metadata',
      metadataValue: 'titleKey + icon',
      metadataDetail: 'Route records keep deterministic navigation and tab behavior.',
      locale: 'Locale',
      localeValue: 'en-US + zh-CN',
      localeDetail: 'Visible route and console copy is covered in both locale trees.',
    },
    settingsPage: {
      eyebrow: 'System',
      title: 'Global Settings',
      description:
        'Manage theme, density, language, layout mode, layout modules, and responsive runtime preview from a full page surface.',
      runtimeTag: 'Runtime-backed',
      nav: {
        appearance: 'Appearance',
        sizeLocale: 'Size & Language',
        layoutMode: 'Layout Mode',
        layoutModules: 'Layout Modules',
        preview: 'Preview',
      },
      appearance: {
        title: 'Appearance',
        description: 'Theme mode and color presets continue to use the existing theme store.',
      },
      sizeLocale: {
        title: 'Size & Language',
      },
      layoutMode: {
        title: 'Layout Mode',
        description: 'The page writes the same preferred layout mode consumed by LayoutAdmin.',
      },
      layoutModules: {
        title: 'Layout Modules',
        description: 'Module switches reuse the existing visibility rules for each layout mode.',
      },
      preview: {
        title: 'Responsive Preview',
        description: 'Current runtime state from device, breakpoint, layout, and size stores.',
        breakpoint: 'Breakpoint',
        deviceType: 'Device',
        effectiveMode: 'Effective layout',
        sizePreset: 'Size preset',
      },
      sizeDescriptions: {
        compact: 'Compact density keeps repeat operations tight.',
        comfortable: 'Comfortable density is the default app rhythm.',
        loose: 'Loose density increases touch and scan space.',
      },
    },
    pages: {
      topology: {
        eyebrow: 'Foundation',
        title: 'How CCD Is Organized',
        description:
          'See how reusable types, shared logic, and app experiences stay in the right place as CCD grows.',
      },
      packageBoundaries: {
        eyebrow: 'Foundation',
        title: 'Reusable Package Roles',
        description:
          'Understand which capabilities are reusable packages, which stay app-local, and why that keeps changes safer.',
      },
      runtimeBoundaries: {
        eyebrow: 'Foundation',
        title: 'Where Runtime Work Lives',
        description:
          'Browser, HTTP, storage, and desktop behavior stay behind app adapters instead of leaking into shared logic.',
      },
      governance: {
        eyebrow: 'Delivery',
        title: 'Navigation And Review Rules',
        description:
          'Navigation, permissions, bilingual copy, and review checks make each browser page easier to inspect before release.',
      },
      http: {
        eyebrow: 'Runtime',
        title: 'HTTP And Alova Runtime',
        description:
          'Requests enter through one app-owned path so loading, retry, errors, and feedback behave consistently.',
      },
      safeStorage: {
        eyebrow: 'Runtime',
        title: 'safeStorage Runtime',
        description:
          'Preference storage is handled by the app so sensitive behavior stays close to the experience that uses it.',
      },
      browser: {
        eyebrow: 'Runtime',
        title: 'Browser Runtime Integration',
        description:
          'Device, language, theme, size, and date behavior are coordinated once so pages can stay focused on users.',
      },
      state: {
        eyebrow: 'Runtime',
        title: 'State Ownership And Utilities',
        description:
          'Persistent preferences, page state, and helper utilities have clear owners before new behavior is added.',
      },
      primevueAdapter: {
        eyebrow: 'UI',
        title: 'PrimeVue Adapter',
        description:
          'PrimeVue controls use shared presets and CCD wrappers so app screens feel consistent without page-level styling.',
      },
      proForm: {
        eyebrow: 'UI',
        title: 'ProForm Capability',
        description:
          'Form demos show guided input, validation, dependent fields, and feedback as reusable product patterns.',
      },
      proTable: {
        eyebrow: 'UI',
        title: 'ProTable Capability',
        description:
          'Table demos show readable rows, toolbar actions, pagination, loading, empty states, and row details.',
      },
      charts: {
        eyebrow: 'UI',
        title: 'Chart Runtime',
        description:
          'Chart demos show token-aware visuals, responsive recovery, and stable loading behavior through the CCD wrapper.',
      },
      feedback: {
        eyebrow: 'UI',
        title: 'Feedback And Empty States',
        description:
          'Dialog, toast, empty state, icons, and local scrolling appear together as user-facing feedback patterns.',
      },
      theme: {
        eyebrow: 'System',
        title: 'Theme System',
        description:
          'Theme pages explain how tokens, presets, and first paint keep the interface consistent across modes.',
      },
      sizeBreakpoints: {
        eyebrow: 'System',
        title: 'Size And Breakpoints',
        description:
          'Density and breakpoint behavior help the same product surface work across compact and spacious screens.',
      },
      layout: {
        eyebrow: 'System',
        title: 'Layout Runtime',
        description:
          'The app shell owns navigation, tabs, breadcrumbs, loading, and refresh behavior so pages stay predictable.',
      },
      unocss: {
        eyebrow: 'System',
        title: 'UnoCSS And Design Engine',
        description:
          'Semantic UnoCSS shortcuts keep page composition consistent without one-off visual rules.',
      },
      desktopBoundary: {
        eyebrow: 'Desktop',
        title: 'Desktop Boundary Mirror',
        description:
          'This web page explains where desktop capabilities belong without calling desktop APIs or changing desktop code.',
      },
    },
    status: {
      topology: { label: 'Product layers', value: 'Reusable layers' },
      runtimeAdapters: { label: 'Runtime fit', value: 'App-owned adapters' },
      deliveryChecks: { label: 'Delivery checks', value: 'On' },
      clearExploration: { label: 'Clear exploration', value: 'Ready' },
      languageReady: { label: 'Languages', value: 'English and Chinese' },
      reviewReadiness: { label: 'Review readiness', value: 'Visible' },
      desktopUntouched: { label: 'Desktop code', value: 'untouched' },
      desktopAdapter: { label: 'Desktop access', value: 'Adapter-owned' },
      desktopPlanning: { label: 'Desktop roadmap', value: 'Planned separately' },
    },
    stats: {
      publicPackages: {
        label: 'Public packages',
        detail: "{'@'}ccd package exports remain governed.",
      },
      apps: { label: 'Apps', detail: 'web-demo and desktop own runtime adapters.' },
      validationGate: {
        label: 'Review checks',
        detail: 'Dedicated checks protect shared capability boundaries.',
      },
      runtimeScans: {
        label: 'Runtime scans',
        value: 'strict',
        detail: 'contracts and core reject browser, Node, Tauri, timers, and network runtime.',
      },
      guidedExploration: {
        label: 'Guided paths',
        value: 'Clear',
        detail: 'Visitors can move from the story to focused capability demos.',
      },
      stableEntry: {
        label: 'Stable entry',
        value: 'Ready',
        detail: 'The homepage, breadcrumbs, tabs, and sidebar behavior stay predictable.',
      },
      bilingualReadiness: {
        label: 'Bilingual experience',
        value: 'Ready',
        detail: 'Public copy is available in both supported languages.',
      },
      runtimeOwner: {
        label: 'Runtime owner',
        detail: 'Concrete runtime behavior stays in the browser app.',
      },
      clientAlova: {
        label: 'Client',
        detail: 'Axios, raw fetch, and XMLHttpRequest remain forbidden in business code.',
      },
      sharedUtilsBlocked: {
        label: 'Shared helpers',
        value: 'app-local',
        detail: 'Storage and runtime helpers stay with the app until reuse is proven.',
      },
      deviceRuntime: {
        label: 'Device runtime',
        value: 'singleton',
        detail: 'Viewport and breakpoint state are initialized once.',
      },
      layoutRuntimeSsot: {
        label: 'Layout runtime',
        value: 'SSOT',
        detail: 'Renderers consume finalized runtime state.',
      },
      storeOwners: {
        label: 'Store owners',
        value: 'single',
        detail: 'Each piece of state has one owner store.',
      },
      utilitiesMerged: {
        label: 'Utilities',
        value: 'merged',
        detail: 'Lodash, IDs, strings, and casters become evidence rows.',
      },
      uiEcosystem: { label: 'UI ecosystem', detail: 'PrimeVue remains the approved control set.' },
      ptStyling: {
        label: 'Styling',
        value: 'PT-first',
        detail: 'Semantic token classes and global presets own visual state.',
      },
      proFormSchemaSurface: {
        label: 'Schema surface',
        detail:
          'Grouping, validation, dependencies, reactions, plugins, and events stay schema-driven.',
      },
      schemaEngine: {
        label: 'Engine',
        value: 'Schema',
        detail: 'Form behavior remains declarative and typed.',
      },
      proTableDataSurface: {
        label: 'Data surface',
        detail:
          'Standard, server, virtual, infinite, column, and event modes stay table-engine concerns.',
      },
      headlessBoundary: {
        label: 'Boundary',
        value: 'Headless engine',
        detail: 'Business HTTP still enters through app request adapters.',
      },
      chartWrapper: { label: 'Chart wrapper', detail: 'Views do not initialize ECharts directly.' },
      reactiveTheme: {
        label: 'Theme',
        value: 'reactive',
        detail: 'Chart options receive token-aware theme merging.',
      },
      feedbackCentral: {
        label: 'Feedback',
        value: 'central',
        detail: 'Toast and dialog behavior route through CCD abstractions.',
      },
      emptyStatesReusable: {
        label: 'Empty states',
        value: 'reusable',
        detail: "EmptyState stays in {'@'}ccd/vue-ui.",
      },
      semanticTokens: {
        label: 'Tokens',
        value: 'semantic',
        detail: 'Canvas, text, brand, status, and sidebar token families.',
      },
      contrastValidated: {
        label: 'Contrast',
        value: 'validated',
        detail: 'validate:tokens owns semantic contrast thresholds.',
      },
      densityModes: {
        label: 'Density',
        value: '3 modes',
        detail: 'compact, comfortable, and loose.',
      },
      breakpointRuntime: {
        label: 'Breakpoints',
        value: 'runtime',
        detail: 'Device store feeds layout runtime and size engine.',
      },
      runtimeSsot: {
        label: 'Runtime SSOT',
        value: 'layoutRuntime',
        detail: 'Renderers consume finalized state.',
      },
      shellPreserved: {
        label: 'Shell',
        value: 'preserved',
        detail: 'No layout runtime rewrite in this lane.',
      },
      closedShortcuts: {
        label: 'Shortcuts',
        value: 'closed',
        detail: 'semanticShortcuts.ts is the audited registry.',
      },
      rawStylesGuarded: {
        label: 'Raw styles',
        value: 'guarded',
        detail: 'No raw hex, rem/em sizing, or raw z-index values.',
      },
      desktopAdapterPath: {
        label: 'Adapter path',
        detail: 'Desktop runtime capabilities are owned by the desktop app.',
      },
      updaterDeepLink: {
        label: 'Updater/deep-link',
        value: 'deferred',
        detail: 'Deferred until a desktop trust model is approved.',
      },
    },
    capabilities: {
      contracts: {
        title: "{'@'}ccd/contracts",
        description: 'Interfaces, DTOs, and cross-runtime contracts only.',
        status: 'Runtime-neutral',
        bullets: { 0: 'No Vue', 1: 'No browser APIs', 2: 'No storage or network runtime' },
      },
      core: {
        title: "{'@'}ccd/core",
        description: 'Runtime-neutral orchestration over injected adapter contracts.',
        status: 'Depends only on contracts',
        bullets: { 0: 'No UI', 1: 'No HTTP runtime', 2: 'No safeStorage runtime' },
      },
      apps: {
        title: 'apps/*',
        description:
          'Applications own routes, views, stores, adapters, and concrete runtime integration.',
        status: 'Runtime owner',
        bullets: { 0: 'web-demo owns browser runtime', 1: 'desktop owns Tauri runtime' },
      },
      uiPrimitives: {
        title: 'UI primitives',
        description:
          "{'@'}ccd/vue-ui owns reusable primitives such as ProForm, ProTable, Icons, CScrollbar, and dialog primitives.",
        status: 'Public package',
        bullets: { 0: 'Public API via package exports', 1: 'No app query behavior' },
      },
      primevueAdapter: {
        title: 'PrimeVue adapter',
        description:
          "{'@'}ccd/vue-primevue-adapter owns PrimeVue theme, PT presets, and service facades.",
        status: 'Adapter package',
        bullets: { 0: 'PrimeVue remains approved', 1: 'Alternative UI stacks are out of scope' },
      },
      appLocalCandidates: {
        title: 'App-local candidates',
        description:
          'web-demo shared candidates stay app-local until a separate extraction lane proves ownership and rollback.',
        status: 'App-local for now',
        bullets: { 0: 'HTTP runtime stays app-owned', 1: 'safeStorage runtime stays app-owned' },
      },
      browserBoundary: {
        title: 'Browser app boundary',
        description:
          'apps/web-demo owns browser entry, routes, stores, views, plugins, HTTP, and safeStorage.',
        status: 'Web runtime',
        bullets: { 0: 'alova stays app-owned', 1: 'safeStorage facade stays app-owned' },
      },
      desktopBoundary: {
        title: 'Desktop adapter boundary',
        description: 'apps/desktop owns Tauri adapters and src-tauri backend boundary.',
        status: 'Read-only here',
        bullets: { 0: 'No invoke in packages', 1: 'No desktop refactor in this lane' },
      },
      rbacMetadata: {
        title: 'RBAC metadata',
        description:
          'Route roles and auths stay declarative in route metadata and v-auth owns element control.',
        status: 'Centralized',
        bullets: { 0: 'No manual route add/remove', 1: 'No store-owned navigation' },
      },
      wikiPortal: {
        title: 'Wiki as source portal',
        description:
          'Architecture updates land under wiki/canonical and generated evidence updates are refreshed.',
        status: 'Maintained',
        bullets: { 0: 'README stays thin', 1: 'No docs tree revival' },
      },
      apiBuilders: {
        title: 'API builders',
        description: 'API modules expose typed method builders and keep stores out of API files.',
        status: 'Typed',
        bullets: { 0: 'DTO triple pattern', 1: 'No default API exports' },
      },
      requestHooks: {
        title: 'Request hooks',
        description:
          'Views consume methods through useHttpRequest so global loading, retry, and normalized errors remain consistent.',
        status: 'Hook-owned',
        bullets: { 0: 'No duplicate 401 handling', 1: 'No duplicate global toasts' },
      },
      piniaPersistence: {
        title: 'Pinia persistence',
        description:
          'Sensitive and preference stores use encrypted serializers where policy requires them.',
        status: 'Encrypted',
        bullets: { 0: 'User store', 1: 'Permission store', 2: 'Layout and size preferences' },
      },
      firstPaintExceptions: {
        title: 'First-paint exceptions',
        description:
          'Theme and locale plaintext exceptions are narrow bootstrap allowances, not general storage permission.',
        status: 'Scoped',
        bullets: { 0: 'theme-mode', 1: 'locale', 2: 'Vite preload reload flag' },
      },
      themeAndSize: {
        title: 'Theme and size',
        description:
          'Token variables, first-paint preload, and adaptive sizing are coordinated by app runtime.',
        status: 'Token-first',
        bullets: { 0: 'No raw theme colors', 1: 'No ad hoc layout media queries' },
      },
      visualReadiness: {
        title: 'Visual readiness',
        description: 'E2E visual mode relies on deterministic runtime signals instead of sleeps.',
        status: 'Deterministic',
        bullets: {
          0: 'Native preloader readiness',
          1: 'Runtime loading idle',
          2: 'Theme switch stability',
        },
      },
      storeMatrix: {
        title: 'Store matrix',
        description:
          'User, permission, layout, theme, size, locale, device, and table drawer stores have documented owners.',
        status: 'Bounded',
        bullets: { 0: 'No API calls in stores', 1: 'No router pushes from stores' },
      },
      utilityPolicy: {
        title: 'Utility policy',
        description:
          'Business casts go through typeCasters and deep operations go through governed helpers.',
        status: 'Auditable',
        bullets: { 0: 'No business any', 1: 'No inline generic utility functions' },
      },
      adapterPackage: {
        title: 'Adapter package',
        description:
          "{'@'}ccd/vue-primevue-adapter owns theme preset, PT presets, and service facades.",
        status: 'Package-owned',
        bullets: { 0: 'Button PT', 1: 'Form controls PT', 2: 'Menu PT' },
      },
      appRegistration: {
        title: 'App registration',
        description:
          'web-demo plugin bootstrap registers PrimeVue, ProForm, ProTable, toast, dialog, and scrollbar integration.',
        status: 'App-wired',
        bullets: { 0: 'No package deep imports', 1: 'No raw Toast in business views' },
      },
      schemaDrivenForm: {
        title: 'Schema-driven form',
        description:
          'Fields, dependencies, options, and validation live in schema instead of scattered template logic.',
        status: 'Demonstrated below',
        bullets: { 0: 'Input', 1: 'Select', 2: 'Switch', 3: 'Textarea' },
      },
      typedColumns: {
        title: 'Typed columns',
        description:
          'Column definitions, value enums, row keys, and pagination stay in typed ProTable inputs.',
        status: 'Demonstrated below',
        bullets: { 0: 'No raw DataTable in business page', 1: 'No native table markup' },
      },
      renderingGuard: {
        title: 'Rendering guard',
        description:
          'The shared wrapper owns DOM-size gating, visibility recovery, and KeepAlive repaint behavior.',
        status: 'Demonstrated below',
        bullets: { 0: 'No raw echarts.init', 1: 'No hardcoded chart colors' },
      },
      uxPrimitives: {
        title: 'UX primitives',
        description:
          'Icons, EmptyState, PrimeDialog, Toast, and CScrollbar stay reusable and token-aware.',
        status: 'Merged',
        bullets: { 0: 'No raw alert or confirm', 1: 'No broad overflow-auto containers' },
      },
      tokenFirstUi: {
        title: 'Token-first UI',
        description:
          'Templates use semantic UnoCSS classes and CSS variables instead of raw colors.',
        status: 'Active',
        bullets: { 0: 'No raw hex', 1: 'No Tailwind palette classes' },
      },
      adaptiveSizing: {
        title: 'Adaptive sizing',
        description:
          'Root font size and layout dimensions resolve from device, breakpoint, preset, and pixel ratio.',
        status: 'Centralized',
        bullets: { 0: 'No local media-query shell logic', 1: 'No ad hoc rem/em sizing' },
      },
      adminShell: {
        title: 'Admin shell',
        description:
          'The legacy console pages use the existing shell behavior instead of introducing a second app frame.',
        status: 'Compatible',
        bullets: {
          0: 'Fixed dashboard tab',
          1: 'Sidebar menu generation',
          2: 'Route keepAlive support',
        },
      },
      semanticComposition: {
        title: 'Semantic composition',
        description:
          'Page shells prefer existing shortcuts and move repeated geometry into local app components.',
        status: 'Token-first',
        bullets: { 0: 'No internal glass primitive direct use', 1: 'No dynamic class strings' },
      },
      tauriBoundary: {
        title: 'Tauri v2 boundary',
        description:
          'Tauri imports and invoke calls stay inside desktop adapters and Rust backend boundaries.',
        status: 'Read-only',
        bullets: { 0: 'No desktop refactor', 1: 'No capability mutation' },
      },
      strategicGuardrails: {
        title: 'Strategic guardrails',
        description:
          'Rust handlers, structured errors, updater behavior, and deep-link capability stay in later desktop work.',
        status: 'P4 deferred',
        bullets: { 0: 'Owner approval required', 1: 'Security model required' },
      },
    },
    evidence: {
      packageDirection: {
        label: 'Package direction',
        detail: 'Documented in wiki and enforced by dependency-cruiser plus boundary scripts.',
      },
      sourceOfTruth: {
        label: 'Source of truth',
        detail: 'README remains a thin portal into the maintained wiki.',
      },
      matrix: {
        label: 'Matrix',
        detail: 'Owner boundary and forbidden moves are documented there.',
      },
      candidateLedger: {
        label: 'Candidate ledger',
        detail:
          'App-local candidates are evidence for future lanes, not current extraction approval.',
      },
      runtimePolicy: {
        label: 'Policy',
        detail: 'Machine-readable runtime surfaces, classifications, and allowances.',
      },
      wikiValidation: {
        label: 'Validation',
        detail: 'Documentation references stay connected to the same checked scripts.',
      },
      p4Guardrails: {
        label: 'P4 guardrails',
        detail:
          'No Reka UI, TanStack Query, design-system repository, starter, or HTTP/core promotion.',
      },
      httpRuntimePath: {
        label: 'Runtime path',
        detail: 'Concrete alova runtime, policies, validation, and upload manager live here.',
      },
      httpGuardrail: {
        label: 'Boundary',
        detail: 'HTTP runtime stays app-owned until a future reuse lane is approved.',
      },
      safeStoragePath: {
        label: 'Runtime path',
        detail: 'Crypto, lzstring, facade, serializer, and maintenance code remain here.',
      },
      safeStorageGuardrail: {
        label: 'Boundary',
        detail: 'Concrete safeStorage behavior stays app-owned until reuse is approved.',
      },
      runtimeConstants: {
        label: 'Runtime constants',
        detail: 'Visual E2E mode keys and readiness events are centralized.',
      },
      stateBoundary: {
        label: 'State boundary',
        detail: 'The immutable data-flow law remains the operating model.',
      },
      adapterPackagePath: {
        label: 'Adapter package',
        detail: 'Reusable PrimeVue integration belongs in the package.',
      },
      appPlugin: { label: 'App plugin', detail: 'Application bootstrap remains app-owned.' },
      proFormPackage: {
        label: 'Package',
        detail: 'Reusable engine and PrimeVue renderers remain package-owned.',
      },
      proTablePackage: {
        label: 'Package',
        detail: 'Reusable table engine remains package-owned; app query behavior stays app-owned.',
      },
      chartsPackage: {
        label: 'Package',
        detail: 'Shared chart runtime and useChartTheme helpers live in the chart package.',
      },
      vueUiPackage: {
        label: 'Package',
        detail: 'Reusable primitives stay package-owned while page composition stays app-local.',
      },
      designTokens: {
        label: 'Design tokens',
        detail: 'Shared token source and pure derivation live in the package.',
      },
      sizeRuntime: {
        label: 'Runtime',
        detail: 'App-owned first-paint and runtime size application remain in web-demo.',
      },
      layoutRuntimePath: {
        label: 'Runtime path',
        detail: 'Finalized responsive shell state remains centralized.',
      },
      unocssPreset: {
        label: 'Preset',
        detail: 'Shortcut registry remains package-owned and closed.',
      },
      desktopWiki: {
        label: 'Wiki',
        detail: 'Desktop role and security baseline stay documented in the wiki.',
      },
    },
    commands: {
      archBoundaries: {
        description: 'Check that reusable packages depend in the expected direction.',
      },
      governanceGate: { description: 'Run the shared review check for product foundation rules.' },
      apiReport: { description: 'Check public package export surface drift.' },
      archBoundariesReject: { description: 'Reject cross-layer or deep-import drift.' },
      archRuntime: { description: 'Check that runtime-specific work stays in app-owned code.' },
      codexPreflight: { description: 'Check local AI adapter readiness before broader changes.' },
      wikiCommands: { description: 'Check documentation references against available scripts.' },
      aiDoctorOpen: { description: 'Surface remaining low-priority planning notes for review.' },
      archRuntimeLeaks: {
        description: 'Catch runtime-specific imports outside their allowed owners.',
      },
      aiGuardStorage: { description: 'Catch raw storage access in browser-facing code.' },
      e2eVisual: { description: 'Validate first-paint and visual-token stability.' },
      aiGuardBusiness: { description: 'Run product-surface checks over browser-facing code.' },
      lintComponentContracts: { description: 'Catch component and import contract violations.' },
      webDemoTypeCheck: { description: 'Check app SFC and schema typing.' },
      testRun: { description: 'Run package builds plus Vitest coverage.' },
      e2eVisualTokens: { description: 'Validate visual token and chart stability paths.' },
      lintBusinessViews: { description: 'Validate business view component contracts.' },
      validateTokens: { description: 'Validate semantic token contrast.' },
      checkFast: { description: 'Run fast workspace validation.' },
      e2eLayout: { description: 'Validate layout geometry behavior.' },
      unocssTokenSmoke: { description: 'Validate token class generation.' },
      syncDesktopConfig: { description: 'Only needed when desktop config changes.' },
      checkDrift: { description: 'Only needed when desktop invariants change.' },
    },
    demos: {
      primeVue: {
        title: 'Button And Form Controls',
        description:
          'PrimeVue controls render through the approved adapter, global PT presets, and CCD tokens.',
        fields: {
          inputText: 'Input text',
          inputNumber: 'Input number',
          password: 'Password',
          select: 'Select',
          autocomplete: 'AutoComplete',
          datePicker: 'Date picker',
        },
        buttons: {
          primary: 'Primary',
          secondary: 'Secondary',
          success: 'Success',
          info: 'Info',
          warn: 'Warn',
          help: 'Help',
          danger: 'Danger',
          contrast: 'Contrast',
        },
        options: {
          contracts: 'Contracts',
          core: 'Core',
          appRuntime: 'App runtime',
        },
        autocomplete: {
          architecture: 'Architecture',
          runtime: 'Runtime',
          primevue: 'PrimeVue',
          governance: 'Governance',
        },
      },
      proForm: {
        title: 'Guided Request Form',
        description:
          'A guided form demonstrates grouping, validation, team routing, conditional notes, and local product feedback.',
        submit: 'Review form',
        asideLabel: 'Reusable pattern',
        asideDescription:
          'Reusable form behavior powers this example while the page keeps the scenario specific to the demo app.',
        groups: {
          basic: 'Basic fields',
          governance: 'Review details',
        },
        fields: {
          capability: 'Request',
          owner: 'Responsible team',
          guarded: 'Needs review',
          command: 'Recommended next step',
          notes: 'Review notes',
        },
        descriptions: {
          owner: 'Changing the responsible team updates the suggested follow-up.',
          guarded: 'When enabled, review notes become visible and required.',
          command: 'The next step is derived from the selected team.',
          notes: 'Describe what the team should confirm before sharing this request.',
        },
        defaults: {
          capability: 'Customer settings review',
          notes: 'Confirm the request is clear enough for product and support follow-up.',
        },
        validation: {
          capabilityRequired: 'Request is required',
          capabilityLength: 'Request needs at least four characters',
          notesRequired: 'Review notes are required when the request needs review',
        },
        owners: {
          app: 'Product team',
          package: 'Design systems team',
          future: 'Planning team',
        },
        summary: {
          empty: 'No submitted values yet',
          submitted: 'Validation passed for: {fields}',
          separator: ', ',
          valid: 'Validation passed',
        },
      },
      proTable: {
        title: 'Typed ProTable',
        description:
          'A single table demonstrates typed columns, global search, status filtering, toolbar controls, pagination, and row-linked evidence.',
        tableTitle: 'Boundary evidence',
        columns: {
          layer: 'Layer',
          owner: 'Owner',
          status: 'Status',
          validation: 'Validation',
          evidence: 'Evidence path',
        },
        filters: {
          status: 'Boundary status',
          all: 'All statuses',
        },
        states: {
          loading: 'Loading state',
          empty: 'Empty state',
        },
        emptyTitle: 'No matching boundary rows',
        emptyDescription: 'Clear search or status filters to restore the evidence rows.',
        evidence: {
          title: 'Selected evidence',
          empty: 'Select a row to inspect source evidence.',
        },
        status: {
          guarded: 'Guarded',
          app: 'App-owned',
          blocked: 'Deferred',
        },
        rows: {
          contractsOwner: 'interfaces and DTO contracts',
          coreOwner: 'runtime-neutral orchestration',
          httpOwner: 'app-owned alova runtime',
          safeStorageOwner: 'app-owned crypto/compression facade',
          blockedOwner: 'app-local storage helper',
        },
        details: {
          contracts: 'Contracts remain interfaces and shared types only.',
          core: 'Core stays runtime-neutral and depends only on contracts.',
          http: 'HTTP runtime remains in the browser app adapter boundary.',
          safeStorage: 'safeStorage crypto and serializer code remain app-owned.',
          blocked: 'The storage helper stays app-local until a future reuse path is approved.',
        },
      },
      chart: {
        title: 'Token-aware chart runtime',
        description:
          'UseEcharts renders themed evidence without raw ECharts initialization in the view.',
        axis: {
          contracts: 'contracts',
          core: 'core',
          web: 'web',
          desktop: 'desktop',
          wiki: 'wiki',
        },
        series: {
          evidenceWeight: 'Evidence weight',
          runtimeRisk: 'Runtime risk',
        },
      },
      feedback: {
        title: 'Feedback primitives',
        description:
          'The merged feedback surface keeps dialog, toast, empty state, icon, and scroll primitives discoverable.',
        emptyTitle: 'No stale example routes',
        emptyDescription: 'The legacy console pages now point toward focused product examples.',
        facadeTitle: 'Dialog and toast facade',
        facadeDescription:
          'Business feedback continues through CCD abstractions instead of native alert or raw Toast.',
      },
    },
  },
}

export { enUSConsole }
export default enUSConsole
