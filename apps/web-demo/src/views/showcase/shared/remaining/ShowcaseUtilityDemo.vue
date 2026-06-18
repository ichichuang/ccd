<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import {
  createDateUtilsPreviewRows,
  createSafeStoragePreviewRows,
  createStatePersistencePreviewRows,
  type UtilityPreviewRow,
} from '../../data/showcaseUtilityDemos'

defineOptions({ name: 'ShowcaseUtilityDemo' })

const props = defineProps<{
  kind: string
}>()

const { t } = useI18n()
const dateUtils = useDateUtils()
const currentUtility = computed(() => props.kind.replace('utils-', ''))

const rows = computed<UtilityPreviewRow[]>(() => {
  if (currentUtility.value === 'safe-storage') return createSafeStoragePreviewRows()
  if (currentUtility.value === 'state-persistence') return createStatePersistencePreviewRows()
  return createDateUtilsPreviewRows()
})

const hookRows = computed<UtilityPreviewRow[]>(() => [
  {
    key: 'initialized',
    labelKey: 'showcase.remaining.utils.initialized',
    value: dateUtils.isInitialized.value ? t('common.yes') : t('common.no'),
  },
  {
    key: 'locale',
    labelKey: 'showcase.remaining.utils.locale',
    value: dateUtils.currentLocale.value,
  },
  {
    key: 'timezone',
    labelKey: 'showcase.remaining.utils.timezone',
    value: dateUtils.currentTimezone.value,
  },
])
</script>

<template>
  <section class="col-stretch min-w-0 gap-md">
    <div class="grid min-w-0 grid-cols-1 gap-md md:grid-cols-3">
      <article
        v-for="row in rows"
        :key="row.key"
        class="material-solid col-stretch min-w-0 gap-xs p-md"
      >
        <span class="text-sm text-muted-foreground">{{ $t(row.labelKey) }}</span>
        <strong class="text-lg text-foreground font-semibold break-all">{{ row.value }}</strong>
      </article>
    </div>

    <div
      v-if="currentUtility === 'date' || currentUtility === 'overview'"
      class="grid min-w-0 grid-cols-1 gap-md md:grid-cols-3"
    >
      <article
        v-for="row in hookRows"
        :key="row.key"
        class="demo-well col-stretch min-w-0 gap-xs"
      >
        <span class="text-sm text-muted-foreground">{{ $t(row.labelKey) }}</span>
        <strong class="text-base text-foreground font-semibold">{{ row.value }}</strong>
      </article>
    </div>

    <p class="text-sm text-muted-foreground m-0">
      {{ $t(`showcase.remaining.utils.${currentUtility}.note`) }}
    </p>
  </section>
</template>
