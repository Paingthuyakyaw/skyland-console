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

export const getPricingRules = async (timeslotPackageId: string, page = 0) => {
  const { data } = await axios.get<
    ApiResponse<PageResponse<PricingRuleResponse>>
  >(`timeslot-packages/${timeslotPackageId}/pricing/rules`, {
    params: { page, size: 20 },
  })
  return data.data
}

export function usePricingRules(timeslotPackageId?: string, page = 0) {
  return useQuery({
    queryKey: [...pricingRulesKey(timeslotPackageId ?? ""), page],
    queryFn: () => getPricingRules(timeslotPackageId!, page),
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

export function useUpdatePricingRule(packageId?: string) {
  return useMutation({
    mutationFn: async ({
      id,
      version,
      rule,
    }: {
      id: string
      version: number
      rule: PricingRuleRequest
    }) => {
      const { data } = await axios.put<ApiResponse<PricingRuleResponse>>(
        `timeslot-packages/${packageId}/pricing/rules/${id}`,
        { version, rule }
      )
      return data
    },
    onSuccess: () => {
      toast.success("Pricing rule updated")
      if (packageId) invalidatePricingRules(packageId)
    },
    onError: (error) =>
      toast.error(apiErrorMessage(error, "Failed to update pricing rule")),
  })
}
