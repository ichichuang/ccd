<script setup lang="ts">
import { useThemeStore } from '@/stores/modules/theme'
import { useThemeSwitch } from '@/hooks/modules/useThemeSwitch'
import { THEME_PRESETS } from '@/constants/theme'
import { COLOR_FAMILIES } from '@/utils/theme/metadata'
import { useToast } from 'primevue/usetoast'
import { ref, computed } from 'vue'

const themeStore = useThemeStore()
const { setThemeWithAnimation, isAnimating } = useThemeSwitch()
const toast = useToast()

const MODE_OPTIONS = [
  { value: 'light', label: 'Light', icon: 'i-lucide-sun' },
  { value: 'dark', label: 'Dark', icon: 'i-lucide-moon' },
  { value: 'auto', label: 'Auto', icon: 'i-lucide-monitor' },
] as const

const TRANSITION_OPTIONS: { value: ThemeTransitionMode; label: string }[] = [
  { value: 'circle', label: 'Circle' },
  { value: 'curtain', label: 'Curtain' },
  { value: 'diamond', label: 'Diamond' },
  { value: 'implosion', label: 'Implosion' },
  { value: 'glitch', label: 'Glitch' },
  { value: 'fade', label: 'Fade' },
]

// Active section state
const activeSection = ref<string>('overview')

// Dynamic Color Demo
const dynamicBgColor = ref('#3665f9')
const dynamicTextColor = ref('#ffffff')
const computedStyle = computed(() => ({
  backgroundColor: dynamicBgColor.value,
  color: dynamicTextColor.value,
  padding: '1rem',
  borderRadius: '0.5rem',
  textAlign: 'center' as const,
  fontWeight: 600,
}))

function copyToClipboard(text: string, label = '') {
  navigator.clipboard.writeText(text).then(() => {
    toast.add({
      severity: 'success',
      summary: 'Copied!',
      detail: label || text,
      life: 2000,
    })
  })
}

function getPresetPreviewGradient(preset: any) {
  const primary = preset.colors?.light?.primary?.default ?? preset.primary
  const bg = preset.colors?.light?.background ?? '#ffffff'
  return `linear-gradient(135deg, ${bg} 0%, ${bg} 50%, ${primary} 50%, ${primary} 100%)`
}

// Color token categories for systematic documentation
const colorCategories = [
  {
    id: 'quad',
    title: 'Quad Families',
    subtitle: 'Primary, Accent, Destructive, Warn, Success',
    description:
      'Full-featured color families with 6 variants each: DEFAULT, foreground, hover, hover-foreground, light, light-foreground',
    tokens: COLOR_FAMILIES.quadFamilies,
    variants: ['default', 'foreground', 'hover', 'hover-foreground', 'light', 'light-foreground'],
  },
  {
    id: 'pair',
    title: 'Pair Families',
    subtitle: 'Card, Popover, Secondary, Muted',
    description: 'Surface & utility colors with 2 variants: DEFAULT and foreground',
    tokens: COLOR_FAMILIES.pairFamilies,
    variants: ['default', 'foreground'],
  },
  {
    id: 'single',
    title: 'Single Tokens',
    subtitle: 'Border, Input, Ring, Background, Foreground',
    description: 'Atomic design tokens with direct CSS variable mapping',
    tokens: COLOR_FAMILIES.singleTokens,
    variants: ['default'],
  },
]

// Sidebar tokens
const sidebarTokens = [
  { token: 'sidebar-background', usage: 'bg-sidebar' },
  { token: 'sidebar-foreground', usage: 'text-sidebar-foreground' },
  { token: 'sidebar-primary', usage: 'bg-sidebar-primary' },
  { token: 'sidebar-primary-foreground', usage: 'text-sidebar-primary-foreground' },
  { token: 'sidebar-accent', usage: 'bg-sidebar-accent' },
  { token: 'sidebar-accent-foreground', usage: 'text-sidebar-accent-foreground' },
  { token: 'sidebar-border', usage: 'border-sidebar-border' },
  { token: 'sidebar-ring', usage: 'ring-sidebar-ring' },
]
</script>

