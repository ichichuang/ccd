<script setup lang="ts">
import { ref, watch } from 'vue'
import type { IconSize, IconAnimation, FlipDirection } from '@/components/Icons/utils/types'
import { SIZE_SCALE_KEYS } from '@/constants/sizeScale'

type EmitFn = {
  (e: 'update:size', value: IconSize): void
  (e: 'update:color', value: string | undefined): void
  (e: 'update:animation', value: IconAnimation | undefined): void
  (e: 'update:flip', value: FlipDirection | undefined): void
  (e: 'update:rotate', value: string | number): void
  (e: 'update:scale', value: number | undefined): void
}

const props = defineProps<{
  iconName: string
  size?: IconSize
  color?: string
  animation?: IconAnimation
  flip?: FlipDirection
  rotate?: string | number
  scale?: number
}>()

const emit = defineEmits<EmitFn>()

const sizeMode = ref<'scale' | 'custom'>('scale')
const sizeScale = ref<IconSize>('md')
const sizeCustom = ref<string | undefined>('')

const colorInput = ref<string | undefined>('')

watch(
  () => props.size,
  val => {
    if (typeof val === 'string' && SIZE_SCALE_KEYS.includes(val as IconSize)) {
      if (sizeMode.value !== 'scale') sizeMode.value = 'scale'
      if (sizeScale.value !== val) sizeScale.value = val
    } else {
      if (sizeMode.value !== 'custom') sizeMode.value = 'custom'
      const customVal = String(val ?? '')
      if (sizeCustom.value !== customVal) sizeCustom.value = customVal
    }
  },
  { immediate: true }
)

watch(
  () => props.color,
  val => {
    const newVal = val ?? ''
    if (colorInput.value !== newVal) colorInput.value = newVal
  },
  { immediate: true }
)

function updateSize() {
  if (sizeMode.value === 'scale') {
    if (props.size !== sizeScale.value) emit('update:size', sizeScale.value)
  } else {
    const customVal = sizeCustom.value ?? ''
    if (props.size !== customVal) emit('update:size', customVal)
  }
}

function updateColor() {
  const newColor = colorInput.value || undefined
  if (props.color !== newColor) emit('update:color', newColor)
}

const animationOptions: Array<{ label: string; value: IconAnimation | '' }> = [
  { label: '无', value: '' },
  { label: '旋转 (Spin)', value: 'spin' },
  { label: '脉冲 (Pulse)', value: 'pulse' },
  { label: '旋转+脉冲', value: 'spin-pulse' },
]

const flipOptions: Array<{ label: string; value: FlipDirection | '' }> = [
  { label: '无', value: '' },
  { label: '水平翻转', value: 'horizontal' },
  { label: '垂直翻转', value: 'vertical' },
  { label: '双向翻转', value: 'both' },
]

const rotateInput = ref<string | undefined>('')
const scaleInput = ref<string | undefined>('')

watch(
  () => props.rotate,
  val => {
    const newVal = String(val ?? '')
    if (rotateInput.value !== newVal) rotateInput.value = newVal
  },
  { immediate: true }
)

watch(
  () => props.scale,
  val => {
    const newVal = String(val ?? '')
    if (scaleInput.value !== newVal) scaleInput.value = newVal
  },
  { immediate: true }
)

watch(
  () => sizeCustom.value,
  () => {
    if (sizeMode.value === 'custom') updateSize()
  }
)

watch(
  () => colorInput.value,
  () => updateColor()
)

watch(
  () => rotateInput.value,
  () => updateRotate()
)

watch(
  () => scaleInput.value,
  () => updateScale()
)

function updateRotate() {
  const val = rotateInput.value ?? ''
  const num = Number.parseFloat(val)
  const newVal = Number.isNaN(num) ? '' : num
  if (props.rotate !== newVal) emit('update:rotate', newVal)
}

function updateScale() {
  const val = scaleInput.value ?? ''
  const num = Number.parseFloat(val)
  const newVal = Number.isNaN(num) ? undefined : num
  if (props.scale !== newVal) emit('update:scale', newVal)
}
</script>

