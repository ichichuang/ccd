<script setup lang="ts">
import { CScrollbar } from '@ccd/vue-ui'
import { useI18n } from 'vue-i18n'
import { showcaseFeedbackAdapter } from '@/adapters/showcaseFeedback.adapter'
import ShowcaseCard from '../ShowcaseCard.vue'
import ShowcaseEmptyState from '../ShowcaseEmptyState.vue'
import ShowcaseFeedbackDialogBridge from '../ShowcaseFeedbackDialogBridge'
import ShowcaseToolbar from '../ShowcaseToolbar.vue'

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
      <ShowcaseCard
        icon="i-lucide-message-circle"
        :title="$t('showcase.remaining.feedback.actionsTitle')"
        :description="$t('showcase.remaining.feedback.actionsDescription')"
      >
        <ShowcaseToolbar class="min-w-0">
          <template #actions>
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
          </template>
        </ShowcaseToolbar>

        <ShowcaseEmptyState
          icon="i-lucide-message-circle"
          :title="$t('showcase.remaining.feedback.emptyTitle')"
          :description="$t('showcase.remaining.feedback.emptyDescription')"
          :action-label="$t('showcase.remaining.feedback.emptyAction')"
          @action="recordEmptyStateAction"
        />
      </ShowcaseCard>

      <ShowcaseCard
        icon="i-lucide-list-checks"
        :title="$t('showcase.remaining.feedback.logTitle')"
      >
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
          <ShowcaseEmptyState
            v-if="visibleLogs.length === 0"
            icon="i-lucide-inbox"
            :title="$t('showcase.remaining.feedback.noLogsTitle')"
            :description="$t('showcase.remaining.feedback.noLogsDescription')"
          />
        </CScrollbar>
      </ShowcaseCard>
    </section>
  </ShowcaseFeedbackDialogBridge>
</template>
