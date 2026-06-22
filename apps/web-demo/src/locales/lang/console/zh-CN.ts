interface ConsoleLocaleTree {
  [key: string]: string | ConsoleLocaleTree
}

const showcasePageTitles = {
  overview: '概览',
  'components-root': '组件',
  'components-primevue-adapter': 'PrimeVue 适配器',
  'components-empty-state': '空状态',
  'components-icons': '图标',
  'components-c-scrollbar': 'CScrollbar',
  'components-pro-table-overview': 'ProTable 概览',
  'components-pro-table-basic': '基础表格',
  'components-pro-table-columns': '列配置',
  'components-pro-table-sorting-filtering': '排序与过滤',
  'components-pro-table-pagination': '分页',
  'components-pro-table-server-request': '服务端请求',
  'components-pro-table-states': '表格状态',
  'components-pro-table-selection': '选择',
  'components-pro-table-toolbar-density': '工具栏与密度',
  'components-pro-table-virtual-infinite': '虚拟与无限滚动',
  'components-pro-table-export-refresh': '导出与刷新',
  'components-pro-table-cell-rendering': '单元格渲染',
  'components-pro-table-form-composition': '表单组合',
  'components-pro-table-api-events': 'API 与事件',
  'components-pro-form-overview': 'ProForm 概览',
  'components-pro-form-basic-schema': '基础 Schema',
  'components-pro-form-grouped-layout': '分组布局',
  'components-pro-form-validation': '校验',
  'components-pro-form-dependencies-computed': '依赖与计算',
  'components-pro-form-conditional-visibility': '条件显示',
  'components-pro-form-reactions': '联动反应',
  'components-pro-form-async-data': '异步数据',
  'components-pro-form-field-arrays': '字段数组',
  'components-pro-form-plugins-draft': '插件与草稿',
  'components-pro-form-submit-states': '提交状态',
  'components-pro-form-api-events': 'API 与事件',
  'components-charts-overview': '图表概览',
  'components-charts-theme': '图表主题',
  'components-charts-responsive': '响应式图表',
  'components-charts-states': '图表状态',
  'components-charts-events': '图表事件',
  'components-charts-dashboard-preview': '看板预览',
  'feedback-dialog-toast': 'Dialog 与 Toast',
  'hooks-overview': 'Hooks 概览',
  'hooks-theme-switching': '主题切换',
  'hooks-locale-switching': '语言切换',
  'hooks-http-flow': 'HTTP 流程',
  'hooks-auth-permission': '认证与权限',
  'hooks-layout-runtime': '布局运行时',
  'hooks-responsive-device': '响应式设备',
  'utils-overview': '工具概览',
  'utils-date': '日期工具',
  'utils-safe-storage': 'safeStorage',
  'utils-state-persistence': '状态持久化',
  'runtime-overview': '运行时概览',
  'runtime-http': 'HTTP 运行时',
  'runtime-browser': '浏览器运行时',
  'runtime-layout': '布局运行时',
  'runtime-state-ownership': '状态归属',
  'design-tokens': '设计 Token',
  'design-unocss': 'UnoCSS',
  'design-material': '材质',
  'design-density': '密度',
  'design-motion': '动效',
  governance: '治理',
  'desktop-boundary': '桌面边界',
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
    eyebrow: 'ProTable 展示',
    description: 'ProTable 表格行为、类型化输入、请求边界与状态证据的导览页。',
    try: '查看能力地图。',
    source: '源码路径包含路由页面与共享 ProTable 演示壳。',
    technical: '技术说明解释类型化列模型与展示页接线。',
  },
  'components-pro-table-basic': {
    eyebrow: 'ProTable 展示',
    description: '完整基础表格，覆盖类型化列、本地行、工具栏搜索、分页与空状态文案。',
    try: '试用基础表格。',
    source: '源码路径展示目录页面与共享类型化表格配置。',
    technical: '技术说明聚焦 ProTable 包装与确定性本地数据。',
  },
  'components-pro-table-columns': {
    eyebrow: 'ProTable 展示',
    description: '展示列显隐、valueEnum、对齐、宽度与状态读取，不使用 render 回调。',
    try: '查看列行为。',
    source: '源码路径展示页面路由与共享列配置的归属。',
    technical: '技术说明强调普通列对象与无 TSX 渲染器。',
  },
  'components-pro-table-sorting-filtering': {
    eyebrow: 'ProTable 展示',
    description: '排序、全局搜索与 PrimeVue 状态过滤展示表格状态如何保持可检查。',
    try: '试用排序与过滤。',
    source: '源码路径展示目录页面与共享确定性行数据。',
    technical: '技术说明描述表格状态证据与本地化过滤文案。',
  },
  'components-pro-table-pagination': {
    eyebrow: 'ProTable 展示',
    description: '分页控件、页大小变更、可排序指标与暴露状态读取集中在一个路由。',
    try: '查看分页。',
    source: '源码路径展示目录页面与共享 ProTable 壳。',
    technical: '技术说明聚焦 ProTable 分页 props 与状态读取。',
  },
  'components-pro-table-server-request': {
    eyebrow: 'ProTable 展示',
    description: '完整本地 request 模式演示，覆盖请求分页、搜索、排序、reload 与 fetch 状态。',
    try: '试用请求模式。',
    source: '源码路径包含基于确定性本地数据的请求适配器。',
    technical: '技术说明解释注入式请求边界与禁止 raw fetch。',
  },
  'components-pro-table-states': {
    eyebrow: 'ProTable 展示',
    description: '完整状态页展示加载、空状态、选择、行聚焦与 state/fetch 检查文案。',
    try: '切换表格状态。',
    source: '源码路径展示状态控件与共享壳。',
    technical: '技术说明解释本地状态归属与 ProTable 插槽。',
  },
  'components-pro-table-selection': {
    eyebrow: 'ProTable 展示',
    description: '复选选择、选中导出、清空选择与状态读取集中在预览就绪页面。',
    try: '试用行选择。',
    source: '源码路径展示路由页面与共享选择行为。',
    technical: '技术说明聚焦暴露的选择方法与本地摘要。',
  },
  'components-pro-table-toolbar-density': {
    eyebrow: 'ProTable 展示',
    description: '工具栏搜索、密度控制、刷新、导出与状态控件组成一个表格工作流。',
    try: '查看工具栏密度。',
    source: '源码路径展示工具栏路由与共享表格壳。',
    technical: '技术说明描述 ProTable 工具栏归属与本地化文案。',
  },
  'components-pro-table-virtual-infinite': {
    eyebrow: 'ProTable 展示',
    description: '只通过 ProTable 支持的 props 展示虚拟行与无限请求加载。',
    try: '切换滚动模式。',
    source: '源码路径展示虚拟/无限路由与本地请求适配器。',
    technical: '技术说明解释 virtual、infinite 与 pagination 的互斥模型。',
  },
  'components-pro-table-export-refresh': {
    eyebrow: 'ProTable 展示',
    description: '页面内提供刷新、当前页导出、选中导出、清空选择与表格状态读取。',
    try: '试用导出与刷新。',
    source: '源码路径展示路由与共享暴露方法控件。',
    technical: '技术说明聚焦浏览器导出触发与本地状态文案。',
  },
  'components-pro-table-cell-rendering': {
    eyebrow: 'ProTable 展示',
    description: '单元格展示使用 valueEnum、对齐、数字字段与普通数据，不使用自定义渲染器。',
    try: '查看单元格展示。',
    source: '源码路径展示路由与普通列预设。',
    technical: '技术说明解释为什么不需要 Vue h 或 TSX renderer。',
  },
  'components-pro-table-form-composition': {
    eyebrow: 'ProTable 展示',
    description: 'PrimeVue 过滤控件围绕 ProTable 组合，但本路由不实现 ProForm 页面。',
    try: '试用组合过滤。',
    source: '源码路径展示页面组合与共享行数据。',
    technical: '技术说明将表单能力留在本次 ProTable-only 范围之外。',
  },
  'components-pro-table-api-events': {
    eyebrow: 'ProTable 展示',
    description: '注入 apiExecutor 的演示把行、排序、过滤、分页、刷新与请求事件记录到本地状态。',
    try: '查看 API 事件。',
    source: '源码路径包含 apiExecutor 适配器与共享壳。',
    technical: '技术说明解释应用注入的 API 边界。',
  },
  'components-pro-form-overview': {
    eyebrow: 'ProForm 展示',
    description: '表单能力导览，覆盖请求录入、价格逻辑、校验反馈与可见状态摘要。',
    try: '浏览表单能力地图。',
    source: '源码路径包含路由页面与共享 ProForm 演示壳。',
    technical: '技术说明解释类型化 schema 模型与共享演示接线。',
  },
  'components-pro-form-basic-schema': {
    eyebrow: 'ProForm 展示',
    description: '完整基础表单展示产品文案、字段标签、默认值、辅助说明与本地提交反馈如何组合。',
    try: '试用基础 schema 表单。',
    source: '源码路径展示路由页面与共享 schema 工厂。',
    technical: '技术说明聚焦类型化 schema 输入与只通过包装组件渲染表单。',
  },
  'components-pro-form-grouped-layout': {
    eyebrow: 'ProForm 展示',
    description: '分组区域让请求信息与计划信息在表单变大前仍然易懂。',
    try: '查看分组布局。',
    source: '源码路径展示分组路由与共享布局 schema。',
    technical: '技术说明解释 schema 分组与响应式 span 归属。',
  },
  'components-pro-form-validation': {
    eyebrow: 'ProForm 展示',
    description: '完整校验页面让缺失输入、resolver 反馈、提交状态与状态读取都在页面内可见。',
    try: '试用校验规则。',
    source: '源码路径包含校验路由、schema 工厂与共享壳。',
    technical: '技术说明解释字段规则、resolver 输出与暴露状态读取。',
  },
  'components-pro-form-dependencies-computed': {
    eyebrow: 'ProForm 展示',
    description: '依赖字段会计算套餐价格与月度成本，同时让计算结果容易检查。',
    try: '切换套餐和席位数。',
    source: '源码路径展示依赖与计算字段 schema。',
    technical: '技术说明聚焦声明式 deps 与 computed 值。',
  },
  'components-pro-form-conditional-visibility': {
    eyebrow: 'ProForm 展示',
    description: '审批与缓解措施字段只在请求真的需要时显示、禁用或变为必填。',
    try: '切换审批条件。',
    source: '源码路径展示条件逻辑路由与共享 schema。',
    technical: '技术说明解释 visible、disabled 与 required 逻辑。',
  },
  'components-pro-form-reactions': {
    eyebrow: 'ProForm 展示',
    description: '完整联动演示会随发布就绪状态与联系偏好更新跟进文案。',
    try: '触发表单联动。',
    source: '源码路径展示联动路由与共享 schema reactions。',
    technical: '技术说明解释声明式 reaction effect 与状态反馈。',
  },
  'components-pro-form-async-data': {
    eyebrow: 'ProForm 展示',
    description: '切换区域会异步加载本地负责人选项，不离开页面，也不依赖远程服务。',
    try: '切换区域。',
    source: '源码路径展示 schema 工厂中的异步选项加载器。',
    technical: '技术说明解释本地选项加载与依赖更新。',
  },
  'components-pro-form-field-arrays': {
    eyebrow: 'ProForm 展示',
    description: '里程碑列表可以新增、删除、排序，同时仍属于同一份表单值。',
    try: '编辑里程碑。',
    source: '源码路径包含字段数组路由、共享壳与字段数组控件。',
    technical: '技术说明解释字段数组 hook 与表单上下文。',
  },
  'components-pro-form-plugins-draft': {
    eyebrow: 'ProForm 展示',
    description: '草稿控件展示表单如何通过批准的草稿层保存、恢复与清理未完成内容。',
    try: '保存并恢复草稿。',
    source: '源码路径展示草稿路由与插件就绪的共享壳。',
    technical: '技术说明解释插件注册与草稿存储 API。',
  },
  'components-pro-form-submit-states': {
    eyebrow: 'ProForm 展示',
    description: '提交状态保持本地化，评审者无需网络请求即可看到空闲、提交中、成功与错误结果。',
    try: '试用提交状态。',
    source: '源码路径展示共享壳中的本地提交状态处理。',
    technical: '技术说明解释本地结果状态与暴露 submit 行为。',
  },
  'components-pro-form-api-events': {
    eyebrow: 'ProForm 展示',
    description: '可见控件调用表单 API，并把校验、取值、状态与提交事件记录到页面文案。',
    try: '查看表单 API 事件。',
    source: '源码路径展示 API 事件路由与共享方法控件。',
    technical: '技术说明解释暴露方法读取与事件记录。',
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
        eyebrow: '展示',
        title,
        description: `${title} 是目录驱动的能力页面，包含聚焦演示、产品价值与源码上下文。`,
        try: `试用${title}能力。`,
        source: '源码路径展示路由页面与共享展示实现。',
        technical: '技术说明解释运行时边界与可复用页面契约。',
        ...(showcasePageLocaleOverrides[id] ?? {}),
      },
    ])
  )
}

