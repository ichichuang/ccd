import type { FormController } from '../core/FormController'
import { FORM_CONTROLLER_KEY } from '../constants'
import { castValue } from '@ccd/shared-utils'
import { inject } from 'vue'

export function useFormContext<
  TValues extends Record<string, unknown> = Record<string, unknown>,
>(): FormController<TValues> {
  const controller = inject(FORM_CONTROLLER_KEY, null)
  if (!controller) {
    throw new Error('[ProForm] useFormContext must be used within a ProForm context')
  }
  return castValue<FormController<TValues>>(controller)
}
