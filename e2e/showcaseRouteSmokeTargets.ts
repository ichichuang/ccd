export const SHOWCASE_ROUTE_SMOKE_TARGET_PATHS = [
  '/showcase/overview',
  '/showcase/components/pro-table/basic',
  '/showcase/components/pro-form/validation',
  '/showcase/components/charts/theme',
  '/showcase/feedback/dialog-toast',
  '/showcase/design/tokens',
] as const

export type ShowcaseRouteSmokeTargetPath = (typeof SHOWCASE_ROUTE_SMOKE_TARGET_PATHS)[number]
