<script setup lang="ts">
defineOptions({ name: 'UseDateUtils' })

import type { DateInput } from '@/utils/date'

type TimezoneId = 'Asia/Shanghai' | 'America/New_York' | 'Europe/London' | 'Asia/Tokyo'

interface TimezoneItem {
  tz: TimezoneId
  label: string
}

interface WorkingDayDemoResult {
  base: string
  offsetWorkingDays: number
  result: string
  nextWorkingDay: string
}

const { formatDate, fromNow, now, isInitialized, currentTimezone, DateUtils } = useDateUtils()

// =========================
// Section 1: 实时时钟与基础格式化
// =========================
const nowValue = ref<ReturnType<typeof DateUtils.now> | null>(null)

const refreshNow = (): void => {
  // Date Law: 禁止 Date.now()/new Date()，因此以 DateUtils.now() 作为唯一当前时间来源
  nowValue.value = now()
}

const { resume: startClock, pause: stopClock } = useIntervalFn(
  () => {
    refreshNow()
  },
  1000,
  { immediate: false }
)

onMounted(() => {
  // 只在组件挂载后启动定时刷新；卸载时停止，防止后台无意义更新。
  refreshNow()
  startClock()
})

onUnmounted(() => {
  stopClock()
})

const nowIso = computed<string>(() => {
  if (!isInitialized.value) return ''
  if (!nowValue.value) return ''
  // Avoid native Date .toISOString(): DateUtils.formatDate is the approved display path.
  return formatDate(nowValue.value, 'YYYY-MM-DDTHH:mm:ss')
})
const nowUnixSeconds = computed<string>(() => (nowValue.value ? String(nowValue.value.unix()) : ''))

const displayYmd = computed<string>(() => {
  if (!isInitialized.value) return '—'
  if (!nowIso.value) return '—'
  const out = formatDate(nowIso.value, 'YYYY-MM-DD')
  return out || '—'
})

const displayDateTime = computed<string>(() => {
  if (!isInitialized.value) return '—'
  if (!nowIso.value) return '—'
  const out = formatDate(nowIso.value, 'YYYY-MM-DD HH:mm:ss')
  return out || '—'
})

const displayUnixSeconds = computed<string>(() => {
  if (!isInitialized.value) return '—'
  if (!nowUnixSeconds.value) return '—'
  return nowUnixSeconds.value
})

// =========================
// Section 2: 相对时间引擎 (fromNow)
// =========================
const relativeInput = ref<string>('')

const relativeParsed = computed<ReturnType<typeof DateUtils.smartParse> | null>(() => {
  if (!isInitialized.value) return null
  const v = relativeInput.value.trim()
  if (!v) return null
  return DateUtils.smartParse(v)
})

const relativeTarget = computed<ReturnType<typeof DateUtils.safeParse> | null>(() => {
  return relativeParsed.value?.date ?? null
})

const relativeTargetIso = computed<string>(() => {
  if (!isInitialized.value) return ''
  if (!relativeTarget.value) return ''
  const out = formatDate(relativeTarget.value, 'YYYY-MM-DDTHH:mm:ss')
  return out || ''
})

const relativeDisplay = computed<string>(() => {
  if (!isInitialized.value) return '—'
  if (!relativeInput.value.trim()) return '请输入或选择一个时间点'
  if (!relativeTarget.value) return '解析失败：请使用更明确的格式（如 YYYY-MM-DD HH:mm:ss）'
  const out = fromNow(relativeTarget.value)
  return out || '—'
})

const setRelativePreset = (preset: 'past3h' | 'future2d'): void => {
  const base = now()
  if (!base) return
  const target = preset === 'past3h' ? base.subtract(3, 'hour') : base.add(2, 'day')
  relativeInput.value = target.format('YYYY-MM-DD HH:mm:ss')
}

const handleRelativeInputUpdate = (value: string | undefined): void => {
  relativeInput.value = value ?? ''
}

// =========================
// Section 3: 时区转换与国际化
// =========================
const timezones = computed<TimezoneItem[]>(() => [
  { tz: 'Asia/Shanghai', label: '上海' },
  { tz: 'Asia/Tokyo', label: '东京' },
  { tz: 'Europe/London', label: '伦敦' },
  { tz: 'America/New_York', label: '纽约' },
])

