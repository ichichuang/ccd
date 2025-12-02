import { get, post } from '@/utils'

/**
 * 用户登录
 */
export const _login = (params: { username: string; password: string }) =>
  post<{ token: string }>('/auth/login', params)

/**
 * 获取用户信息
 */
export const _getUserInfo = () => get<UserInfo>('/auth/userInfo')

/**
 * 获取动态路由
 * 根据用户权限返回可访问的路由配置
 * DynamicRouteManager 接口
 */
export const _getAuthRoutes = () => get<BackendRouteConfig[]>('/auth/routes')

/* mock */
const MOCK_TOKEN = 'fake-jwt-token-123456'
const mockUser: (UserInfo & { password: string })[] = [
  {
    userId: '1',
    username: 'admin',
    password: '123456', // 添加密码字段
    roles: ['admin'],
    permissions: ['read', 'write', 'delete'],
    email: 'admin@example.com',
    avatar: 'https://i.pravatar.cc/150?img=1',
    phone: '12345678901',
  },
]
const routes: BackendRouteConfig[] = [
  {
    path: '/user',
    name: 'User',
    component: 'user/index',
    meta: {
      titleKey: 'router.user.title',
      icon: 'ri-user-3-line',
      rank: 1,
    },
    children: [
      {
        path: 'list',
        name: 'UserList',
        component: 'user/views/user-list',
        meta: {
          titleKey: 'router.user.list.title',
          icon: 'ri-user-3-line',
          rank: 1,
        },
      },
      {
        path: 'permission',
        name: 'UserPermission',
        component: 'user/views/user-permission',
        meta: {
          titleKey: 'router.user.permission.title',
          icon: 'ri-user-3-line',
          rank: 2,
        },
      },
    ],
  },
  {
    path: '/permission',
    name: 'Permission',
    component: 'permission/index',
    meta: {
      titleKey: 'router.permission.title',
      icon: 'ri-building-2-line',
      rank: 2,
    },
    children: [
      {
        path: 'page',
        name: 'PermissionPage',
        component: 'permission/views/permission-page',
        meta: {
          titleKey: 'router.permission.page.title',
          roles: ['admin', 'common'],
          icon: 'ri-building-2-line',
        },
      },
      {
        path: 'button',
        name: 'PermissionButton',
        component: 'permission/views/permission-button',
        meta: {
          titleKey: 'router.permission.button.title',
          roles: ['admin'],
          auths: ['permission:btn:add', 'permission:btn:edit', 'permission:btn:delete'],
          icon: 'ri-building-2-line',
        },
      },
    ],
  },
]

export const login = (params: { username: string; password: string }) => {
  const user = mockUser.find(item => item.username === params.username)
  if (!user) {
    return Promise.reject({ success: false, message: '用户不存在' })
  }
  return Promise.resolve({
    success: true,
    data: { token: MOCK_TOKEN },
  })
}

export const getUserInfo = () =>
  Promise.resolve({
    success: true,
    data: { ...mockUser[0] },
  })

export const getAuthRoutes = () =>
  Promise.resolve({
    success: true,
    data: routes,
  })
