export type BannerType =
  "HOME" | "TOUR" | "HOLIDAY_PACKAGE" | "COMBO_TOUR" | "OTHER"

export type BlogStatus = "PUBLISHED" | "DRAFT"

export type BannerRequest = {
  title: string
  imageUrl: string
  active: boolean
  bannerType: BannerType
}

export type BannerResponse = {
  id: string
  title: string
  imageUrl: string
  active: boolean
  bannerType: BannerType
  version?: number
  createdAt?: string
  updatedAt?: string
}

export type BlogRequest = {
  title: string
  coverImageUrl?: string
  body: string
  status: BlogStatus
}

export type BlogResponse = {
  id: string
  title: string
  coverImageUrl?: string
  body: string
  status: BlogStatus
  version?: number
  createdAt?: string
  updatedAt?: string
}

export type FaqRequest = {
  question: string
  answer: string
}

export type FaqResponse = {
  id: string
  question: string
  answer: string
  version?: number
  createdAt?: string
  updatedAt?: string
}

export type CmsMediaAsset = {
  id: string
  provider?: string
  url?: string
  folderPath?: string
  originalFilename?: string
  contentType?: string
  sizeBytes?: number
  uploadedAt?: string
  uploadedBy?: string
}

export type CmsListParams = {
  page?: number
  size?: number
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

export type UpdateRequest<T> = {
  version: number
  value: T
}
