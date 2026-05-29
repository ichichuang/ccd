import type { DialogOptions } from '@ccd/vue-ui'
import { useDialog } from '@/hooks/modules/useDialog'
import { useLayoutRuntime } from '@/hooks/layout/useLayoutRuntime'
import { useI18n } from 'vue-i18n'
import SettingsContent from './SettingsContent.vue'

const SETTINGS_DIALOG_CLASS =
  'w-[92vw]! sm:w-[var(--dialog-settings-width)]! max-w-[92vw]! max-h-90vh'

const SETTINGS_DIALOG_PT: DialogOptions['pt'] = {
  header: {
    class: 'bg-transparent px-md py-sm border-b border-b-solid border-border/50',
  },
  content: {
    class: 'bg-transparent overflow-hidden px-sm py-0',
  },
}

export function useGlobalSettingsDialog() {
  const { t } = useI18n()
  const { openDialog } = useDialog()
  const runtime = useLayoutRuntime()

  function openGlobalSettings() {
    openDialog({
      header: () => t('layout.globalSettingsTitle'),
      class: SETTINGS_DIALOG_CLASS,
      position: runtime.isMobile.value ? 'center' : 'right',
      hideFooter: true,
      pt: SETTINGS_DIALOG_PT,
      contentRenderer: () => <SettingsContent />,
    })
  }

  return {
    openGlobalSettings,
  }
}
