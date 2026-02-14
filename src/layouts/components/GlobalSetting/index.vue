<script setup lang="tsx">
import { useDialog } from '@/hooks/modules/useDialog'
import { useDeviceStore } from '@/stores/modules/device'
import { useI18n } from 'vue-i18n'
import SettingsContent from './SettingsContent.vue'
import Button from 'primevue/button'
import { Icons } from '@/components/Icons'

const { t } = useI18n()
const { openDialog } = useDialog()
const deviceStore = useDeviceStore()

const openSettings = () => {
  const isMobile = deviceStore.isMobileLayout
  openDialog({
    header: t('layout.globalSettingsTitle'),
    position: isMobile ? 'center' : 'right',
    width: isMobile ? '95vw' : 'auto',
    contentRenderer: () => <SettingsContent />,
  })
}
</script>

<template>
  <Button
    v-tooltip.left="t('layout.openGlobalSettings')"
    @click="openSettings"
  >
    <Icons
      class="text-primary-foreground"
      name="i-lucide-settings"
    />
  </Button>
</template>
