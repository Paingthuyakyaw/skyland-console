export type PeriodSummary = {
  totalBookings: number
  totalRevenue: number
  previousBookings: number
  previousRevenue: number
}

export type DashboardSummary = {
  today: PeriodSummary
  thisWeek: PeriodSummary
  thisMonth: PeriodSummary
}

export type DailyBookings = {
  date: string
  totalBookings: number
}

export type TopTour = {
  tourId: string
  name: string
  totalCount: number
}

export type NewTourInquiries = {
  totalCount: number
}

export type ApiResponse<T> = {
  success: boolean
  message?: string
  data: T
  timestamp?: string
}
