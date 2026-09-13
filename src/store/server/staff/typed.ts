export type StaffStatus = "ACTIVE" | "LOCKED"

export type RoleSummary = {
  id: string
  name: string
  code: string
}

export type RoleRequest = {
  name: string
  code: string
  description?: string
}

export type RoleResponse = {
  id: string
  name: string
  code: string
  description?: string
  menuIds?: string[]
  createdAt?: string
  updatedAt?: string
}

export type StaffCreateRequest = {
  name: string
  email: string
  phone?: string
  password: string
  roleId: string
  status: StaffStatus
}

export type StaffUpdateRequest = {
  name: string
  email: string
  phone?: string
  password?: string
  roleId: string
  status: StaffStatus
}

export type StaffResponse = {
  id: string
  name: string
  email: string
  phone?: string
  role?: RoleSummary
  status: StaffStatus
  lastLoginAt?: string
  online?: boolean
  createdAt?: string
  updatedAt?: string
}

export type StaffQueryParams = {
  query?: string
  status?: StaffStatus
  roleId?: string
  page?: number
  size?: number
  sort?: string
  direction?: "asc" | "desc"
}

export type RolesQueryParams = {
  query?: string
  page?: number
  size?: number
  sort?: string
  direction?: "asc" | "desc"
}

export type MenuNode = {
  id: string
  code?: string
  label: string
  icon?: string
  path?: string
  sortOrder?: number
  children?: MenuNode[]
}

export type PermissionResponse = {
  roleId: string
  menuIds: string[]
}

export type PermissionUpdateRequest = {
  menuIds: string[]
}

export type PageResponse<T> = {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  first?: boolean
  last?: boolean
}

export type ApiResponse<T> = {
  success: boolean
  message?: string
  data: T
  timestamp?: string
}
