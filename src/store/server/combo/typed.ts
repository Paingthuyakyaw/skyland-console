export type ComboTourStatus = "DRAFT" | "PUBLISHED"

export type CategoryLevel = "PRIMARY" | "SECONDARY"

export type ComboCategory = {
  id: string
  name: string
  slug: string
  level?: string
  levelLabel?: string
  sortOrder?: number
  version?: number
}

export type ComboCategorySummary = {
  id: string
  name: string
  slug: string
  level?: CategoryLevel
  levelLabel?: string
}

export type ComboTourCategory = ComboCategorySummary & {
  parent?: ComboCategorySummary
  imageUrl?: string
  sortOrder?: number
  version?: number
  createdAt?: string
  updatedAt?: string
}

export type ComboTourBadge = {
  logoUrl?: string
  title: string
  shortInfo?: string
}

export type ComboTour = {
  id: string
  title: string
  slug: string
  primaryCategory?: ComboTourCategory
  comboPrice: number
  currency: string
  status: ComboTourStatus
  discountPrice?: number
  durationMinutes?: number
  isAttraction?: boolean
  isHot?: boolean
  hotelPickupIncluded?: boolean
  badges?: ComboTourBadge[]
  imageUrl?: string
  version?: number
  createdAt?: string
  updatedAt?: string
}

export type ComboToursQueryParams = {
  query?: string
  status?: ComboTourStatus
  categoryId?: string
  page?: number
  size?: number
  sort?: string
  direction?: "asc" | "desc"
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
