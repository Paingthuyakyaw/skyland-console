import { axios } from "@/api"
import { queryClient } from "@/lib/query-client"
import { apiErrorMessage } from "@/store/server/api-error"
import type {
  ApiResponse,
  GenerateCodeRequest,
  GeneratedCodeResponse,
  PageResponse,
  PromotionRequest,
  PromotionResponse,
  PromotionUpdateRequest,
  PromotionsQueryParams,
} from "@/store/server/promotions/typed"
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query"
import { toast } from "sonner"

export type DeletePromotionPayload = {
  id: string
}

export type UpdatePromotionPayload = {
  id: string
  version: number
  promotion: PromotionRequest
}

const PROMOTIONS_KEY = ["promotions"] as const

function invalidatePromotions() {
  void queryClient.invalidateQueries({ queryKey: PROMOTIONS_KEY })
}

export const getPromotions = async (params: PromotionsQueryParams = {}) => {
  const { data } = await axios.get<
    ApiResponse<PageResponse<PromotionResponse>>
  >("promotions", {
    params: {
      query: params.query || undefined,
      status: params.status,
      discountType: params.discountType,
      scopeType: params.scopeType,
      activeOn: params.activeOn,
      page: params.page ?? 0,
      size: params.size ?? 20,
      sort: params.sort ?? "createdAt",
      direction: params.direction ?? "desc",
    },
  })
  return data.data
}

export const usePromotions = (params: PromotionsQueryParams = {}) => {
  return useQuery({
    queryKey: [...PROMOTIONS_KEY, params],
    queryFn: () => getPromotions(params),
    placeholderData: keepPreviousData,
  })
}

export const getPromotion = async (id: string) => {
  const { data } = await axios.get<ApiResponse<PromotionResponse>>(
    `promotions/${id}`
  )
  return data.data
}

export const usePromotion = (id: string, enabled = true) => {
  return useQuery({
    queryKey: [...PROMOTIONS_KEY, id],
    queryFn: () => getPromotion(id),
    enabled: enabled && Boolean(id),
  })
}

export const createPromotion = async (payload: PromotionRequest) => {
  const { data } = await axios.post<ApiResponse<PromotionResponse>>(
    "promotions",
    payload
  )
  return data
}

export function useCreatePromotion() {
  return useMutation({
    mutationFn: createPromotion,
    onSuccess: (response) => {
      toast.success(response.message || "Coupon created")
      invalidatePromotions()
    },
    onError: (err) => {
      toast.error(apiErrorMessage(err, "Failed to create coupon"))
    },
  })
}

export const updatePromotion = async ({
  id,
  version,
  promotion,
}: UpdatePromotionPayload) => {
  const body: PromotionUpdateRequest = { version, promotion }
  const { data } = await axios.put<ApiResponse<PromotionResponse>>(
    `promotions/${id}`,
    body
  )
  return data
}

export function useUpdatePromotion() {
  return useMutation({
    mutationFn: updatePromotion,
    onSuccess: (response) => {
      toast.success(response.message || "Coupon updated")
      invalidatePromotions()
    },
    onError: (err) => {
      toast.error(apiErrorMessage(err, "Failed to update coupon"))
    },
  })
}

export const deletePromotion = async ({ id }: DeletePromotionPayload) => {
  const { data } = await axios.delete<ApiResponse<PromotionResponse | unknown>>(
    `promotions/${id}`
  )
  return data
}

export function useDeletePromotion() {
  return useMutation({
    mutationFn: deletePromotion,
    onSuccess: (response) => {
      toast.success(
        (response && "message" in response && response.message) ||
          "Coupon deleted"
      )
      invalidatePromotions()
    },
    onError: (err) => {
      toast.error(apiErrorMessage(err, "Failed to delete coupon"))
    },
  })
}

export const generatePromotionCode = async (
  payload: GenerateCodeRequest = { prefix: "SKY", randomLength: 6 }
) => {
  const { data } = await axios.post<ApiResponse<GeneratedCodeResponse>>(
    "promotions/generate-code",
    payload
  )
  return data.data
}

export function useGeneratePromotionCode() {
  return useMutation({
    mutationFn: generatePromotionCode,
    onError: (err) => {
      toast.error(apiErrorMessage(err, "Failed to generate coupon code"))
    },
  })
}
