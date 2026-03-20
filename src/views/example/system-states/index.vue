<script setup lang="ts">
import { LOADING_SIZE_PERCENT, SIZE_SCALE_KEYS, type SizeScaleKey } from '@/constants/sizeScale'
import { useLoading } from '@/hooks/layout/useLoading'
import { goToRoute } from '@/router/utils/helper'

defineOptions({ name: 'SystemStatesShowcaseIndex' })

const { withLoading, withPageLoading } = useLoading()

const btnLoading = ref(false)

// 语义尺寸（Skeleton 用），避免硬编码 rem/px
const avatarSize = 'var(--spacing-2xl)'
const spacingMd = 'var(--spacing-md)'
const spacingLg = 'var(--spacing-lg)'
const spacingXl = 'var(--spacing-xl)'

async function triggerGlobalLoading() {
  await withLoading(async () => {
    await new Promise(resolve => setTimeout(resolve, 3000))
  })
}

async function triggerPageLoading() {
  await withPageLoading(async () => {
    await new Promise(resolve => setTimeout(resolve, 3000))
  })
}

async function triggerButtonLoading() {
  btnLoading.value = true
  await new Promise(resolve => setTimeout(resolve, 3000))
  btnLoading.value = false
}

// 错误页为 fullscreen，显式传 newWindow=false 在当前标签页跳转（与 router-meta-example 一致）
function goToForbidden() {
  goToRoute('403', undefined, true)
}
function goToNotFound() {
  goToRoute('404', undefined, true)
}
function goToServerError() {
  goToRoute('500', undefined, true)
}

// 尺寸阶梯展示列表，避免在模板中对 key 做类型断言
const sizeScaleDisplayList = computed<{ key: SizeScaleKey; percent: number }[]>(() =>
  SIZE_SCALE_KEYS.map(key => ({ key, percent: LOADING_SIZE_PERCENT[key] }))
)
</script>

