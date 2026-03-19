/**
 * DummyJSON 公开 API 集成
 * 文档：https://dummyjson.com/docs/users  https://dummyjson.com/docs/products
 * 注：该接口为外部公开 Mock API，直接使用 fetch；不走 Alova 实例（后者指向内部 /api）。
 */

const DUMMY_USERS_BASE = 'https://dummyjson.com/users'
const DUMMY_USERS_SEARCH = 'https://dummyjson.com/users/search'

const DUMMY_PRODUCTS_BASE = 'https://dummyjson.com/products'
const DUMMY_PRODUCTS_SEARCH = 'https://dummyjson.com/products/search'

// ── DTOs ────────────────────────────────────────────────────────────────────

export interface DummyUserDTO extends Record<string, unknown> {
  id: number
  firstName: string
  lastName: string
  age: number
  gender: string
  email: string
  phone: string
  username: string
  image: string
  birthDate: string
  bloodGroup: string
  height: number
  weight: number
  company: {
    name: string
    department: string
    title: string
  }
  address: {
    city: string
    state: string
    country: string
  }
}

export interface DummyUserListRes {
  users: DummyUserDTO[]
  total: number
  skip: number
  limit: number
}

// ── Request params ───────────────────────────────────────────────────────────

export interface DummyUserListReq {
  page: number
  pageSize: number
  sortField?: string | null
  sortOrder?: 'asc' | 'desc' | null
  keyword?: string
}

// ── API function ─────────────────────────────────────────────────────────────

/**
 * 获取 DummyJSON 用户列表（支持分页、排序、全文搜索）
 * 搜索时自动切换到 /search 端点，两端点均支持 limit/skip/sortBy/order 参数。
 */
// ── Products ─────────────────────────────────────────────────────────────────

export interface DummyProductDTO extends Record<string, unknown> {
  id: number
  title: string
  description: string
  category: string
  price: number
  discountPercentage: number
  rating: number
  stock: number
  brand: string
  thumbnail: string
  tags: string[]
}

export interface DummyProductListRes {
  products: DummyProductDTO[]
  total: number
  skip: number
  limit: number
}

export interface DummyProductListReq {
  page: number
  pageSize: number
  keyword?: string
}

/**
 * 获取 DummyJSON 商品列表（支持分页与关键词搜索）
 */
export async function requestDummyProducts(
  params: DummyProductListReq
): Promise<DummyProductListRes> {
  const { page, pageSize, keyword } = params

  const qs = new URLSearchParams()
  qs.set('limit', String(pageSize))
  qs.set('skip', String((page - 1) * pageSize))
  if (keyword) qs.set('q', keyword)

  const baseUrl = keyword ? DUMMY_PRODUCTS_SEARCH : DUMMY_PRODUCTS_BASE
  const res = await fetch(`${baseUrl}?${qs.toString()}`)

  if (!res.ok) {
    throw new Error(`DummyJSON API ${res.status}: ${res.statusText}`)
  }

  return res.json() as Promise<DummyProductListRes>
}

// ── Users ─────────────────────────────────────────────────────────────────────

export async function requestDummyUsers(params: DummyUserListReq): Promise<DummyUserListRes> {
  const { page, pageSize, sortField, sortOrder, keyword } = params

  const qs = new URLSearchParams()
  qs.set('limit', String(pageSize))
  qs.set('skip', String((page - 1) * pageSize))
  if (sortField) qs.set('sortBy', sortField)
  if (sortOrder) qs.set('order', sortOrder)
  if (keyword) qs.set('q', keyword)

  const baseUrl = keyword ? DUMMY_USERS_SEARCH : DUMMY_USERS_BASE
  const res = await fetch(`${baseUrl}?${qs.toString()}`)

  if (!res.ok) {
    throw new Error(`DummyJSON API ${res.status}: ${res.statusText}`)
  }

  return res.json() as Promise<DummyUserListRes>
}