<template>
  <div class="min-h-screen bg-background text-foreground">
    <!-- Sticky Header -->
    <header
      class="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div class="container mx-auto px-6 py-4">
        <div class="flex items-center justify-between gap-8">
          <div>
            <h1 class="text-2xl font-bold">Theme System Developer Guide</h1>
            <p class="mt-1 text-sm text-muted-foreground">Configuration-First 配色架构完整参考</p>
          </div>

          <!-- Theme Controls -->
          <div class="flex items-center gap-4">
            <!-- Mode Switcher -->
            <div class="flex items-center rounded-full border border-border bg-card p-1 shadow-sm">
              <button
                v-for="opt in MODE_OPTIONS"
                :key="opt.value"
                class="relative flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200"
                :class="
                  themeStore.mode === opt.value
                    ? 'bg-primary text-primary-foreground shadow'
                    : 'text-muted-foreground hover:text-foreground'
                "
                :disabled="isAnimating"
                @click="e => setThemeWithAnimation(opt.value, e)"
              >
                <i :class="[opt.icon, 'w-3.5 h-3.5']" />
                {{ opt.label }}
              </button>
            </div>

            <!-- Transition Mode Selector -->
            <Select
              :model-value="themeStore.transitionMode"
              :options="TRANSITION_OPTIONS"
              class="w-36"
              option-label="label"
              option-value="value"
              placeholder="Transition"
              @update:model-value="val => themeStore.setTransitionMode(val as ThemeTransitionMode)"
            />
          </div>
        </div>
      </div>
    </header>

    <main class="container mx-auto max-w-7xl px-6 py-12">
      <!-- Quick Navigation -->
      <nav class="mb-12 rounded-xl border border-border bg-card/50 p-6">
        <div class="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-6">
          <button
            v-for="section in ['overview', 'presets', 'tokens', 'unocss', 'scss', 'dynamic']"
            :key="section"
            class="rounded-lg px-4 py-2 text-sm font-medium transition-all"
            :class="
              activeSection === section
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
            "
            @click="activeSection = section"
          >
            {{ section.charAt(0).toUpperCase() + section.slice(1) }}
          </button>
        </div>
      </nav>

      <!-- Section 1: Architecture Overview -->
      <section
        v-show="activeSection === 'overview'"
        class="space-y-8"
      >
        <div>
          <h2 class="mb-2 flex items-center gap-2 text-3xl font-bold">
            <i class="i-lucide-book-open text-primary" />
            Architecture Overview
          </h2>
          <p class="text-muted-foreground">Understanding the Configuration-First theme system</p>
        </div>

        <div class="grid gap-6 md:grid-cols-2">
          <!-- Color Taxonomy -->
          <div class="rounded-xl border border-border bg-card p-6">
            <h3 class="mb-4 flex items-center gap-2 text-lg font-semibold">
              <i class="i-lucide-layers w-5 h-5 text-primary" />
              Color Taxonomy
            </h3>
            <div class="space-y-4">
              <div>
                <div class="mb-1 text-sm font-medium">Quad Families (6 variants)</div>
                <div class="font-mono text-xs text-muted-foreground">
                  primary, accent, destructive, warn, success
                </div>
              </div>
              <div>
                <div class="mb-1 text-sm font-medium">Pair Families (2 variants)</div>
                <div class="font-mono text-xs text-muted-foreground">
                  card, popover, secondary, muted
                </div>
              </div>
              <div>
                <div class="mb-1 text-sm font-medium">Single Tokens</div>
                <div class="font-mono text-xs text-muted-foreground">
                  border, input, ring, background, foreground
                </div>
              </div>
              <div>
                <div class="mb-1 text-sm font-medium">Sidebar Family (8 tokens)</div>
                <div class="font-mono text-xs text-muted-foreground">sidebar-*</div>
              </div>
            </div>
          </div>

          <!-- Resolution Priority -->
          <div class="rounded-xl border border-border bg-card p-6">
            <h3 class="mb-4 flex items-center gap-2 text-lg font-semibold">
              <i class="i-lucide-workflow w-5 h-5 text-primary" />
              Resolution Priority
            </h3>
            <ol class="space-y-3 text-sm">
              <li class="flex items-start gap-3">
                <div
                  class="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground"
                >
                  1
                </div>
                <div>
                  <div class="font-medium">Explicit Configuration</div>
                  <div class="text-xs text-muted-foreground">preset.colors.light/dark.*</div>
                </div>
              </li>
              <li class="flex items-start gap-3">
                <div
                  class="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground"
                >
                  2
                </div>
                <div>
                  <div class="font-medium">Legacy Preset</div>
                  <div class="text-xs text-muted-foreground">preset.primary, preset.accent</div>
                </div>
              </li>
              <li class="flex items-start gap-3">
                <div
                  class="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground"
                >
                  3
                </div>
                <div>
                  <div class="font-medium">Algorithmic Fallback</div>
                  <div class="text-xs text-muted-foreground">THEME_ENGINE constants</div>
                </div>
              </li>
            </ol>
          </div>
        </div>

        <!-- Key Files Reference -->
        <div class="rounded-xl border border-border bg-muted/30 p-6">
          <h3 class="mb-4 text-lg font-semibold">Key Architecture Files</h3>
          <div class="grid gap-3 text-sm font-mono md:grid-cols-2">
            <div class="flex items-center gap-2 rounded bg-card p-2">
              <i class="i-lucide-file-code text-primary" />
              <span class="text-muted-foreground">src/types/systems/</span>
              <span class="font-semibold text-primary">theme.d.ts</span>
            </div>
            <div class="flex items-center gap-2 rounded bg-card p-2">
              <i class="i-lucide-file-code text-primary" />
              <span class="text-muted-foreground">src/utils/theme/</span>
              <span class="font-semibold text-primary">engine.ts</span>
            </div>
            <div class="flex items-center gap-2 rounded bg-card p-2">
              <i class="i-lucide-file-code text-primary" />
              <span class="text-muted-foreground">src/utils/theme/</span>
              <span class="font-semibold text-primary">metadata.ts</span>
            </div>
            <div class="flex items-center gap-2 rounded bg-card p-2">
              <i class="i-lucide-file-code text-primary" />
              <span class="text-muted-foreground">src/constants/</span>
              <span class="font-semibold text-primary">theme.ts</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Section 2: Theme Presets -->
      <section
        v-show="activeSection === 'presets'"
        class="space-y-8"
      >
        <div>
          <h2 class="mb-2 flex items-center gap-2 text-3xl font-bold">
            <i class="i-lucide-swatch-book text-primary" />
            Theme Presets
          </h2>
          <p class="text-muted-foreground">Switch between professionally curated color palettes</p>
        </div>

        <div class="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          <button
            v-for="preset in THEME_PRESETS"
            :key="preset.name"
            class="group flex flex-col items-center gap-3 rounded-xl border-2 bg-card p-4 transition-all hover:-translate-y-1 hover:shadow-lg"
            :class="
              themeStore.themeName === preset.name
                ? 'border-primary shadow-md ring-2 ring-primary/20'
                : 'border-transparent hover:border-border'
            "
            @click="themeStore.setTheme(preset.name)"
          >
            <div
              class="h-20 w-20 rounded-full shadow-inner ring-1 ring-border/20"
              :style="{ background: getPresetPreviewGradient(preset) }"
            ></div>
            <div class="text-center">
              <div class="text-sm font-medium">{{ preset.label }}</div>
              <code class="text-[10px] text-muted-foreground">{{ preset.name }}</code>
            </div>
            <div
              v-if="themeStore.themeName === preset.name"
              class="absolute right-2 top-2"
            >
              <i class="i-lucide-check-circle-2 h-5 w-5 text-primary" />
            </div>
          </button>
        </div>
      </section>

      <!-- Section 3: Token Reference -->
      <section
        v-show="activeSection === 'tokens'"
        class="space-y-8"
      >
        <div>
          <h2 class="mb-2 flex items-center gap-2 text-3xl font-bold">
            <i class="i-lucide-palette text-primary" />
            Token Reference
          </h2>
          <p class="text-muted-foreground">
            Complete catalog of all color tokens and their variants
          </p>
        </div>

        <!-- Quad Families -->
        <div
          v-for="cat in colorCategories"
          :key="cat.id"
          class="rounded-xl border border-border bg-card/30 p-6"
        >
          <div class="mb-6">
            <h3 class="text-xl font-semibold">{{ cat.title }}</h3>
            <p class="mt-1 text-sm text-muted-foreground">{{ cat.description }}</p>
          </div>

          <div class="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
            <div
              v-for="token in cat.tokens"
              :key="token"
              class="rounded-lg border border-border bg-card p-4"
            >
              <h4 class="mb-3 flex items-center justify-between text-sm font-semibold capitalize">
                <span>{{ token }}</span>
                <code class="font-mono text-[10px] text-muted-foreground">--{{ token }}</code>
              </h4>
              <div class="space-y-2">
                <template v-if="cat.id === 'quad'">
                  <!-- Quad variants: 6 total -->
                  <button
                    :class="`bg-${token} text-${token}-foreground`"
                    class="w-full rounded px-3 py-2 text-xs font-medium transition-opacity hover:opacity-90"
                    @click="copyToClipboard(`bg-${token}`, `bg-${token}`)"
                  >
                    bg-{{ token }}
                  </button>
                  <button
                    :class="`bg-${token}-hover text-${token}-hover-foreground`"
                    class="w-full rounded px-3 py-2 text-xs font-medium transition-opacity hover:opacity-90"
                    @click="copyToClipboard(`bg-${token}-hover`, `bg-${token}-hover`)"
                  >
                    bg-{{ token }}-hover
                  </button>
                  <button
                    :class="`bg-${token}-light text-${token}-light-foreground`"
                    class="w-full rounded px-3 py-2 text-xs font-medium transition-opacity hover:opacity-90"
                    @click="copyToClipboard(`bg-${token}-light`, `bg-${token}-light`)"
                  >
                    bg-{{ token }}-light
                  </button>
                </template>
                <template v-else-if="cat.id === 'pair'">
                  <!-- Pair variants: 2 total -->
                  <button
                    :class="`bg-${token} text-${token}-foreground`"
                    class="w-full rounded px-3 py-2 text-xs font-medium transition-opacity hover:opacity-90"
                    @click="copyToClipboard(`bg-${token}`, `bg-${token}`)"
                  >
                    bg-{{ token }}
                  </button>
                </template>
                <template v-else>
                  <!-- Single token -->
                  <button
                    :class="[
                      token === 'border' || token === 'input' || token === 'ring'
                        ? `border-2 border-${token} bg-card text-foreground`
                        : token === 'foreground'
                          ? 'bg-foreground text-background'
                          : token === 'background'
                            ? 'bg-background text-foreground border border-border'
                            : `bg-${token} text-foreground`,
                    ]"
                    class="w-full rounded px-3 py-2 text-xs font-medium transition-opacity hover:opacity-90"
                    @click="
                      copyToClipboard(
                        token === 'border' || token === 'input' || token === 'ring'
                          ? `border-${token}`
                          : `bg-${token}`
                      )
                    "
                  >
                    {{
                      token === 'border' || token === 'input' || token === 'ring'
                        ? `border-${token}`
                        : `bg-${token}`
                    }}
                  </button>
                </template>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar Tokens -->
        <div class="rounded-xl border border-border bg-card/30 p-6">
          <div class="mb-6">
            <h3 class="text-xl font-semibold">Sidebar Family</h3>
            <p class="mt-1 text-sm text-muted-foreground">
              Dedicated tokens for sidebar components with independent theming
            </p>
          </div>

          <div class="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <button
              v-for="item in sidebarTokens"
              :key="item.token"
              class="group flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:bg-muted/50"
              @click="copyToClipboard(item.usage, item.token)"
            >
              <div
                :class="[
                  item.usage.startsWith('bg-') ? item.usage : 'bg-sidebar',
                  item.token.includes('foreground')
                    ? 'flex items-center justify-center text-[8px] text-sidebar-background font-bold'
                    : '',
                ]"
                class="h-10 w-10 flex-shrink-0 rounded-md border border-border/10 shadow-sm"
              >
                <span v-if="item.token.includes('foreground')">Aa</span>
              </div>
              <div class="min-w-0 text-left">
                <div
                  class="truncate text-xs font-medium transition-colors group-hover:text-primary"
                >
                  {{ item.token }}
                </div>
                <code class="font-mono text-[10px] text-muted-foreground">.{{ item.usage }}</code>
              </div>
            </button>
          </div>
        </div>
      </section>

      <!-- Section 4: UnoCSS Usage -->
      <section
        v-show="activeSection === 'unocss'"
        class="space-y-8"
      >
        <div>
          <h2 class="mb-2 flex items-center gap-2 text-3xl font-bold">
            <i class="i-lucide-code text-primary" />
            UnoCSS Class Usage
          </h2>
          <p class="text-muted-foreground">Utility-first class names for rapid UI development</p>
        </div>

        <!-- Background Colors -->
        <div class="rounded-xl border border-border bg-card p-6">
          <h3 class="mb-4 text-lg font-semibold">Background Colors</h3>
          <div class="grid gap-6 md:grid-cols-2">
            <div>
              <div class="mb-2 text-sm font-medium text-muted-foreground">Syntax</div>
              <pre class="overflow-x-auto rounded-lg bg-muted p-4 text-sm"><code>bg-{token}
