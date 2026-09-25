import { axios } from "@/api"
import type {
  ApiResponse,
  OutstandingReport,
  PageQuery,
  PageResponse,
  PromoCodeReport,
  RefundCancelReport,
} from "@/store/server/reports/typed"
import { useQuery } from "@tanstack/react-query"

const REPORTS_KEY = ["reports"] as const

function pageParams(query: PageQuery) {
  return {
    from: query.from,
    to: query.to,
    page: query.page,
    size: query.size,
  }
}

export const getPromoCodes = async (query: PageQuery) => {
  const { data } = await axios.get<ApiResponse<PageResponse<PromoCodeReport>>>(
    "reports/promo-codes",
    { params: pageParams(query) }
  )
  return data.data
}

export const usePromoCodes = (query: PageQuery, enabled: boolean) => {
  return useQuery({
    queryKey: [...REPORTS_KEY, "promo-codes", query],
    queryFn: () => getPromoCodes(query),
    enabled,
  })
}

export const getRefundsCancellations = async (query: PageQuery) => {
  const { data } = await axios.get<
    ApiResponse<PageResponse<RefundCancelReport>>
  >("reports/refunds-cancellations", { params: pageParams(query) })
  return data.data
}

export const useRefundsCancellations = (query: PageQuery, enabled: boolean) => {
  return useQuery({
    queryKey: [...REPORTS_KEY, "refunds-cancellations", query],
    queryFn: () => getRefundsCancellations(query),
    enabled,
  })
}

export const getPayOnArrival = async (query: PageQuery) => {
  const { data } = await axios.get<
    ApiResponse<PageResponse<OutstandingReport>>
  >("reports/pay-on-arrival", { params: pageParams(query) })
  return data.data
}

export const usePayOnArrival = (query: PageQuery, enabled: boolean) => {
  return useQuery({
    queryKey: [...REPORTS_KEY, "pay-on-arrival", query],
    queryFn: () => getPayOnArrival(query),
    enabled,
  })
}

export const getDeposits = async (query: PageQuery) => {
  const { data } = await axios.get<
    ApiResponse<PageResponse<OutstandingReport>>
  >("reports/deposits", { params: pageParams(query) })
  return data.data
}

export const useDeposits = (query: PageQuery, enabled: boolean) => {
  return useQuery({
    queryKey: [...REPORTS_KEY, "deposits", query],
    queryFn: () => getDeposits(query),
    enabled,
  })
}
