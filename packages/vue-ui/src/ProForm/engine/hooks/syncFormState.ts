import type { FormController } from '../core/FormController'
import type { FormState } from '../types'

/**
 * Syncs the latest form state snapshot from FormController into a reactive FormState object.
 * Shared by useForm and useField to avoid duplicating the same 5-property copy pattern.
 */
export function syncFormState<TValues extends Record<string, unknown>>(
  controller: FormController<TValues>,
  state: FormState<TValues>
): void {
  const latest = controller.getFormState()
  state.values = latest.values
  state.errors = latest.errors
  state.touched = latest.touched
  state.dirty = latest.dirty
  state.valid = latest.valid
}
