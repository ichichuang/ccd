<script setup lang="tsx">
import { useDialog } from '@/hooks/modules/useDialog'
import SettingsContent from './SettingsContent.vue'
import Button from 'primevue/button'
import { Icons } from '@/components/Icons'

const { openDialog } = useDialog()

const openSettings = () => {
  openDialog({
    header: '全局配置 (Global Settings)',
    position: 'right',
    width: 'auto',
    contentRenderer: () => <SettingsContent />,
  })
}
</script>

<template>
  <Button
    v-tooltip.left="'Open Global Settings'"
    @click="openSettings"
  >
    <Icons
      class="color-primary-foreground"
      name="i-lucide-settings"
    />
  </Button>
</template>
