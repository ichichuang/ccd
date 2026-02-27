<!--
  黄金样本：PrimeVue v4 基础表单组件（Select、DatePicker、ToggleSwitch）
  AI 生成 PrimeVue 表单时请严格模仿，禁止使用 v3 组件名：Dropdown、Calendar、InputSwitch
  参考 docs/ai-specs/PRIMEVUE_V4_API.md
-->
<script setup lang="ts">
interface CityOption {
  label: string
  value: string
}

const selectVal = ref<string | null>(null)
const dateVal = ref<Date | null>(null)
const toggleVal = ref<boolean>(false)

const cityOptions: CityOption[] = [
  { label: '北京', value: 'bj' },
  { label: '上海', value: 'sh' },
  { label: '广州', value: 'gz' },
]
</script>

<template>
  <div class="flex flex-col gap-md max-w-md">
    <div class="flex flex-col gap-xs">
      <label
        for="pv-select"
        class="text-foreground fs-sm"
      >
        城市
      </label>
      <Select
        id="pv-select"
        v-model="selectVal"
        :options="cityOptions"
        option-label="label"
        option-value="value"
        placeholder="请选择"
        show-clear
      />
    </div>
    <div class="flex flex-col gap-xs">
      <label
        for="pv-date"
        class="text-foreground fs-sm"
      >
        日期
      </label>
      <DatePicker
        id="pv-date"
        v-model="dateVal"
        date-format="yy-mm-dd"
        placeholder="选择日期"
        show-icon
      />
    </div>
    <div class="flex items-center gap-sm">
      <ToggleSwitch
        id="pv-toggle"
        v-model="toggleVal"
      />
      <label
        for="pv-toggle"
        class="text-foreground fs-sm"
      >
        启用
      </label>
    </div>
  </div>
</template>
