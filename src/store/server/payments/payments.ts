import { axios } from "@/api"
import type {
  AmountGroup,
  ApiResponse,
  DateRange,
  MonthlyRevenue,
  PageResponse,
  TotalPaidAmount,
  TransactionLog,
} from "@/store/server/payments/typed"
import { useQuery } from "@tanstack/react-query"

const PAYMENTS_KEY = ["payment-revenue"] as const

function rangeParams(range: DateRange) {
  return { from: range.from, to: range.to }
}

export const getTotalPaid = async (range: DateRange) => {
  const { data } = await axios.get<ApiResponse<TotalPaidAmount>>(
    "payment-revenue/total-paid",
    { params: rangeParams(range) }
  )
  return data.data
}

export const useTotalPaid = (range: DateRange, enabled: boolean) => {
  return useQuery({
    queryKey: [...PAYMENTS_KEY, "total-paid", range],
    queryFn: () => getTotalPaid(range),
    enabled,
  })
}

export const getPaymentMethods = async (range: DateRange) => {
  const { data } = await axios.get<ApiResponse<AmountGroup[]>>(
    "payment-revenue/payment-methods",
    { params: rangeParams(range) }
  )
  return data.data
}

export const usePaymentMethods = (range: DateRange, enabled: boolean) => {
  return useQuery({
    queryKey: [...PAYMENTS_KEY, "payment-methods", range],
    queryFn: () => getPaymentMethods(range),
    enabled,
  })
}

export const getTourPaymentOptions = async (range: DateRange) => {
  const { data } = await axios.get<ApiResponse<AmountGroup[]>>(
    "payment-revenue/tour-payment-options",
    { params: rangeParams(range) }
  )
  return data.data
}

export const useTourPaymentOptions = (range: DateRange, enabled: boolean) => {
  return useQuery({
    queryKey: [...PAYMENTS_KEY, "tour-payment-options", range],
    queryFn: () => getTourPaymentOptions(range),
    enabled,
  })
}

export const getMonthlyRevenue = async (range: DateRange) => {
  const { data } = await axios.get<ApiResponse<MonthlyRevenue[]>>(
    "payment-revenue/monthly-revenue",
    { params: rangeParams(range) }
  )
  return data.data
}

export const useMonthlyRevenue = (range: DateRange, enabled: boolean) => {
  return useQuery({
    queryKey: [...PAYMENTS_KEY, "monthly-revenue", range],
    queryFn: () => getMonthlyRevenue(range),
    enabled,
  })
}

export const getTransactions = async (
  range: DateRange,
  page: number,
  size: number
) => {
  const { data } = await axios.get<ApiResponse<PageResponse<TransactionLog>>>(
    "transactions",
    { params: { ...rangeParams(range), page, size } }
  )
  return data.data
}

export const useTransactions = (
  range: DateRange,
  page: number,
  size: number,
  enabled: boolean
) => {
  return useQuery({
    queryKey: [...PAYMENTS_KEY, "transactions", range, page, size],
    queryFn: () => getTransactions(range, page, size),
    enabled,
  })
}
