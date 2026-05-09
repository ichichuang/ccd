<script setup lang="tsx">
import { useDialog } from '@/hooks/modules/useDialog'
import { useLayoutRuntime } from '@/hooks/layout/useLayoutRuntime'
import { useI18n } from 'vue-i18n'
import SettingsContent from './SettingsContent.vue'

const { t } = useI18n()
const { openDialog } = useDialog()
const runtime = useLayoutRuntime()

const openSettings = () => {
  openDialog({
    header: t('layout.globalSettingsTitle'),
    class: 'w-[82vw]! sm:w-[60vw]! md:w-[40vw]! lg:w-[36vw]!',
    position: runtime.isMobile.value ? 'center' : 'right',
    contentRenderer: () => <SettingsContent />,
  })
}
</script>

<template>
  <div
    class="block w-full bg-transparent border-none p-0 text-left outline-none interactive-item"
    @click="openSettings"
  >
    <slot></slot>
  </div>
</template>