<template>
  <div class="flex flex-col gap-lg">
    <h3 class="fs-md font-semibold text-foreground">图标控制</h3>

    <div class="flex flex-col gap-sm">
      <label class="text-sm font-medium text-foreground">当前图标</label>
      <div class="p-padding-sm bg-muted rounded-scale-md">
        <code class="fs-xs font-mono text-foreground break-all">{{ iconName }}</code>
      </div>
    </div>

    <div class="flex flex-col gap-md">
      <label class="text-sm font-medium text-foreground">尺寸 (Size)</label>
      <div class="flex gap-sm">
        <Button
          label="标准尺寸"
          size="small"
          :severity="sizeMode === 'scale' ? 'primary' : 'secondary'"
          @click="sizeMode = 'scale'"
        />
        <Button
          label="自定义"
          size="small"
          :severity="sizeMode === 'custom' ? 'primary' : 'secondary'"
          @click="sizeMode = 'custom'"
        />
      </div>
      <div v-if="sizeMode === 'scale'">
        <div class="flex flex-wrap gap-sm">
          <Button
            v-for="key in SIZE_SCALE_KEYS"
            :key="key"
            :label="key"
            size="small"
            :severity="sizeScale === key ? 'primary' : 'secondary'"
            @click="
              sizeScale = key
              updateSize()
            "
          />
        </div>
      </div>
      <div v-else>
        <InputText
          v-model="sizeCustom"
          placeholder="例如: 24px, 2rem, 50%"
          size="small"
        />
      </div>
    </div>

    <div class="flex flex-col gap-md">
      <label class="text-sm font-medium text-foreground">颜色 (Color)</label>
      <div class="flex gap-sm items-center">
        <InputText
          v-model="colorInput"
          placeholder="例如: #ff0000, rgb(var(--primary))"
          size="small"
          class="flex-1"
        />
        <input
          v-if="colorInput && /^#[0-9A-Fa-f]{6}$/.test(colorInput)"
          type="color"
          :value="colorInput"
          class="w-[var(--spacing-xl)] h-[var(--spacing-lg)] rounded-scale-md cursor-pointer"
          @input="
            colorInput = ($event.target as HTMLInputElement).value
            updateColor()
          "
        />
      </div>
      <div class="flex flex-wrap gap-sm">
        <Button
          label="主色"
          size="small"
          severity="secondary"
          @click="
            colorInput = 'rgb(var(--primary))'
            updateColor()
          "
        />
        <Button
          label="前景色"
          size="small"
          severity="secondary"
          @click="
            colorInput = 'rgb(var(--foreground))'
            updateColor()
          "
        />
        <Button
          label="信息色"
          size="small"
          severity="secondary"
          @click="
            colorInput = 'rgb(var(--info))'
            updateColor()
          "
        />
        <Button
          label="成功色"
          size="small"
          severity="secondary"
          @click="
            colorInput = 'rgb(var(--success))'
            updateColor()
          "
        />
        <Button
          label="警告色"
          size="small"
          severity="secondary"
          @click="
            colorInput = 'rgb(var(--warn))'
            updateColor()
          "
        />
        <Button
          label="危险色"
          size="small"
          severity="secondary"
          @click="
            colorInput = 'rgb(var(--danger))'
            updateColor()
          "
        />
        <Button
          label="清除"
          size="small"
          severity="secondary"
          @click="
            colorInput = ''
            updateColor()
          "
        />
      </div>
    </div>

    <div class="flex flex-col gap-md">
      <label class="text-sm font-medium text-foreground">动画 (Animation)</label>
      <div class="flex flex-wrap gap-sm">
        <Button
          v-for="opt in animationOptions"
          :key="opt.value"
          :label="opt.label"
          size="small"
          :severity="(animation ?? '') === opt.value ? 'primary' : 'secondary'"
          @click="emit('update:animation', opt.value || undefined)"
        />
      </div>
    </div>

    <div class="flex flex-col gap-md">
      <label class="text-sm font-medium text-foreground">翻转 (Flip)</label>
      <div class="flex flex-wrap gap-sm">
        <Button
          v-for="opt in flipOptions"
          :key="opt.value"
          :label="opt.label"
          size="small"
          :severity="(flip ?? '') === opt.value ? 'primary' : 'secondary'"
          @click="emit('update:flip', opt.value || undefined)"
        />
      </div>
    </div>

    <div class="flex flex-col gap-md">
      <label class="text-sm font-medium text-foreground">旋转 (Rotate)</label>
      <div class="flex flex-wrap gap-sm items-center">
        <InputText
          v-model="rotateInput"
          placeholder="角度 (deg)，例如: 90"
          size="small"
          class="flex-1 min-w-0"
        />
        <div class="flex gap-xs shrink-0">
          <Button
            label="90°"
            size="small"
            severity="secondary"
            @click="
              rotateInput = '90'
              updateRotate()
            "
          />
          <Button
            label="180°"
            size="small"
            severity="secondary"
            @click="
              rotateInput = '180'
              updateRotate()
            "
          />
          <Button
            label="270°"
            size="small"
            severity="secondary"
            @click="
              rotateInput = '270'
              updateRotate()
            "
          />
          <Button
            label="清除"
            size="small"
            severity="secondary"
            @click="
              rotateInput = ''
              updateRotate()
            "
          />
        </div>
      </div>
    </div>

    <div class="flex flex-col gap-md">
      <label class="text-sm font-medium text-foreground">缩放 (Scale)</label>
      <div class="flex flex-wrap gap-sm items-center">
        <InputText
          v-model="scaleInput"
          placeholder="缩放比例，例如: 1.5"
          size="small"
          class="flex-1 min-w-0"
        />
        <div class="flex gap-xs shrink-0">
          <Button
            label="0.5x"
            size="small"
            severity="secondary"
            @click="
              scaleInput = '0.5'
              updateScale()
            "
          />
          <Button
            label="1.5x"
            size="small"
            severity="secondary"
            @click="
              scaleInput = '1.5'
              updateScale()
            "
          />
          <Button
            label="2x"
            size="small"
            severity="secondary"
            @click="
              scaleInput = '2'
              updateScale()
            "
          />
          <Button
            label="清除"
            size="small"
            severity="secondary"
            @click="
              scaleInput = ''
              updateScale()
            "
          />
        </div>
      </div>
    </div>
  </div>
</template>