bg-{token}-hover
bg-{token}-light
bg-{token}/{opacity}</code></pre>
            </div>
            <div>
              <div class="mb-2 text-sm font-medium text-muted-foreground">Examples</div>
              <div class="space-y-2">
                <div class="rounded bg-primary px-3 py-2 font-mono text-sm text-primary-foreground">
                  bg-primary
                </div>
                <div
                  class="rounded bg-accent-light px-3 py-2 font-mono text-sm text-accent-light-foreground"
                >
                  bg-accent-light
                </div>
                <div class="rounded bg-destructive/20 px-3 py-2 font-mono text-sm text-destructive">
                  bg-destructive/20
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Text Colors -->
        <div class="rounded-xl border border-border bg-card p-6">
          <h3 class="mb-4 text-lg font-semibold">Text Colors</h3>
          <div class="grid gap-6 md:grid-cols-2">
            <div>
              <div class="mb-2 text-sm font-medium text-muted-foreground">Syntax</div>
              <pre class="overflow-x-auto rounded-lg bg-muted p-4 text-sm"><code>text-{token}
text-{token}-foreground
text-{token}-hover-foreground
text-{token}/{opacity}</code></pre>
            </div>
            <div>
              <div class="mb-2 text-sm font-medium text-muted-foreground">Examples</div>
              <div class="space-y-2 rounded-lg bg-background p-4">
                <div class="font-mono text-sm text-primary">text-primary</div>
                <div class="font-mono text-sm text-muted-foreground">text-muted-foreground</div>
                <div class="font-mono text-sm text-success/60">text-success/60</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Border Colors -->
        <div class="rounded-xl border border-border bg-card p-6">
          <h3 class="mb-4 text-lg font-semibold">Border & Ring Colors</h3>
          <div class="grid gap-6 md:grid-cols-2">
            <div>
              <div class="mb-2 text-sm font-medium text-muted-foreground">Syntax</div>
              <pre class="overflow-x-auto rounded-lg bg-muted p-4 text-sm"><code>border-{token}
