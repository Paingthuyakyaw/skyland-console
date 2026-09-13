import { axios } from "@/api"
import { queryClient } from "@/lib/query-client"
import { apiErrorMessage } from "@/store/server/api-error"
import type {
  ApiResponse,
  ComboTour,
  ComboToursQueryParams,
  PageResponse,
} from "@/store/server/combo/typed"
import { useMutation, useQuery } from "@tanstack/react-query"
import { toast } from "sonner"

export type DeleteComboTourPayload = {
  id: string
}

const COMBO_TOURS_KEY = ["combo-tours"] as const

function invalidateComboTours() {
  void queryClient.invalidateQueries({ queryKey: COMBO_TOURS_KEY })
}

export const getComboTours = async (params: ComboToursQueryParams = {}) => {
  const { data } = await axios.get<ApiResponse<PageResponse<ComboTour>>>(
    "combo-tours",
    {
      params: {
        query: params.query || undefined,
        status: params.status,
        categoryId: params.categoryId,
        page: params.page ?? 0,
        size: params.size ?? 20,
        sort: params.sort ?? "createdAt",
        direction: params.direction ?? "desc",
      },
    }
  )
  return data.data
}

export const useComboTours = (params: ComboToursQueryParams = {}) => {
  return useQuery({
    queryKey: [...COMBO_TOURS_KEY, params],
    queryFn: () => getComboTours(params),
  })
}

export const deleteComboTour = async ({ id }: DeleteComboTourPayload) => {
  const { data } = await axios.delete<ApiResponse<ComboTour | unknown>>(
    `combo-tours/${id}`
  )
  return data
}

export function useDeleteComboTour() {
  return useMutation({
    mutationFn: deleteComboTour,
    onSuccess: (response) => {
      toast.success(response.message || "Combo tour deleted")
      invalidateComboTours()
    },
    onError: (err) => {
      toast.error(apiErrorMessage(err, "Failed to delete combo tour"))
    },
  })
}
