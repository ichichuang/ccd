<script setup lang="ts">
import { LOADING_SIZE_PERCENT, SIZE_SCALE_KEYS, type SizeScaleKey } from '@/constants/sizeScale'
import { useLoading } from '@/hooks/layout/useLoading'
import Loading from '@/layouts/components/Loading.vue'
import { goToRoute } from '@/router/utils/helper'

defineOptions({ name: 'SystemStatesShowcaseIndex' })

const { withLoading, withPageLoading } = useLoading()

const btnLoading = ref(false)

/** 尺寸预览按 sizeScale 常量完整展示（xs -> 5xl） */
const sizeScalePreviewKeys = SIZE_SCALE_KEYS

/** Lottie 样式 type，供模板绑定避免 string 收窄 */
const loadingPreviewType = 1 as const

// 语义尺寸（Skeleton 用），避免硬编码 rem/px
const avatarSize = 'var(--spacing-2xl)'
const spacingMd = 'var(--spacing-md)'
const spacingLg = 'var(--spacing-lg)'
const spacingXl = 'var(--spacing-xl)'

const waitFor = (ms: number): Promise<void> =>
  new Promise(resolve => {
    const { start, stop } = useTimeoutFn(
      () => {
        stop()
        resolve()
      },
      ms,
      { immediate: false }
    )
    start()
  })

async function triggerGlobalLoading() {
  await withLoading(async () => {
    await waitFor(3000)
  })
}

async function triggerPageLoading() {
  await withPageLoading(async () => {
    await waitFor(3000)
  })
}

async function triggerButtonLoading() {
  btnLoading.value = true
  await waitFor(3000)
  btnLoading.value = false
}

// 错误页为 fullscreen，显式传 newWindow=false 在当前标签页跳转（与 router-meta-example 一致）
function goToForbidden() {
  goToRoute('403', undefined, false)
}
function goToNotFound() {
  goToRoute('404', undefined, false)
}
function goToServerError() {
  goToRoute('500', undefined, false)
}