border-{token}-hover
ring-{token}
ring-offset-{token}</code></pre>
            </div>
            <div>
              <div class="mb-2 text-sm font-medium text-muted-foreground">Examples</div>
              <div class="space-y-2">
                <div class="rounded border-2 border-primary p-2 text-center font-mono text-sm">
                  border-primary
                </div>
                <div class="rounded border-2 border-warn p-2 text-center font-mono text-sm">
                  border-warn
                </div>
                <div class="rounded p-2 text-center font-mono text-sm ring-2 ring-success">
                  ring-success
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Combined Patterns -->
        <div class="rounded-xl border border-primary/20 bg-primary/5 p-6">
          <h3 class="mb-4 flex items-center gap-2 text-lg font-semibold">
            <i class="i-lucide-sparkles h-5 w-5 text-primary" />
            Combined Patterns
          </h3>
          <div class="space-y-3 text-sm">
            <div class="flex items-start gap-3">
              <code class="flex-1 rounded bg-card p-3 font-mono text-xs"
                >bg-primary text-primary-foreground</code
              >
              <div class="rounded bg-primary px-4 py-2 font-medium text-primary-foreground">
                Button
              </div>
            </div>
            <div class="flex items-start gap-3">
              <code class="flex-1 rounded bg-card p-3 font-mono text-xs"
                >bg-card text-card-foreground border border-border</code
              >
              <div class="rounded border border-border bg-card px-4 py-2 text-card-foreground">
                Card
              </div>
            </div>
            <div class="flex items-start gap-3">
              <code class="flex-1 rounded bg-card p-3 font-mono text-xs"
                >bg-secondary text-secondary-foreground hover:bg-secondary/80</code
              >
              <div
                class="rounded bg-secondary px-4 py-2 text-secondary-foreground transition-colors hover:bg-secondary/80"
              >
                Secondary
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Section 5: SCSS/Style Usage -->
      <section
        v-show="activeSection === 'scss'"
        class="space-y-8"
      >
        <div>
          <h2 class="mb-2 flex items-center gap-2 text-3xl font-bold">
            <i class="i-lucide-braces text-primary" />
            SCSS / Style Usage
          </h2>
          <p class="text-muted-foreground">Using CSS variables directly in styles and SCSS</p>
        </div>

        <!-- CSS Variables -->
        <div class="rounded-xl border border-border bg-card p-6">
          <h3 class="mb-4 text-lg font-semibold">CSS Variable Format</h3>
          <div class="mb-4 rounded-lg bg-muted p-4 font-mono text-sm">
            --{"{token}"}: RGB_CHANNELS<br />
            Example: --primary: 54 101 249
          </div>
          <div class="mb-4 text-sm text-muted-foreground">
            ⚠️ All CSS variables use RGB channel format (e.g.,
            <code class="rounded bg-muted px-1">54 101 249</code>) to support opacity modifiers via
            <code class="rounded bg-muted px-1">rgb(var(--primary) / 0.5)</code>
          </div>
        </div>

        <!-- Template Style Usage -->
        <div class="rounded-xl border border-border bg-card p-6">
          <h3 class="mb-4 text-lg font-semibold">
            Template <code class="rounded bg-muted px-2 py-0.5 text-sm">&lt;style&gt;</code> Usage
          </h3>
          <div class="space-y-4">
            <div>
              <div class="mb-2 text-sm font-medium text-muted-foreground">
                RGB Format (with opacity support)
              </div>
              <pre
                class="overflow-x-auto rounded-lg bg-muted p-4 text-sm"
              ><code>&lt;style scoped&gt;
