export type BookingStatus =
  | "PENDING_PAYMENT"
  | "CONFIRMED"
  | "CANCEL_PENDING"
  | "CANCELLED"
  | "EXPIRED"
  | "REFUND_PENDING"
  | "REFUNDED"
  | "REVIEW_REQUIRED"

export type PaymentStatus =
  | "REQUIRES_PAYMENT"
  | "PROCESSING"
  | "REQUIRES_ACTION"
  | "SUCCEEDED"
  | "FAILED"
  | "CANCELLED"
  | "REFUND_PENDING"
  | "REFUNDED"
  | "DISPUTED"

export type RefundStatus = "PENDING" | "SUCCEEDED" | "FAILED"

export type AddonPricingBasis = "PER_GUEST" | "PER_BOOKING" | "PER_UNIT"

export type BookingSummary = {
  id: string
  customerName?: string
  email?: string
  phoneNumber?: string
  bookingStatus: BookingStatus
  paymentStatus: PaymentStatus
  baseSubtotal?: number
  addonSubtotal?: number
  totalAmount?: number
  currency?: string
  expiresAt?: string
  createdAt?: string
  version?: number
}

export type BookingAddon = {
  addonId?: string
  code?: string
  title?: string
  description?: string
  pricingBasis?: AddonPricingBasis
  unitAmount?: number
  quantity?: number
  subtotal?: number
}

export type BookingItem = {
  id: string
  tourId?: string
  travelDate?: string
  timeslotId?: string
  timeslotPackageId?: string
  adultCount?: number
  childCount?: number
  infantCount?: number
  privateTour?: boolean
  heldQuantity?: number
  promotionCode?: string
  unitPrice?: number
  subtotal?: number
  discountAmount?: number
  lineTotal?: number
  departureAt?: string
  departureEndsAt?: string
  departureTimeZone?: string
  baseSubtotal?: number
  addonSubtotal?: number
  addons?: BookingAddon[]
  expiresAt?: string
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

export type PaymentAttempt = {
  id: string
  provider?: string
  providerPaymentId?: string
  amount?: number
  currency?: string
  status?: string
  createdAt?: string
}

export type RefundAttempt = {
  id: string
  provider?: string
  providerRefundId?: string
  amount?: number
  currency?: string
  status?: RefundStatus
  reason?: string
  createdAt?: string
}

export type BookingDetail = {
  summary: BookingSummary
  customerDetails?: CustomerDetails
  items?: BookingItem[]
  payments?: PaymentAttempt[]
  refunds?: RefundAttempt[]
}

export type BookingActionRequest = {
  version: number
  reason: string
}

export type BookingsQueryParams = {
  query?: string
  tourId?: string
  travelFrom?: string
  travelTo?: string
  bookingStatus?: BookingStatus
  paymentStatus?: PaymentStatus
  createdFrom?: string
  createdTo?: string
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
