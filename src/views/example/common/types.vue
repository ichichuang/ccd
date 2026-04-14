<script setup lang="ts">
defineOptions({ name: 'CommonTypes' })

type TypePanelId =
  | 'ApiResponse'
  | 'UIDesignState'
  | 'SystemAsyncRoutes'
  | 'UserAuthDTO'
  | 'HttpRequestTypes'

interface TypePanel {
  id: TypePanelId
  title: string
  boundaryMessage: string
  snippet: string
}

const typePanels: TypePanel[] = [
  {
    id: 'ApiResponse',
    title: 'ApiResponse<T> (global)',
    boundaryMessage:
      '这是"业务成功结构"的最小统一响应形态：业务层只取 `data`，错误与 401/重试交由拦截器与 hooks 处理。类型仅在编译期生效。',
    snippet: `export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}`,
  },
  {
    id: 'UIDesignState',
    title: 'UIDesignState (layout contract)',
    boundaryMessage:
      '这是 UI 架构的只读契约：限制页面 intent/archetype/density/hierarchy 等结构化决策，供"设计编译器/生成器"做一致渲染。运行期页面不会直接依赖该类型字段。',
    snippet: `export type BaseBusinessDTO = Record<string, unknown>

export interface UIDesignState {
  intent: 'dashboard' | 'data-management' | 'form-workflow' | 'detail-view' | 'settings'
  context?: 'desktop-first' | 'mobile-first'
  archetype:
    | 'A1-toolbar-content'
    | 'A2-sidebar-inspector'
    | 'A3-stats-grid'
    | 'A4-table-drawer'
    | 'A5-form-wizard'
  density: 'compact' | 'comfortable' | 'spacious'
  hierarchy: 'data-first' | 'action-first' | 'reading-first'
  emphasis: 'low' | 'medium' | 'high'
  ctaPolicy: 'minimal' | 'single-primary' | 'dual-primary'
}`,
  },
  {
    id: 'SystemAsyncRoutes',
    title: 'SystemAsyncRoutes (dynamic router DTO)',
    boundaryMessage:
      '用于描述后端动态路由"原始响应"与"单项内容"：Stage 1/2/3 的链路中会对它做归一化与转换。它用于类型校验，不提供运行时反射能力。',
    snippet: `export interface SystemAsyncRouteItem {
  path: string
  name?: string
  component?: string
  redirect?: string
  meta: RouteMeta
  children?: SystemAsyncRouteItem[]
}

export type SystemAsyncRoutesRawRes =
  SystemAsyncRouteItem[] | { routes: SystemAsyncRouteItem[] }`,
  },
  {
    id: 'UserAuthDTO',
    title: 'UserAuth DTO (auth.dto)',
    boundaryMessage:
      '用于登录态结构与请求参数的统一类型来源：例如 `UserInfo`、`LoginParams`、`LoginResult`。在页面中通过 type-only import 使用，配合 Pinia 与 hooks 做数据流编排。',
    snippet: `export interface UserInfo {
  userId: string
  username: string
  roles: string[]
  permissions: string[]
  avatar?: string
  email?: string
  phone?: string
}

export interface LoginParams {
  username: string
  password: string
}

export interface LoginResult {
  token: string
  userInfo: UserInfo
}`,
  },
  {
    id: 'HttpRequestTypes',
    title: 'Http Request Types (request layer)',
    boundaryMessage:
      '这是 hooks/请求层的配置与响应"变体"：例如 `RequestConfig` 与请求层 `ApiResponse<T>`（与 global ApiResponse 的字段形态不同）。它决定了缓存、重试、去重与安全配置的可控边界。',
    snippet: `export interface RequestConfig {
  headers?: Record<string, string>
  timeout?: number
  enableCache?: boolean
  cacheTTL?: number
  retry?: RetryConfig
  deduplicate?: boolean
  cancelStrategy?: 'none' | 'cancelPrevious'
  security?: SecurityConfig
  [key: string]: unknown
}

export interface SecurityConfig {
  enableCSRF?: boolean
  enableSignature?: boolean
  enableRateLimit?: boolean
  maxRequestsPerMinute?: number
  sensitiveFields?: string[]
}`,
  },
]

const activeTypes = ref<string | string[] | null | undefined>(['ApiResponse', 'UIDesignState'])
</script>

<template>
  <div
    class="col-stretch"
    data-archetype="A1-toolbar-content"
  >
    <div class="col-stretch gap-md min-h-0 min-w-0">
      <div class="layout-narrow col-stretch gap-md min-w-0">
        <header class="shrink-0 glass-panel col-stretch gap-md min-w-0">
          <div class="row-between gap-md min-w-0">
            <div class="row-start gap-sm min-w-0 flex-wrap">
              <div class="glass-icon-box shrink-0">
                <Icons
                  name="i-lucide-type"
                  size="xl"
                  class="text-primary"
                />
              </div>
              <div class="col-stretch gap-xs min-w-0">
                <div class="row-start gap-xs min-w-0 flex-wrap">
                  <span class="text-lg font-bold text-foreground text-no-wrap">
                    Type Definitions
                  </span>
                  <span
                    class="surface-primary rounded-md px-sm py-xs text-xs font-semibold uppercase"
                  >
                    COMMON
                  </span>
                </div>
                <span class="text-sm text-muted-foreground text-ellipsis-1">
                  Types 只在编译期存在，运行期无法直接枚举。此页以"静态代码片段"的方式做类型参考。
                </span>
              </div>
            </div>
          </div>
        </header>

        <section class="material-elevated col-stretch gap-md min-w-0">
          <Message severity="warn">
            提示：TypeScript 类型擦除后无法在运行期获取该类型定义。
            因此本页展示的只是从源码提取/复制的字符串片段，作为阅读与对照用。
          </Message>
        </section>

        <section class="material-elevated col-stretch gap-md min-w-0">
          <div class="row-between min-w-0">
            <h2 class="text-lg font-semibold text-foreground m-0">TypeScript API Reference</h2>
            <Tag
              value="static-only"
              severity="secondary"
              rounded
            />
          </div>

          <Accordion
            v-model:value="activeTypes"
            multiple
            :pt="{
              header: {
                toggleIcon: { class: 'pointer-events-none' },
              },
            }"
          >
            <AccordionPanel
              v-for="p in typePanels"
              :key="p.id"
              :value="p.id"
            >
              <AccordionHeader>
                <span class="pointer-events-none">{{ p.title }}</span>
              </AccordionHeader>
              <AccordionContent>
                <div class="col-stretch gap-md min-w-0">
                  <Message severity="info">
                    {{ p.boundaryMessage }}
                  </Message>
                  <pre class="code-block">
                      {{ p.snippet }}
                    </pre
                  >
                </div>
              </AccordionContent>
            </AccordionPanel>
          </Accordion>
        </section>
      </div>
    </div>
  </div>
</template>
