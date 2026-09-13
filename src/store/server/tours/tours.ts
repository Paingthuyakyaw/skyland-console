import { axios } from "@/api"
import { queryClient } from "@/lib/query-client"
import { apiErrorMessage } from "@/store/server/api-error"
import type {
  ApiResponse,
  PageResponse,
  TourRequest,
  TourResponse,
  TourSummary,
  ToursQueryParams,
} from "@/store/server/tours/typed"
import { useMutation, useQuery } from "@tanstack/react-query"
import { toast } from "sonner"

export type DeleteTourPayload = {
  id: string
}

const TOURS_KEY = ["tours"] as const

function invalidateTours() {
  void queryClient.invalidateQueries({ queryKey: TOURS_KEY })
}

export const getTours = async (params: ToursQueryParams = {}) => {
  const { data } = await axios.get<ApiResponse<PageResponse<TourSummary>>>(
    "tours",
    {
      params: {
        query: params.query || undefined,
        status: params.status,
        difficulty: params.difficulty,
        primaryCategoryId: params.primaryCategoryId,
        secondaryCategoryId: params.secondaryCategoryId,
        page: params.page ?? 0,
        size: params.size ?? 20,
        sort: params.sort ?? "createdAt",
        direction: params.direction ?? "desc",
      },
    }
  )
  return data.data
}

export const useTours = (params: ToursQueryParams = {}) => {
  return useQuery({
    queryKey: [...TOURS_KEY, params],
    queryFn: () => getTours(params),
  })
}

export const deleteTour = async ({ id }: DeleteTourPayload) => {
  const { data } = await axios.delete<ApiResponse<TourSummary | unknown>>(
    `tours/${id}`
  )
  return data
}

export const createTour = async (payload: TourRequest) => {
  const { data } = await axios.post<ApiResponse<TourResponse>>("tours", payload)
  return data
}

export function useCreateTour() {
  return useMutation({
    mutationFn: createTour,
    onSuccess: (response) => {
      toast.success(response.message || "Tour created")
      invalidateTours()
    },
    onError: (err) => {
      toast.error(apiErrorMessage(err, "Failed to create tour"))
    },
  })
}

export function useDeleteTour() {
  return useMutation({
    mutationFn: deleteTour,
    onSuccess: (response) => {
      toast.success(response.message || "Tour deleted")
      invalidateTours()
    },
    onError: (err) => {
      toast.error(apiErrorMessage(err, "Failed to delete tour"))
    },
  })
}
