export type HolidayPackageStatus = "ACTIVE" | "INACTIVE"

export type HolidayPackageDifficulty = "EASY" | "MODERATE" | "HARD"

export type HolidayPackageHotelTier =
  | "THREE_STAR"
  | "FOUR_STAR"
  | "FIVE_STAR"

export type HolidayPackageCategory = {
  id: string
  name: string
  slug: string
  level?: string
  levelLabel?: string
  sortOrder?: number
  version?: number
  imageUrl?: string
  createdAt?: string
  updatedAt?: string
}

export type HolidayPackageBadge = {
  logoUrl?: string
  title: string
  shortInfo?: string
}

export type HolidayPackageBadgeRequest = {
  logoUrl: string
  title: string
  shortInfo: string
}

export type HolidayPackageItineraryDayRequest = {
  dayNumber: number
  description: string
}

export type HolidayPackageItineraryDay = {
  id?: string
  dayNumber: number
  description: string
}

export type HolidayPackageImage = {
  id?: string
  mediaAssetId: string
  url?: string
  originalFilename?: string
  sortOrder?: number
  featured?: boolean
}

export type HolidayPackageTextItem = {
  id?: string
  value: string
  sortOrder?: number
}

export type HolidayPackageCancellationPolicy = {
  id: string
  code?: string
  name: string
}

export type HolidayPackageUpdateRequest = {
  version: number
  holidayPackage: HolidayPackageRequest
}

export type HolidayPackageRequest = {
  title: string
  slug: string
  shortDescription: string
  longDescription: string
  categoryId: string
  fromPrice: number
  status: HolidayPackageStatus
  cancellationPolicyId: string
  duration: string
  minimumAge: number
  difficulty: HolidayPackageDifficulty
  hotelTier: HolidayPackageHotelTier
  airportTransferIncluded: boolean
  imageMediaAssetIds: string[]
  itinerary: HolidayPackageItineraryDayRequest[]
  languages: string[]
  inclusions: string[]
  exclusions: string[]
  whatToBring: string[]
  hotelPickupIncluded: boolean
  isAttraction: boolean
  isHot: boolean
  badges: HolidayPackageBadgeRequest[]
}

export type HolidayPackageDetail = {
  id: string
  title: string
  slug: string
  shortDescription?: string
  longDescription?: string
  category?: HolidayPackageCategory
  fromPrice: number
  currency?: string
  status: HolidayPackageStatus
  cancellationPolicy?: HolidayPackageCancellationPolicy
  duration?: string
  durationMinutes?: number
  minimumAge?: number
  difficulty?: HolidayPackageDifficulty
  hotelTier?: HolidayPackageHotelTier
  airportTransferIncluded?: boolean
  discountPrice?: number
  isAttraction?: boolean
  isHot?: boolean
  hotelPickupIncluded?: boolean
  images?: HolidayPackageImage[]
  itinerary?: HolidayPackageItineraryDay[]
  languages?: HolidayPackageTextItem[]
  inclusions?: HolidayPackageTextItem[]
  exclusions?: HolidayPackageTextItem[]
  whatToBring?: HolidayPackageTextItem[]
  badges?: HolidayPackageBadge[]
  version?: number
  createdAt?: string
  updatedAt?: string
  rating?: number
  reviewCount?: number
}

export type HolidayPackage = {
  id: string
  title: string
  slug: string
  category?: HolidayPackageCategory
  fromPrice: number
  currency: string
  status: HolidayPackageStatus
  discountPrice?: number
  isAttraction?: boolean
  isHot?: boolean
  hotelPickupIncluded?: boolean
  badges?: HolidayPackageBadge[]
  featuredImageUrl?: string
  version?: number
  createdAt?: string
  updatedAt?: string
}

export type HolidayPackagesQueryParams = {
  query?: string
  status?: HolidayPackageStatus
  categoryId?: string
  difficulty?: HolidayPackageDifficulty
  hotelTier?: HolidayPackageHotelTier
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
