<script setup lang="ts">
import { useSizeStore } from '@/stores/modules/size'
import { OhVueIcon } from 'oh-vue-icons'
import { computed, onBeforeUnmount, reactive } from 'vue'

const sizeStore = useSizeStore()
const headerHeight = computed(() => sizeStore.getHeaderHeight)

type Severity = 'success' | 'info' | 'warn' | 'error' | 'secondary' | 'contrast'
type Variant = 'filled' | 'outlined' | 'text' | 'simple'
type Size = 'small' | 'large' | undefined

interface MessagePayload {
  id: number
  severity: Severity
  summary?: string
  detail?: string
  content?: string
  variant?: Variant
  size?: Size
  iconName?: string
  life: number
  closable: boolean
  class?: string
  onClose?: () => void
}

type AddOptions = Partial<Omit<MessagePayload, 'id' | 'life' | 'closable'>> & {
  life?: number
  closable?: boolean
}

const messageQueue = reactive<MessagePayload[]>([])
const timers = reactive(new Map<number, number>())
let seed = 0

const props = withDefaults(
  defineProps<{
    offsetTop?: number
  }>(),
  {
    offsetTop: 0,
  }
)

const stackStyle = computed(() => ({
  top: `${props.offsetTop > 0 ? props.offsetTop : headerHeight.value / 2}px`,
  left: '50%',
  transform: 'translateX(-50%)',
}))

function clearTimer(id: number) {
  const timer = timers.get(id)
  if (timer) {
    clearTimeout(timer)
    timers.delete(id)
  }
}

function removeMessage(id: number) {
  clearTimer(id)
  const index = messageQueue.findIndex(item => item.id === id)
  if (index !== -1) {
    const target = messageQueue[index]
    if (typeof target.onClose === 'function') {
      try {
        target.onClose()
      } catch (_err) {
        // ignore
      }
    }
    messageQueue.splice(index, 1)
  }
}

function addMessage(options: AddOptions) {
  const id = ++seed
  const payload: MessagePayload = {
    id,
    severity: options.severity ?? 'info',
    summary: options.summary,
    detail: options.detail,
    content: options.content,
    variant: options.variant,
    size: options.size,
    iconName: options.iconName,
    life: typeof options.life === 'number' ? options.life : 3000,
    closable: options.closable ?? false,
    class: options.class,
    onClose: options.onClose,
  }
  messageQueue.push(payload)

  if (payload.life > 0) {
    const timer = window.setTimeout(() => removeMessage(id), payload.life)
    timers.set(id, timer)
  }

  return id
}

function clearMessages() {
  messageQueue.splice(0, messageQueue.length)
  timers.forEach(timer => clearTimeout(timer))
  timers.clear()
}

function getIconSizeClass(size?: Size): string {
  if (size === 'small') {
    return 'w-appFontSizes h-appFontSizes'
  }
  if (size === 'large') {
    return 'w-appFontSizex h-appFontSizex'
  }
  return 'w-appFontSize h-appFontSize'
}

function getTextSizeClass(size?: Size): string {
  if (size === 'small') {
    return 'fs-appFontSizes'
  }
  if (size === 'large') {
    return 'fs-appFontSizex'
  }
  return 'fs-appFontSize'
}

const messageService = {
  add: addMessage,
  success: (content: string, detail?: string, life = 3000, options: AddOptions = {}) =>
    addMessage({ ...options, severity: 'success', content, detail, life }),
  info: (content: string, detail?: string, life = 3000, options: AddOptions = {}) =>
    addMessage({ ...options, severity: 'info', content, detail, life }),
  warn: (content: string, detail?: string, life = 3000, options: AddOptions = {}) =>
    addMessage({ ...options, severity: 'warn', content, detail, life }),
  error: (content: string, detail?: string, life = 3000, options: AddOptions = {}) =>
    addMessage({ ...options, severity: 'error', content, detail, life }),
  secondary: (content: string, detail?: string, life = 3000, options: AddOptions = {}) =>
    addMessage({ ...options, severity: 'secondary', content, detail, life }),
  contrast: (content: string, detail?: string, life = 3000, options: AddOptions = {}) =>
    addMessage({ ...options, severity: 'contrast', content, detail, life }),
  remove: removeMessage,
  clear: clearMessages,
}

declare global {
  interface Window {
    // 与全局 utils 声明保持一致（any）以避免重复类型冲突
    $message: any
  }
}

if (typeof window !== 'undefined') {
  window.$message = messageService
}

onBeforeUnmount(() => {
  clearMessages()
})
</script>

<template>
  <Teleport to="body">
    <TransitionGroup
      name="pv-message-pop"
      tag="div"
      class="pv-message-stack"
      :style="stackStyle"
    >
      <Message
        v-for="item in messageQueue"
        :key="item.id"
        :severity="item.severity"
        :closable="item.closable"
        :variant="item.variant"
        :size="item.size"
        :class="item.class"
        @close="removeMessage(item.id)"
      >
        <template
          v-if="item.iconName"
          #icon
        >
          <OhVueIcon
            :name="item.iconName"
            :class="getIconSizeClass(item.size)"
          />
        </template>

        <div
          class="pv-message-body"
          :class="getTextSizeClass(item.size)"
        >
          <div
            v-if="item.summary"
            class="pv-message-summary"
          >
            {{ item.summary }}
          </div>
          <div
            v-if="item.detail"
            class="pv-message-detail"
          >
            {{ item.detail }}
          </div>
          <template v-if="!item.summary && !item.detail">
            {{ item.content }}
          </template>
        </div>
      </Message>
    </TransitionGroup>
  </Teleport>
</template>

<style scoped lang="scss">
.pv-message-stack {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1300;
  display: flex;
  flex-direction: column;
  gap: var(--gapx);
  pointer-events: none;
}

.pv-message-stack :deep(.p-message) {
  pointer-events: auto;
  width: auto;
  min-width: 10vw;
  align-self: center;
}

.pv-message-body {
  display: flex;
  flex-direction: column;
  gap: var(--gap);
}

.pv-message-summary {
  font-weight: 600;
}

.pv-message-pop-enter-from,
.pv-message-pop-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.98);
}

.pv-message-pop-enter-active,
.pv-message-pop-leave-active {
  transition: all 0.2s ease;
}
</style>
