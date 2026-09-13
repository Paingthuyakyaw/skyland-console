import { axios } from "@/api"
import type {
  ApiResponse,
  CancellationPolicyOption,
} from "@/store/server/tours/typed"
import { useQuery } from "@tanstack/react-query"

const CANCELLATION_OPTIONS_KEY = ["cancellation-policies", "options"] as const

export const getCancellationPolicyOptions = async () => {
  const { data } = await axios.get<ApiResponse<CancellationPolicyOption[]>>(
    "cancellation-policies/options"
  )
  return data.data ?? []
}

export function useCancellationPolicyOptions() {
  return useQuery({
    queryKey: CANCELLATION_OPTIONS_KEY,
    queryFn: getCancellationPolicyOptions,
  })
}
