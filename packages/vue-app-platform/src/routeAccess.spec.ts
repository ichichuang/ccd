import { describe, expect, it } from 'vitest'
import {
  checkRouteAccess,
  checkRouteAuths,
  checkRouteRoles,
  filterMenuByAccess,
  isWhiteListed,
  parseSafeRedirect,
} from './routeAccess'

describe('route access helpers', () => {
  it('checks route roles with unrestricted and ANY semantics', () => {
    expect(checkRouteRoles(undefined, [])).toBe(true)
    expect(checkRouteRoles([], [])).toBe(true)
    expect(checkRouteRoles(['admin', 'editor'], ['editor'])).toBe(true)
    expect(checkRouteRoles(['admin'], ['user'])).toBe(false)
  })

  it('checks route auths with unrestricted, wildcard, and ALL semantics', () => {
    expect(checkRouteAuths(undefined, [])).toBe(true)
    expect(checkRouteAuths([], [])).toBe(true)
    expect(checkRouteAuths(['system:user:list'], ['*:*:*'])).toBe(true)
    expect(checkRouteAuths(['a', 'b'], ['a', 'b', 'c'])).toBe(true)
    expect(checkRouteAuths(['a', 'b'], ['a'])).toBe(false)
  })

  it('combines route roles and auths', () => {
    expect(checkRouteAccess(undefined, [], [])).toBe(true)
    expect(checkRouteAccess({ roles: ['admin'], auths: ['a'] }, ['admin'], ['a'])).toBe(true)
    expect(checkRouteAccess({ roles: ['admin'], auths: ['a'] }, ['user'], ['a'])).toBe(false)
    expect(checkRouteAccess({ roles: ['admin'], auths: ['a'] }, ['admin'], [])).toBe(false)
  })

  it('matches whitelist exact paths and bounded wildcard paths', () => {
    expect(isWhiteListed('login', ['/login'])).toBe(true)
    expect(isWhiteListed('/public', ['/public/**'])).toBe(true)
    expect(isWhiteListed('/public/docs', ['/public/**'])).toBe(true)
    expect(isWhiteListed('/publicity', ['/public/**'])).toBe(false)
  })

  it('rejects unsafe redirects', () => {
    expect(parseSafeRedirect(undefined)).toBeNull()
    expect(parseSafeRedirect('   ')).toBeNull()
    expect(parseSafeRedirect('%E0%A4%A')).toBeNull()
    expect(parseSafeRedirect('https://example.com/admin')).toBeNull()
    expect(parseSafeRedirect('//example.com/admin')).toBeNull()
    expect(parseSafeRedirect('/admin/../secret')).toBeNull()
    expect(parseSafeRedirect('/admin\\secret')).toBeNull()
    expect(parseSafeRedirect('admin/dashboard')).toBeNull()
  })

  it('normalizes safe redirect path and parses query values', () => {
    expect(parseSafeRedirect('/admin//dashboard/?tab=users&empty&name=A%20B')).toEqual({
      path: '/admin/dashboard',
      query: {
        tab: 'users',
        empty: '',
        name: 'A B',
      },
    })
  })

  it('filters menus immutably with route role and menu OR auth semantics', () => {
    const menus = [
      {
        path: '/admin',
        roles: ['admin'],
        children: [
          { path: '/admin/users', auths: ['system:user:list'] },
          { path: '/admin/roles', auths: ['system:role:list'] },
        ],
      },
      { path: '/reports', roles: ['reporter'] },
    ]

    const filtered = filterMenuByAccess(menus, ['admin'], ['system:role:list'])

    expect(filtered).toEqual([
      {
        path: '/admin',
        roles: ['admin'],
        children: [{ path: '/admin/roles', auths: ['system:role:list'] }],
      },
    ])
    expect(filtered).not.toBe(menus)
    expect(filtered[0]).not.toBe(menus[0])
    expect(filtered[0]?.children).not.toBe(menus[0]?.children)
  })

  it('allows wildcard permissions for menu filtering', () => {
    const menus = [{ path: '/admin', auths: ['a'], children: [{ path: '/admin/a', auths: ['b'] }] }]

    expect(filterMenuByAccess(menus, [], ['*:*:*'])).toEqual(menus)
  })
})
