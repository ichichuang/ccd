import type { RecomputeCapableController } from './TransactionManager'
import type { FieldState } from '../types'

type ValuesRecord = Record<string, unknown>

export interface LifecycleController<
  TValues extends ValuesRecord = ValuesRecord,
> extends RecomputeCapableController {
  fieldNames: (keyof TValues & string)[]
  transactionManager: {
    begin: () => void
    updateField: (field: string) => void
    commit: (
      onFlush: (orderedFields: string[]) => void,
      controller?: RecomputeCapableController
    ) => void
  }
  loadAsyncOptions: (fieldName: string) => void
  store: {
    getFieldState(field: string): FieldState<unknown> | undefined
    getFieldValue(field: string): unknown
    setFieldState(field: string, state: FieldState<unknown>): void
  }
}

export class LifecycleManager<TValues extends ValuesRecord = ValuesRecord> {
  private readonly controller: LifecycleController<TValues>

  constructor(controller: LifecycleController<TValues>) {
    this.controller = controller
  }

  trigger(_event: 'fieldMount', fieldName: string): void {
    if (!this.controller.fieldNames.includes(fieldName as keyof TValues & string)) return

    this.controller.transactionManager.begin()
    this.controller.transactionManager.updateField(fieldName)
    this.controller.transactionManager.commit(() => {}, this.controller)

    this.controller.loadAsyncOptions(fieldName)
  }
}
