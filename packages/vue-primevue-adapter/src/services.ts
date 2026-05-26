import type { App } from 'vue'
import ConfirmationService from 'primevue/confirmationservice'
import DialogService from 'primevue/dialogservice'
import ToastService from 'primevue/toastservice'
import Tooltip from 'primevue/tooltip'

export interface PrimeVueServiceInstallOptions {
  toast?: boolean
  confirmation?: boolean
  dialog?: boolean
  tooltip?: boolean
}

export function installPrimeVueServices(
  app: App,
  options: PrimeVueServiceInstallOptions = {}
): void {
  const { toast = true, confirmation = true, dialog = true, tooltip = true } = options

  if (toast) {
    app.use(ToastService)
  }

  if (confirmation) {
    app.use(ConfirmationService)
  }

  if (dialog) {
    app.use(DialogService)
  }

  if (tooltip) {
    app.directive('tooltip', Tooltip)
  }
}