const tzDisplays = computed<Record<TimezoneId, string>>(() => {
  const empty: Record<TimezoneId, string> = {
    'Asia/Shanghai': '—',
    'Asia/Tokyo': '—',
    'Europe/London': '—',
    'America/New_York': '—',
  }
  if (!isInitialized.value) return empty
  if (!nowValue.value) return empty
  const base = nowValue.value

  const format = 'YYYY-MM-DD HH:mm:ss'
  const build = (tz: TimezoneId): string => {
    const out = formatDate(base, format, { timezone: tz })
    return out || '—'
  }
  return {
    'Asia/Shanghai': build('Asia/Shanghai'),
    'Asia/Tokyo': build('Asia/Tokyo'),
    'Europe/London': build('Europe/London'),
    'America/New_York': build('America/New_York'),
  }
})

// =========================
// Section 4: 企业级日历推算（工作日/节假日）
// =========================
const workingBaseInput = ref<string>('')
const offsetWorkingDays = ref<number>(1)

const workingBaseParsed = computed<ReturnType<typeof DateUtils.smartParse> | null>(() => {
  if (!isInitialized.value) return null
  const v = workingBaseInput.value.trim()
  if (!v) return null
  return DateUtils.smartParse(v)
})

const workingBaseDate = computed<ReturnType<typeof DateUtils.safeParse> | null>(() => {
  return workingBaseParsed.value?.date ?? null
})

function addWorkingDays(base: DateInput, offset: number): ReturnType<typeof DateUtils.safeParse> {
  // 演示逻辑，建议后续沉淀至 DateUtils：
  // 这里用 DateUtils.isWorkingDay + dayjs add/subtract 实现“跳过非工作日”的推算，
  // 严禁原生 Date。
  const step = offset >= 0 ? 1 : -1
  let remaining = Math.abs(offset)
  let cursor = DateUtils.safeParse(base)
  if (!cursor) {
    return null
  }

  while (remaining > 0) {
    cursor = cursor.add(step, 'day')
    if (DateUtils.isWorkingDay(cursor)) {
      remaining -= 1
    }
  }
  return cursor
}

const workingDemo = computed<WorkingDayDemoResult>(() => {
  const base = workingBaseDate.value ?? nowValue.value
  const offset = Number.isFinite(offsetWorkingDays.value) ? offsetWorkingDays.value : 0

  if (!isInitialized.value || !base) {
    return { base: '—', offsetWorkingDays: offset, result: '—', nextWorkingDay: '—' }
  }

  const resultDate = addWorkingDays(base, offset)
  const nextDate = DateUtils.nextWorkingDay(base)

  const baseText = formatDate(base, 'YYYY-MM-DD HH:mm:ss') || '—'
  const resultText = resultDate ? formatDate(resultDate, 'YYYY-MM-DD HH:mm:ss') || '—' : '—'
  const nextText = nextDate ? formatDate(nextDate, 'YYYY-MM-DD HH:mm:ss') || '—' : '—'

  return {
    base: baseText,
    offsetWorkingDays: offset,
    result: resultText,
    nextWorkingDay: nextText,
  }
})

const setWorkingBaseNow = (): void => {
  const n = now()
  if (!n) return
  workingBaseInput.value = n.format('YYYY-MM-DD HH:mm:ss')
}

const handleWorkingBaseInputUpdate = (value: string | undefined): void => {
  workingBaseInput.value = value ?? ''
}
</script>

