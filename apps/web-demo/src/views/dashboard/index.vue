<script setup lang="ts">
import { useDialog } from '@/hooks/modules/useDialog'

defineOptions({ name: 'Dashboard' })

interface DashboardCard {
  label: string
  value: string
  detail: string
  icon: string
  severity: 'success' | 'info' | 'warn' | 'danger'
}

interface DashboardEvidence {
  title: string
  description: string
  path: string
  icon: string
}

const { info } = useDialog()

const statusCards: DashboardCard[] = [
  {
    label: 'Package boundary',
    value: 'Clean',
    detail: 'contracts -> core -> apps remains the dependency direction',
    icon: 'i-lucide-package-check',
    severity: 'success',
  },
  {
    label: 'Runtime isolation',
    value: 'App-owned',
    detail: 'HTTP and safeStorage runtime stay inside apps/web-demo',
    icon: 'i-lucide-shield-check',
    severity: 'info',
  },
  {
    label: 'Validation gate',
    value: 'Governed',
    detail: 'governance:gate remains the single architecture gate',
    icon: 'i-lucide-list-checks',
    severity: 'success',
  },
  {
    label: 'P4 guardrails',
    value: 'Visible',
    detail: 'strategic work stays deferred or blocked until owner approval',
    icon: 'i-lucide-signpost',
    severity: 'warn',
  },
]

const evidenceCards: DashboardEvidence[] = [
  {
    title: 'Monorepo topology',
    description:
      '@ccd/contracts, @ccd/core, frontend-platform packages, and apps keep separate responsibility boundaries.',
    path: 'wiki/canonical/architecture/package-responsibility-matrix.md',
    icon: 'i-lucide-git-branch',
  },
  {
    title: 'Runtime boundaries',
    description:
      'Runtime access is owned by app adapters or exact app-owned infrastructure exceptions.',
    path: 'wiki/canonical/architecture/runtime-isolation.md',
    icon: 'i-lucide-radar',
  },
  {
    title: 'Web demo role',
    description:
      'The browser app owns routes, stores, views, plugin wiring, HTTP runtime, and safeStorage runtime.',
    path: 'wiki/canonical/application-boundaries/web-demo-role.md',
    icon: 'i-lucide-globe-2',
  },
  {
    title: 'Strategic guardrails',
    description:
      'No Reka UI, TanStack Query, design-system split, starter extraction, or runtime promotion in this lane.',
    path: 'wiki/canonical/governance/strategic-guardrails.md',
    icon: 'i-lucide-ban',
  },
]

const validationCommands = [
  'pnpm wiki:refresh',
  'pnpm arch:runtime',
  'pnpm arch:boundaries',
  'pnpm build:web-demo',
  'pnpm governance:gate',
]

function openValidationDialog(): void {
  info(
    'Architecture console validation is tracked through wiki, route/i18n, runtime, boundary, build, E2E, and governance gates.',
    'CCD Architecture Validation'
  )
}
</script>

<template>
  <section
    id="dashboard-page"
    class="col-stretch gap-lg"
  >
    <header class="material-elevated col-stretch gap-md">
      <div class="row-between gap-md flex-wrap">
        <div class="col-stretch gap-xs min-w-0">
          <span class="text-xs font-semibold text-primary text-no-wrap">CCD Architecture</span>
          <h1 class="text-2xl font-bold text-foreground m-0">Architecture Control Center</h1>
          <p class="text-sm text-muted-foreground m-0 text-ellipsis-2">
            Focused evidence for package boundaries, runtime isolation, validation gates, wiki
            governance, desktop posture, and strategic guardrails.
          </p>
        </div>

        <Button
          id="dashboard-quick-action"
          label="Validation lane"
          icon="i-lucide-shield-check"
          @click="openValidationDialog"
        />
      </div>
    </header>

    <section class="grid grid-cols-1 gap-md md:grid-cols-2 xl:grid-cols-4">
      <article
        v-for="card in statusCards"
        :key="card.label"
        class="material-elevated col-stretch gap-md"
      >
        <div class="row-between gap-md">
          <span class="text-sm text-muted-foreground">{{ card.label }}</span>
          <Tag
            :severity="card.severity"
            :value="card.value"
          />
        </div>
        <Icons
          :name="card.icon"
          size="xl"
          class="text-primary"
        />
        <p class="text-sm text-muted-foreground m-0">
          {{ card.detail }}
        </p>
      </article>
    </section>

    <section class="grid grid-cols-1 gap-md xl:grid-cols-2">
      <article class="material-elevated col-stretch gap-md">
        <div class="row-between gap-md">
          <div class="col-stretch gap-xs">
            <h2 class="text-lg font-semibold text-foreground m-0">Current Route Posture</h2>
            <p class="text-sm text-muted-foreground m-0">
              The old example route museum is reduced into an architecture taxonomy.
            </p>
          </div>
          <Icons
            name="i-lucide-route"
            size="xl"
            class="text-primary"
          />
        </div>

        <div class="grid grid-cols-1 gap-md md:grid-cols-3">
          <div class="demo-well col-stretch gap-xs">
            <span class="text-sm text-muted-foreground">Before</span>
            <strong class="text-2xl text-foreground">106</strong>
            <span class="text-sm text-muted-foreground">registered route records</span>
          </div>
          <div class="demo-well col-stretch gap-xs">
            <span class="text-sm text-muted-foreground">Legacy museum</span>
            <strong class="text-2xl text-foreground">99</strong>
            <span class="text-sm text-muted-foreground">museum route records</span>
          </div>
          <div class="demo-well col-stretch gap-xs">
            <span class="text-sm text-muted-foreground">After</span>
            <strong class="text-2xl text-foreground">29</strong>
            <span class="text-sm text-muted-foreground">focused registered records</span>
          </div>
        </div>
      </article>

      <article class="material-elevated col-stretch gap-md">
        <div class="row-between gap-md">
          <div class="col-stretch gap-xs">
            <h2 class="text-lg font-semibold text-foreground m-0">Validation Commands</h2>
            <p class="text-sm text-muted-foreground m-0">
              The console is governed by existing repo commands, not a new toolchain.
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
            v-for="command in validationCommands"
            :key="command"
            class="code-inline demo-well"
          >
            {{ command }}
          </code>
        </div>
      </article>
    </section>

    <section class="grid grid-cols-1 gap-md xl:grid-cols-4">
      <article
        v-for="item in evidenceCards"
        :key="item.title"
        class="material-elevated col-stretch gap-md"
      >
        <div class="row-between gap-md">
          <Icons
            :name="item.icon"
            size="lg"
            class="text-primary"
          />
          <Tag
            value="Wiki"
            severity="info"
          />
        </div>
        <div class="col-stretch gap-xs">
          <h2 class="text-lg font-semibold text-foreground m-0">
            {{ item.title }}
          </h2>
          <p class="text-sm text-muted-foreground m-0">
            {{ item.description }}
          </p>
        </div>
        <code class="code-inline">{{ item.path }}</code>
      </article>
    </section>
  </section>
</template>
