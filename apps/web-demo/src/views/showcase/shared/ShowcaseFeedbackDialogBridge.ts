import { defineComponent } from 'vue'
import { useDialog } from '@/hooks/modules/useDialog'

export type ShowcaseFeedbackOpenInfoDialog = (message: string, title: string) => void

export default defineComponent({
  name: 'ShowcaseFeedbackDialogBridge',
  setup(_props, { slots }) {
    const dialog = useDialog()

    const openInfoDialog: ShowcaseFeedbackOpenInfoDialog = (message, title) => {
      dialog.info(message, title)
    }

    return () => slots.default?.({ openInfoDialog })
  },
})
