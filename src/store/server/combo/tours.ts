import { axios } from "@/api"
import { queryClient } from "@/lib/query-client"
import { apiErrorMessage } from "@/store/server/api-error"
import type {
  ApiResponse,
  ComboTour,
  ComboTourDetail,
  ComboTourRequest,
  ComboToursQueryParams,
  ComboTourUpdateRequest,
  PageResponse,
} from "@/store/server/combo/typed"
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query"
import { toast } from "sonner"

export type DeleteComboTourPayload = {
  id: string
}

export type UpdateComboTourPayload = ComboTourUpdateRequest & {
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
    placeholderData: keepPreviousData,
  })
}

export const getComboTour = async (id: string) => {
  const { data } = await axios.get<ApiResponse<ComboTourDetail>>(
    `combo-tours/${id}`
  )
  return data.data
}

export function useComboTour(id: string, enabled = true) {
  return useQuery({
    queryKey: [...COMBO_TOURS_KEY, id],
    queryFn: () => getComboTour(id),
    enabled: enabled && id.length > 0,
  })
}

export const createComboTour = async (payload: ComboTourRequest) => {
  const { data } = await axios.post<ApiResponse<ComboTourDetail>>(
    "combo-tours",
    payload
  )
  return data
}

export function useCreateComboTour() {
  return useMutation({
    mutationFn: createComboTour,
    onSuccess: (response) => {
      toast.success(response.message || "Combo tour created")
      invalidateComboTours()
    },
    onError: (err) => {
      toast.error(apiErrorMessage(err, "Failed to create combo tour"))
    },
  })
}

export const updateComboTour = async ({
  id,
  version,
  comboTour,
}: UpdateComboTourPayload) => {
  const { data } = await axios.put<ApiResponse<ComboTourDetail>>(
    `combo-tours/${id}`,
    { version, comboTour }
  )
  return data
}

export function useUpdateComboTour() {
  return useMutation({
    mutationFn: updateComboTour,
    onSuccess: (response, { id }) => {
      toast.success(response.message || "Combo tour updated")
      invalidateComboTours()
      void queryClient.invalidateQueries({
        queryKey: [...COMBO_TOURS_KEY, id],
      })
    },
    onError: (err) => {
      toast.error(apiErrorMessage(err, "Failed to update combo tour"))
    },
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
