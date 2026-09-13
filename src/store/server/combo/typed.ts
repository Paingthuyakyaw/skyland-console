export type ComboTourStatus = "DRAFT" | "PUBLISHED"

export type CategoryLevel = "PRIMARY" | "SECONDARY"

export type ComboCategory = {
  id: string
  name: string
  slug: string
  level?: CategoryLevel
  levelLabel?: string
  imageUrl?: string
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

export type ComboTourBadgeRequest = {
  logoUrl: string
  title: string
  shortInfo: string
}

export type ComboTourItemRequest = {
  tourId: string
  quantity: number
}

export type ComboTourItem = {
  id?: string
  tourId: string
  tourTitle?: string
  tourSlug?: string
  quantity: number
  sortOrder?: number
}

export type ComboTourImageRequest = {
  mediaAssetId: string
  featured: boolean
}

export type ComboTourImage = {
  id?: string
  mediaAssetId: string
  url?: string
  originalFilename?: string
  sortOrder?: number
  featured?: boolean
}

export type ComboTourTextItem = {
  id?: string
  value: string
  sortOrder?: number
}

export type ComboTourCancellationPolicy = {
  id: string
  code?: string
  name: string
}

export type ComboTourRequest = {
  title: string
  slug: string
  shortDescription: string
  longDescription: string
  primaryCategoryId: string
  comboPrice: number
  status: ComboTourStatus
  cancellationPolicyId: string
  metaTitle?: string
  metaDescription?: string
  items: ComboTourItemRequest[]
  images: ComboTourImageRequest[]
  inclusions: string[]
  exclusions: string[]
  durationMinutes?: number
  discountPrice?: number
  isAttraction: boolean
  isHot: boolean
  hotelPickupIncluded: boolean
  badges: ComboTourBadgeRequest[]
}

export type ComboTourUpdateRequest = {
  version: number
  comboTour: ComboTourRequest
}

export type ComboTourDetail = {
  id: string
  title: string
  slug: string
  shortDescription?: string
  longDescription?: string
  primaryCategory?: ComboTourCategory
  comboPrice: number
  currency?: string
  status: ComboTourStatus
  discountPrice?: number
  durationMinutes?: number
  isAttraction?: boolean
  isHot?: boolean
  hotelPickupIncluded?: boolean
  cancellationPolicy?: ComboTourCancellationPolicy
  metaTitle?: string
  metaDescription?: string
  items?: ComboTourItem[]
  images?: ComboTourImage[]
  inclusions?: ComboTourTextItem[]
  exclusions?: ComboTourTextItem[]
  version?: number
  createdAt?: string
  updatedAt?: string
  badges?: ComboTourBadge[]
  rating?: number
  reviewCount?: number
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
