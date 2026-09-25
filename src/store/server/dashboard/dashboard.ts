import { axios } from "@/api"
import type {
  ApiResponse,
  DailyBookings,
  DashboardSummary,
  NewTourInquiries,
  TopTour,
} from "@/store/server/dashboard/typed"
import { useQuery } from "@tanstack/react-query"

const DASHBOARD_KEY = ["dashboard"] as const

export const getDashboardSummary = async () => {
  const { data } =
    await axios.get<ApiResponse<DashboardSummary>>("dashboard/summary")
  return data.data
}

export const useDashboardSummary = () => {
  return useQuery({
    queryKey: [...DASHBOARD_KEY, "summary"],
    queryFn: getDashboardSummary,
  })
}

export const getPreviousSevenDays = async () => {
  const { data } = await axios.get<ApiResponse<DailyBookings[]>>(
    "dashboard/bookings/previous-seven-days"
  )
  return data.data
}

export const usePreviousSevenDays = () => {
  return useQuery({
    queryKey: [...DASHBOARD_KEY, "previous-seven-days"],
    queryFn: getPreviousSevenDays,
  })
}

export const getTopSellingTours = async () => {
  const { data } = await axios.get<ApiResponse<TopTour[]>>(
    "dashboard/tours/top-selling"
  )
  return data.data
}

export const useTopSellingTours = () => {
  return useQuery({
    queryKey: [...DASHBOARD_KEY, "top-selling"],
    queryFn: getTopSellingTours,
  })
}

export const getNewTourInquiryCount = async () => {
  const { data } = await axios.get<ApiResponse<NewTourInquiries>>(
    "dashboard/tour-inquiries/new/count"
  )
  return data.data
}

export const useNewTourInquiryCount = () => {
  return useQuery({
    queryKey: [...DASHBOARD_KEY, "new-inquiries"],
    queryFn: getNewTourInquiryCount,
  })
}
