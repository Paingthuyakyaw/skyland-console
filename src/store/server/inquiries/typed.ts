export type ProductType = "TOUR" | "HOLIDAY_PACKAGE" | "COMBO_TOUR"

export type SalesQueue = "tour" | "combo" | "holiday"

export type InquiryStatus =
  "NEW" | "IN_PROGRESS" | "QUOTED" | "ACCEPTED" | "DECLINED" | "CLOSED"

export type StaffQuote = {
  amount?: number
  currency?: string
  message?: string
  expiresAt?: string
}

export type WorkflowItem = {
  id?: string
  productId?: string
  productType?: ProductType | string
  productTitleSnapshot?: string
  requestedDate?: string
  adultCount?: number
  childCount?: number
  infantCount?: number
  quantity?: number
}

export type BillingAddress = {
  line1?: string
  line2?: string
  region?: string
  city?: string
  postalCode?: string
  countryCode?: string
}

export type CustomerDetails = {
  leadNationalityCountryCode?: string
  billingAddress?: BillingAddress
  customerRemarks?: string
}

export type ProductWorkflow = {
  id: string
  salesCaseId?: string
  productType?: ProductType
  salesCaseProductTypes?: ProductType[]
  firstName?: string
  lastName?: string
  phoneNumber?: string
  email?: string
  requestedDate?: string
  totalChild?: number
  totalAdults?: number
  totalInfants?: number
  country?: string
  hotelType?: string
  roomCount?: number
  description?: string
  status?: InquiryStatus | string
  staffQuote?: StaffQuote
  resolutionReason?: string
  items?: WorkflowItem[]
  customerDetails?: CustomerDetails
  version?: number
  createdAt?: string
  updatedAt?: string
}

export type VersionRequest = {
  version: number
}

export type QuoteRequest = {
  version: number
  amount: number
  currency: string
  message: string
  expiresAt: string
}

export type ResolutionRequest = {
  version: number
  reason: string
}

export type TourInquiriesQueryParams = {
  query?: string
  status?: InquiryStatus
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
