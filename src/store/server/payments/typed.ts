export type DateRange = {
  from: string
  to: string
}

export type TotalPaidAmount = {
  amount: number
}

export type AmountGroup = {
  name: string
  amount: number
}

export type MonthlyRevenue = {
  month: string
  amount: number
}

export type TransactionLog = {
  id: string
  bookingRef?: string
  customerName?: string
  paymentType?: string
  amount?: number
  method?: string
  status?: string
  dateTime?: string
  eventType?: string
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
