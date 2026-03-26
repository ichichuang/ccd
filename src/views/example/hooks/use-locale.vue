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
</script>

<template>
  <div
    class="animate__animated animate__fadeIn col-stretch gap-md"
    data-archetype="A1-toolbar-content"
  >
    <div class="layout-narrow col-stretch gap-md">
      <section class="material-elevated col-stretch gap-md">
        <div class="row-between">
          <div class="col-stretch gap-xs">
            <h2 class="text-lg font-semibold text-foreground m-0">useLocale Demo</h2>
            <p class="text-sm text-muted-foreground m-0">
              切换语言 + 展示 $t/$d/$n 与 isChineseLang/isRTL
            </p>
          </div>
          <div class="row-center gap-sm">
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
        <Divider />

        <div class="col-stretch gap-md">
          <div class="row-between">
            <span class="text-sm text-muted-foreground">Current State</span>
            <div class="row-start flex-wrap gap-sm">
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

          <div class="grid grid-cols-1 md:grid-cols-2 gap-md">
            <div class="col-stretch gap-sm">
              <div class="text-sm text-muted-foreground">支持的语言</div>
              <div class="row-start flex-wrap gap-sm">
                <Tag
                  v-for="l in supportedLocales"
                  :key="l.key"
                  :value="`${l.flag} ${l.name}`"
                  :severity="locale === l.key ? 'primary' : 'secondary'"
                />
              </div>
            </div>

            <div class="col-stretch gap-sm">
              <div class="text-sm text-muted-foreground">示例输出（$t/$d/$n）</div>
              <div class="col-stretch gap-xs">
                <div class="row-between">
                  <span class="text-sm text-muted-foreground">$t('common.confirm')</span>
                  <Tag
                    :value="sampleText"
                    severity="secondary"
                  />
                </div>
                <div class="row-between">
                  <span class="text-sm text-muted-foreground">$d(timestamp)</span>
                  <Tag
                    :value="sampleDate"
                    severity="secondary"
                  />
                </div>
                <div class="row-between">
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
      </section>

      <section class="material-elevated col-stretch gap-md">
        <div class="row-between">
          <h3 class="text-md font-semibold text-foreground m-0">Action Triggers</h3>
          <span class="text-sm text-muted-foreground">switchLocale()</span>
        </div>
        <Divider />

        <div class="col-stretch gap-md">
          <div class="row-between gap-md">
            <div class="col-stretch gap-xs">
              <span class="text-sm text-muted-foreground">选择语言</span>
              <Select
                v-model="selectedLocale"
                :options="supportedLocales"
                option-label="name"
                option-value="key"
                placeholder="Select Locale"
              />
            </div>
            <div class="row-center gap-sm">
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
</template>
