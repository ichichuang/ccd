<script setup lang="ts">
defineOptions({ name: 'ProUpload' })

import type { FieldComponentProps } from '../../engine/types'

type UploadValue = File | File[] | string | null

type Props = FieldComponentProps<UploadValue>

const props = defineProps<Omit<Props, 'modelValue'>>()
const model = defineModel<UploadValue>()

const attrs = useAttrs()

const emptyPlaceholder = computed<string>(() => {
  const value = attrs.previewEmptyPlaceholder as string | undefined
  return value && value.length > 0 ? value : '-'
})

const uploadMode = computed<string>(() => (attrs.mode as string | undefined) ?? 'basic')

const isMultiple = computed<boolean>(() => {
  if (Array.isArray(model.value)) return true
  const multipleAttr = attrs.multiple as string | boolean | undefined
  if (multipleAttr === '' || multipleAttr === 'true' || multipleAttr === true) return true
  return false
})

const fileNames = computed<string[]>(() => {
  const value = model.value
  if (value == null) return []

  if (Array.isArray(value)) {
    return value.map(item => (item instanceof File ? item.name : String(item)))
  }

  if (value instanceof File) {
    return [value.name]
  }

  return [String(value)]
})

/** 兼容 FileUploadSelectEvent 和 FileUploadUploaderEvent 的共有属性 */
interface FileUploadFilesEvent {
  files: File | File[] | null | undefined
}

const handleSelect = (event: FileUploadFilesEvent): void => {
  const rawFiles = event.files

  const files: File[] = rawFiles == null ? [] : Array.isArray(rawFiles) ? rawFiles : [rawFiles]

  if (isMultiple.value) {
    model.value = files
    return
  }

  model.value = files[0] ?? null
}
</script>

<template>
  <div class="w-full">
    <template v-if="props.readonly">
      <span
        v-if="fileNames.length === 0"
        class="block py-xs text-muted-foreground leading-normal break-words"
      >
        {{ emptyPlaceholder }}
      </span>
      <ul
        v-else
        class="text-sm text-secondary-foreground leading-normal"
      >
        <li
          v-for="name in fileNames"
          :key="name"
          class="text-ellipsis-1"
        >
          {{ name }}
        </li>
      </ul>
    </template>
    <FileUpload
      v-else
      :disabled="props.disabled"
      :custom-upload="true"
      :mode="uploadMode"
      :multiple="isMultiple"
      @select="handleSelect"
      @uploader="handleSelect"
    />
  </div>
</template>