.my-button {
  background: rgb(var(--primary) / &lt;alpha-value&gt;);
  color: rgb(var(--primary-foreground));
}

.my-card {
  background: rgb(var(--card));
  border: 1px solid rgb(var(--border) / 0.5);
}
&lt;/style&gt;</code></pre>
            </div>
            <div>
              <div class="mb-2 text-sm font-medium text-muted-foreground">SCSS Mixing</div>
              <pre
                class="overflow-x-auto rounded-lg bg-muted p-4 text-sm"
              ><code>&lt;style lang="scss" scoped&gt;
.themed-component {
  background: rgb(var(--background));

  &__header {
    background: rgb(var(--primary));
    color: rgb(var(--primary-foreground));
  }

  &:hover {
    background: rgb(var(--muted) / 0.8);
  }
}
&lt;/style&gt;</code></pre>
            </div>
          </div>
        </div>

        <!-- Inline Style Binding -->
        <div class="rounded-xl border border-border bg-card p-6">
          <h3 class="mb-4 text-lg font-semibold">
            Vue <code class="rounded bg-muted px-2 py-0.5 text-sm">:style</code> Binding
          </h3>
          <pre
            class="mb-4 overflow-x-auto rounded-lg bg-muted p-4 text-sm"
          ><code>&lt;!-- Using CSS variables in inline styles --&gt;
