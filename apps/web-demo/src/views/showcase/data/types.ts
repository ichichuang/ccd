export type ShowcaseGroupId =
  | 'overview'
  | 'components'
  | 'tables'
  | 'forms'
  | 'charts'
  | 'hooks'
  | 'utils'
  | 'runtime'
  | 'design'
  | 'feedback'
  | 'governance'
  | 'desktopBoundary'

export type ShowcaseDemoLevel = 'complete' | 'preview'
export type ShowcasePageKind = 'overview' | 'table' | 'form' | 'chart' | 'demo' | 'technical'

export interface ShowcaseCatalogGroup {
  id: ShowcaseGroupId
  titleKey: `showcase.groups.${string}.title`
  descriptionKey: `showcase.groups.${string}.description`
  icon: `i-${string}`
  rank: number
}

export interface ShowcaseCatalogItem {
  id: string
  parentId?: string
  groupId: ShowcaseGroupId
  path: `/showcase${string}`
  name: string
  titleKey: `router.showcase.${string}`
  localeBaseKey: `showcase.pages.${string}`
  icon: `i-${string}`
  rank: number
  kind: ShowcasePageKind
  demoLevel: ShowcaseDemoLevel
  componentKey: string
  sourcePaths: string[]
  dashboardLink?: boolean
  e2eTarget?: boolean
  tags: string[]
  relatedIds?: string[]
}

export type ShowcaseRouteMeta = NonNullable<RouteConfig['meta']> & {
  showcaseId: ShowcaseCatalogItem['id']
  showcaseGroupId: ShowcaseGroupId
  showcaseDemoLevel: ShowcaseDemoLevel
  showcaseKind: ShowcasePageKind
  showcaseSourcePaths: string[]
  dashboardLink?: boolean
  e2eTarget?: boolean
}
