import { axios } from "@/api"
import { queryClient } from "@/lib/query-client"
import { apiErrorMessage } from "@/store/server/api-error"
import type {
  ApiResponse,
  PageResponse,
  PricingRuleRequest,
  PricingRuleResponse,
} from "@/store/server/tours/typed"
import { useMutation, useQuery } from "@tanstack/react-query"
import { toast } from "sonner"

const pricingRulesKey = (packageId: string) =>
  ["timeslot-package-pricing-rules", packageId] as const

function invalidatePricingRules(packageId: string) {
  void queryClient.invalidateQueries({ queryKey: pricingRulesKey(packageId) })
}

export const getPricingRules = async (timeslotPackageId: string) => {
  const { data } = await axios.get<
    ApiResponse<PageResponse<PricingRuleResponse>>
  >(`timeslot-packages/${timeslotPackageId}/pricing/rules`, {
    params: { size: 50 },
  })
  return data.data?.content ?? []
}

export function usePricingRules(timeslotPackageId?: string) {
  return useQuery({
    queryKey: pricingRulesKey(timeslotPackageId ?? ""),
    queryFn: () => getPricingRules(timeslotPackageId!),
    enabled: Boolean(timeslotPackageId),
  })
}

export const createPricingRule = async ({
  timeslotPackageId,
  payload,
}: {
  timeslotPackageId: string
  payload: PricingRuleRequest
}) => {
  const { data } = await axios.post<ApiResponse<PricingRuleResponse>>(
    `timeslot-packages/${timeslotPackageId}/pricing/rules`,
    payload
  )
  return data
}

export function useCreatePricingRule(timeslotPackageId?: string) {
  return useMutation({
    mutationFn: createPricingRule,
    onSuccess: (response) => {
      toast.success(response.message || "Pricing rule created")
      if (timeslotPackageId) invalidatePricingRules(timeslotPackageId)
    },
    onError: (err) => {
      toast.error(apiErrorMessage(err, "Failed to create pricing rule"))
    },
  })
}