&lt;div :style="{
  background: 'rgb(var(--primary))',
  color: 'rgb(var(--primary-foreground))',
  padding: '1rem',
  borderRadius: '0.5rem'
}"&gt;
  Dynamic Styled Element
&lt;/div&gt;

&lt;!-- With opacity --&gt;
&lt;div :style="{
  background: 'rgb(var(--destructive) / 0.1)',
  border: '1px solid rgb(var(--destructive))'
}"&gt;
  Light Destructive Background
&lt;/div&gt;</code></pre>
        </div>
      </section>

      <!-- Section 6: Dynamic Script Usage -->
      <section
        v-show="activeSection === 'dynamic'"
        class="space-y-8"
      >
        <div>
          <h2 class="mb-2 flex items-center gap-2 text-3xl font-bold">
            <i class="i-lucide-terminal text-primary" />
            Dynamic Script Usage
          </h2>
          <p class="text-muted-foreground">
            Programmatic color manipulation in
            <code class="rounded bg-muted px-2 py-0.5 text-xs">script setup</code>
          </p>
        </div>

        <!-- Live Demo -->
        <div class="rounded-xl border border-border bg-card p-6">
          <h3 class="mb-4 text-lg font-semibold">Live Interactive Demo</h3>
          <div class="grid gap-6 md:grid-cols-2">
            <div class="space-y-4">
              <div>
                <label class="mb-2 block text-sm font-medium">Background Color</label>
                <input
                  v-model="dynamicBgColor"
                  class="h-10 w-full rounded border border-border"
                  type="color"
                />
                <code class="mt-1 block text-xs text-muted-foreground">{{ dynamicBgColor }}</code>
              </div>
              <div>
                <label class="mb-2 block text-sm font-medium">Text Color</label>
                <input
                  v-model="dynamicTextColor"
                  class="h-10 w-full rounded border border-border"
                  type="color"
                />
                <code class="mt-1 block text-xs text-muted-foreground">{{ dynamicTextColor }}</code>
              </div>
            </div>
            <div>
              <div class="mb-2 text-sm font-medium">Result</div>
              <div :style="computedStyle">Dynamic Styled Component</div>
              <div class="mt-4 rounded bg-muted p-3 font-mono text-xs">:style="computedStyle"</div>
            </div>
          </div>
        </div>

        <!-- Code Examples -->
        <div class="rounded-xl border border-border bg-card p-6">
          <h3 class="mb-4 text-lg font-semibold">Reading CSS Variables in Script</h3>
          <pre class="overflow-x-auto rounded-lg bg-muted p-4 text-sm"><code>&lt;script setup&gt;
