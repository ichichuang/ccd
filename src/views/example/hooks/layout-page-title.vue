<script setup lang="ts">
defineOptions({ name: 'LayoutPageTitle' })

const { title, currentPageTitle, updatePageTitle, getRouteTitle } = usePageTitle()

const route = useRoute()
const appTitleDraft = ref<string | undefined>('')
const previewTitle = computed(() => {
  // If input is empty, calculatePageTitle will treat it as "no app title".
  return getRouteTitle(route, appTitleDraft.value ?? '')
})

const pageReady = ref<boolean>(true)
</script>

<template>
  <div
    class="col-stretch"
    data-archetype="A1-toolbar-content"
  >
    <AnimateWrapper
      :show="pageReady"
      enter="fadeInUp"
      leave="fadeOut"
    >
      <div class="col-stretch gap-md min-h-0 min-w-0">
        <div class="layout-narrow col-stretch gap-md min-w-0">
          <header class="shrink-0 glass-panel col-stretch gap-md min-w-0">
            <div class="row-between gap-md min-w-0">
              <div class="row-start gap-sm min-w-0 flex-wrap">
                <div class="glass-icon-box shrink-0">
                  <Icons
                    name="i-lucide-text-cursor-input"
                    size="xl"
                    class="text-primary"
                  />
                </div>
                <div class="col-stretch gap-xs min-w-0">
                  <div class="row-start gap-xs min-w-0 flex-wrap">
                    <span class="text-lg font-bold text-foreground text-no-wrap">usePageTitle</span>
                    <span
                      class="surface-success rounded-md px-sm py-xs text-xs font-semibold uppercase"
                    >
                      HOOK
                    </span>
                  </div>
                  <span class="text-sm text-muted-foreground text-ellipsis-1">
                    验证 title / currentPageTitle 的同步与 getRouteTitle 计算
                  </span>
                </div>
              </div>
              <div class="row-center gap-sm min-w-0">
                <Tag
                  :value="title"
                  severity="secondary"
                />
              </div>
            </div>

            <div class="col-stretch gap-md min-w-0">
              <div class="row-between min-w-0">
                <span class="text-sm text-muted-foreground">Current State</span>
                <Tag
                  :value="currentPageTitle"
                  severity="info"
                />
              </div>

              <div class="col-stretch gap-sm min-w-0">
                <div class="row-between min-w-0">
                  <span class="text-sm text-muted-foreground">
                    getRouteTitle 预览（基于当前 route）
                  </span>
                  <Tag
                    :value="previewTitle"
                    severity="primary"
                  />
                </div>

                <div class="row-between gap-md min-w-0">
                  <div class="col-stretch gap-xs w-full min-w-0">
                    <span class="text-sm text-muted-foreground">appTitle 输入</span>
                    <InputText
                      v-model="appTitleDraft"
                      placeholder="空字符串 = 不追加应用标题"
                    />
                  </div>
                </div>
              </div>
            </div>
          </header>

          <section class="material-elevated col-stretch gap-md min-w-0">
            <div class="row-between min-w-0">
              <h3 class="text-md font-semibold text-foreground m-0">Action Triggers</h3>
              <span class="text-sm text-muted-foreground">
                手动刷新 useTitle 管理的 document.title
              </span>
            </div>

            <div class="col-stretch gap-sm min-w-0">
              <div class="row-start flex-wrap gap-sm min-w-0">
                <Button
                  size="small"
                  severity="primary"
                  label="手动 Sync"
                  @click="updatePageTitle"
                />
              </div>
              <div class="text-sm text-muted-foreground">
                注：只要你修改路由或 i18n 语言，currentPageTitle 会自动变化；useTitle 会自动同步。
              </div>
            </div>
          </section>
        </div>
      </div>
    </AnimateWrapper>
  </div>
</template>
