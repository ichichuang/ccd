<script setup lang="ts">
import { SIZE_PRESETS } from '@/constants/size'

defineOptions({ name: 'ArchitectureStoreSize' })

const sizeStore = useSizeStore()

interface SizeOption {
  value: SizeMode
  label: string
  icon: string
  description: string
}

const sizes: SizeOption[] = [
  {
    value: 'compact',
    label: 'Compact',
    icon: 'i-lucide-minimize-2',
    description: '紧凑密度，最大化信息量，适合数据密集场景',
  },
  {
    value: 'comfortable',
    label: 'Comfortable',
    icon: 'i-lucide-layout-grid',
    description: '舒适默认，适合大多数管理后台场景',
  },
  {
    value: 'loose',
    label: 'Loose',
    icon: 'i-lucide-maximize-2',
    description: '宽松大方，适合内容阅读与展示页',
  },
]

const currentPreset = computed(() => sizeStore.currentPreset)
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
            <h2 class="text-lg font-semibold text-foreground m-0">Size Store</h2>
            <p class="text-sm text-muted-foreground m-0">
              全局空间密度系统控制 — setSize() 原子级更新所有 CSS 变量
            </p>
          </div>
          <Tag
            :value="`current: ${sizeStore.sizeName}`"
            severity="primary"
          />
        </div>
        <Divider />

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-md">
          <button
            v-for="s in sizes"
            :key="s.value"
            class="interactive-card rounded-xl p-md col-stretch gap-sm text-start"
            :class="
              sizeStore.sizeName === s.value
                ? 'ring-2 ring-primary ring-offset-2 ring-offset-background'
                : ''
            "
            @click="sizeStore.setSize(s.value)"
          >
            <div class="row-between">
              <div class="row-start gap-sm items-center">
                <Icons
                  :name="s.icon"
                  size="sm"
                  :class="sizeStore.sizeName === s.value ? 'text-primary' : 'text-muted-foreground'"
                />
                <span class="text-sm font-semibold text-foreground">{{ s.label }}</span>
              </div>
              <div
                v-if="sizeStore.sizeName === s.value"
                class="w-[var(--spacing-sm)] h-[var(--spacing-sm)] rounded-full bg-primary shrink-0"
              />
            </div>
            <span class="text-xs text-muted-foreground">{{ s.description }}</span>
          </button>
        </div>
      </section>

      <section class="material-elevated col-stretch gap-md">
        <h3 class="text-md font-semibold text-foreground m-0">Current Preset Metrics</h3>
        <Divider />
        <div
          v-if="currentPreset"
          class="grid grid-cols-2 md:grid-cols-4 gap-md"
        >
          <div class="col-stretch gap-xs bg-muted rounded-lg p-md">
            <span class="text-xs text-muted-foreground">spacingBase</span>
            <span class="text-xl font-mono font-bold text-primary">
              {{ currentPreset.spacingBase }}px
            </span>
          </div>
          <div class="col-stretch gap-xs bg-muted rounded-lg p-md">
            <span class="text-xs text-muted-foreground">fontSizeBase</span>
            <span class="text-xl font-mono font-bold text-primary">
              {{ currentPreset.fontSizeBase }}px
            </span>
          </div>
          <div class="col-stretch gap-xs bg-muted rounded-lg p-md">
            <span class="text-xs text-muted-foreground">radius</span>
            <span class="text-xl font-mono font-bold text-primary">
              {{ currentPreset.radius }}px
            </span>
          </div>
          <div class="col-stretch gap-xs bg-muted rounded-lg p-md">
            <span class="text-xs text-muted-foreground">presets available</span>
            <span class="text-xl font-mono font-bold text-foreground">
              {{ SIZE_PRESETS.length }}
            </span>
          </div>
        </div>
        <p class="text-sm text-muted-foreground m-0">
          切换预设后，generateSizeVars() 生成 CSS 变量并注入 document.documentElement。 所有使用
          spacing/font token 的组件实时响应，无需页面刷新。
        </p>
      </section>
    </div>
  </div>
</template>