import { ref, computed } from 'vue'

// Get CSS variable value
const getPrimaryColor = () =&gt; {
  const root = document.documentElement
  const rgbValue = getComputedStyle(root)
    .getPropertyValue('--primary').trim()
  return `rgb(${rgbValue})`
}

// Read on mount
const currentPrimary = ref(getPrimaryColor())

// Compute style object
const dynamicStyle = computed(() =&gt; ({
  background: currentPrimary.value,
  color: 'rgb(var(--primary-foreground))',
  padding: '1rem'
}))
&lt;/script&gt;</code></pre>
        </div>

        <div class="rounded-xl border border-border bg-card p-6">
          <h3 class="mb-4 text-lg font-semibold">Setting CSS Variables Programmatically</h3>
          <pre class="overflow-x-auto rounded-lg bg-muted p-4 text-sm"><code>&lt;script setup&gt;
// Override a theme color temporarily
const setCustomPrimary = (hexColor: string) =&gt; {
  const root = document.documentElement
  // Convert hex to RGB channels
  const r = parseInt(hexColor.slice(1, 3), 16)
  const g = parseInt(hexColor.slice(3, 5), 16)
  const b = parseInt(hexColor.slice(5, 7), 16)

  root.style.setProperty('--primary', `${r} ${g} ${b}`)
}

// Usage
setCustomPrimary('#ff6b6b')
&lt;/script&gt;</code></pre>
        </div>

        <div class="rounded-xl border border-border bg-card p-6">
          <h3 class="mb-4 text-lg font-semibold">Using Theme Utilities</h3>
          <pre class="overflow-x-auto rounded-lg bg-muted p-4 text-sm"><code>&lt;script setup&gt;
import { useThemeStore } from '@/stores/modules/theme'
import { useThemeSwitch } from '@/hooks/modules/useThemeSwitch'
import { generateThemeVars, applyTheme } from '@/utils/theme/engine'
import { THEME_PRESETS } from '@/constants/theme'

const themeStore = useThemeStore()
const { setThemeWithAnimation, isDark } = useThemeSwitch()

// Get current theme preset
const currentPreset = computed(() =&gt; {
  return THEME_PRESETS.find(p =&gt; p.name === themeStore.themeName)
})

// Generate vars for current mode
const currentVars = computed(() =&gt; {
  return generateThemeVars(currentPreset.value, isDark.value)
})

// Switch theme with animation
const switchToViolet = (e: MouseEvent) =&gt; {
  themeStore.setTheme('violet')
  setThemeWithAnimation('dark', e, 'circle')
}
&lt;/script&gt;</code></pre>
        </div>
      </section>
    </main>

    <!-- Footer -->
    <footer class="mt-20 border-t border-border py-8 text-center text-sm text-muted-foreground">
      <div class="container mx-auto px-6">
        <p>CCD Design System v3.1 · Configuration-First Theme Architecture</p>
        <p class="mt-2 text-xs">Powered by UnoCSS, View Transition API, and Pinia</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
code {
  @apply font-mono;
}

pre code {
  @apply text-foreground;
}

/* Smooth section transitions */
section {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