const sizeScaleDisplayList = computed<{ key: SizeScaleKey; percent: number }[]>(() =>
  SIZE_SCALE_KEYS.map(key => ({ key, percent: LOADING_SIZE_PERCENT[key] }))
)
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
                  name="i-lucide-activity"
                  size="xl"
                  class="text-primary"
                />
              </div>
              <div class="col-stretch gap-xs min-w-0">
                <div class="row-start gap-xs min-w-0 flex-wrap">
                  <span class="text-lg font-bold text-foreground text-no-wrap">System States</span>
                  <span
                    class="surface-success rounded-md px-sm py-xs text-xs font-semibold uppercase"
                  >
                    SYSTEM
                  </span>
                </div>
                <span class="text-sm text-muted-foreground text-ellipsis-1">
                  加载状态、骨架屏与异常页面 — 全局/页面/按钮 Loading 及错误页入口
                </span>
              </div>
            </div>
          </div>
        </header>

        <!-- Loading States -->
        <section class="col-stretch gap-sm min-w-0">
          <h2
            class="text-lg font-semibold text-foreground m-0 row-start items-center gap-sm min-w-0"
          >
            <Icons
              name="i-lucide-loader-2"
              size="sm"
              class="text-primary"
            />
            加载状态
          </h2>

          <div class="col-stretch gap-md min-w-0">
            <section class="material-elevated col-stretch gap-md">
              <div
                class="row-start items-center gap-sm text-md font-medium text-foreground min-w-0"
              >
                <Icons
                  name="i-lucide-loader-2"
                  size="sm"
                  class="text-primary"
                />
                全局 Loading
              </div>
              <p class="text-sm text-muted-foreground m-0">
                全屏遮罩，覆盖整个布局，使用
                <span class="px-xs rounded bg-muted">Loading</span>
                type 3（003.json）、size 5xl。触发后持续 3 秒自动关闭。
              </p>
              <Button
                label="触发全局 Loading"
                icon="i-lucide-loader-2"
                severity="secondary"
                @click="triggerGlobalLoading"
              />
            </section>

            <section class="material-elevated col-stretch gap-md">
              <div
                class="row-start items-center gap-sm text-md font-medium text-foreground min-w-0"
              >
                <Icons
                  name="i-lucide-layout"
                  size="sm"
                  class="text-primary"
                />
                页面 Loading
              </div>
              <p class="text-sm text-muted-foreground m-0">
                内容区遮罩，仅覆盖主内容区域，使用
                <span class="px-xs rounded bg-muted">Loading</span>
                type 2（002.json）、size lg。触发后持续 3 秒自动关闭。
              </p>
              <Button
                label="触发页面 Loading"
                icon="i-lucide-layout"
                severity="secondary"
                @click="triggerPageLoading"
              />
            </section>

            <section class="material-elevated col-stretch gap-md">
              <div
                class="row-start items-center gap-sm text-md font-medium text-foreground min-w-0"
              >
                <Icons
                  name="i-lucide-mouse-pointer-click"
                  size="sm"
                  class="text-primary"
                />
                按钮 Loading
              </div>
              <p class="text-sm text-muted-foreground m-0">
                PrimeVue Button 的 loading 状态。触发后持续 3 秒。
              </p>
              <Button
                label="触发按钮 Loading"
                icon="i-lucide-loader-2"
                :loading="btnLoading"
                @click="triggerButtonLoading"
              />
            </section>

            <section class="material-elevated col-stretch gap-md">
              <div
                class="row-start items-center gap-sm text-md font-medium text-foreground min-w-0"
              >
                <Icons
                  name="i-lucide-ruler"
                  size="sm"
                  class="text-primary"
                />
                Loading 尺寸阶梯 (Size Scale)
              </div>
              <p class="text-sm text-muted-foreground m-0">
                <span class="px-xs rounded bg-muted">size</span>
                使用 Design System 的 SizeScaleKey；动画边长由
                <span class="px-xs rounded bg-muted">LOADING_SIZE_CSS</span>
                控制，下表为
                <span class="px-xs rounded bg-muted">LOADING_SIZE_PERCENT</span>
                （vw 占比参考）。
              </p>
              <div class="row-start flex-wrap gap-md items-end min-w-0">
                <div
                  v-for="key in sizeScalePreviewKeys"
                  :key="key"
                  class="col-stretch gap-xs items-center min-w-0"
                >
                  <div
                    class="center rounded-md bg-muted/30 overflow-hidden h-[100px] w-[min(26vw,160px)]"
                  >
                    <Loading
                      :size="key"
                      :type="loadingPreviewType"
                    />
                  </div>
                  <span class="text-xs font-mono text-muted-foreground text-no-wrap">
                    {{ key }} ({{ LOADING_SIZE_PERCENT[key] }}vw)
                  </span>
                </div>
              </div>
              <div class="row-start flex-wrap gap-sm gap-y-xs min-w-0">
                <span
                  v-for="item in sizeScaleDisplayList"
                  :key="item.key"
                  class="code-inline text-muted-foreground px-sm py-xs rounded bg-muted/40"
                >
                  {{ item.key }}: {{ item.percent }}vw
                </span>
              </div>
            </section>

            <section class="material-elevated col-stretch gap-md">
              <div
                class="row-start items-center gap-sm text-md font-medium text-foreground min-w-0"
              >
                <Icons
                  name="i-lucide-square-dashed-bottom-code"
                  size="sm"
                  class="text-primary"
                />
                Skeleton 骨架屏
              </div>
              <p class="text-sm text-muted-foreground m-0">模拟个人资料卡片的骨架占位。</p>
              <div
                class="row-start items-center gap-lg py-md mx-auto w-full max-w-[min(92%,520px)] min-w-0"
              >
                <div class="shrink-0">
                  <Skeleton
                    shape="circle"
                    :size="avatarSize"
                  />
                </div>
                <div class="flex-1 min-w-0 col-stretch gap-sm">
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
            </section>
          </div>
        </section>

        <!-- Exception Pages -->
        <section class="col-stretch gap-sm min-w-0">
          <h2
            class="text-lg font-semibold text-foreground m-0 row-start items-center gap-sm min-w-0"
          >
            <Icons
              name="i-lucide-alert-triangle"
              size="sm"
              class="text-warn"
            />
            异常页面
          </h2>

          <section class="material-elevated col-stretch gap-md">
            <div class="row-start items-center gap-sm text-md font-medium text-foreground min-w-0">
              <Icons
                name="i-lucide-file-question"
                size="sm"
                class="text-muted-foreground"
              />
              错误页入口
            </div>
            <p class="text-sm text-muted-foreground m-0">
              通过路由可访问 403 / 404 / 500 等异常页，用于演示错误态与返回引导。
            </p>
            <div class="row-start flex-wrap items-center gap-md min-w-0">
              <Button
                :label="$t('router.error.forbidden')"
                severity="primary"
                @click="goToForbidden"
              />
              <Button
                :label="$t('router.error.notFound')"
                severity="warn"
                @click="goToNotFound"
              />
              <Button
                :label="$t('router.error.serverError')"
                severity="danger"
                @click="goToServerError"
              />
            </div>
          </section>
        </section>
      </div>
    </div>
  </div>
</template>
