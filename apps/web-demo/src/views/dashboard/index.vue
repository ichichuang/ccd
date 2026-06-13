<script setup lang="ts">
import ArchitectureControlCenter from './components/ArchitectureControlCenter.vue'
import {
  dashboardEvidenceCards,
  dashboardStatusCards,
  dashboardValidationCommands,
} from '@/views/architecture-console/data/dashboard'
import { useDialog } from '@/hooks/modules/useDialog'
import { useI18n } from 'vue-i18n'

defineOptions({ name: 'Dashboard' })

const { info } = useDialog()
const { t } = useI18n()

function dashboardKey(field: string): string {
  return `console.dashboard.${field}`
}

function cardKey(key: string, field: string): string {
  return `console.dashboard.cards.${key}.${field}`
}

function valueKey(key: string): string {
  return `console.dashboard.values.${key}`
}

function evidenceKey(key: string, field: string): string {
  return `console.dashboard.evidence.${key}.${field}`
}

function openValidationDialog(): void {
  info(t('console.dashboard.dialog.message'), t('console.dashboard.dialog.title'))
}
</script>

<template>
  <ArchitectureControlCenter
    :eyebrow="t(dashboardKey('eyebrow'))"
    :title="t(dashboardKey('title'))"
    :description="t(dashboardKey('description'))"
    :action-label="t(dashboardKey('action'))"
    @action="openValidationDialog"
  >
    <section class="grid min-w-0 grid-cols-1 gap-md md:grid-cols-2 xl:grid-cols-4">
      <article
        v-for="card in dashboardStatusCards"
        :key="card.key"
        class="material-elevated col-stretch min-w-0 gap-md"
      >
        <div class="row-between gap-md">
          <span class="text-sm text-muted-foreground min-w-0">
            {{ t(cardKey(card.key, 'label')) }}
          </span>
          <Tag
            :severity="card.severity"
            :value="t(valueKey(card.valueKey))"
          />
        </div>
        <Icons
          :name="card.icon"
          size="xl"
          class="text-primary"
        />
        <p class="text-sm text-muted-foreground m-0">
          {{ t(cardKey(card.key, 'detail')) }}
        </p>
      </article>
    </section>

    <section class="grid min-w-0 grid-cols-1 gap-md xl:grid-cols-2">
      <article class="material-elevated col-stretch min-w-0 gap-md">
        <div class="row-between gap-md">
          <div class="col-stretch min-w-0 gap-xs">
            <h2 class="text-lg font-semibold text-foreground m-0">
              {{ t(dashboardKey('routePosture.title')) }}
            </h2>
            <p class="text-sm text-muted-foreground m-0">
              {{ t(dashboardKey('routePosture.description')) }}
            </p>
          </div>
          <Icons
            name="i-lucide-route"
            size="xl"
            class="text-primary"
          />
        </div>

        <div class="grid min-w-0 grid-cols-1 gap-md md:grid-cols-3">
          <div class="demo-well col-stretch min-w-0 gap-xs">
            <span class="text-sm text-muted-foreground">
              {{ t(dashboardKey('routePosture.before')) }}
            </span>
            <strong class="text-2xl text-foreground">106</strong>
            <span class="text-sm text-muted-foreground">
              {{ t(dashboardKey('routePosture.beforeDetail')) }}
            </span>
          </div>
          <div class="demo-well col-stretch min-w-0 gap-xs">
            <span class="text-sm text-muted-foreground">
              {{ t(dashboardKey('routePosture.legacy')) }}
            </span>
            <strong class="text-2xl text-foreground">99</strong>
            <span class="text-sm text-muted-foreground">
              {{ t(dashboardKey('routePosture.legacyDetail')) }}
            </span>
          </div>
          <div class="demo-well col-stretch min-w-0 gap-xs">
            <span class="text-sm text-muted-foreground">
              {{ t(dashboardKey('routePosture.after')) }}
            </span>
            <strong class="text-2xl text-foreground">30</strong>
            <span class="text-sm text-muted-foreground">
              {{ t(dashboardKey('routePosture.afterDetail')) }}
            </span>
          </div>
        </div>
      </article>

      <article class="material-elevated col-stretch min-w-0 gap-md">
        <div class="row-between gap-md">
          <div class="col-stretch min-w-0 gap-xs">
            <h2 class="text-lg font-semibold text-foreground m-0">
              {{ t(dashboardKey('commands.title')) }}
            </h2>
            <p class="text-sm text-muted-foreground m-0">
              {{ t(dashboardKey('commands.description')) }}
            </p>
          </div>
          <Icons
            name="i-lucide-terminal"
            size="xl"
            class="text-primary"
          />
        </div>

        <div class="col-stretch gap-sm">
          <code
            v-for="command in dashboardValidationCommands"
            :key="command"
            class="dashboard-safe-code code-inline demo-well w-full min-w-0 whitespace-normal break-words leading-normal"
          >
            {{ command }}
          </code>
        </div>
      </article>
    </section>

    <section class="grid min-w-0 grid-cols-1 gap-md md:grid-cols-2 3xl:grid-cols-4">
      <article
        v-for="item in dashboardEvidenceCards"
        :key="item.key"
        class="material-elevated col-stretch min-w-0 gap-md"
      >
        <div class="row-between gap-md">
          <Icons
            :name="item.icon"
            size="lg"
            class="text-primary"
          />
          <Tag
            :value="t(dashboardKey('evidenceTag'))"
            severity="info"
          />
        </div>
        <div class="col-stretch min-w-0 gap-xs">
          <h2 class="text-lg font-semibold text-foreground m-0">
            {{ t(evidenceKey(item.key, 'title')) }}
          </h2>
          <p class="text-sm text-muted-foreground m-0">
            {{ t(evidenceKey(item.key, 'description')) }}
          </p>
        </div>
        <code
          class="dashboard-safe-code code-inline w-full min-w-0 whitespace-normal break-words leading-normal"
        >
          {{ item.path }}
        </code>
      </article>
    </section>
  </ArchitectureControlCenter>
</template>

<style scoped>
.dashboard-safe-code {
  overflow-wrap: anywhere;
}
</style>
