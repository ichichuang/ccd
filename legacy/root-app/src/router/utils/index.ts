/**
 * 路由工具统一导出（按领域拆分：menu / transform / dynamic / resolver）
 * 推荐从具体文件导入以利于 tree-shaking，此处仅作聚合与兼容。
 */

export {
  filterRoutesByParent,
  filterTopLevelRoutesByParent,
  filterShowLinkMenus,
  filterEmptyChildren,
  filterNoPermissionTree,
  generateMenuTree,
  generateBreadcrumbMap,
} from './menu'

export {
  addParentPathsToLeafRoutes,
  addParentPathsToBackendRoutes,
  processAsyncRoutes,
  formatTwoStageRoutes,
  formatFlatteningRoutes,
  sortRoutes,
  flattenRoutes,
  getParentPaths,
  getAuths,
  hasAuth,
  checkRoutePermission,
  filterAuthorizedRoutes,
  recordUnauthorizedAccess,
  transformToVueRoutes,
  normalizeRatioMetaOnRoutes,
  findRouteByPath,
  getKeepAliveNames,
  createRouteUtils,
  getAllRoutePaths,
  getBackendRoutes,
} from './transform'

export { createDynamicRouteManager } from './dynamic'

export {
  loadView,
  generateNameByPath,
  validateComponentFile,
  getAvailableComponentPaths,
  isUsingFallbackComponent,
} from './resolver'