<template>
  <div
    class="animate__animated animate__fadeIn col-stretch gap-md"
    data-archetype="A1-toolbar-content"
  >
    <div class="layout-narrow col-stretch gap-md">
      <Card class="material-elevated">
        <template #title>实时时钟与基础格式化</template>
        <template #content>
          <div class="col-stretch gap-sm">
            <div class="row-between gap-sm">
              <div class="col-stretch gap-xs">
                <div class="text-sm text-muted-foreground">当前时区</div>
                <div class="text-base text-foreground text-ellipsis-1">{{ currentTimezone }}</div>
              </div>
              <Tag
                :value="isInitialized ? 'DateUtils 已初始化' : '初始化中…'"
                :severity="isInitialized ? 'success' : 'warn'"
              />
            </div>

            <Divider />

            <div class="col-stretch gap-xs">
              <div class="row-between gap-sm">
                <div class="text-sm text-muted-foreground">当前时间（ISO）</div>
                <div class="text-base text-foreground text-ellipsis-1">{{ nowIso || '—' }}</div>
              </div>
              <div class="row-between gap-sm">
                <div class="text-sm text-muted-foreground">formatDate（YYYY-MM-DD）</div>
                <div class="text-base text-foreground">{{ displayYmd }}</div>
              </div>
              <div class="row-between gap-sm">
                <div class="text-sm text-muted-foreground">formatDate（YYYY-MM-DD HH:mm:ss）</div>
                <div class="text-base text-foreground">{{ displayDateTime }}</div>
              </div>
              <div class="row-between gap-sm">
                <div class="text-sm text-muted-foreground">Unix 时间戳（秒）</div>
                <div class="text-base text-foreground">{{ displayUnixSeconds }}</div>
              </div>
            </div>
          </div>
        </template>
      </Card>

      <Card class="material-elevated">
        <template #title>相对时间引擎</template>
        <template #content>
          <div class="col-stretch gap-sm">
            <div class="text-sm text-muted-foreground">
              为严格遵守 Date Law，本页不使用原生 Date/Intl，因此用字符串输入 + DateUtils.smartParse
              解析为 dayjs。
            </div>

            <div class="row-between gap-sm">
              <InputText
                :model-value="relativeInput"
                placeholder="例如：2026-03-26 12:30:00"
                class="w-full"
                @update:model-value="handleRelativeInputUpdate"
              />
              <div class="row-center gap-xs">
                <Button
                  label="前 3 小时"
                  severity="secondary"
                  @click="setRelativePreset('past3h')"
                />
                <Button
                  label="后 2 天"
                  severity="secondary"
                  @click="setRelativePreset('future2d')"
                />
              </div>
            </div>

            <Divider />

            <div class="row-between gap-sm">
              <div class="text-sm text-muted-foreground">解析结果（ISO）</div>
              <Tag
                :value="relativeTargetIso || '—'"
                severity="secondary"
              />
            </div>
            <div class="row-between gap-sm">
              <div class="text-sm text-muted-foreground">相对时间（fromNow）</div>
              <Tag
                :value="relativeDisplay"
                severity="info"
              />
            </div>
          </div>
        </template>
      </Card>

      <Card class="material-elevated">
        <template #title>时区转换与国际化</template>
        <template #content>
          <div class="col-stretch gap-sm">
            <div class="text-sm text-muted-foreground">
              通过 DateUtils + dayjs-timezone 的 `timezone`
              选项格式化同一时刻在不同城市的时间展示（不触碰 Intl）。
            </div>
            <Divider />
            <div class="col-stretch gap-xs">
              <div
                v-for="item in timezones"
                :key="item.tz"
                class="row-between gap-sm"
              >
                <div class="text-sm text-muted-foreground">{{ item.label }}（{{ item.tz }}）</div>
                <Tag
                  :value="tzDisplays[item.tz]"
                  severity="secondary"
                />
              </div>
            </div>
          </div>
        </template>
      </Card>

      <Card class="material-elevated">
        <template #title>企业级日历推算</template>
        <template #content>
          <div class="col-stretch gap-sm">
            <div class="text-sm text-muted-foreground">
              展示工作日推算（跳过周末与节假日/调休）。底层判断依赖 DateUtils.isWorkingDay /
              nextWorkingDay。
            </div>

            <div class="row-between gap-sm">
              <InputText
                :model-value="workingBaseInput"
                placeholder="基准时间：YYYY-MM-DD HH:mm:ss（留空则用当前时间）"
                class="w-full"
                @update:model-value="handleWorkingBaseInputUpdate"
              />
              <Button
                label="设为现在"
                severity="secondary"
                @click="setWorkingBaseNow"
              />
            </div>

            <div class="row-between gap-sm">
              <div class="text-sm text-muted-foreground">工作日偏移（天，可负数）</div>
              <InputNumber
                v-model="offsetWorkingDays"
                :min="-30"
                :max="30"
              />
            </div>

            <Divider />

            <div class="col-stretch gap-xs">
              <div class="row-between gap-sm">
                <div class="text-sm text-muted-foreground">基准时间</div>
                <Tag
                  :value="workingDemo.base"
                  severity="secondary"
                />
              </div>
              <div class="row-between gap-sm">
                <div class="text-sm text-muted-foreground">偏移结果（+/- 工作日）</div>
                <Tag
                  :value="workingDemo.result"
                  severity="success"
                />
              </div>
              <div class="row-between gap-sm">
                <div class="text-sm text-muted-foreground">下一个工作日</div>
                <Tag
                  :value="workingDemo.nextWorkingDay"
                  severity="info"
                />
              </div>
            </div>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>
