<script setup lang="ts">
import { CScrollbar } from '@ccd/vue-ui'
import { useI18n } from 'vue-i18n'
import { showcaseFeedbackAdapter } from '@/adapters/showcaseFeedback.adapter'
import ShowcaseFeedbackDialogBridge from '../ShowcaseFeedbackDialogBridge'

interface FeedbackLog {
  id: number
  label: string
}

type FeedbackLogKey = 'dialogOpened' | 'emptyActionLogged' | 'messageShown' | 'toastShown'

defineOptions({ name: 'ShowcaseFeedbackDemo' })

const { t } = useI18n()
const logs = ref<FeedbackLog[]>([])
let logId = 0

const visibleLogs = computed(() => logs.value.slice().reverse())

function pushLog(key: FeedbackLogKey): void {
  logId += 1
  logs.value.push({ id: logId, label: t(`showcase.remaining.feedback.${key}`) })
}

function openInfoDialog(openDialog: (message: string, title: string) => void): void {
  openDialog(
    t('showcase.remaining.feedback.dialogMessage'),
    t('showcase.remaining.feedback.dialogTitle')
  )
  pushLog('dialogOpened')
}

function showMessage(): void {
  showcaseFeedbackAdapter.showSuccessMessage(
    t('showcase.remaining.feedback.messageBody'),
    t('showcase.remaining.feedback.messageTitle')
  )
  pushLog('messageShown')
}

function showToast(): void {
  showcaseFeedbackAdapter.showSuccessToast(
    'top-right',
    t('showcase.remaining.feedback.toastTitle'),
    t('showcase.remaining.feedback.toastBody')
  )
  pushLog('toastShown')
}

function recordEmptyStateAction(): void {
  pushLog('emptyActionLogged')
  showcaseFeedbackAdapter.showInfoToast(
    'top-right',
    t('showcase.remaining.feedback.emptyActionTitle'),
    t('showcase.remaining.feedback.emptyActionBody')
  )
}
</script>

<template>
  <ShowcaseFeedbackDialogBridge v-slot="{ openInfoDialog: openDialog }">
    <section class="grid min-w-0 grid-cols-1 gap-md xl:grid-cols-2">
      <article class="material-solid col-stretch min-w-0 gap-md p-md">
        <div class="row-start min-w-0 gap-sm flex-wrap">
          <Button
            :label="$t('showcase.remaining.feedback.openDialog')"
            severity="primary"
            @click="openInfoDialog(openDialog)"
          />
          <Button
            :label="$t('showcase.remaining.feedback.showMessage')"
            severity="success"
            outlined
            @click="showMessage"
          />
          <Button
            :label="$t('showcase.remaining.feedback.showToast')"
            severity="warn"
            outlined
            @click="showToast"
          />
        </div>

        <EmptyState
          icon="i-lucide-message-circle"
          :title="$t('showcase.remaining.feedback.emptyTitle')"
          :description="$t('showcase.remaining.feedback.emptyDescription')"
          :action-label="$t('showcase.remaining.feedback.emptyAction')"
          @action="recordEmptyStateAction"
        />
      </article>

      <article class="material-solid col-stretch min-w-0 gap-md p-md">
        <div class="row-start min-w-0 gap-sm">
          <Icons
            name="i-lucide-list-checks"
            size="lg"
            class="text-primary"
          />
          <h3 class="text-base font-semibold text-foreground m-0">
            {{ $t('showcase.remaining.feedback.logTitle') }}
          </h3>
        </div>

        <CScrollbar class="h-[32vh]">
          <ul class="col-stretch gap-xs m-0 p-0 list-none">
            <li
              v-for="entry in visibleLogs"
              :key="entry.id"
              class="demo-well row-between min-w-0 gap-sm"
            >
              <span class="text-sm text-foreground">{{ entry.label }}</span>
              <Tag
                :value="String(entry.id)"
                severity="info"
              />
            </li>
          </ul>
          <EmptyState
            v-if="visibleLogs.length === 0"
            icon="i-lucide-inbox"
            :title="$t('showcase.remaining.feedback.noLogsTitle')"
            :description="$t('showcase.remaining.feedback.noLogsDescription')"
          />
        </CScrollbar>
      </article>
    </section>
  </ShowcaseFeedbackDialogBridge>
</template>
