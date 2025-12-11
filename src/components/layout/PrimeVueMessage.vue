<script setup lang="ts">
import { OhVueIcon } from 'oh-vue-icons'
import Message from 'primevue/message'
import { onBeforeUnmount, reactive } from 'vue'

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
    closable: options.closable ?? true,
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
            class="w-appFontSizes h-appFontSizes"
          />
        </template>

        <div class="pv-message-body">
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
  right: 20px;
  z-index: 1300;
  display: flex;
  flex-direction: column;
  gap: 12px;
  pointer-events: none;
}

.pv-message-stack :deep(.p-message) {
  pointer-events: auto;
}

.pv-message-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
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
