<script setup lang="ts">
defineOptions({ name: 'LayoutPageTitle' })

const { title, currentPageTitle, updatePageTitle, getRouteTitle } = usePageTitle()

const route = useRoute()
const appTitleDraft = ref<string | undefined>('')
const previewTitle = computed(() => {
  // If input is empty, calculatePageTitle will treat it as “no app title”.
  return getRouteTitle(route, appTitleDraft.value ?? '')
})
</script>

<template>
  <div
    class="animate__animated animate__fadeIn col-stretch gap-md"
    data-archetype="A1-toolbar-content"
  >
    <div class="layout-narrow col-stretch gap-md">
      <section class="material-elevated col-stretch gap-md">
        <div class="row-between items-center">
          <div class="col-stretch gap-xs">
            <h2 class="text-lg font-semibold text-foreground m-0">usePageTitle Demo</h2>
            <p class="text-sm text-muted-foreground m-0">
              验证 title / currentPageTitle 的同步与 getRouteTitle 计算
            </p>
          </div>
          <div class="row-center gap-sm">
            <Tag
              :value="title"
              severity="secondary"
            />
          </div>
        </div>

        <Divider />

        <div class="col-stretch gap-md">
          <div class="row-between items-center">
            <span class="text-sm text-muted-foreground">Current State</span>
            <Tag
              :value="currentPageTitle"
              severity="info"
            />
          </div>

          <div class="col-stretch gap-sm">
            <div class="row-between items-center">
              <span class="text-sm text-muted-foreground">
                getRouteTitle 预览（基于当前 route）
              </span>
              <Tag
                :value="previewTitle"
                severity="primary"
              />
            </div>

            <div class="row-between items-center gap-md">
              <div class="col-stretch gap-xs w-full">
                <span class="text-sm text-muted-foreground">appTitle 输入</span>
                <InputText
                  v-model="appTitleDraft"
                  placeholder="空字符串 = 不追加应用标题"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="material-elevated col-stretch gap-md">
        <div class="row-between items-center">
          <h3 class="text-md font-semibold text-foreground m-0">Action Triggers</h3>
          <span class="text-sm text-muted-foreground">手动刷新 useTitle 管理的 document.title</span>
        </div>
        <Divider />

        <div class="col-stretch gap-sm">
          <div class="row-start flex-wrap gap-sm">
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
</template>
