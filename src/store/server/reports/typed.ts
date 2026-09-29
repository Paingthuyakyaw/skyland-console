export type DateRange = {
  from: string
  to: string
}

export type PageQuery = DateRange & {
  page: number
  size: number
}

export type RefundCancelReport = {
  bookingRef?: string
  tourName?: string
  reason?: string
  refundAmount?: number
  status?: string
  dateTime?: string
}

export type OutstandingReport = {
  bookingRef?: string
  tourName?: string
  customerName?: string
  outstandingAmount?: number
  collectedAmount?: number
  status?: string
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
