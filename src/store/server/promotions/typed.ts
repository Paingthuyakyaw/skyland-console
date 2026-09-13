export type DiscountType = "PERCENTAGE" | "FIXED_AMOUNT"

export type PromotionScopeType = "ALL_TOURS" | "CATEGORY" | "SPECIFIC_TOUR"

export type PromotionStatus = "ACTIVE" | "SCHEDULED" | "EXHAUSTED"

export type PromotionRequest = {
  code: string
  discountType: DiscountType
  value: number
  minSpend?: number
  scopeType: PromotionScopeType
  scopeRefId?: string
  startDate: string
  endDate?: string
  noEndDate: boolean
  totalUsesAllowed?: number
  unlimitedUses: boolean
  usesPerCustomer: number
  firstTimeCustomersOnly: boolean
  usedCount: number
  isManuallyDisabled: boolean
  expiredOrExhaustedMessage: string
}

export type PromotionResponse = {
  id: string
  code: string
  discountType: DiscountType
  value: number
  minSpend?: number
  scopeType: PromotionScopeType
  scopeRefId?: string
  startDate: string
  endDate?: string
  noEndDate: boolean
  totalUsesAllowed?: number
  unlimitedUses: boolean
  usesPerCustomer: number
  firstTimeCustomersOnly: boolean
  usedCount: number
  isManuallyDisabled: boolean
  expiredOrExhaustedMessage: string
  status: PromotionStatus
  version?: number
  createdAt?: string
  updatedAt?: string
}

export type PromotionUpdateRequest = {
  version: number
  promotion: PromotionRequest
}

export type PromotionsQueryParams = {
  query?: string
  status?: PromotionStatus
  discountType?: DiscountType
  scopeType?: PromotionScopeType
  activeOn?: string
  page?: number
  size?: number
  sort?: string
  direction?: "asc" | "desc"
}

export type GenerateCodeRequest = {
  prefix?: string
  randomLength?: number
}

export type GeneratedCodeResponse = {
  code: string
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
