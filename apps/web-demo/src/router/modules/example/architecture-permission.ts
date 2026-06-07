const permissionRoute: RouteConfig = {
  path: '/example/permission',
  name: 'ExamplePermission',
  redirect: '/example/permission/roles',
  meta: {
    titleKey: 'router.example.architecture.permission.root',
    rank: 5,
    icon: 'i-lucide-shield',
  },
  children: [
    {
      path: '/example/permission/roles',
      name: 'ExamplePermissionRoles',
      component: () => import('@/views/example/architecture/permission/permission-roles.vue'),
      meta: {
        titleKey: 'router.example.architecture.permission.roles',
        rank: 1,
        icon: 'i-lucide-shield-check',
        roles: ['admin'],
      },
    },
    {
      path: '/example/permission/auths',
      name: 'ExamplePermissionAuths',
      component: () => import('@/views/example/architecture/permission/permission-auths.vue'),
      meta: {
        titleKey: 'router.example.architecture.permission.auths',
        rank: 2,
        icon: 'i-lucide-badge-check',
        roles: ['admin', 'user'],
        auths: ['example:architecture:read', 'example:architecture:write'],
      },
    },
  ],
}

export { permissionRoute }

export default [permissionRoute] satisfies RouteConfig[]
