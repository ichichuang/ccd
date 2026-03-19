import type { FormController } from '../core/FormController'
import { FORM_CONTROLLER_KEY } from '../constants'

export function useFormContext<
  TValues extends Record<string, unknown> = Record<string, unknown>,
>(): FormController<TValues> {
  const controller = inject(FORM_CONTROLLER_KEY, null) as FormController<TValues> | null
  if (!controller) {
    throw new Error('[ProForm] useFormContext must be used within a ProForm context')
  }
  return controller
}