const showcaseRouterLocale = createNestedLocaleRecord([
  ['root', '展示'],
  ['overview', '概览'],
  ['components.root', '组件'],
  ['components.primevueAdapter', 'PrimeVue 适配器'],
  ['components.emptyState', '空状态'],
  ['components.icons', '图标'],
  ['components.cScrollbar', 'CScrollbar'],
  ['components.proTable.root', 'ProTable'],
  ['components.proTable.overview', 'ProTable 概览'],
  ['components.proTable.basic', '基础表格'],
  ['components.proTable.columns', '列配置'],
  ['components.proTable.sortingFiltering', '排序与过滤'],
  ['components.proTable.pagination', '分页'],
  ['components.proTable.serverRequest', '服务端请求'],
  ['components.proTable.states', '表格状态'],
  ['components.proTable.selection', '选择'],
  ['components.proTable.toolbarDensity', '工具栏与密度'],
  ['components.proTable.virtualInfinite', '虚拟与无限滚动'],
  ['components.proTable.exportRefresh', '导出与刷新'],
  ['components.proTable.cellRendering', '单元格渲染'],
  ['components.proTable.formComposition', '表单组合'],
  ['components.proTable.apiEvents', 'API 与事件'],
  ['components.proForm.root', 'ProForm'],
  ['components.proForm.overview', 'ProForm 概览'],
  ['components.proForm.basicSchema', '基础 Schema'],
  ['components.proForm.groupedLayout', '分组布局'],
  ['components.proForm.validation', '校验'],
  ['components.proForm.dependenciesComputed', '依赖与计算'],
  ['components.proForm.conditionalVisibility', '条件显示'],
  ['components.proForm.reactions', '联动反应'],
  ['components.proForm.asyncData', '异步数据'],
  ['components.proForm.fieldArrays', '字段数组'],
  ['components.proForm.pluginsDraft', '插件与草稿'],
  ['components.proForm.submitStates', '提交状态'],
  ['components.proForm.apiEvents', 'API 与事件'],
  ['components.charts.root', '图表'],
  ['components.charts.overview', '图表概览'],
  ['components.charts.theme', '图表主题'],
  ['components.charts.responsive', '响应式图表'],
  ['components.charts.states', '图表状态'],
  ['components.charts.events', '图表事件'],
  ['components.charts.dashboardPreview', '看板预览'],
  ['feedback.dialogToast', 'Dialog 与 Toast'],
  ['hooks.root', 'Hooks'],
  ['hooks.overview', 'Hooks 概览'],
  ['hooks.themeSwitching', '主题切换'],
  ['hooks.localeSwitching', '语言切换'],
  ['hooks.httpFlow', 'HTTP 流程'],
  ['hooks.authPermission', '认证与权限'],
  ['hooks.layoutRuntime', '布局运行时'],
  ['hooks.responsiveDevice', '响应式设备'],
  ['utils.root', '工具'],
  ['utils.overview', '工具概览'],
  ['utils.date', '日期工具'],
  ['utils.safeStorage', 'safeStorage'],
  ['utils.statePersistence', '状态持久化'],
  ['runtime.root', '运行时'],
  ['runtime.overview', '运行时概览'],
  ['runtime.http', 'HTTP 运行时'],
  ['runtime.browser', '浏览器运行时'],
  ['runtime.layout', '布局运行时'],
  ['runtime.stateOwnership', '状态归属'],
  ['design.root', '设计系统'],
  ['design.tokens', '设计 Token'],
  ['design.unocss', 'UnoCSS'],
  ['design.material', '材质'],
  ['design.density', '密度'],
  ['design.motion', '动效'],
  ['governance.root', '治理'],
  ['desktopBoundary.root', '桌面边界'],
])

