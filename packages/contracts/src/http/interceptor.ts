export type HttpInterceptorLifecycleStage =
  | 'before-request'
  | 'response'
  | 'response-error'
  | 'request-error'
  | 'complete'

export type HttpInterceptorFailureMode = 'propagate' | 'recover' | 'notify-and-propagate'

export interface HttpInterceptorLifecycleContract {
  readonly name: string
  readonly stages: readonly HttpInterceptorLifecycleStage[]
  readonly order?: number
  readonly failureMode?: HttpInterceptorFailureMode
}
