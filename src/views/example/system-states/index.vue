<script setup lang="ts">
import { LOADING_SIZE_PERCENT, SIZE_SCALE_KEYS, type SizeScaleKey } from '@/constants/sizeScale'
import { useLoading } from '@/hooks/layout/useLoading'

defineOptions({ name: 'SystemStatesShowcaseIndex' })

const { withLoading, withPageLoading } = useLoading()

const btnLoading = ref(false)

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
</script>

<template>
  <div
    data-archetype="A1-toolbar-content"
    class="h-full flex flex-col overflow-hidden"
  >
    <div
      data-region="toolbar"
      class="shrink-0 flex items-center justify-between gap-lg px-padding-lg py-padding-md border-b-default"
    >
      <span class="fs-md font-semibold text-foreground">
        {{ $t('router.example.systemStates') }}
      </span>
    </div>

    <div
      data-region="content"
      class="flex-1 min-h-0"
    >
      <CScrollbar class="h-full">
        <div class="p-padding-lg flex flex-col gap-lg">
          <!-- Loading States -->
          <h2 class="fs-lg font-semibold text-foreground m-0 flex items-center gap-sm">
            <Icons
              name="i-lucide-loader-2"
              size="sm"
              class="text-primary"
            />
            加载状态
          </h2>
          <div class="flex flex-col gap-lg">
            <Card class="bg-card component-border">
              <template #title>
                <span class="flex items-center gap-sm">
                  <Icons
                    name="i-lucide-loader-2"
                    size="sm"
                    class="text-primary"
                  />
                  全局 Loading
                </span>
              </template>
              <template #content>
                <p class="fs-sm text-muted-foreground m-0 mb-margin-md">
                  全屏遮罩，覆盖整个布局，使用
                  <span class="px-padding-xs rounded bg-muted">Loading</span>
                  type 3（003.json）、size 5xl。触发后持续 3 秒自动关闭。
                </p>
                <Button
                  label="触发全局 Loading"
                  icon="i-lucide-loader-2"
                  severity="secondary"
                  @click="triggerGlobalLoading"
                />
              </template>
            </Card>

            <Card class="bg-card component-border">
              <template #title>
                <span class="flex items-center gap-sm">
                  <Icons
                    name="i-lucide-layout"
                    size="sm"
                    class="text-primary"
                  />
                  页面 Loading
                </span>
              </template>
              <template #content>
                <p class="fs-sm text-muted-foreground m-0 mb-margin-md">
                  内容区遮罩，仅覆盖主内容区域，使用
                  <span class="px-padding-xs rounded bg-muted">Loading</span>
                  type 2（002.json）、size lg。触发后持续 3 秒自动关闭。
                </p>
                <Button
                  label="触发页面 Loading"
                  icon="i-lucide-layout"
                  severity="secondary"
                  @click="triggerPageLoading"
                />
              </template>
            </Card>

            <Card class="bg-card component-border">
              <template #title>
                <span class="flex items-center gap-sm">
                  <Icons
                    name="i-lucide-mouse-pointer-click"
                    size="sm"
                    class="text-primary"
                  />
                  按钮 Loading
                </span>
              </template>
              <template #content>
                <p class="fs-sm text-muted-foreground m-0 mb-margin-md">
                  PrimeVue Button 的 loading 状态。触发后持续 3 秒。
                </p>
                <Button
                  label="触发按钮 Loading"
                  icon="i-lucide-loader-2"
                  :loading="btnLoading"
                  @click="triggerButtonLoading"
                />
              </template>
            </Card>

            <Card class="bg-card component-border">
              <template #title>
                <span class="flex items-center gap-sm">
                  <Icons
                    name="i-lucide-ruler"
                    size="sm"
                    class="text-primary"
                  />
                  Loading 尺寸阶梯 (Size Scale)
                </span>
              </template>
              <template #content>
                <p class="fs-sm text-muted-foreground m-0 mb-margin-md">
                  <span class="px-padding-xs rounded bg-muted">size</span>
                  使用 Design System 的 SizeScaleKey，对应 LOADING_SIZE_PERCENT。
                </p>
                <div class="flex flex-wrap items-end gap-xl">
                  <div
                    v-for="key in SIZE_SCALE_KEYS"
                    :key="key"
                    class="flex flex-col items-center gap-sm"
                  >
                    <span class="fs-xs font-mono text-muted-foreground">
                      {{ key }} ({{ LOADING_SIZE_PERCENT[key as SizeScaleKey] }}vw)
                    </span>
                  </div>
                </div>
              </template>
            </Card>

            <Card class="bg-card component-border">
              <template #title>
                <span class="flex items-center gap-sm">
                  <Icons
                    name="i-lucide-square-dashed-bottom-code"
                    size="sm"
                    class="text-primary"
                  />
                  Skeleton 骨架屏
                </span>
              </template>
              <template #content>
                <p class="fs-sm text-muted-foreground m-0 mb-margin-md">
                  模拟个人资料卡片的骨架占位。
                </p>
                <div class="flex gap-lg max-w-md">
                  <div class="shrink-0">
                    <Skeleton
                      shape="circle"
                      size="4rem"
                    />
                  </div>
                  <div class="flex-1 min-w-0 flex flex-col gap-sm">
                    <Skeleton
                      width="80%"
                      height="var(--spacing-lg)"
                    />
                    <Skeleton
                      width="60%"
                      height="var(--spacing-md)"
                    />
                    <Skeleton
                      width="100%"
                      height="var(--spacing-xl)"
                    />
                  </div>
                </div>
              </template>
            </Card>
          </div>

          <!-- Exception Pages 说明 -->
          <h2 class="fs-lg font-semibold text-foreground m-0 mt-margin-lg flex items-center gap-sm">
            <Icons
              name="i-lucide-alert-triangle"
              size="sm"
              class="text-warn"
            />
            异常页面
          </h2>
          <Card class="bg-card component-border">
            <template #title>
              <span class="flex items-center gap-sm">
                <Icons
                  name="i-lucide-external-link"
                  size="sm"
                  class="text-muted-foreground"
                />
                从侧边栏打开
              </span>
            </template>
            <template #content>
              <p class="fs-sm text-muted-foreground m-0">
                请在左侧「布局与检查器」下点击「{{ $t('router.error.forbidden') }}」「{{
                  $t('router.error.notFound')
                }}」「{{
                  $t('router.error.serverError')
                }}」菜单项，将以全屏模式打开对应异常页查看效果。
              </p>
            </template>
          </Card>
        </div>
      </CScrollbar>
    </div>
  </div>
</template>
