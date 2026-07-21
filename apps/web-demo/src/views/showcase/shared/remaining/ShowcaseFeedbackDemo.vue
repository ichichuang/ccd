<script setup lang="ts">
import { CScrollbar } from '@ccd/vue-ui'
import { useI18n } from 'vue-i18n'
import { showcaseFeedbackAdapter } from '@/adapters/showcaseFeedback.adapter'
import ShowcaseCard from '../ShowcaseCard.vue'
import ShowcaseEmptyState from '../ShowcaseEmptyState.vue'
import ShowcaseFeedbackDialogBridge from '../ShowcaseFeedbackDialogBridge'
import ShowcaseSection from '../ShowcaseSection.vue'
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
const actionButtonPt = {
  root: {
    class:
      'ring-focus-focus focus:!outline-solid focus:!outline-2 focus:!outline-ring focus:!outline-offset-2',
  },
}

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
    <div
      class="col-stretch min-w-0 gap-lg"
    >
      <ShowcaseSection
        :title="$t('showcase.remaining.feedback.stageTitle')"
        :description="$t('showcase.remaining.feedback.stageDescription')"
        icon="i-lucide-message-circle"
      >
        <ShowcaseToolbar
          :title="$t('showcase.remaining.feedback.toolbarTitle')"
          :description="$t('showcase.remaining.feedback.toolbarDescription')"
        >
          <template #actions>
            <Button
              :label="$t('showcase.remaining.feedback.openDialog')"
              icon="i-lucide-panel-top-open"
              severity="primary"
              :pt="actionButtonPt"
              @click="openInfoDialog(openDialog)"
            />
            <Button
              :label="$t('showcase.remaining.feedback.showMessage')"
              icon="i-lucide-message-square"
              severity="success"
              outlined
              :pt="actionButtonPt"
              @click="showMessage"
            />
            <Button
              :label="$t('showcase.remaining.feedback.showToast')"
              icon="i-lucide-bell"
              severity="warn"
              outlined
              :pt="actionButtonPt"
              @click="showToast"
            />
          </template>
        </ShowcaseToolbar>

        <div class="grid min-w-0 grid-cols-1 gap-md xl:grid-cols-2">
          <ShowcaseCard
            icon="i-lucide-panel-top-open"
            :title="$t('showcase.remaining.feedback.emptyTitle')"
            :description="$t('showcase.remaining.feedback.emptyDescription')"
          >
            <div class="demo-stage col-stretch min-w-0 gap-md">
              <div class="demo-well col-stretch min-w-0 gap-xs">
                <span class="text-xs font-semibold text-primary">
                  {{ $t('showcase.remaining.feedback.stageCardTitle') }}
                </span>
                <p class="text-sm text-muted-foreground m-0">
                  {{ $t('showcase.remaining.feedback.stageCardDescription') }}
                </p>
              </div>

              <div class="grid min-w-0 grid-cols-1 gap-sm md:grid-cols-3">
                <div class="demo-well col-stretch min-w-0 gap-xs">
                  <span class="text-xs font-semibold text-primary">
                    {{ $t('showcase.remaining.feedback.dialogContractTitle') }}
                  </span>
                  <p class="text-sm text-muted-foreground m-0">
                    {{ $t('showcase.remaining.feedback.dialogContractDescription') }}
                  </p>
                </div>
                <div class="demo-well col-stretch min-w-0 gap-xs">
                  <span class="text-xs font-semibold text-primary">
                    {{ $t('showcase.remaining.feedback.messageContractTitle') }}
                  </span>
                  <p class="text-sm text-muted-foreground m-0">
                    {{ $t('showcase.remaining.feedback.messageContractDescription') }}
                  </p>
                </div>
                <div class="demo-well col-stretch min-w-0 gap-xs">
                  <span class="text-xs font-semibold text-primary">
                    {{ $t('showcase.remaining.feedback.toastContractTitle') }}
                  </span>
                  <p class="text-sm text-muted-foreground m-0">
                    {{ $t('showcase.remaining.feedback.toastContractDescription') }}
                  </p>
                </div>
              </div>
            </div>
          </ShowcaseCard>

          <ShowcaseCard
            icon="i-lucide-list-checks"
            :title="$t('showcase.remaining.feedback.logTitle')"
            :description="$t('showcase.remaining.feedback.logDescription')"
          >
            <CScrollbar class="max-h-[32vh]">
              <ul
                v-if="visibleLogs.length"
                class="col-stretch gap-xs m-0 p-0 list-none"
                aria-live="polite"
              >
                <li
                  v-for="entry in visibleLogs"
                  :key="entry.id"
                  class="demo-well row-between min-w-0 gap-sm"
                >
                  <span class="min-w-0 break-words text-sm text-foreground">
                    {{ entry.label }}
                  </span>
                  <Tag
                    :value="String(entry.id)"
                    severity="info"
                  />
                </li>
              </ul>

              <ShowcaseEmptyState
                v-else
                icon="i-lucide-inbox"
                :title="$t('showcase.remaining.feedback.noLogsTitle')"
                :description="$t('showcase.remaining.feedback.noLogsDescription')"
                :action-label="$t('showcase.remaining.feedback.emptyAction')"
                @action="recordEmptyStateAction"
              />
            </CScrollbar>
          </ShowcaseCard>
        </div>
      </ShowcaseSection>

      <ShowcaseSection
        :title="$t('showcase.remaining.feedback.contractTitle')"
        :description="$t('showcase.remaining.feedback.contractDescription')"
        icon="i-lucide-badge-check"
      >
        <div class="grid min-w-0 grid-cols-1 gap-md lg:grid-cols-3">
          <ShowcaseCard
            icon="i-lucide-route"
            :title="$t('showcase.remaining.feedback.dialogContractTitle')"
            :description="$t('showcase.remaining.feedback.dialogContractDescription')"
            :tag="$t('showcase.remaining.tags.technical')"
          />
          <ShowcaseCard
            icon="i-lucide-message-square"
            :title="$t('showcase.remaining.feedback.messageContractTitle')"
            :description="$t('showcase.remaining.feedback.messageContractDescription')"
            :tag="$t('showcase.remaining.tags.technical')"
          />
          <ShowcaseCard
            icon="i-lucide-bell"
            :title="$t('showcase.remaining.feedback.toastContractTitle')"
            :description="$t('showcase.remaining.feedback.toastContractDescription')"
            :tag="$t('showcase.remaining.tags.technical')"
          />
        </div>
      </ShowcaseSection>
    </div>
  </ShowcaseFeedbackDialogBridge>
</template>
