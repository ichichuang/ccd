import { FORM_CONTROLLER_KEY } from './useForm'
import type { FormController } from '../core/FormController'

export function useFormContext<
  TValues extends Record<string, unknown> = Record<string, unknown>,
>(): FormController<TValues> {
  const context = inject<FormController<TValues>>(FORM_CONTROLLER_KEY)
  if (!context) {
    throw new Error('[ProForm] useFormContext must be used within a ProForm component.')
  }
  return context
}