<template>
  <div
    data-archetype="A1-toolbar-content"
    class="h-full column overflow-hidden"
  >
    <div
      data-region="toolbar"
      class="shrink-0 row-between gap-md px-lg py-md border-b-default"
    >
      <span class="text-md font-semibold text-foreground">
        {{ $t('router.example.systemStates') }}
      </span>
    </div>

    <div
      data-region="content"
      class="col-fill"
    >
      <CScrollbar class="h-full">
        <div class="p-lg layout-stack gap-xl">
          <!-- Loading States -->
          <section class="col-stack-lg">
            <h2 class="text-lg font-semibold text-foreground m-0 row-y-center gap-sm">
              <Icons
                name="i-lucide-loader-2"
                size="sm"
                class="text-primary"
              />
              加载状态
            </h2>
            <div class="layout-stack gap-lg">
              <Card class="surface-elevated rounded-md! overflow-hidden">
                <template #title>
                  <span class="row-y-center gap-sm">
                    <Icons
                      name="i-lucide-loader-2"
                      size="sm"
                      class="text-primary"
                    />
                    全局 Loading
                  </span>
                </template>
                <template #content>
                  <p class="text-sm text-muted-foreground m-0 mb-md">
                    全屏遮罩，覆盖整个布局，使用
                    <span class="px-xs rounded bg-muted">Loading</span>
                    type 3（003.json）、size 5xl。触发后持续 3 秒自动关闭。
                  </p>
                  <Button
                    label="触发全局 Loading"
                    icon="i-lucide-loader-2"
                    severity="secondary"
                    class="behavior-hover-transition interactive-focus-ring"
                    @click="triggerGlobalLoading"
                  />
                </template>
              </Card>

              <Card class="surface-elevated rounded-md! overflow-hidden">
                <template #title>
                  <span class="row-y-center gap-sm">
                    <Icons
                      name="i-lucide-layout"
                      size="sm"
                      class="text-primary"
                    />
                    页面 Loading
                  </span>
                </template>
                <template #content>
                  <p class="text-sm text-muted-foreground m-0 mb-md">
                    内容区遮罩，仅覆盖主内容区域，使用
                    <span class="px-xs rounded bg-muted">Loading</span>
                    type 2（002.json）、size lg。触发后持续 3 秒自动关闭。
                  </p>
                  <Button
                    label="触发页面 Loading"
                    icon="i-lucide-layout"
                    severity="secondary"
                    class="behavior-hover-transition interactive-focus-ring"
                    @click="triggerPageLoading"
                  />
                </template>
              </Card>

              <Card class="surface-elevated rounded-md! overflow-hidden">
                <template #title>
                  <span class="row-y-center gap-sm">
                    <Icons
                      name="i-lucide-mouse-pointer-click"
                      size="sm"
                      class="text-primary"
                    />
                    按钮 Loading
                  </span>
                </template>
                <template #content>
                  <p class="text-sm text-muted-foreground m-0 mb-md">
                    PrimeVue Button 的 loading 状态。触发后持续 3 秒。
                  </p>
                  <Button
                    label="触发按钮 Loading"
                    icon="i-lucide-loader-2"
                    :loading="btnLoading"
                    class="behavior-hover-transition interactive-focus-ring"
                    @click="triggerButtonLoading"
                  />
                </template>
              </Card>

              <Card class="surface-elevated rounded-md! overflow-hidden">
                <template #title>
                  <span class="row-y-center gap-sm">
                    <Icons
                      name="i-lucide-ruler"
                      size="sm"
                      class="text-primary"
                    />
                    Loading 尺寸阶梯 (Size Scale)
                  </span>
                </template>
                <template #content>
                  <p class="text-sm text-muted-foreground m-0 mb-md">
                    <span class="px-xs rounded bg-muted">size</span>
                    使用 Design System 的 SizeScaleKey，对应 LOADING_SIZE_PERCENT。
                  </p>
                  <div class="layout-wrap gap-xl items-end">
                    <div
                      v-for="item in sizeScaleDisplayList"
                      :key="item.key"
                      class="col-stack-sm items-center"
                    >
                      <span class="text-xs font-mono text-muted-foreground">
                        {{ item.key }} ({{ item.percent }}vw)
                      </span>
                    </div>
                  </div>
                </template>
              </Card>

              <Card class="surface-elevated rounded-md! overflow-hidden">
                <template #title>
                  <span class="row-y-center gap-sm">
                    <Icons
                      name="i-lucide-square-dashed-bottom-code"
                      size="sm"
                      class="text-primary"
                    />
                    Skeleton 骨架屏
                  </span>
                </template>
                <template #content>
                  <p class="text-sm text-muted-foreground m-0 mb-md">
                    模拟个人资料卡片的骨架占位。
                  </p>
                  <div
                    class="row-y-center gap-lg py-sm md:py-md xl:py-lg 2xl:py-xl mx-auto max-w-[88%] sm:max-w-[84%] md:max-w-[82%] lg:max-w-[80%] xl:max-w-[78%] 2xl:max-w-[76%]"
                  >
                    <div class="shrink-0">
                      <Skeleton
                        shape="circle"
                        :size="avatarSize"
                      />
                    </div>
                    <div class="flex-1 min-w-0 col-stack-sm">
                      <Skeleton
                        width="80%"
                        :height="spacingLg"
                      />
                      <Skeleton
                        width="60%"
                        :height="spacingMd"
                      />
                      <Skeleton
                        width="100%"
                        :height="spacingXl"
                      />
                    </div>
                  </div>
                </template>
              </Card>
            </div>
          </section>

          <!-- Exception Pages -->
          <section class="col-stack-md">
            <h2 class="text-lg font-semibold text-foreground m-0 row-y-center gap-sm">
              <Icons
                name="i-lucide-alert-triangle"
                size="sm"
                class="text-warn"
              />
              异常页面
            </h2>
            <Card class="surface-elevated rounded-md! overflow-hidden">
              <template #title>
                <span class="row-y-center gap-sm">
                  <Icons
                    name="i-lucide-file-question"
                    size="sm"
                    class="text-muted-foreground"
                  />
                  错误页入口
                </span>
              </template>
              <template #content>
                <p class="text-sm text-muted-foreground m-0 mb-md">
                  通过路由可访问 403 / 404 / 500 等异常页，用于演示错误态与返回引导。
                </p>
                <div class="row-y-center layout-wrap gap-md">
                  <Button
                    severity="primary"
                    class="behavior-hover-transition interactive-focus-ring"
                    @click="goToForbidden"
                  >
                    {{ $t('router.error.forbidden') }}
                  </Button>
                  <Button
                    severity="warn"
                    class="behavior-hover-transition interactive-focus-ring"
                    @click="goToNotFound"
                  >
                    {{ $t('router.error.notFound') }}
                  </Button>
                  <Button
                    severity="danger"
                    class="behavior-hover-transition interactive-focus-ring"
                    @click="goToServerError"
                  >
                    {{ $t('router.error.serverError') }}
                  </Button>
                </div>
              </template>
            </Card>
          </section>
        </div>
      </CScrollbar>
    </div>
  </div>
</template>
