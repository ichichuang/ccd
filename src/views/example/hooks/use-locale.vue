<script setup lang="ts">
defineOptions({ name: 'UseLocale' })

const { locale, currentLocale, isChineseLang, isRTL, supportedLocales, switchLocale, $t, $d, $n } =
  useLocale()

const selectedLocale = ref(locale.value)

watch(
  () => locale.value,
  v => {
    selectedLocale.value = v
  }
)

const switching = ref(false)
const onLocaleSelected = async (next: typeof selectedLocale.value) => {
  switching.value = true
  try {
    await switchLocale(next)
  } finally {
    switching.value = false
  }
}

const sampleText = computed(() => $t('common.confirm'))
const sampleDate = computed(() => $d(1704067200000))
const sampleNumber = computed(() => $n(123456.789))

watch(
  () => selectedLocale.value,
  v => {
    if (v !== locale.value) {
      void onLocaleSelected(v)
    }
  }
)

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
                    name="i-lucide-languages"
                    size="xl"
                    class="text-primary"
                  />
                </div>
                <div class="col-stretch gap-xs min-w-0">
                  <div class="row-start gap-xs min-w-0 flex-wrap">
                    <span class="text-lg font-bold text-foreground text-no-wrap">useLocale</span>
                    <span
                      class="surface-success rounded-md px-sm py-xs text-xs font-semibold uppercase"
                    >
                      HOOK
                    </span>
                  </div>
                  <span class="text-sm text-muted-foreground text-ellipsis-1">
                    切换语言 + 展示 $t/$d/$n 与 isChineseLang/isRTL
                  </span>
                </div>
              </div>
              <div class="row-center gap-sm min-w-0">
                <Tag
                  :value="`isChineseLang=${isChineseLang}`"
                  :severity="isChineseLang ? 'success' : 'secondary'"
                />
                <Tag
                  :value="`isRTL=${isRTL}`"
                  :severity="isRTL ? 'warn' : 'secondary'"
                />
              </div>
            </div>

            <div class="col-stretch gap-md min-w-0">
              <div class="row-between min-w-0">
                <span class="text-sm text-muted-foreground">Current State</span>
                <div class="row-start flex-wrap gap-sm min-w-0">
                  <Tag
                    :value="`locale=${locale}`"
                    severity="secondary"
                  />
                  <Tag
                    :value="currentLocale?.name ? `name=${currentLocale.name}` : 'name: —'"
                    severity="info"
                  />
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-md min-w-0">
                <div class="col-stretch gap-sm min-w-0">
                  <div class="text-sm text-muted-foreground">支持的语言</div>
                  <div class="row-start flex-wrap gap-sm min-w-0">
                    <Tag
                      v-for="l in supportedLocales"
                      :key="l.key"
                      :value="`${l.flag} ${l.name}`"
                      :severity="locale === l.key ? 'primary' : 'secondary'"
                    />
                  </div>
                </div>

                <div class="col-stretch gap-sm min-w-0">
                  <div class="text-sm text-muted-foreground">示例输出（$t/$d/$n）</div>
                  <div class="col-stretch gap-xs min-w-0">
                    <div class="row-between min-w-0">
                      <span class="text-sm text-muted-foreground">$t('common.confirm')</span>
                      <Tag
                        :value="sampleText"
                        severity="secondary"
                      />
                    </div>
                    <div class="row-between min-w-0">
                      <span class="text-sm text-muted-foreground">$d(timestamp)</span>
                      <Tag
                        :value="sampleDate"
                        severity="secondary"
                      />
                    </div>
                    <div class="row-between min-w-0">
                      <span class="text-sm text-muted-foreground">$n(number)</span>
                      <Tag
                        :value="sampleNumber"
                        severity="secondary"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <section class="material-elevated col-stretch gap-md min-w-0">
            <div class="row-between min-w-0">
              <h3 class="text-md font-semibold text-foreground m-0">Action Triggers</h3>
              <span class="text-sm text-muted-foreground">switchLocale()</span>
            </div>

            <div class="col-stretch gap-md min-w-0">
              <div class="row-between gap-md min-w-0">
                <div class="col-stretch gap-xs min-w-0">
                  <span class="text-sm text-muted-foreground">选择语言</span>
                  <Select
                    v-model="selectedLocale"
                    :options="supportedLocales"
                    option-label="name"
                    option-value="key"
                    placeholder="Select Locale"
                  />
                </div>
                <div class="row-center gap-sm min-w-0">
                  <Tag
                    :value="switching ? 'switching...' : 'idle'"
                    severity="secondary"
                  />
                </div>
              </div>
              <div class="text-sm text-muted-foreground">
                切换后会同步更新当前 locale/currentLocale，并刷新 $t/$d/$n 的展示结果。
              </div>
            </div>
          </section>
        </div>
      </div>
    </AnimateWrapper>
  </div>
</template>
