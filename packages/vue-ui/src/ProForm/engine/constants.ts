import type { ComputedRef, InjectionKey, Slots } from 'vue'
import type { BreakpointKey } from './utils/breakpoint'
import type { ProFormDateFormatter } from './persistence/DraftStorage'
import type { FormController } from './core/FormController'
import type { FormState, FormValuesRecord } from './types'

export interface ProFormGlobalState {
  disabled: ComputedRef<boolean>
  readonly: ComputedRef<boolean>
}

export interface ProFormLayoutState {
  layout: ComputedRef<'vertical' | 'horizontal'>
  labelWidth: ComputedRef<string | undefined>
  gap: ComputedRef<string>
  activeBreakpoint?: ComputedRef<BreakpointKey>
  labelAlign?: ComputedRef<'left' | 'center' | 'right'>
}

export const FORM_CONTROLLER_KEY: InjectionKey<FormController<FormValuesRecord>> =
  Symbol('ProFormFormController')

export const PRO_FORM_GLOBAL_STATE_KEY: InjectionKey<ProFormGlobalState> = Symbol(
  'PRO_FORM_GLOBAL_STATE'
) as InjectionKey<ProFormGlobalState>

export const PRO_FORM_LAYOUT_KEY: InjectionKey<ProFormLayoutState> = Symbol(
  'PRO_FORM_LAYOUT'
) as InjectionKey<ProFormLayoutState>

export const PRO_FORM_SLOTS_KEY: InjectionKey<Slots> = Symbol(
  'PRO_FORM_SLOTS'
) as InjectionKey<Slots>

export const PRO_FORM_STATE_KEY: InjectionKey<FormState<FormValuesRecord>> =
  Symbol('PRO_FORM_STATE')

export const PRO_FORM_DATE_FORMATTER_KEY: InjectionKey<ProFormDateFormatter> =
  Symbol('PRO_FORM_DATE_FORMATTER')
