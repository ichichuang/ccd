const zhCNConsole = {
  router: {
    console: {
      architecture: {
        root: '架构',
        topology: '单仓拓扑',
        packageBoundaries: '包边界',
        runtimeBoundaries: '运行时边界',
        governance: '治理',
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
  console: {
    dashboard: {
      eyebrow: 'CCD 架构',
      title: '架构控制中心',
      description: '集中展示包边界、运行时隔离、验证门禁、Wiki 治理、桌面姿态和 P4 战略护栏。',
      action: '验证通道',
      evidenceTag: 'Wiki',
      values: {
        clean: '干净',
        appOwned: '应用持有',
        governed: '受治理',
        visible: '可见',
      },
      cards: {
        packageBoundary: {
          label: '包边界',
          detail: '依赖方向保持 packages/contracts -> packages/core -> apps。',
        },
        runtimeIsolation: {
          label: '运行时隔离',
          detail: 'HTTP 与 safeStorage 运行时继续留在 apps/web-demo。',
        },
        validationGate: {
          label: '验证门禁',
          detail: 'governance:gate 仍是单一架构门禁。',
        },
        p4Guardrails: {
          label: 'P4 护栏',
          detail: '战略事项在所有者批准前保持延期或阻塞。',
        },
      },
      routePosture: {
        title: '当前路由姿态',
        description: '旧示例博物馆已收敛为架构分类。',
        before: '之前',
        beforeDetail: '注册路由记录',
        legacy: '旧示例',
        legacyDetail: '博物馆路由记录',
        after: '之后',
        afterDetail: '聚焦后的注册记录',
      },
      commands: {
        title: '验证命令',
        description: '控制台只复用仓库既有命令，不引入新工具链。',
      },
      evidence: {
        monorepoTopology: {
          title: '单仓拓扑',
          description: "{'@'}ccd/contracts、{'@'}ccd/core、前端平台包与 apps 保持清晰责任边界。",
        },
        runtimeBoundaries: {
          title: '运行时边界',
          description: '运行时访问由应用适配器或明确的应用内例外持有。',
        },
        webDemoRole: {
          title: 'Web Demo 角色',
          description: '浏览器应用持有路由、Store、视图、插件、HTTP 运行时与 safeStorage 运行时。',
        },
        strategicGuardrails: {
          title: '战略护栏',
          description:
            '本分支不引入 Reka UI、TanStack Query、设计系统拆分、starter 抽取或运行时上移。',
        },
      },
      dialog: {
        title: 'CCD 架构验证',
        message: '架构控制台通过 Wiki、路由/i18n、运行时、边界、构建、E2E 与治理门禁共同验证。',
      },
    },
    shared: {
      evidence: {
        title: '证据',
        description: '支撑当前页面的仓库路径与策略事实。',
      },
      commands: {
        title: '验证命令',
        description: '命令保持脚本可追溯，并由 Wiki/治理门禁校验。',
      },
    },
    routeReduction: {
      title: '路由收敛',
      description: '旧路由记录被更小的架构分类替代。',
      before: '之前',
      beforeDetail: '含 99 条旧博物馆入口的注册记录',
      after: '之后',
      afterDetail: '架构控制台分类下的注册记录',
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
        eyebrow: '架构',
        title: '单仓拓扑',
        description:
          '当前 CCD 拓扑是确定性的 pnpm + Turbo 工作区，contracts 与 core 保持运行时中立。',
      },
      packageBoundaries: {
        eyebrow: '架构',
        title: '包边界',
        description: '每个包都有公开职责与禁止上移规则；应用运行时不会提升到共享包。',
      },
      runtimeBoundaries: {
        eyebrow: '架构',
        title: '运行时边界',
        description:
          '运行时 API 只属于应用适配器或明确批准的应用内基础设施，不进入 contracts 或 core。',
      },
      governance: {
        eyebrow: '架构',
        title: '治理与路由元数据',
        description: '路由元数据、RBAC、Wiki 验证与 AI 护栏让 web-demo 可解释、可测试。',
      },
      http: {
        eyebrow: '运行时',
        title: 'HTTP 与 Alova 运行时',
        description:
          'web-demo 持有具体 alova 运行时、拦截器、刷新协调、策略与 useHttpRequest 消费路径。',
      },
      safeStorage: {
        eyebrow: '运行时',
        title: 'safeStorage 运行时',
        description: 'safeStorage 加密、压缩、序列化、迁移、维护与门面代码继续由应用持有。',
      },
      browser: {
        eyebrow: '运行时',
        title: '浏览器运行时集成',
        description: '设备、语言、主题、尺寸、日期与视觉 E2E 就绪信号由应用运行时统一接线。',
      },
      state: {
        eyebrow: '运行时',
        title: '状态归属与工具',
        description: 'Store 持有持久系统状态，组件局部状态保持局部；工具示例按归属汇总。',
      },
      primevueAdapter: {
        eyebrow: 'UI',
        title: 'PrimeVue 适配器',
        description:
          'PrimeVue v4 仍是批准的 UI 生态，页面使用全局 PT 预设与 CCD 包装，而不是分散样式。',
      },
      proForm: {
        eyebrow: 'UI',
        title: 'ProForm 能力',
        description: '旧的九条 ProForm 示例路由收敛为一页，展示 schema、校验与联动能力。',
      },
      proTable: {
        eyebrow: 'UI',
        title: 'ProTable 能力',
        description: '旧表格路由收敛为一页，展示类型化列、行数据、工具栏与分页姿态。',
      },
      charts: {
        eyebrow: 'UI',
        title: '图表运行时',
        description:
          '图表示例聚焦 CCD 图表运行时：UseEcharts、主题合并、响应式恢复与 token 化主题。',
      },
      feedback: {
        eyebrow: 'UI',
        title: '反馈与空状态',
        description: 'Dialog、Toast、EmptyState、图标与 CScrollbar 合并到一个小型能力页。',
      },
      theme: {
        eyebrow: '系统',
        title: '主题系统',
        description: '主题控制被表达为 token 族、PrimeVue 预设映射与首屏行为的架构证据。',
      },
      sizeBreakpoints: {
        eyebrow: '系统',
        title: '尺寸与断点',
        description: '尺寸与断点系统持有密度预设、像素比感知尺寸与响应式布局变量。',
      },
      layout: {
        eyebrow: '系统',
        title: '布局运行时',
        description:
          'LayoutAdmin 继续持有头部、侧栏、面包屑、标签页、页脚、抽屉、上下文菜单、加载与刷新行为。',
      },
      unocss: {
        eyebrow: '系统',
        title: 'UnoCSS 与设计引擎',
        description: 'UnoCSS 作为封闭的语义快捷类注册表使用，所有类都受 token 和护栏约束。',
      },
      desktopBoundary: {
        eyebrow: '桌面',
        title: '桌面边界镜像',
        description:
          '本页只读镜像 Tauri 边界：desktop 适配器与 src-tauri 在 web-demo UI 分支中保持不动。',
      },
    },
    status: {
      topology: { label: '拓扑', value: 'contracts -> core -> apps' },
      runtimeAdapters: { label: '运行时', value: '应用适配器持有' },
      p4Guarded: { label: 'P4', value: '受护栏保护' },
      routeMetadata: { label: '路由元数据', value: '必须有 titleKey' },
      i18n: { label: 'i18n', value: 'en-US + zh-CN' },
      ledgerP4: { label: '台账', value: 'P4 可见' },
      desktopUntouched: { label: '桌面代码', value: '未触碰' },
      tauriAdapterOnly: { label: 'Tauri API', value: '仅适配器' },
      p4BackendDeferred: { label: 'P4 后端', value: '延期' },
    },
    stats: {
      publicPackages: { label: '公开包', detail: "{'@'}ccd 包导出面继续受治理。" },
      apps: { label: '应用', detail: 'web-demo 与 desktop 持有各自运行时适配器。' },
      validationGate: { label: '验证门禁', detail: 'governance:gate 是架构门禁。' },
      runtimeScans: {
        label: '运行时扫描',
        value: '严格',
        detail: 'contracts 与 core 拒绝浏览器、Node、Tauri、定时器与网络运行时。',
      },
      targetRoutes: { label: '目标路由', detail: '移除 99 条旧示例博物馆记录后的业务路由记录。' },
      legacyExample: { label: '旧示例', detail: '迁移后不保留规范旧 example 菜单入口。' },
      routeTests: {
        label: '路由测试',
        value: '有意收敛',
        detail: '规格断言路由签名与 locale 覆盖。',
      },
      runtimeOwner: { label: '运行时所有者', detail: '具体运行时行为保留在浏览器应用中。' },
      clientAlova: {
        label: '客户端',
        detail: '业务代码仍禁止 Axios、裸 fetch 与 XMLHttpRequest。',
      },
      sharedUtilsBlocked: {
        label: 'shared-utils',
        value: '阻塞',
        detail: '禁止加密、压缩或运行时门面上移。',
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
      uiEcosystem: { label: 'UI 生态', detail: '本分支不替换为 Reka UI。' },
      ptStyling: {
        label: '样式',
        value: 'PT 优先',
        detail: '语义 token 类与全局 PT 预设持有视觉状态。',
      },
      proFormLegacyRoutes: {
        label: '旧路由',
        detail: '基础、分组、校验、DAG、联动、插件与事件合并。',
      },
      schemaEngine: { label: '引擎', value: 'Schema', detail: '表单行为保持声明式与类型化。' },
      proTableLegacyRoutes: { label: '旧路由', detail: '基础、服务端、虚拟、无限、列与事件合并。' },
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
        value: '阻塞',
        detail: '在桌面信任模型批准前保持禁用。',
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
        bullets: { 0: 'PrimeVue 仍是批准方案', 1: '本分支不迁移 Reka UI' },
      },
      appLocalCandidates: {
        title: '应用内候选',
        description: 'web-demo shared 候选保持应用内，直到单独抽取分支证明所有权与回滚方案。',
        status: '未抽取',
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
        description: '架构控制台使用既有 shell 行为，不引入新的应用框架。',
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
        description:
          'Rust command handler、结构化 Rust error、updater 与 deep-link runtime 均保持未来分支。',
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
      wikiValidation: { label: '验证', detail: '文档命令引用保持脚本支撑。' },
      p4Guardrails: {
        label: 'P4 护栏',
        detail: '禁止 Reka UI、TanStack Query、设计系统仓库、starter 或 HTTP/core 上移。',
      },
      httpRuntimePath: {
        label: '运行时路径',
        detail: '具体 alova 运行时、策略、校验与上传管理器位于此处。',
      },
      httpGuardrail: { label: '护栏', detail: '未有未来批准分支前，HTTP 运行时上移被明确阻塞。' },
      safeStoragePath: {
        label: '运行时路径',
        detail: 'Crypto、lzstring、门面、序列化与维护代码位于此处。',
      },
      safeStorageGuardrail: {
        label: '护栏',
        detail: '未有未来批准分支前，safeStorage 上移被阻塞。',
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
      archBoundaries: { description: '验证工作区依赖方向。' },
      governanceGate: { description: '运行单一架构治理门禁。' },
      apiReport: { description: '检查公开包导出面漂移。' },
      archBoundariesReject: { description: '拒绝跨层或深导入漂移。' },
      archRuntime: { description: '运行运行时泄漏检测。' },
      codexPreflight: { description: '检查 AI/治理适配器预检。' },
      wikiCommands: { description: '根据 package scripts 校验 Wiki 命令引用。' },
      aiDoctorOpen: { description: '行动项关闭时保持 P4 护栏可见。' },
      archRuntimeLeaks: { description: '捕获禁止的运行时泄漏。' },
      aiGuardStorage: { description: '拒绝业务代码中的裸存储访问。' },
      e2eVisual: { description: '验证首屏与视觉 token 回归。' },
      aiGuardBusiness: { description: '对业务表面运行架构护栏检查。' },
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
        title: 'Schema 驱动 ProForm',
        description: '通过 schema 展示分组、校验、所有者联动、条件证据与应用内组合边界。',
        submit: '校验 schema',
        asideLabel: '布局约束',
        asideDescription:
          "可复用 ProForm 能力由 {'@'}ccd/vue-ui 持有；当前 schema 属于 apps/web-demo 的应用内组合。",
        groups: {
          basic: '基础字段',
          governance: '治理区',
        },
        fields: {
          capability: '能力',
          owner: '所有者边界',
          guarded: '治理护栏',
          command: '验证命令',
          notes: '证据备注',
        },
        descriptions: {
          owner: '切换所有者会更新验证命令。',
          guarded: '开启后，证据备注会显示并变为必填。',
          command: '命令由当前所有者边界派生。',
          notes: '说明该能力为什么保留在当前边界中。',
        },
        defaults: {
          capability: '架构控制台页面壳',
          notes: '在单独抽取分支证明所有权前，组合保持应用内。',
        },
        validation: {
          capabilityRequired: '能力不能为空',
          capabilityLength: '能力名称至少需要 4 个字符',
          notesRequired: '开启治理护栏时必须填写证据备注',
        },
        owners: {
          app: '应用内组合',
          package: '公开包原语',
          future: '未来抽取分支',
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
          blocked: '阻塞',
        },
        rows: {
          contractsOwner: '接口与 DTO 契约',
          coreOwner: '运行时中立编排',
          httpOwner: '应用持有的 alova 运行时',
          safeStorageOwner: '应用持有的加密/压缩门面',
          blockedOwner: '阻塞的 shared-utils 上移',
        },
        details: {
          contracts: 'contracts 只保留接口与共享类型。',
          core: 'core 保持运行时中立，并且只依赖 contracts。',
          http: 'HTTP 运行时留在浏览器应用适配边界内。',
          safeStorage: 'safeStorage 加密与序列化代码继续由应用持有。',
          blocked: 'repair ledger 将 safeStorage 上移保持为 P4 阻塞护栏。',
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
        description: '合并后的反馈面让 dialog、toast、空状态、图标与滚动原语可发现。',
        emptyTitle: '无陈旧示例路由',
        emptyDescription: '架构控制台用聚焦证据替代博物馆式示例。',
        facadeTitle: 'Dialog 与 toast 门面',
        facadeDescription: '业务反馈继续通过 CCD 抽象进入，而不是 native alert 或裸 Toast。',
      },
    },
  },
}

export { zhCNConsole }
export default zhCNConsole