const zhCNConsole = {
  router: {
    showcase: showcaseRouterLocale,
    console: {
      architecture: {
        root: '产品基础',
        topology: 'CCD 如何组织',
        packageBoundaries: '复用包职责',
        runtimeBoundaries: '运行时放在哪里',
        governance: '交付规则',
      },
      runtime: {
        root: '运行时',
        http: 'HTTP / Alova',
        safeStorage: 'safeStorage',
        browser: '浏览器运行时',
        state: '状态归属',
      },
      ui: {
        root: 'UI',
        primevueAdapter: 'PrimeVue 适配器',
        proForm: 'ProForm',
        proTable: 'ProTable',
        charts: '图表',
        feedback: '反馈',
      },
      system: {
        root: '系统',
        theme: '主题',
        sizeBreakpoints: '尺寸与断点',
        layout: '布局运行时',
        unocss: 'UnoCSS',
        globalSettings: '全局设置',
      },
      desktop: {
        root: '桌面边界',
      },
    },
  },
  showcase: {
    pages: createShowcasePageLocale(),
    groups: {
      overview: {
        title: '从这里开始',
        description: '展示地图与设计意图的公开入口。',
      },
      components: {
        title: '组件',
        description: '可复用 UI 原语与适配器承载的组件能力。',
      },
      tables: {
        title: '表格',
        description: '面向数据阅读、状态与请求边界的 ProTable 工作流。',
      },
      forms: {
        title: '表单',
        description: '面向校验、依赖与提交状态的 ProForm Schema 流程。',
      },
      charts: {
        title: '图表',
        description: '基于受控图表适配器的主题感知图表示例。',
      },
      feedback: {
        title: '反馈',
        description: 'Dialog、Toast、空状态与用户反馈模式。',
      },
      hooks: {
        title: 'Hooks',
        description: '通过受治理 hooks 暴露的可组合运行时行为。',
      },
      utils: {
        title: '工具',
        description: '带安全格式化与持久化边界的共享应用工具。',
      },
      runtime: {
        title: '运行时',
        description: 'HTTP、浏览器、布局与状态归属边界。',
      },
      design: {
        title: '设计系统',
        description: 'Token、材质、密度、动效与 UnoCSS 治理。',
      },
      governance: {
        title: '交付信心',
        description: '评审就绪、源码上下文与检查机制，让共享能力更容易理解。',
      },
      desktopBoundary: {
        title: '桌面边界',
        description: 'Tauri 与桌面访问模式保留在应用持有的适配器之后。',
      },
    },
    dashboard: {
      hero: {
        eyebrow: 'CCD 产品系统',
        title: '用一套可复用能力构建一致的应用体验。',
        description:
          'CCD 将 UI 组件、运行时边界、设计 Token 与交付检查组织在一起，让团队不用重复搭建基础能力，也能交付一致的 Web 与桌面体验。',
        primaryAction: '开始探索',
        secondaryAction: '查看交付故事',
      },
      benefits: {
        buildingBlocks: {
          title: '可复用构件',
          description: '从成熟的页面、组件、反馈与布局模式开始，而不是反复重建常见应用表面。',
        },
        themes: {
          title: '一致主题',
          description:
            '设计 Token、密度、材质与图标规则让浅色、深色、桌面和移动视图保持同一种产品气质。',
        },
        dataWorkflows: {
          title: '可靠数据工作流',
          description: '表格体验已经覆盖加载、空状态、分页、工具栏与行状态，让数据操作更可预期。',
        },
        guidedInput: {
          title: '智能输入流程',
          description: 'Schema 驱动的表单模式让校验、依赖字段与提交状态更容易理解和维护。',
        },
        responsiveUx: {
          title: '响应式多语言体验',
          description: '导航、布局与文案从一开始就面向多屏幕尺寸和多语言上下文设计。',
        },
        runtimeSafety: {
          title: '运行时边界',
          description:
            '浏览器、HTTP、持久化与桌面访问保留在清晰的应用适配器之后，不泄漏进共享逻辑。',
        },
      },
      capabilities: {
        eyebrow: '探索目录',
        title: '选择你想查看的能力。',
        description: '打开聚焦演示，查看表格、表单、图表、设计、运行时行为与交付信心。',
        catalogTag: '聚焦路线',
        dataTables: {
          eyebrow: '数据',
          title: '探索数据表格',
          description: '查看面向可读行、清晰状态和可预期数据操作的紧凑表格基础。',
          preview: '打开表格能力',
        },
        smartForms: {
          eyebrow: '输入',
          title: '试用智能表单',
          description: '在专属页面查看校验型表单行为，而不是在首页嵌入大型表单演示。',
          preview: '打开表单能力',
        },
        charts: {
          eyebrow: '洞察',
          title: '查看图表型看板',
          description: '通过专属展示路由检查主题感知图表，而不是在首页加载大型图表。',
          preview: '打开图表能力',
        },
        designSystem: {
          eyebrow: '设计',
          title: '浏览设计系统',
          description: '查看让 CCD 界面保持一致的 Token、材质、密度与动效规则。',
          preview: '打开设计 Token',
        },
        runtime: {
          eyebrow: '运行时',
          title: '查看运行时能力',
          description: '理解应用体验如何将浏览器与桌面能力清晰分离。',
          preview: '打开运行时概览',
        },
        delivery: {
          eyebrow: '交付',
          title: '查看交付故事',
          description: '了解 CCD 如何让可复用能力保持可理解、可评审并可交付。',
          preview: '打开交付故事',
        },
      },
      preview: {
        table: {
          title: '表格只链接，不嵌入',
          description: '首页保留小型视觉提示，详细表格行为进入 showcase 查看。',
        },
        form: {
          title: '表单在这里保持轻量',
          description: '校验和字段行为留在专属页面，让当前路由保持快速和公开。',
        },
        chart: {
          title: '图表只做安全预览',
          description: '图表能力一键可达，但不会在 Landing 页加载大型 canvas。',
        },
      },
      story: {
        eyebrow: 'CCD 如何帮忙',
        title: '为需要一致性和速度的团队准备的产品系统。',
        description:
          'CCD 不是单个演示，而是一套用于构建应用表面的可复用基础，让界面观感、行为和交付方式像一个产品。',
        align: {
          title: '对齐体验',
          description: '共享语言和可复用 UI 模式减少看板、设置、数据页面与桌面表面之间的漂移。',
        },
        adapt: {
          title: '按运行时适配',
          description: '应用可以把平台相关工作留在正确位置，同时让共享能力保持可移植。',
        },
        ship: {
          title: '更有把握地交付',
          description: '目录路由、双语文案、布局检查与源码元数据让每项能力更容易评审。',
        },
      },
    },
    shell: {
      heroActions: '展示操作',
      source: {
        title: '源码',
        description: '开发者需要实现线索时，可以从这些文件继续追踪。',
        empty: '该目录项未登记源码路径。',
      },
      related: {
        title: '相关页面',
        description: '来自同一目录分组的相邻展示路由。',
      },
      technical: {
        title: '技术说明',
      },
      demoLevels: {
        complete: '完整',
        preview: '预览',
      },
      kinds: {
        overview: '概览',
        table: '表格',
        form: '表单',
        chart: '图表',
        demo: '演示',
        technical: '技术',
      },
    },
    placeholder: {
      description: '该路由已接入，等待专属展示页。',
      sources: '计划源码',
      what: {
        title: '这是什么',
      },
      why: {
        title: '为什么重要',
        description: '该路由属于公开展示目录的一部分。',
      },
      try: {
        title: '可以尝试什么',
      },
      source: {
        title: '源码位置',
      },
      demo: {
        title: '预览外壳',
        description: '专属演示尚未实现，但路由已经可加载。',
        stateTitle: '兜底页已启用',
        stateDescription: '该页面保留导航、目录元数据、相关链接与源码引用。',
      },
      catalog: {
        title: '同组更多页面',
        description: '使用目录卡片浏览相邻展示页面。',
      },
    },
    remaining: {
      tags: {
        value: '价值',
        explanation: '原因',
        technical: '技术',
      },
      demos: {
        'catalog-overview': {
          description: '浏览承载产品演示、设计系统、运行时与交付故事的核心能力路由。',
        },
        'catalog-components': {
          description: '从一个分组入口扫视组件、表格、表单、图表与反馈路由，再进入聚焦演示。',
        },
        'catalog-single-group': {
          description: '查看当前能力组的相邻路由，并跳转到与你任务匹配的聚焦实现。',
        },
        'component-primevue-adapter': {
          description: '调整状态、尺寸和禁用态，查看 PrimeVue 控件如何跟随应用主题。',
        },
        'component-empty-state': {
          description: '触发 EmptyState 操作，确认空结果仍然解释下一步可做什么。',
        },
        'component-icons': {
          description: '切换批准的图标名称，比较图标如何辅助识别而不替代文案。',
        },
        'component-c-scrollbar': {
          description: '查看固定高度 CScrollbar 区域、稳定行、本地滚动与 token 感知交互。',
        },
        'feedback-dialog-toast': {
          description:
            '在一个反馈表面打开 dialog、message、toast、空状态、图标标题与滚动事件记录。',
        },
        'chart-overview': {
          description: '通过共享图表包装和纯数据配置比较采用度与信心信号。',
        },
        'chart-theme': {
          description: '查看主题感知图表如何跟随当前 token 色板，而不硬编码序列颜色。',
        },
        'chart-responsive': {
          description: '切换紧凑宽度，确认容器变化时图表仍然可读。',
        },
        'chart-states': {
          description: '切换加载状态，同时保留图表布局、标签与周边产品文案。',
        },
        'chart-events': {
          description: '观察 ready 与 finished 计数如何由包装事件更新，而不直接访问图表运行时。',
        },
        'chart-dashboard-preview': {
          description: '用紧凑图表预览看板就绪度，而不是嵌入完整看板页面。',
        },
        'hook-theme-switching': {
          description: '切换主题运行时状态，确认页面在变化期间保留本地内容。',
        },
        'hook-locale-switching': {
          description: '通过演示控件切换语言，并确认可见状态读数原地更新。',
        },
        'hook-http-flow': {
          description: '以产品状态阅读请求流程边界，视图不直接发起远程调用。',
        },
        'hook-auth-permission': {
          description: '把权限状态作为只读页面信号，用于受控 UI 决策。',
        },
        'hook-layout-runtime': {
          description: '查看运行时驱动应用壳的布局模式与断点信号。',
        },
        'hook-responsive-device': {
          description: '比较布局、图表与能力页面使用的响应式设备信号。',
        },
        'utils-date': {
          description: '通过批准的日期工具查看日期格式化、智能标签与工作日检查。',
        },
        'utils-safe-storage': {
          description: '预览偏好数据编码结果与通过安全存储编解码路径恢复的值。',
        },
        'utils-state-persistence': {
          description: '比较持久化编解码输出与应用偏好使用的恢复状态字段。',
        },
        'runtime-overview': {
          description: '查看浏览器、请求、布局与状态归属边界，不调用平台 API。',
        },
        'runtime-http': {
          description: '把应用持有的请求边界作为产品能力检查，而不是传输细节。',
        },
        'runtime-browser': {
          description: '确认浏览器特定行为留在 Web 应用内，并与桌面能力分离。',
        },
        'runtime-layout': {
          description: '查看最终布局信号如何被 shell 渲染器与功能页面消费。',
        },
        'runtime-state-ownership': {
          description: '新增行为前先检查哪些状态属于 Store、页面与运行时适配器。',
        },
        'runtime-governance': {
          description: '以可见产品证据呈现交付纪律：归属、源码上下文与评审就绪。',
        },
        'runtime-desktop-boundary': {
          description: '把桌面边界作为只读 Web 镜像阅读，本页不直接使用桌面 API。',
        },
        'design-tokens': {
          description: '查看语义 token 族，以及状态表面如何跨主题保持可读。',
        },
        'design-unocss': {
          description: '把语义工具类作为页面组合的封闭视觉语言进行检查。',
        },
        'design-material': {
          description: '比较 solid、elevated 与 panel 材质，让层级服务内容结构。',
        },
        'design-density': {
          description: '把密度作为紧凑、舒适与宽松工作流的产品节奏阅读。',
        },
        'design-motion': {
          description: '把动效作为状态反馈检查，保持克制并照顾减少动效设置。',
        },
      },
      cards: {
        adapterOwnership: {
          title: '适配器归属',
          description: '运行时特定行为留在应用适配器与页面注入边界之后。',
        },
        authPermission: {
          title: '权限信号',
          description: '权限状态作为 UI 信号可见，而不把页面耦合到导航逻辑。',
        },
        browserRuntime: {
          title: '浏览器运行时',
          description: '浏览器能力保持可读，同时平台特定工作保持分离。',
        },
        catalogMap: {
          title: '目录地图',
          description: '路由、标题、源码路径与相关页面都来自展示目录。',
        },
        chartEvents: {
          title: '图表事件',
          description: '包装事件呈现为页面反馈，而不是进入图表内部。',
        },
        chartStates: {
          title: '图表状态',
          description: '加载与空结果类状态显示在图表旁边，而不是藏在代码里。',
        },
        chartWrapper: {
          title: '图表包装',
          description: '图表通过共享包装渲染，配置只包含数据并接收主题合并。',
        },
        componentAdapter: {
          title: '组件适配器',
          description: 'PrimeVue 控件遵循应用样式与服务约定。',
        },
        dashboardPreview: {
          title: '看板预览',
          description: '看板信号被摘要展示，而不加载完整看板体验。',
        },
        dateFormatting: {
          title: '日期格式化',
          description: '日期文案通过日期工具流转，让语言与时区行为一致。',
        },
        deliveryDiscipline: {
          title: '交付纪律',
          description: '每个路由都携带可见价值、源码上下文与评审说明。',
        },
        densityScale: {
          title: '密度尺度',
          description: '密度选择让紧凑与舒适工作流的扫视节奏明确。',
        },
        desktopBoundary: {
          title: '桌面边界',
          description: '桌面行为以只读上下文呈现，不发起直接平台调用。',
        },
        deviceSignals: {
          title: '设备信号',
          description: '响应式状态作为运行时信号读取，不在视图内猜测。',
        },
        dialogFacade: {
          title: 'Dialog 门面',
          description: 'Dialog 通过共享反馈路径打开，让覆盖层行为保持一致。',
        },
        emptyStateReady: {
          title: '空状态就绪',
          description: '空状态包含操作文案与可见恢复路径。',
        },
        feedbackLoop: {
          title: '反馈闭环',
          description: '交互写入可见页面反馈，评审者能看到变化。',
        },
        hookScenario: {
          title: 'Hook 场景',
          description: 'Hook 输出通过产品状态呈现，而不是只给开发者的日志。',
        },
        httpBoundary: {
          title: '请求边界',
          description: '请求能力通过应用行为描述，而不是裸传输调用。',
        },
        iconLanguage: {
          title: '图标语言',
          description: '图标辅助识别，文本仍然负责表达含义。',
        },
        layoutRuntime: {
          title: '布局运行时',
          description: '布局状态先完成归一，再被页面组件消费。',
        },
        layoutSignals: {
          title: '布局信号',
          description: '断点、密度与 shell 模式读数保持可见，方便评审。',
        },
        localeRuntime: {
          title: '语言运行时',
          description: '语言切换会同时更新文案与相关日期行为。',
        },
        materialRules: {
          title: '材质规则',
          description: '材质解释层级，而不是为密集内容增加装饰。',
        },
        motionRules: {
          title: '动效规则',
          description: '动效只用于状态反馈，并避免布局位移。',
        },
        noRawRuntime: {
          title: '无裸运行时调用',
          description: '视图避免直接使用平台、网络与持久化原语。',
        },
        plainCopy: {
          title: '清晰文案',
          description: '页面先解释用户价值，再展示源码细节。',
        },
        primeControls: {
          title: 'PrimeVue 控件',
          description: '交互控件使用批准的 PrimeVue 组件表面。',
        },
        productEntry: {
          title: '产品入口',
          description: '首屏说明可以试什么，以及该能力为什么重要。',
        },
        reducedMotion: {
          title: '减少动效',
          description: '动效保持克制，即使移除也不损失含义。',
        },
        resizeAware: {
          title: '尺寸感知',
          description: '图表与布局通过共享运行时支持响应容器尺寸变化。',
        },
        safePersistence: {
          title: '安全持久化',
          description: '偏好数据通过批准的持久化路径编码与恢复。',
        },
        scrollRegion: {
          title: '局部滚动区域',
          description: '可滚动演示使用固定高度 CScrollbar 区域。',
        },
        semanticShortcuts: {
          title: '语义快捷类',
          description: '视觉结构来自语义工具类，而不是一次性样式。',
        },
        sourceTrace: {
          title: '源码追踪',
          description: '源码链接放在最后，让产品行为保持优先。',
        },
        stateOwnership: {
          title: '状态归属',
          description: 'Store、页面与适配器职责保持分离并可见。',
        },
        stateRestore: {
          title: '状态恢复',
          description: '恢复值以可读状态展示，而不是隐藏的持久化输出。',
        },
        themeAware: {
          title: '主题感知',
          description: '控件与演示跟随当前主题，不使用局部颜色覆盖。',
        },
        themeRuntime: {
          title: '主题运行时',
          description: '主题模式作为运行时信号更新 UI，而不重挂载页面。',
        },
        tokenFamilies: {
          title: 'Token 族',
          description: '画布、文本、品牌与状态角色在不同表面保持语义化。',
        },
        toastMessage: {
          title: 'Toast 消息',
          description: 'Toast 反馈通过应用门面发送，并包含清晰标题与详情。',
        },
      },
      controls: {
        primary: '主',
        success: '成功',
        warn: '警告',
        small: '小',
        normal: '标准',
        large: '大',
        sparkles: '亮点',
        layout: '布局',
        storage: '存储',
        shield: '防护',
        severity: '状态',
        size: '尺寸',
        disabled: '禁用',
        adapterAction: '适配器操作',
        adapterTag: '适配器标签',
        icon: '图标',
      },
      component: {
        emptyTitle: '暂无事项需要处理',
        emptyDescription: '空状态保持恢复操作可见，不增加额外页面结构。',
        emptyAction: '记录操作',
        emptyActionMessage: '空状态操作已记录。',
        emptyCount: '已记录操作：{count}',
        scrollTitle: '固定高度滚动区域',
        scrollDescription: '列表行保留在局部 CScrollbar 中，页面布局保持稳定。',
        scrollItem: '可滚动行 {index}',
      },
      chart: {
        wrapperDriven: '包装驱动',
        readyCount: 'Ready {count}',
        finishedCount: 'Finished {count}',
        compactWidth: '紧凑宽度',
        loading: '加载',
        overview: {
          note: '概览图表使用纯数据序列比较采用度与信心。',
        },
        theme: {
          note: '主题模式变化由图表包装与 token 运行时处理。',
        },
        responsive: {
          note: '紧凑模式改变容器，包装保持渲染稳定。',
        },
        states: {
          note: '加载状态由包装控制，图表表面保持稳定。',
        },
        events: {
          note: 'Ready 与 finished 事件记录为本地页面反馈。',
        },
        'dashboard-preview': {
          note: '雷达预览汇总看板就绪度，不加载完整看板。',
        },
      },
      feedback: {
        actionsTitle: '反馈操作',
        actionsDescription: '在同一个操作组中触发 Dialog、Message、Toast 与空状态反馈。',
        openDialog: '打开 Dialog',
        showMessage: '显示 Message',
        showToast: '显示 Toast',
        dialogTitle: '反馈 Dialog',
        dialogMessage: 'Dialog 已通过共享反馈路径打开。',
        messageTitle: 'Message 已发送',
        messageBody: 'Message 门面产生了本地反馈。',
        toastTitle: 'Toast 已发送',
        toastBody: 'Toast 门面产生了本地反馈。',
        emptyTitle: '反馈从空状态开始',
        emptyDescription: '使用控件添加 dialog、message、toast 与空状态事件。',
        emptyAction: '添加空状态事件',
        emptyActionTitle: '空状态操作',
        emptyActionBody: '空状态操作已写入反馈记录。',
        logTitle: '反馈事件记录',
        noLogsTitle: '暂无反馈',
        noLogsDescription: '触发控件后，这个可滚动记录会填充内容。',
        dialogOpened: 'Dialog 已打开',
        messageShown: 'Message 已显示',
        toastShown: 'Toast 已显示',
        emptyActionLogged: '空状态操作已记录',
      },
      hooks: {
        permissionAllowed: '允许',
        permissionLimited: '受限',
        themeMode: '主题模式',
        locale: '语言',
        layoutMode: '布局模式',
        breakpoint: '断点',
        permission: '权限',
        toggleTheme: '切换主题',
        toggleLocale: '切换语言',
        badges: {
          'theme-switching': '主题切换',
          'locale-switching': '语言切换',
          'http-flow': '请求流程',
          'auth-permission': '认证与权限',
          'layout-runtime': '布局运行时',
          'responsive-device': '响应式设备',
        },
        'theme-switching': {
          title: '主题切换状态',
          description: '主题变化会更新运行时状态，同时页面保留本地内容。',
        },
        'locale-switching': {
          title: '语言切换状态',
          description: '语言变化会在一次流程中更新可见文案与相关格式化。',
        },
        'http-flow': {
          title: '请求流程边界',
          description: '请求状态被建模为应用能力，而不是视图中的直接传输。',
        },
        'auth-permission': {
          title: '权限读数',
          description: '权限检查被消费为受控行为的 UI 状态。',
        },
        'layout-runtime': {
          title: '布局运行时读数',
          description: '生效模式与断点来自布局运行时。',
        },
        'responsive-device': {
          title: '响应式设备读数',
          description: '设备状态帮助页面与图表适配，而不做局部猜测。',
        },
      },
      utils: {
        dateFormat: '格式化日期',
        dateSmart: '智能日期',
        workingDay: '工作日',
        encodedLength: '编码长度',
        decodedScope: '解码范围',
        decodedMode: '解码模式',
        codec: '编解码器',
        restoredTheme: '恢复主题',
        restoredScope: '恢复范围',
        initialized: '已初始化',
        locale: '语言',
        timezone: '时区',
        overview: {
          note: '工具路由按面向用户的职责组织确定性 helper。',
        },
        date: {
          note: '日期 helper 通过统一日期策略格式化可见文案。',
        },
        'safe-storage': {
          note: '安全存储预览展示编码后的偏好状态与恢复值。',
        },
        'state-persistence': {
          note: '状态持久化使用恢复值中展示的同一编解码路径。',
        },
      },
      runtime: {
        http: {
          title: '请求运行时',
          description: '请求通过应用持有的适配器与可复用 hook 进入。',
          focusTitle: '请求运行时重点',
          focusDescription: '让请求行为保持可注入，并在应用边界可见。',
        },
        browser: {
          title: '浏览器运行时',
          description: '浏览器能力留在 Web 应用运行时与支持适配器中。',
          focusTitle: '浏览器运行时重点',
          focusDescription: '让浏览器专属工作与桌面能力分开。',
        },
        layout: {
          title: '布局运行时',
          description: '布局模式、断点与密度在渲染前完成归一。',
          focusTitle: '布局运行时重点',
          focusDescription: '页面组件消费布局状态，但不持有 shell。',
        },
        stateOwnership: {
          title: '状态归属',
          description: '持久状态有明确 Store 所有者；页面状态保持局部。',
        },
        overview: {
          focusTitle: '运行时概览重点',
          focusDescription: '新增运行时能力前先检查边界地图。',
        },
        'state-ownership': {
          focusTitle: '状态归属重点',
          focusDescription: '接线前先选择 Store、页面或适配器归属。',
        },
        governance: {
          focusTitle: '交付重点',
          focusDescription: '能力页面携带源码上下文与可评审产品文案。',
        },
        'desktop-boundary': {
          focusTitle: '桌面边界重点',
          focusDescription: '本 Web 页面镜像桌面归属，但不导入桌面 API。',
        },
      },
      design: {
        rows: {
          primary: {
            title: 'Primary',
            description: '用于选中操作与重要状态的品牌强调。',
          },
          success: {
            title: 'Success',
            description: '具备可读对比度的正向完成状态。',
          },
          warn: {
            title: 'Warning',
            description: '用于可恢复风险的注意状态。',
          },
          info: {
            title: 'Info',
            description: '用于次级产品上下文的中性引导。',
          },
          solid: {
            title: 'Solid',
            description: '适合密集阅读与重复内容的稳定表面。',
          },
          elevated: {
            title: 'Elevated',
            description: '适合聚焦演示与成组控件的前景表面。',
          },
          panel: {
            title: 'Panel',
            description: '只在层级能解释上下文时使用的覆盖层材质。',
          },
        },
        semantic: {
          title: '语义组合',
          description: '页面使用语义类，让主题变化后含义保持一致。',
        },
        density: {
          title: '密度节奏',
          description: '间距与控件尺寸支持扫视，同时避免内容拥挤。',
        },
        motion: {
          title: '动效克制',
          description: '动效解释状态变化，并且可以安全减少。',
        },
      },
    },
    proTable: {
      badges: {
        proTableOnly: '仅 ProTable',
      },
      modes: {
        overview: {
          label: '概览',
          demo: '紧凑能力地图展示这些 ProTable 页面如何共享类型化行、列、源码链接与暴露 API 控件。',
          tableTitle: 'ProTable 能力地图',
        },
        basic: {
          label: '基础',
          demo: '基础 ProTable 路由包含本地数据、工具栏搜索、分页、空状态与源码驱动文案。',
          tableTitle: '基础能力行',
        },
        columns: {
          label: '列配置',
          demo: '列控件隐藏或显示所有者列，状态读取会展示隐藏列数量。',
          tableTitle: '列配置',
        },
        'sorting-filtering': {
          label: '排序与过滤',
          demo: '点击列头排序，使用全局搜索，并通过 PrimeVue 状态过滤收窄行。',
          tableTitle: '可排序过滤行',
        },
        pagination: {
          label: '分页',
          demo: '页大小与页码变化会通过 ProTable 状态读取保持可见。',
          tableTitle: '分页指标',
        },
        'server-request': {
          label: '服务端请求',
          demo: 'request 模式通过异步本地适配器处理确定性数据，并遵守 page、pageSize、全局搜索与排序。',
          tableTitle: '请求模式行',
        },
        states: {
          label: '表格状态',
          demo: '切换加载与空状态，同时保留表格、空状态插槽与方法摘要。',
          tableTitle: '状态演示行',
        },
        selection: {
          label: '选择',
          demo: '复选选择、清空选择、选中导出与行聚焦都会反馈到本地页面文案。',
          tableTitle: '可选择行',
        },
        'toolbar-density': {
          label: '工具栏与密度',
          demo: 'ProTable 工具栏在一个表面内持有搜索、密度、刷新、全屏、导出与列设置。',
          tableTitle: '工具栏密度行',
        },
        'virtual-infinite': {
          label: '虚拟与无限滚动',
          demo: '在虚拟行与无限请求加载之间切换；两种滚动模式都禁用分页。',
          tableTitle: '滚动行',
        },
        'export-refresh': {
          label: '导出与刷新',
          demo: '使用当前页导出、选中导出、刷新、清空选择与状态读取，结果不写入 console。',
          tableTitle: '可导出行',
        },
        'cell-rendering': {
          label: '单元格渲染',
          demo: '单元格展示使用 valueEnum 状态标签、对齐、数字字段与文本列，不使用自定义渲染器。',
          tableTitle: '单元格展示行',
        },
        'form-composition': {
          label: '表单组合',
          demo: 'PrimeVue 所有者过滤围绕 ProTable 组合，但该页面仍是 ProTable 展示，不是 ProForm 路由。',
          tableTitle: '组合过滤行',
        },
        'api-events': {
          label: 'API 与事件',
          demo: 'apiExecutor 模式将行、排序、过滤、分页、刷新与请求事件记录到本地状态。',
          tableTitle: 'API executor 行',
        },
      },
      columns: {
        capability: '能力',
        owner: '所有者',
        status: '状态',
        priority: '优先级',
        records: '记录数',
        workflow: '推荐操作',
        signal: '用户价值',
      },
      status: {
        guarded: '受护栏保护',
        preview: '预览',
        ready: '就绪',
        request: '请求',
      },
      owners: {
        adapter: '应用适配器',
        catalog: '展示目录',
        core: '运行时中立 core',
        vueUi: 'CCD Vue UI 包',
        webDemo: 'web-demo 视图',
      },
      filters: {
        status: '状态过滤',
        owner: '所有者过滤',
        scrollMode: '滚动模式',
        allStatuses: '全部状态',
        allOwners: '全部所有者',
      },
      virtualModes: {
        virtual: '虚拟滚动',
        infinite: '无限请求',
      },
      controls: {
        loading: '加载态',
        empty: '空状态',
        columns: '列控件',
        hideOwner: '隐藏所有者',
        showOwner: '显示所有者',
        reload: '刷新',
        clearSelection: '清空选择',
        getState: '读取状态',
        getFetchState: '读取请求状态',
        exportPage: '导出当前页',
        exportSelected: '导出选中',
      },
      toolbar: {
        title: '表格操作',
        description: '在数据表面附近运行表格方法，并查看状态反馈。',
      },
      actions: {
        ready: '使用控件调用 ProTable 暴露方法，并在这里查看结果。',
        reloaded: '已调用 reload()。请求模式会重新执行适配器，本地表格会触发 refresh。',
        selectionCleared: '已调用 clearSelection()，本地选中行副本已重置。',
        stateRead: '已调用 getState()，下方状态摘要会反映分页、过滤、排序与列设置。',
        fetchRead: '已调用 getFetchState()，下方请求摘要会反映当前请求状态。',
        exportedPage: '已针对当前可见行调用 exportData("page")。',
        exportedSelected: '已针对 {count} 条选中行调用 exportData("selected")。',
        ownerColumnShown: '所有者列已重新显示。',
        ownerColumnHidden: '已通过 toggleColumnVisibility() 隐藏所有者列。',
      },
      state: {
        title: '表格状态',
        empty: '尚未读取状态。',
        none: '无',
        summary:
          '第 {page} 页，页大小 {pageSize}，总数 {total}，排序 {sort}，隐藏列 {hidden}，过滤 {filter}。',
      },
      fetch: {
        title: '请求状态',
        empty: '尚未读取请求状态。',
        noError: '无请求错误',
        summary: '加载 {loading}，错误 {error}，还有更多 {hasMore}，消息：{message}。',
      },
      booleans: {
        yes: '是',
        no: '否',
      },
      selection: {
        title: '选择与行聚焦',
        summary: '已选 {count} 条。最后聚焦行：{row}。',
      },
      events: {
        title: '事件记录',
        empty: '与表格交互后会在这里记录事件。',
        manual: '手动刷新',
        refresh: 'refresh：{detail}',
        rowClick: 'row-click：{detail}',
        sort: 'sort-change：{detail}',
        filter: 'filter-change：{detail}',
        page: 'page-change：{detail}',
        requestError: 'request-error：{detail}',
      },
      empty: {
        title: '没有匹配的 ProTable 行',
        description: '清除过滤或关闭空状态开关即可恢复确定性演示行。',
      },
      rows: {
        none: '暂无聚焦行',
        'typed-columns': {
          capability: '可复用表格起点',
          workflow: '先定义类型化列与稳定行字段，再叠加更丰富的表格行为。',
          signal: '团队获得可预期、易扩展的表格基础。',
        },
        'local-data': {
          capability: '可靠演示内容',
          workflow: '使用稳定示例行比较表格状态，不改变数据故事。',
          signal: '评审者可以专注检查行为，而不必担心数据是否变化。',
        },
        toolbar: {
          capability: '表格操作中心',
          workflow: '把搜索、刷新、导出、密度与列设置放在表格附近。',
          signal: '用户可以在表格上下文内完成常见操作。',
        },
        pagination: {
          capability: '逐页查看',
          workflow: '为中等规模结果集提供可预期的页大小。',
          signal: '用户浏览密集数据时仍能保持位置感。',
        },
        'server-request': {
          capability: '服务端式加载',
          workflow: '只加载当前页，并在刷新时保留搜索和排序选择。',
          signal: '大数据集保持响应顺畅，同时不暴露实现细节。',
        },
        'state-slots': {
          capability: '清晰表格状态',
          workflow: '用说明性文案呈现加载与空结果。',
          signal: '用户能理解表格是在等待、为空，还是已经可操作。',
        },
        selection: {
          capability: '批量选择准备',
          workflow: '让用户选择行、清空选择集，并只导出已选择项目。',
          signal: '批量工作流保持明确且可撤回。',
        },
        density: {
          capability: '可调阅读密度',
          workflow: '让用户按当前表格选择合适的扫视节奏。',
          signal: '紧凑与舒适阅读模式可用，同时不改变整个应用。',
        },
        'virtual-scroll': {
          capability: '长列表扫视',
          workflow: '当用户需要连续查看大量行时使用虚拟滚动。',
          signal: '大量行仍然可用，不需要沉重的分页界面。',
        },
        'infinite-scroll': {
          capability: '渐进加载',
          workflow: '用户继续向下浏览时追加更多行。',
          signal: '探索型结果集可以保持浏览节奏。',
        },
        'export-refresh': {
          capability: '刷新与分享',
          workflow: '刷新可见数据，并导出当前页或选中行。',
          signal: '用户可以把表格结果带入后续工作。',
        },
        'value-enum': {
          capability: '易读状态单元格',
          workflow: '用一致的标签和状态强度呈现状态值。',
          signal: '用户可以一眼识别就绪、预览和请求状态。',
        },
        'form-filters': {
          capability: '聚焦过滤控件',
          workflow: '当完整表单过重时，把简单过滤器放在表格附近。',
          signal: '用户可以快速收窄表格，同时留在当前视图。',
        },
        'api-events': {
          capability: '可见交互反馈',
          workflow: '把行点击、排序、过滤、分页、刷新与请求事件显示为页面反馈。',
          signal: '用户能看到表格交互确实产生了状态变化。',
        },
        'source-links': {
          capability: '实现上下文可追溯',
          workflow: '演示结束后仍保留相邻页面与实现入口。',
          signal: '开发者需要时可以从产品行为进入更深上下文。',
        },
        governance: {
          capability: '发布前就绪',
          workflow: '按产品团队分享前的同一流程检查页面。',
          signal: '展示页既适合产品评审，也方便开发者继续跟进。',
        },
      },
      features: {
        typedRows: {
          title: '先定义类型化行',
          description: '行、列、状态值与所有者过滤在进入模板前都已经类型化。',
          tag: '类型',
        },
        toolbar: {
          title: '工具栏归 ProTable 持有',
          description: '搜索、刷新、密度、全屏、导出与列设置都保留在 ProTable 内。',
          tag: '工具栏',
        },
        stateEvidence: {
          title: '状态可检查',
          description: '演示会调用 getState() 与 getFetchState()，并把结果渲染到本地页面文案。',
          tag: '状态',
        },
        catalogSource: {
          title: '目录关联页面',
          description: '每个页面都通过既有 showcase 目录源码路径和相关路由模型解析。',
          tag: '目录',
        },
        pagination: {
          title: '分页契约',
          description: '页码与页大小变化通过 ProTable 分页 props 处理，并能通过状态读取看到。',
          tag: '分页',
        },
        columns: {
          title: '普通列对象',
          description:
            '列预设使用 field、width、alignment、sortable 与 valueEnum，不使用 Vue render helper。',
          tag: '列',
        },
        cellValueEnum: {
          title: 'Value enum 渲染',
          description: '状态单元格通过 valueEnum 标签与 severity 渲染，页面不需要 renderer。',
          tag: '单元格',
        },
        filters: {
          title: '过滤组合',
          description: 'PrimeVue Select 控件收窄本地行，同时保留 ProTable 全局搜索。',
          tag: '过滤',
        },
        request: {
          title: '请求边界',
          description: '请求示例使用异步本地适配器或 apiExecutor 注入，视图中没有 raw fetch。',
          tag: '请求',
        },
        apiEvents: {
          title: '事件留在页面上',
          description: '行、排序、过滤、分页、刷新与请求事件会记录到页面状态。',
          tag: '事件',
        },
        states: {
          title: '完整状态',
          description: '加载与空状态由本地控件驱动，并使用批准的 ProTable empty slot。',
          tag: '状态',
        },
        selection: {
          title: '选择方法',
          description: '选择使用 checkbox 模式、v-model:selected、clearSelection() 与选中行导出。',
          tag: '选择',
        },
        exportRefresh: {
          title: '导出与刷新',
          description: '可见控件调用 reload() 与 exportData()，摘要保留在页面内。',
          tag: '操作',
        },
        virtualInfinite: {
          title: '滚动模式',
          description: '虚拟与无限演示只使用受支持的 virtualScroll 与 infiniteScroll props。',
          tag: '滚动',
        },
        formComposition: {
          title: '不进入 ProForm',
          description: '本页展示围绕表格的小型 PrimeVue 控件，但不实现 ProForm 路由。',
          tag: '组合',
        },
        apiExecutor: {
          title: '注入式 API executor',
          description: 'apiUrl 模式委托给应用持有的本地数据 executor，让 ProTable 保持运行时中立。',
          tag: 'API',
        },
      },
      technical: {
        proTableOnly: {
          title: '只使用 ProTable 包装',
          description: '展示页面使用 ProTable，视图代码不直接使用 DataTable 或 Column。',
        },
        i18nCopy: {
          title: '可见文案本地化',
          description: '页面标题、控件、行标签、特性卡片与技术说明都由 locale 提供。',
        },
        catalogSource: {
          title: '目录源码路径',
          description: '每个路由保留目录源码路径，并把共享壳、数据与列文件加入源码链接。',
        },
        noRenderers: {
          title: '没有 Vue h 或 TSX renderer',
          description: '列表现依靠 valueEnum、对齐与普通字段，不使用自定义 render 函数。',
        },
        stateEvidence: {
          title: '暴露 API 证据',
          description:
            'reload、clearSelection、getState、getFetchState 与 exportData 都由可见控件触发。',
        },
        apiBoundary: {
          title: '注入式请求边界',
          description: 'request 与 apiExecutor 演示都操作确定性本地数据，不使用 raw fetch。',
        },
      },
    },
    proForm: {
      badges: {
        proFormOnly: 'ProForm 包装',
      },
      modes: {
        overview: {
          label: '概览',
          demo: '紧凑录入表单集中展示 schema 字段、计算价格、可见反馈与源码入口。',
        },
        'basic-schema': {
          label: '基础 schema',
          demo: '基础请求表单组合标签、辅助说明、默认值、字段规则与本地提交摘要。',
        },
        'grouped-layout': {
          label: '分组布局',
          demo: '请求字段与计划字段按任务分组，让较长表单在进入技术细节前仍然可读。',
        },
        validation: {
          label: '校验',
          demo: '提交或校验表单，查看必填字段、resolver 消息与状态摘要如何在页面内更新。',
        },
        'dependencies-computed': {
          label: '依赖与计算',
          demo: '切换套餐或席位数，依赖价格字段会自动计算月度成本。',
        },
        'conditional-visibility': {
          label: '条件显示',
          demo: '切换审批与风险，字段会按需要显示、必填或禁用。',
        },
        reactions: {
          label: '联动反应',
          demo: '发布就绪状态与联系偏好会通过表单联动更新跟进字段，并反馈到事件区。',
        },
        'async-data': {
          label: '异步数据',
          demo: '切换区域后，本地负责人选项会异步加载，同时表单保持可交互。',
        },
        'field-arrays': {
          label: '字段数组',
          demo: '里程碑可以新增、删除、排序，并保持为同一份提交值的一部分。',
        },
        'plugins-draft': {
          label: '插件与草稿',
          demo: '草稿控件通过批准的草稿 API 保存、恢复与清理未完成表单文案。',
        },
        'submit-states': {
          label: '提交状态',
          demo: '本地结果开关让评审者无需网络请求即可比较空闲、提交中、成功与错误反馈。',
        },
        'api-events': {
          label: 'API 与事件',
          demo: '可见方法控件会读取取值、校验、提交，并把事件反馈记录到页面。',
        },
      },
      controls: {
        validate: '校验',
        getValues: '读取取值',
        getFormState: '读取表单状态',
        submitApi: '调用提交',
        saveDraft: '保存草稿',
        readDraft: '读取草稿',
        clearDraft: '清除草稿',
        submit: '提交请求',
      },
      actions: {
        ready: '使用控件校验、提交并检查表单，无需打开开发者工具。',
        valid: '校验通过，表单可以提交。',
        invalid: '校验发现缺失或不完整字段，消息已显示在输入项旁边。',
        valuesRead: '当前表单取值已读取，并在下方摘要显示。',
        stateRead: '表单状态已读取，并在下方摘要显示。',
        submitCalled: '页面控件已调用暴露的提交方法。',
        draftSaved: '当前草稿已保存。',
        draftLoaded: '已把保存的草稿恢复到表单。',
        draftCleared: '保存的草稿已清除。',
        submitting: '正在本地提交字段：{fields}。',
        submitted: '已本地提交字段：{fields}。',
        submitFailed: '本地提交返回错误状态，没有发起远程请求。',
      },
      submitState: {
        title: '提交结果预览',
        shortTitle: '提交状态',
        description: '切换错误路径，对比结果反馈，同时保持所有状态本地化。',
        forceError: '使用错误结果',
        idle: '空闲',
        submitting: '提交中',
        success: '成功',
        error: '错误',
      },
      state: {
        title: '表单状态',
        empty: '尚未读取表单状态。',
        valid: '有效',
        invalid: '无效',
        summary: '已变更 {dirty}，有效 {valid}，提交中 {submitting}，错误字段 {errors}。',
      },
      values: {
        title: '当前取值',
        empty: '尚未读取取值。',
        none: '无',
        summary: '当前已有值字段：{fields}。',
      },
      draft: {
        empty: '尚未执行草稿操作。',
        pluginInstalled: '草稿插件已为当前演示路由注册。',
        pluginReady: '草稿插件已可用。',
        saved: '当前表单取值已保存为草稿。',
        loaded: '草稿已恢复到表单。',
        cleared: '草稿已清除。',
      },
      booleans: {
        yes: '是',
        no: '否',
      },
      events: {
        title: '事件记录',
        empty: '与表单交互后会在这里记录事件。',
        validate: 'validate：{detail}',
        values: 'getValues：{detail}',
        state: 'getFormState 有效：{detail}',
        submitApi: 'submit 方法：{detail}',
        submit: 'submit：{detail}',
      },
      fieldArray: {
        title: '里程碑',
        description: '使用列表控件管理同一份表单中的重复字段。',
        moveUp: '上移里程碑',
        moveDown: '下移里程碑',
        remove: '删除里程碑',
        placeholder: '新增里程碑',
        add: '新增里程碑',
      },
      groups: {
        request: '请求信息',
        planning: '计划信息',
      },
      options: {
        owners: {
          product: '产品',
          support: '支持',
          operations: '运营',
        },
        priorities: {
          high: '高',
          medium: '中',
          low: '低',
        },
        regions: {
          americas: '美洲',
          emea: '欧洲、中东与非洲',
          apac: '亚太',
        },
        plans: {
          starter: '入门',
          growth: '增长',
          scale: '规模化',
        },
        risks: {
          low: '低',
          medium: '中',
          high: '高',
        },
        events: {
          email: '邮件跟进',
          review: '评审会议',
          call: '客户电话',
        },
      },
      fields: {
        requestName: {
          label: '请求名称',
          description: '清楚命名面向用户的变更。',
          placeholder: '季度发布就绪',
        },
        ownerTeam: {
          label: '负责团队',
          description: '选择会处理该请求的团队。',
        },
        priority: {
          label: '优先级',
          description: '设置评审紧急程度。',
        },
        audience: {
          label: '受众',
          description: '描述谁会从该变更中受益。',
          placeholder: '客户成功经理',
        },
        summary: {
          label: '摘要',
          description: '用普通语言说明期望结果。',
          placeholder: '帮助团队准备面向客户的发布说明。',
        },
        needsApproval: {
          label: '需要审批',
          description: '只有需要评审时才显示审批说明。',
        },
        riskLevel: {
          label: '风险等级',
          description: '高风险会让审批说明变为必填。',
        },
        approvalNote: {
          label: '审批说明',
          description: '记录评审者为什么应该批准该请求。',
          placeholder: '说明审批背景与期望决策。',
        },
        mitigation: {
          label: '缓解计划',
          description: '只有高风险时启用。',
          placeholder: '描述如何降低发布风险。',
        },
        plan: {
          label: '套餐',
          description: '套餐选择会驱动计算单价。',
        },
        seatCount: {
          label: '席位数',
          description: '席位数会参与月度成本计算。',
        },
        seatPrice: {
          label: '席位价格',
          description: '根据选择的套餐计算。',
        },
        monthlyCost: {
          label: '月度成本',
          description: '由席位数与价格计算。',
        },
        region: {
          label: '区域',
          description: '区域控制本地负责人列表。',
        },
        assignee: {
          label: '负责人',
          description: '选项会在区域变化后加载。',
        },
        publishReady: {
          label: '可以发布',
          description: '启用后会自动更新跟进文案。',
        },
        eventPreference: {
          label: '跟进渠道',
          description: '渠道变化会更新跟进提示。',
        },
        followUp: {
          label: '跟进消息',
          description: '联动让这段文案与选择的工作流保持一致。',
          placeholder: '写下下一步客户沟通内容。',
        },
        milestones: {
          label: '里程碑',
          description: '重复字段仍然附着在同一份表单值上。',
        },
        draftTitle: {
          label: '草稿标题',
          description: '编辑该字段，保存草稿，再恢复它。',
          placeholder: '客户更新草稿',
        },
        draftSummary: {
          label: '草稿摘要',
          description: '这段草稿内容可以本地保存并恢复。',
          placeholder: '记录仍在编辑中的摘要。',
        },
      },
      defaults: {
        requestName: '发布就绪录入',
        audience: '面向客户的团队',
        summary: '准备一份清晰、易校验且可提交的请求。',
        deliveryWindow: '本季度',
        followUp: '评审后发送简洁更新。',
        readyFollowUp: '发布更新，并通知选定受众。',
        draftTitle: '客户更新草稿',
        draftSummary: '该草稿可以在演示页面保存、恢复与清除。',
      },
      validation: {
        requestNameRequired: '请求名称必填。',
        audienceRequired: '受众必填。',
        summaryLength: '摘要至少需要 12 个字符。',
        approvalNoteRequired: '高风险工作需要至少 10 个字符的审批说明。',
        milestonesRequired: '每个里程碑至少需要 3 个字符。',
      },
      reactionPlaceholders: {
        email: '编写邮件跟进内容。',
        review: '总结评审会议议程。',
        call: '准备客户电话备注。',
      },
      features: {
        schemaBasics: {
          title: 'Schema 描述表单',
          description: '字段、标签、辅助说明、默认值、布局 span 与规则都来自类型化 schema。',
          tag: 'Schema',
        },
        groupedLayout: {
          title: '分组易读',
          description: '相关字段按任务分组，用户可以按工作流扫视表单。',
          tag: '布局',
        },
        validation: {
          title: '校验可见',
          description: '字段规则与 resolver 结果会显示在输入旁边和页面摘要里。',
          tag: '校验',
        },
        dependenciesComputed: {
          title: '依赖驱动取值',
          description: '声明式依赖会更新计算字段，视图中不需要额外 watcher。',
          tag: '逻辑',
        },
        conditionalLogic: {
          title: '字段按需出现',
          description: '显示、禁用与必填状态会响应用户选择。',
          tag: '条件',
        },
        reactions: {
          title: '联动更新文案',
          description: '声明式 reactions 让下游字段值与属性跟随上游变化。',
          tag: '联动',
        },
        asyncOptions: {
          title: '异步选项保持本地',
          description: '选项加载器展示延迟数据，同时不发起远程请求。',
          tag: '选项',
        },
        fieldArrays: {
          title: '重复字段易管理',
          description: '里程碑可以新增、删除、排序，并保持在同一份表单内。',
          tag: '数组',
        },
        draftPlugin: {
          title: '草稿保留进度',
          description: '草稿控件让未完成表单文案可恢复，而不需要额外页面。',
          tag: '草稿',
        },
        submitStates: {
          title: '结果状态明确',
          description: '提交中、成功与错误结果都可见，并适合页面内评审。',
          tag: '提交',
        },
        apiEvents: {
          title: '表单 API 可检查',
          description: '方法控件把取值、状态、校验与提交结果读取到页面文案。',
          tag: 'API',
        },
        localFeedback: {
          title: '反馈留在页面',
          description: '用户无需打开控制台或离开路由，就能看到发生了什么变化。',
          tag: '反馈',
        },
      },
      technical: {
        proFormOnly: {
          title: '包装组件持有表单表面',
          description: '多字段演示都通过 CCD ProForm 包装渲染，而不是裸业务表单控件。',
        },
        schemaContracts: {
          title: '类型化 schema 契约',
          description: '共享 schema 工厂返回 FormSchema，包含声明式 deps、computed 与条件逻辑。',
        },
        validationResolver: {
          title: 'Resolver 契约',
          description:
            '校验页面使用 ValidationResolver，让字段错误与表单有效性共享同一种结果形状。',
        },
        exposedApis: {
          title: '暴露 API 控件',
          description: 'submit、validate、getValues 与 getFormState 都通过可见页面控件触发。',
        },
        localOnly: {
          title: '无远程依赖',
          description: '异步选项与提交状态使用确定性的本地时序，不调用远程服务。',
        },
        fieldArrayHook: {
          title: '字段数组上下文',
          description: '里程碑控件在表单 provider 上下文内使用 useFieldArray。',
        },
        pluginApi: {
          title: '插件注册',
          description: '草稿路由安装一个小型 ProFormPlugins 条目，用于展示插件注册。',
        },
        draftStorage: {
          title: '草稿存储 API',
          description: '草稿操作通过应用配置的 draft adapter 使用 DraftStorage。',
        },
      },
    },
  },
  console: {
    shared: {
      evidence: {
        title: '源码上下文',
        description: '为需要更多细节的开发者保留仓库路径与支撑事实。',
      },
      commands: {
        title: '可选技术检查',
        description: '开发脚本放在页面末尾，先保留产品行为说明，再提供技术验证线索。',
      },
    },
    routeEvidence: {
      title: '给开发者的导航细节',
      description: '页面保留稳定名称、图标与双语标签，让导航行为保持可预期。',
      modules: '模块',
      modulesValue: '顶层',
      modulesDetail: '路由模块保持在 apps/web-demo/src/router/modules 下。',
      metadata: '元数据',
      metadataValue: 'titleKey + icon',
      metadataDetail: '路由记录保持确定性的导航与标签行为。',
      locale: '语言',
      localeValue: 'en-US + zh-CN',
      localeDetail: '可见路由与控制台文案均覆盖两套语言树。',
    },
    settingsPage: {
      eyebrow: '系统',
      title: '全局设置',
      description: '以完整页面管理主题、尺寸、语言、布局模式、布局模块与响应式运行时预览。',
      runtimeTag: '复用运行时',
      nav: {
        appearance: '外观',
        sizeLocale: '尺寸与语言',
        layoutMode: '布局模式',
        layoutModules: '布局模块',
        preview: '预览',
      },
      appearance: {
        title: '外观',
        description: '主题模式与配色继续使用现有 theme store。',
      },
      sizeLocale: {
        title: '尺寸与语言',
      },
      layoutMode: {
        title: '布局模式',
        description: '本页写入 LayoutAdmin 已消费的同一 preferred layout mode。',
      },
      layoutModules: {
        title: '布局模块',
        description: '模块开关复用各布局模式下的既有可见性规则。',
      },
      preview: {
        title: '响应式预览',
        description: '展示来自设备、断点、布局与尺寸 Store 的当前运行时状态。',
        breakpoint: '断点',
        deviceType: '设备',
        effectiveMode: '生效布局',
        sizePreset: '尺寸预设',
      },
      sizeDescriptions: {
        compact: '紧凑密度适合高频重复操作。',
        comfortable: '舒适密度是应用默认节奏。',
        loose: '宽松密度提供更大的触控与扫视空间。',
      },
    },
    pages: {
      topology: {
        eyebrow: '基础',
        title: 'CCD 如何组织',
        description: '查看可复用类型、共享逻辑与应用体验如何各在其位，方便能力持续增长。',
      },
      packageBoundaries: {
        eyebrow: '基础',
        title: '复用包职责',
        description: '了解哪些能力属于复用包，哪些保留在应用内，以及这样如何降低改动风险。',
      },
      runtimeBoundaries: {
        eyebrow: '基础',
        title: '运行时放在哪里',
        description: '浏览器、HTTP、存储与桌面行为保留在应用适配器之后，不泄漏进共享逻辑。',
      },
      governance: {
        eyebrow: '交付',
        title: '导航与评审规则',
        description: '导航、权限、双语文案与评审检查让每个浏览器页面在发布前更容易检查。',
      },
      http: {
        eyebrow: '运行时',
        title: 'HTTP 与 Alova 运行时',
        description: '请求通过一条应用持有路径进入，让加载、重试、错误与反馈保持一致。',
      },
      safeStorage: {
        eyebrow: '运行时',
        title: 'safeStorage 运行时',
        description: '偏好存储由应用处理，让敏感行为靠近实际使用它的体验。',
      },
      browser: {
        eyebrow: '运行时',
        title: '浏览器运行时集成',
        description: '设备、语言、主题、尺寸与日期行为统一协调，让页面专注于用户任务。',
      },
      state: {
        eyebrow: '运行时',
        title: '状态归属与工具',
        description: '持久偏好、页面状态与辅助工具在新增行为前都有清晰归属。',
      },
      primevueAdapter: {
        eyebrow: 'UI',
        title: 'PrimeVue 适配器',
        description: 'PrimeVue 控件使用共享预设与 CCD 包装，让应用页面无需页面级样式也能一致。',
      },
      proForm: {
        eyebrow: 'UI',
        title: 'ProForm 能力',
        description: '表单演示把引导输入、校验、依赖字段与反馈呈现为可复用产品模式。',
      },
      proTable: {
        eyebrow: 'UI',
        title: 'ProTable 能力',
        description: '表格演示展示可读行、工具栏操作、分页、加载、空状态与行详情。',
      },
      charts: {
        eyebrow: 'UI',
        title: '图表运行时',
        description: '图表演示通过 CCD 包装展示 token 感知视觉、响应式恢复与稳定加载行为。',
      },
      feedback: {
        eyebrow: 'UI',
        title: '反馈与空状态',
        description: 'Dialog、Toast、EmptyState、图标与局部滚动组合成面向用户的反馈模式。',
      },
      theme: {
        eyebrow: '系统',
        title: '主题系统',
        description: '主题页面说明 token、预设与首屏行为如何让界面跨模式保持一致。',
      },
      sizeBreakpoints: {
        eyebrow: '系统',
        title: '尺寸与断点',
        description: '密度与断点行为帮助同一个产品表面适应紧凑和宽松屏幕。',
      },
      layout: {
        eyebrow: '系统',
        title: '布局运行时',
        description: '应用壳持有导航、标签页、面包屑、加载与刷新行为，让页面保持可预期。',
      },
      unocss: {
        eyebrow: '系统',
        title: 'UnoCSS 与设计引擎',
        description: '语义 UnoCSS 快捷类让页面组合保持一致，避免一次性视觉规则。',
      },
      desktopBoundary: {
        eyebrow: '桌面',
        title: '桌面边界镜像',
        description: '这个 Web 页面解释桌面能力归属，不调用桌面 API，也不修改桌面代码。',
      },
    },
    status: {
      topology: { label: '产品分层', value: '可复用分层' },
      runtimeAdapters: { label: '运行时适配', value: '应用适配器持有' },
      deliveryChecks: { label: '交付检查', value: '已开启' },
      clearExploration: { label: '清晰探索', value: '就绪' },
      languageReady: { label: '语言', value: '中文与英文' },
      reviewReadiness: { label: '评审就绪', value: '可见' },
      desktopUntouched: { label: '桌面代码', value: '未触碰' },
      desktopAdapter: { label: '桌面访问', value: '适配器持有' },
      desktopPlanning: { label: '桌面路线', value: '独立规划' },
    },
    stats: {
      publicPackages: { label: '公开包', detail: "{'@'}ccd 包导出面继续受治理。" },
      apps: { label: '应用', detail: 'web-demo 与 desktop 持有各自运行时适配器。' },
      validationGate: { label: '评审检查', detail: '专用检查保护共享能力边界。' },
      runtimeScans: {
        label: '运行时扫描',
        value: '严格',
        detail: 'contracts 与 core 拒绝浏览器、Node、Tauri、定时器与网络运行时。',
      },
      guidedExploration: {
        label: '清晰路径',
        value: '清楚',
        detail: '访问者可以从产品故事进入聚焦能力演示。',
      },
      stableEntry: {
        label: '稳定入口',
        value: '就绪',
        detail: '首页、面包屑、标签页与侧栏行为保持可预期。',
      },
      bilingualReadiness: {
        label: '双语体验',
        value: '就绪',
        detail: '公开文案覆盖两种支持语言。',
      },
      runtimeOwner: { label: '运行时所有者', detail: '具体运行时行为保留在浏览器应用中。' },
      clientAlova: {
        label: '客户端',
        detail: '业务代码仍禁止 Axios、裸 fetch 与 XMLHttpRequest。',
      },
      sharedUtilsBlocked: {
        label: '共享 helper',
        value: '应用内',
        detail: '存储与运行时 helper 在复用被证明前留在应用内。',
      },
      deviceRuntime: { label: '设备运行时', value: '单例', detail: '视口与断点状态只初始化一次。' },
      layoutRuntimeSsot: {
        label: '布局运行时',
        value: '单一事实源',
        detail: '渲染器消费最终运行时状态。',
      },
      storeOwners: {
        label: 'Store 所有者',
        value: '单一',
        detail: '每块状态只有一个 owner store。',
      },
      utilitiesMerged: {
        label: '工具',
        value: '已合并',
        detail: 'Lodash、ID、字符串与 caster 汇总为证据行。',
      },
      uiEcosystem: { label: 'UI 生态', detail: 'PrimeVue 仍是批准的控件集合。' },
      ptStyling: {
        label: '样式',
        value: 'PT 优先',
        detail: '语义 token 类与全局 PT 预设持有视觉状态。',
      },
      proFormSchemaSurface: {
        label: 'Schema 表面',
        detail: '分组、校验、依赖、联动、插件与事件保持 schema 驱动。',
      },
      schemaEngine: { label: '引擎', value: 'Schema', detail: '表单行为保持声明式与类型化。' },
      proTableDataSurface: {
        label: '数据表面',
        detail: '标准、服务端、虚拟、无限、列与事件模式保持为表格引擎职责。',
      },
      headlessBoundary: {
        label: '边界',
        value: '无头引擎',
        detail: '业务 HTTP 仍从应用请求适配器进入。',
      },
      chartWrapper: { label: '图表包装', detail: '视图不直接初始化 ECharts。' },
      reactiveTheme: {
        label: '主题',
        value: '响应式',
        detail: '图表配置接收 token 感知的主题合并。',
      },
      feedbackCentral: {
        label: '反馈',
        value: '集中化',
        detail: 'Toast 与 dialog 行为通过 CCD 抽象进入。',
      },
      emptyStatesReusable: {
        label: '空状态',
        value: '可复用',
        detail: "EmptyState 保持在 {'@'}ccd/vue-ui。",
      },
      semanticTokens: {
        label: 'Token',
        value: '语义化',
        detail: '画布、文本、品牌、状态与侧栏 token 族。',
      },
      contrastValidated: {
        label: '对比度',
        value: '已验证',
        detail: 'validate:tokens 持有语义对比度阈值。',
      },
      densityModes: { label: '密度', value: '三档', detail: '紧凑、舒适与宽松三档。' },
      breakpointRuntime: {
        label: '断点',
        value: '运行时',
        detail: '设备 store 为布局运行时与尺寸引擎供给状态。',
      },
      runtimeSsot: { label: '运行时 SSOT', value: 'layoutRuntime', detail: '渲染器消费最终状态。' },
      shellPreserved: { label: 'Shell', value: '保留', detail: '本分支不重写布局运行时。' },
      closedShortcuts: {
        label: '快捷类',
        value: '封闭',
        detail: 'semanticShortcuts.ts 是已审计注册表。',
      },
      rawStylesGuarded: {
        label: '裸样式',
        value: '受护栏保护',
        detail: '禁止裸 hex、rem/em 尺寸与裸 z-index。',
      },
      desktopAdapterPath: { label: '适配器路径', detail: '桌面运行时能力由 desktop 应用持有。' },
      updaterDeepLink: {
        label: '更新/深链',
        value: '延期',
        detail: '在桌面信任模型批准前保持延期。',
      },
    },
    capabilities: {
      contracts: {
        title: "{'@'}ccd/contracts",
        description: '只放接口、DTO 与跨运行时契约。',
        status: '运行时中立',
        bullets: { 0: '无 Vue', 1: '无浏览器 API', 2: '无存储或网络运行时' },
      },
      core: {
        title: "{'@'}ccd/core",
        description: '基于注入适配器契约的运行时中立编排。',
        status: '只依赖 contracts',
        bullets: { 0: '无 UI', 1: '无 HTTP 运行时', 2: '无 safeStorage 运行时' },
      },
      apps: {
        title: 'apps/*',
        description: '应用持有路由、视图、Store、适配器与具体运行时集成。',
        status: '运行时所有者',
        bullets: { 0: 'web-demo 持有浏览器运行时', 1: 'desktop 持有 Tauri 运行时' },
      },
      uiPrimitives: {
        title: 'UI primitives',
        description:
          "{'@'}ccd/vue-ui 持有 ProForm、ProTable、Icons、CScrollbar 与 dialog 等复用原语。",
        status: '公开包',
        bullets: { 0: '通过 package exports 暴露公开 API', 1: '不持有应用查询行为' },
      },
      primevueAdapter: {
        title: 'PrimeVue 适配器',
        description: "{'@'}ccd/vue-primevue-adapter 持有 PrimeVue 主题、PT 预设与服务门面。",
        status: '适配器包',
        bullets: { 0: 'PrimeVue 仍是批准方案', 1: '其他 UI 栈不在当前范围' },
      },
      appLocalCandidates: {
        title: '应用内候选',
        description: 'web-demo shared 候选保持应用内，直到单独抽取分支证明所有权与回滚方案。',
        status: '暂留应用内',
        bullets: { 0: 'HTTP 运行时留在应用内', 1: 'safeStorage 运行时留在应用内' },
      },
      browserBoundary: {
        title: '浏览器应用边界',
        description: 'apps/web-demo 持有浏览器入口、路由、Store、视图、插件、HTTP 与 safeStorage。',
        status: 'Web 运行时',
        bullets: { 0: 'alova 保持应用持有', 1: 'safeStorage 门面保持应用持有' },
      },
      desktopBoundary: {
        title: '桌面适配器边界',
        description: 'apps/desktop 持有 Tauri 适配器与 src-tauri 后端边界。',
        status: '此处分支只读',
        bullets: { 0: '包内无 invoke', 1: '本分支不做桌面重构' },
      },
      rbacMetadata: {
        title: 'RBAC 元数据',
        description: '路由角色与 auths 保持声明式，元素控制由 v-auth 持有。',
        status: '集中化',
        bullets: { 0: '不手动增删路由', 1: 'Store 不持有导航' },
      },
      wikiPortal: {
        title: 'Wiki 作为源门户',
        description: '架构更新进入 wiki/canonical，并刷新生成证据。',
        status: '维护中',
        bullets: { 0: 'README 保持薄入口', 1: '不恢复 docs 树' },
      },
      apiBuilders: {
        title: 'API 构造器',
        description: 'API 模块暴露类型化 method builder，并让 Store 远离 API 文件。',
        status: '类型化',
        bullets: { 0: 'DTO 三元模式', 1: '无默认 API 导出' },
      },
      requestHooks: {
        title: '请求 Hook',
        description: '视图通过 useHttpRequest 消费方法，保持全局 loading、重试与错误归一一致。',
        status: 'Hook 持有',
        bullets: { 0: '不重复处理 401', 1: '不重复全局 toast' },
      },
      piniaPersistence: {
        title: 'Pinia 持久化',
        description: '敏感 Store 与偏好 Store 在策略要求时使用加密序列化。',
        status: '加密',
        bullets: { 0: '用户 Store', 1: '权限 Store', 2: '布局与尺寸偏好' },
      },
      firstPaintExceptions: {
        title: '首屏例外',
        description: '主题与语言明文例外是窄启动许可，不是通用存储权限。',
        status: '受限',
        bullets: { 0: 'theme-mode', 1: 'locale', 2: 'Vite preload reload flag' },
      },
      themeAndSize: {
        title: '主题与尺寸',
        description: 'Token 变量、首屏预载与自适应尺寸由应用运行时协调。',
        status: 'Token-first',
        bullets: { 0: '无裸主题颜色', 1: '无临时布局媒体查询' },
      },
      visualReadiness: {
        title: '视觉就绪',
        description: 'E2E 视觉模式依赖确定性运行时信号，而不是 sleep。',
        status: '确定性',
        bullets: { 0: '原生预加载器就绪', 1: '运行时 loading 空闲', 2: '主题切换稳定' },
      },
      storeMatrix: {
        title: 'Store 矩阵',
        description: '用户、权限、布局、主题、尺寸、语言、设备与表格抽屉 Store 都有记录 owner。',
        status: '有边界',
        bullets: { 0: 'Store 不调用 API', 1: 'Store 不 push 路由' },
      },
      utilityPolicy: {
        title: '工具策略',
        description: '业务 cast 进入 typeCasters，深操作进入受治理 helper。',
        status: '可审计',
        bullets: { 0: '无业务 any', 1: '无内联通用工具函数' },
      },
      adapterPackage: {
        title: '适配器包',
        description: "{'@'}ccd/vue-primevue-adapter 持有主题预设、PT 预设与服务门面。",
        status: '包持有',
        bullets: { 0: 'Button PT', 1: '表单控件 PT', 2: '菜单 PT' },
      },
      appRegistration: {
        title: '应用注册',
        description:
          'web-demo 插件启动注册 PrimeVue、ProForm、ProTable、toast、dialog 与 scrollbar 集成。',
        status: '应用接线',
        bullets: { 0: '无包深导入', 1: '业务视图无裸 Toast' },
      },
      schemaDrivenForm: {
        title: 'Schema 驱动表单',
        description: '字段、依赖、选项与校验放在 schema 中，而不是散落在模板逻辑里。',
        status: '下方演示',
        bullets: { 0: '输入框', 1: '选择器', 2: '开关', 3: '文本域' },
      },
      typedColumns: {
        title: '类型化列',
        description: '列定义、枚举、行键与分页保持在类型化 ProTable 输入中。',
        status: '下方演示',
        bullets: { 0: '业务页无裸 DataTable', 1: '无原生 table 标记' },
      },
      renderingGuard: {
        title: '渲染护栏',
        description: '共享包装持有 DOM 尺寸门禁、可见性恢复与 KeepAlive 重绘行为。',
        status: '下方演示',
        bullets: { 0: '无裸 echarts.init', 1: '无硬编码图表颜色' },
      },
      uxPrimitives: {
        title: 'UX 原语',
        description:
          'Icons、EmptyState、PrimeDialog、Toast 与 CScrollbar 保持可复用且 token-aware。',
        status: '已合并',
        bullets: { 0: '无裸 alert 或 confirm', 1: '无宽泛 overflow-auto 容器' },
      },
      tokenFirstUi: {
        title: 'Token-first UI',
        description: '模板使用语义 UnoCSS 类与 CSS 变量，而不是裸颜色。',
        status: '启用',
        bullets: { 0: '无裸 hex', 1: '无 Tailwind 调色板类' },
      },
      adaptiveSizing: {
        title: '自适应尺寸',
        description: '根字号与布局尺寸由设备、断点、预设与像素比解析。',
        status: '集中化',
        bullets: { 0: '无局部媒体查询壳逻辑', 1: '无临时 rem/em 尺寸' },
      },
      adminShell: {
        title: 'Admin Shell',
        description: '旧控制台页面使用既有 shell 行为，不引入第二套应用框架。',
        status: '兼容',
        bullets: { 0: '固定 dashboard 标签页', 1: '侧栏菜单生成', 2: '路由 keepAlive 支持' },
      },
      semanticComposition: {
        title: '语义组合',
        description: '页面 shell 优先使用既有快捷类，并把重复几何放入本地应用组件。',
        status: 'Token-first',
        bullets: { 0: '不直接使用内部 glass primitive', 1: '无动态 class 字符串' },
      },
      tauriBoundary: {
        title: 'Tauri v2 边界',
        description: 'Tauri import 与 invoke 调用留在桌面适配器和 Rust 后端边界内。',
        status: '只读',
        bullets: { 0: '不重构 desktop', 1: '不修改 capability' },
      },
      strategicGuardrails: {
        title: '战略护栏',
        description: 'Rust 命令处理、结构化错误、更新器与深链能力保留到后续桌面路线。',
        status: 'P4 延期',
        bullets: { 0: '需要 owner 批准', 1: '需要安全模型' },
      },
    },
    evidence: {
      packageDirection: {
        label: '包方向',
        detail: '记录在 Wiki 中，并由 dependency-cruiser 与边界脚本执行。',
      },
      sourceOfTruth: { label: '事实源', detail: 'README 仍是通向维护中 Wiki 的薄入口。' },
      matrix: { label: '矩阵', detail: '所有者边界与禁止移动记录在此。' },
      candidateLedger: {
        label: '候选台账',
        detail: '应用内候选是未来分支证据，不是当前抽取批准。',
      },
      runtimePolicy: { label: '策略', detail: '机器可读的运行时表面、分类与许可。' },
      wikiValidation: { label: '验证', detail: '文档引用继续连接到同一组已检查脚本。' },
      p4Guardrails: {
        label: 'P4 护栏',
        detail: '禁止 Reka UI、TanStack Query、设计系统仓库、starter 或 HTTP/core 上移。',
      },
      httpRuntimePath: {
        label: '运行时路径',
        detail: '具体 alova 运行时、策略、校验与上传管理器位于此处。',
      },
      httpGuardrail: { label: '边界', detail: 'HTTP 运行时在未来复用路线获批前保持应用持有。' },
      safeStoragePath: {
        label: '运行时路径',
        detail: 'Crypto、lzstring、门面、序列化与维护代码位于此处。',
      },
      safeStorageGuardrail: {
        label: '边界',
        detail: '具体 safeStorage 行为在复用获批前保持应用持有。',
      },
      runtimeConstants: { label: '运行时常量', detail: '视觉 E2E 模式 key 与就绪事件集中管理。' },
      stateBoundary: { label: '状态边界', detail: '不可变数据流法则仍是操作模型。' },
      adapterPackagePath: { label: '适配器包', detail: '可复用 PrimeVue 集成属于 package。' },
      appPlugin: { label: '应用插件', detail: '应用启动仍由 app 持有。' },
      proFormPackage: {
        label: 'Package',
        detail: '可复用引擎与 PrimeVue renderer 仍由 package 持有。',
      },
      proTablePackage: {
        label: 'Package',
        detail: '可复用表格引擎仍由 package 持有；应用查询行为留在应用内。',
      },
      chartsPackage: {
        label: 'Package',
        detail: '共享图表运行时与 useChartTheme helper 位于图表包。',
      },
      vueUiPackage: { label: 'Package', detail: '复用原语保持包持有，页面组合保持应用内。' },
      designTokens: { label: '设计 token', detail: '共享 token 源与纯派生逻辑位于 package。' },
      sizeRuntime: { label: '运行时', detail: '应用持有首屏与运行时尺寸应用。' },
      layoutRuntimePath: { label: '运行时路径', detail: '最终响应式 shell 状态保持集中。' },
      unocssPreset: { label: 'Preset', detail: '快捷类注册表保持包持有且封闭。' },
      desktopWiki: { label: 'Wiki', detail: '桌面角色与安全基线仍记录在 Wiki。' },
    },
    commands: {
      archBoundaries: { description: '检查复用包是否按预期方向依赖。' },
      governanceGate: { description: '运行产品基础规则的共享评审检查。' },
      apiReport: { description: '检查公开包导出面漂移。' },
      archBoundariesReject: { description: '拒绝跨层或深导入漂移。' },
      archRuntime: { description: '检查运行时相关工作是否保留在应用持有代码中。' },
      codexPreflight: { description: '在更大改动前检查本地 AI 适配准备情况。' },
      wikiCommands: { description: '根据可用脚本检查文档引用。' },
      aiDoctorOpen: { description: '展示剩余低优先级规划备注，便于评审。' },
      archRuntimeLeaks: { description: '捕获越过归属边界的运行时导入。' },
      aiGuardStorage: { description: '捕获面向浏览器代码中的裸存储访问。' },
      e2eVisual: { description: '验证首屏与视觉 token 稳定性。' },
      aiGuardBusiness: { description: '对浏览器可见代码运行产品表面检查。' },
      lintComponentContracts: { description: '捕获组件与导入契约违规。' },
      webDemoTypeCheck: { description: '检查应用 SFC 与 schema 类型。' },
      testRun: { description: '运行 package build 与 Vitest 覆盖。' },
      e2eVisualTokens: { description: '验证视觉 token 与图表稳定路径。' },
      lintBusinessViews: { description: '验证业务视图组件契约。' },
      validateTokens: { description: '验证语义 token 对比度。' },
      checkFast: { description: '运行快速工作区验证。' },
      e2eLayout: { description: '验证布局几何行为。' },
      unocssTokenSmoke: { description: '验证 token 类生成。' },
      syncDesktopConfig: { description: '仅在桌面配置变化时需要。' },
      checkDrift: { description: '仅在桌面不变量变化时需要。' },
    },
    demos: {
      primeVue: {
        title: '按钮与表单控件',
        description: 'PrimeVue 控件通过批准适配器、全局 PT 预设与 CCD token 渲染。',
        fields: {
          inputText: '文本输入',
          inputNumber: '数字输入',
          password: '密码',
          select: '选择器',
          autocomplete: '自动完成',
          datePicker: '日期选择',
        },
        buttons: {
          primary: '主按钮',
          secondary: '次按钮',
          success: '成功',
          info: '信息',
          warn: '警告',
          help: '帮助',
          danger: '危险',
          contrast: '高对比',
        },
        options: {
          contracts: '契约',
          core: '核心',
          appRuntime: '应用运行时',
        },
        autocomplete: {
          architecture: '架构',
          runtime: '运行时',
          primevue: 'PrimeVue',
          governance: '治理',
        },
      },
      proForm: {
        title: '引导式请求表单',
        description: '通过引导式表单展示分组、校验、团队分派、条件备注与本地产品反馈。',
        submit: '检查表单',
        asideLabel: '可复用模式',
        asideDescription: '可复用表单能力支撑该示例，页面保留演示应用自己的业务场景。',
        groups: {
          basic: '基础字段',
          governance: '评审信息',
        },
        fields: {
          capability: '请求',
          owner: '负责团队',
          guarded: '需要评审',
          command: '推荐下一步',
          notes: '评审备注',
        },
        descriptions: {
          owner: '切换负责团队会更新建议的后续动作。',
          guarded: '开启后，评审备注会显示并变为必填。',
          command: '下一步由当前负责团队派生。',
          notes: '说明团队在分享该请求前需要确认什么。',
        },
        defaults: {
          capability: '客户设置评审',
          notes: '确认该请求足够清晰，便于产品与支持团队继续跟进。',
        },
        validation: {
          capabilityRequired: '请求不能为空',
          capabilityLength: '请求至少需要 4 个字符',
          notesRequired: '请求需要评审时必须填写评审备注',
        },
        owners: {
          app: '产品团队',
          package: '设计系统团队',
          future: '规划团队',
        },
        summary: {
          empty: '尚未提交表单值',
          submitted: '校验通过字段：{fields}',
          separator: '、',
          valid: '校验通过',
        },
      },
      proTable: {
        title: '类型化 ProTable',
        description: '单表格展示类型化列、全局搜索、状态过滤、工具栏、分页与行证据联动。',
        tableTitle: '边界证据',
        columns: {
          layer: '层',
          owner: '所有者',
          status: '状态',
          validation: '验证',
          evidence: '证据路径',
        },
        filters: {
          status: '边界状态',
          all: '全部状态',
        },
        states: {
          loading: '加载态',
          empty: '空状态',
        },
        emptyTitle: '没有匹配的边界记录',
        emptyDescription: '清除搜索或状态过滤即可恢复证据行。',
        evidence: {
          title: '选中证据',
          empty: '选择一行查看源路径证据。',
        },
        status: {
          guarded: '受护栏保护',
          app: '应用持有',
          blocked: '延期',
        },
        rows: {
          contractsOwner: '接口与 DTO 契约',
          coreOwner: '运行时中立编排',
          httpOwner: '应用持有的 alova 运行时',
          safeStorageOwner: '应用持有的加密/压缩门面',
          blockedOwner: '应用内存储 helper',
        },
        details: {
          contracts: 'contracts 只保留接口与共享类型。',
          core: 'core 保持运行时中立，并且只依赖 contracts。',
          http: 'HTTP 运行时留在浏览器应用适配边界内。',
          safeStorage: 'safeStorage 加密与序列化代码继续由应用持有。',
          blocked: '存储 helper 在未来复用路线获批前保持应用内。',
        },
      },
      chart: {
        title: 'Token-aware 图表运行时',
        description: 'UseEcharts 渲染主题化证据，视图不直接初始化 ECharts。',
        axis: {
          contracts: 'contracts',
          core: 'core',
          web: 'web',
          desktop: 'desktop',
          wiki: 'wiki',
        },
        series: {
          evidenceWeight: '证据权重',
          runtimeRisk: '运行时风险',
        },
      },
      feedback: {
        title: '反馈原语',
        description: '反馈面让 dialog、toast、空状态、图标与滚动原语可发现。',
        emptyTitle: '暂无反馈事件',
        emptyDescription: '该状态展示可复用空状态与业务反馈门面。',
        facadeTitle: 'Dialog 与 toast 门面',
        facadeDescription: '业务反馈继续通过 CCD 抽象进入，而不是 native alert 或裸 Toast。',
      },
    },
  },
}

export { zhCNConsole }
export default zhCNConsole
