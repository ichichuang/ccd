const enUSConsole = {
  router: {
    console: {
      architecture: {
        root: 'Architecture',
        topology: 'Monorepo Topology',
        packageBoundaries: 'Package Boundaries',
        runtimeBoundaries: 'Runtime Boundaries',
        governance: 'Governance',
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
  console: {
    dashboard: {
      eyebrow: 'CCD Architecture',
      title: 'Architecture Control Center',
      description:
        'Focused evidence for package boundaries, runtime isolation, validation gates, wiki governance, desktop posture, and P4 guardrails.',
      action: 'Validation lane',
      evidenceTag: 'Wiki',
      values: {
        clean: 'Clean',
        appOwned: 'App-owned',
        governed: 'Governed',
        visible: 'Visible',
      },
      cards: {
        packageBoundary: {
          label: 'Package boundary',
          detail: 'Dependency direction remains packages/contracts -> packages/core -> apps.',
        },
        runtimeIsolation: {
          label: 'Runtime isolation',
          detail: 'HTTP and safeStorage runtime stay inside apps/web-demo.',
        },
        validationGate: {
          label: 'Validation gate',
          detail: 'governance:gate remains the single architecture gate.',
        },
        p4Guardrails: {
          label: 'P4 guardrails',
          detail: 'Strategic work stays deferred or blocked until owner approval.',
        },
      },
      routePosture: {
        title: 'Current Route Posture',
        description: 'The old example route museum is reduced into an architecture taxonomy.',
        before: 'Before',
        beforeDetail: 'registered route records',
        legacy: 'Legacy museum',
        legacyDetail: 'museum route records',
        after: 'After',
        afterDetail: 'focused registered records',
      },
      commands: {
        title: 'Validation Commands',
        description: 'The console is governed by existing repo commands, not a new toolchain.',
      },
      evidence: {
        monorepoTopology: {
          title: 'Monorepo topology',
          description:
            "{'@'}ccd/contracts, {'@'}ccd/core, frontend-platform packages, and apps keep separate responsibility boundaries.",
        },
        runtimeBoundaries: {
          title: 'Runtime boundaries',
          description:
            'Runtime access is owned by app adapters or exact app-owned infrastructure exceptions.',
        },
        webDemoRole: {
          title: 'Web demo role',
          description:
            'The browser app owns routes, stores, views, plugin wiring, HTTP runtime, and safeStorage runtime.',
        },
        strategicGuardrails: {
          title: 'Strategic guardrails',
          description:
            'No Reka UI, TanStack Query, design-system split, starter extraction, or runtime promotion in this lane.',
        },
      },
      dialog: {
        title: 'CCD Architecture Validation',
        message:
          'Architecture console validation is tracked through wiki, route/i18n, runtime, boundary, build, E2E, and governance gates.',
      },
    },
    shared: {
      evidence: {
        title: 'Evidence',
        description: 'Repository paths and policy facts backing this route.',
      },
      commands: {
        title: 'Validation Commands',
        description: 'Commands remain script-backed and validated by wiki/governance gates.',
      },
    },
    routeReduction: {
      title: 'Route Reduction',
      description: 'Legacy route records are replaced with a smaller architecture taxonomy.',
      before: 'Before',
      beforeDetail: 'registered records with 99 legacy museum entries',
      after: 'After',
      afterDetail: 'registered records in the console taxonomy',
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
        eyebrow: 'Architecture',
        title: 'Monorepo Topology',
        description:
          'The active CCD topology is a deterministic pnpm and Turbo workspace with contracts and core kept runtime-neutral.',
      },
      packageBoundaries: {
        eyebrow: 'Architecture',
        title: 'Package Boundaries',
        description:
          'Each package has a public posture and a forbidden promotion rule; app runtime is not promoted into shared packages.',
      },
      runtimeBoundaries: {
        eyebrow: 'Architecture',
        title: 'Runtime Boundaries',
        description:
          'Runtime APIs belong in app adapters or exact approved app-owned infrastructure, never in contracts or core.',
      },
      governance: {
        eyebrow: 'Architecture',
        title: 'Governance And Route Metadata',
        description:
          'Route metadata, RBAC, wiki validation, and AI guardrails make the web-demo surface explainable and testable.',
      },
      http: {
        eyebrow: 'Runtime',
        title: 'HTTP And Alova Runtime',
        description:
          'web-demo owns the concrete alova runtime, interceptors, refresh coordination, policies, and useHttpRequest consumption path.',
      },
      safeStorage: {
        eyebrow: 'Runtime',
        title: 'safeStorage Runtime',
        description:
          'safeStorage encryption, compression, serializer, migration, maintenance, and facade code remain app-owned.',
      },
      browser: {
        eyebrow: 'Runtime',
        title: 'Browser Runtime Integration',
        description:
          'Device, locale, theme, size, date, and visual-E2E readiness are app runtime concerns wired through plugins, stores, and hooks.',
      },
      state: {
        eyebrow: 'Runtime',
        title: 'State Ownership And Utilities',
        description:
          'Stores own persistent system state while component-local state remains local; utility demos are summarized by ownership.',
      },
      primevueAdapter: {
        eyebrow: 'UI',
        title: 'PrimeVue Adapter',
        description:
          'PrimeVue v4 remains the approved ecosystem, with global PT presets and CCD wrappers used instead of scattered styling.',
      },
      proForm: {
        eyebrow: 'UI',
        title: 'ProForm Capability',
        description:
          'The old nine-route ProForm museum is consolidated into one page that shows schema, validation, and reactions.',
      },
      proTable: {
        eyebrow: 'UI',
        title: 'ProTable Capability',
        description:
          'The old table route spread is consolidated into one page that demonstrates typed columns, row data, toolbar, and pagination posture.',
      },
      charts: {
        eyebrow: 'UI',
        title: 'Chart Runtime',
        description:
          'Chart demos focus on the CCD chart runtime: UseEcharts, theme merging, responsive recovery, and tokenized themes.',
      },
      feedback: {
        eyebrow: 'UI',
        title: 'Feedback And Empty States',
        description:
          'Dialog, toast, empty state, icons, and CScrollbar examples are merged into a small capability page.',
      },
      theme: {
        eyebrow: 'System',
        title: 'Theme System',
        description:
          'Theme controls are represented as architecture evidence over token families, PrimeVue preset mapping, and first-paint behavior.',
      },
      sizeBreakpoints: {
        eyebrow: 'System',
        title: 'Size And Breakpoints',
        description:
          'The size and breakpoint system owns density presets, pixel-ratio-aware sizing, and responsive layout variables.',
      },
      layout: {
        eyebrow: 'System',
        title: 'Layout Runtime',
        description:
          'LayoutAdmin remains the shell owner for header, sidebar, breadcrumbs, tabs, footer, drawer, context menu, loading, and refresh behavior.',
      },
      unocss: {
        eyebrow: 'System',
        title: 'UnoCSS And Design Engine',
        description:
          'UnoCSS is used as a closed semantic shortcut registry with token-backed classes and guardrails.',
      },
      desktopBoundary: {
        eyebrow: 'Desktop',
        title: 'Desktop Boundary Mirror',
        description:
          'This page is a read-only mirror of the Tauri boundary: desktop adapters and src-tauri remain untouched in the web-demo UI lane.',
      },
    },
    status: {
      topology: { label: 'Topology', value: 'contracts -> core -> apps' },
      runtimeAdapters: { label: 'Runtime', value: 'App-owned adapters' },
      p4Guarded: { label: 'P4', value: 'Guarded' },
      routeMetadata: { label: 'Route metadata', value: 'titleKey required' },
      i18n: { label: 'i18n', value: 'en-US + zh-CN' },
      ledgerP4: { label: 'Ledger', value: 'P4 visible' },
      desktopUntouched: { label: 'Desktop code', value: 'untouched' },
      tauriAdapterOnly: { label: 'Tauri APIs', value: 'adapter-only' },
      p4BackendDeferred: { label: 'P4 backend', value: 'deferred' },
    },
    stats: {
      publicPackages: {
        label: 'Public packages',
        detail: "{'@'}ccd package exports remain governed.",
      },
      apps: { label: 'Apps', detail: 'web-demo and desktop own runtime adapters.' },
      validationGate: {
        label: 'Validation gate',
        detail: 'governance:gate is the architecture gate.',
      },
      runtimeScans: {
        label: 'Runtime scans',
        value: 'strict',
        detail: 'contracts and core reject browser, Node, Tauri, timers, and network runtime.',
      },
      targetRoutes: {
        label: 'Target routes',
        detail: 'Business route records after retiring the 99-record example museum.',
      },
      legacyExample: {
        label: 'Legacy example',
        detail: 'No canonical legacy example menu entries after migration.',
      },
      routeTests: {
        label: 'Route tests',
        value: 'intentional',
        detail: 'The spec asserts route signatures and locale coverage.',
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
        label: 'Shared-utils',
        value: 'blocked',
        detail: 'No crypto, compression, or runtime facade promotion.',
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
      uiEcosystem: { label: 'UI ecosystem', detail: 'No Reka UI replacement in this lane.' },
      ptStyling: {
        label: 'Styling',
        value: 'PT-first',
        detail: 'Semantic token classes and global presets own visual state.',
      },
      proFormLegacyRoutes: {
        label: 'Legacy routes',
        detail: 'Basic, grouping, validation, DAG, reactions, plugins, and events are merged.',
      },
      schemaEngine: {
        label: 'Engine',
        value: 'Schema',
        detail: 'Form behavior remains declarative and typed.',
      },
      proTableLegacyRoutes: {
        label: 'Legacy routes',
        detail: 'Basic, server, virtual, infinite, columns, and events are merged.',
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
        value: 'blocked',
        detail: 'Disabled until a desktop trust model is approved.',
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
        bullets: { 0: 'PrimeVue remains approved', 1: 'No Reka UI migration in this lane' },
      },
      appLocalCandidates: {
        title: 'App-local candidates',
        description:
          'web-demo shared candidates stay app-local until a separate extraction lane proves ownership and rollback.',
        status: 'Not extracted',
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
          'The architecture console uses existing shell behavior rather than introducing a new app frame.',
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
          'Rust command handlers, structured Rust errors, updater, and deep-link runtime remain future lanes.',
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
        detail: 'Documentation command references remain script-backed.',
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
        label: 'Guardrail',
        detail: 'HTTP runtime promotion is explicitly blocked without a future approved lane.',
      },
      safeStoragePath: {
        label: 'Runtime path',
        detail: 'Crypto, lzstring, facade, serializer, and maintenance code remain here.',
      },
      safeStorageGuardrail: {
        label: 'Guardrail',
        detail: 'Concrete safeStorage promotion is blocked without a future approved lane.',
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
      archBoundaries: { description: 'Validate workspace dependency direction.' },
      governanceGate: { description: 'Run the single architecture governance gate.' },
      apiReport: { description: 'Check public package export surface drift.' },
      archBoundariesReject: { description: 'Reject cross-layer or deep-import drift.' },
      archRuntime: { description: 'Run runtime leak detection.' },
      codexPreflight: { description: 'Check AI/governance adapter preflight.' },
      wikiCommands: { description: 'Validate wiki command references against package scripts.' },
      aiDoctorOpen: { description: 'Keep P4 guardrails visible while actionable work closes.' },
      archRuntimeLeaks: { description: 'Catch forbidden runtime leakage.' },
      aiGuardStorage: { description: 'Reject raw storage access in business code.' },
      e2eVisual: { description: 'Validate first-paint and visual token regressions.' },
      aiGuardBusiness: { description: 'Run architecture guard checks over business surfaces.' },
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
        title: 'Schema-driven ProForm',
        description:
          'A schema-driven form demonstrates grouping, validation, reactive ownership, conditional evidence, and app-local composition.',
        submit: 'Validate schema',
        asideLabel: 'Layout constraint',
        asideDescription:
          "Reusable ProForm behavior lives in {'@'}ccd/vue-ui; this schema stays in apps/web-demo because it is app-specific composition.",
        groups: {
          basic: 'Basic fields',
          governance: 'Governance',
        },
        fields: {
          capability: 'Capability',
          owner: 'Owner boundary',
          guarded: 'Governance guarded',
          command: 'Validation command',
          notes: 'Evidence notes',
        },
        descriptions: {
          owner: 'Changing owner updates the validation command.',
          guarded: 'When enabled, evidence notes become visible and required.',
          command: 'Command is derived from the selected owner boundary.',
          notes: 'Describe why this capability remains in its selected boundary.',
        },
        defaults: {
          capability: 'Architecture console page shell',
          notes: 'Keep composition app-local until a separate extraction lane proves ownership.',
        },
        validation: {
          capabilityRequired: 'Capability is required',
          capabilityLength: 'Capability needs at least four characters',
          notesRequired: 'Evidence notes are required when governance guard is enabled',
        },
        owners: {
          app: 'App-local composition',
          package: 'Public package primitive',
          future: 'Future extraction lane',
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
          blocked: 'Blocked',
        },
        rows: {
          contractsOwner: 'interfaces and DTO contracts',
          coreOwner: 'runtime-neutral orchestration',
          httpOwner: 'app-owned alova runtime',
          safeStorageOwner: 'app-owned crypto/compression facade',
          blockedOwner: 'blocked shared-utils promotion',
        },
        details: {
          contracts: 'Contracts remain interfaces and shared types only.',
          core: 'Core stays runtime-neutral and depends only on contracts.',
          http: 'HTTP runtime remains in the browser app adapter boundary.',
          safeStorage: 'safeStorage crypto and serializer code remain app-owned.',
          blocked: 'The repair ledger keeps safeStorage promotion blocked as a P4 guardrail.',
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
        emptyDescription:
          'The architecture console replaces museum-style examples with focused evidence.',
        facadeTitle: 'Dialog and toast facade',
        facadeDescription:
          'Business feedback continues through CCD abstractions instead of native alert or raw Toast.',
      },
    },
  },
}

export { enUSConsole }
export default enUSConsole
