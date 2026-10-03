import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { axios } from "@/api"
import { apiErrorMessage } from "@/store/server/api-error"
import type { ApiResponse, PageResponse } from "@/store/server/tours/typed"

export type ReviewProductType = "tours" | "holiday-packages"
export type ProductReviewRequest = {
  name: string
  country?: string
  city?: string
  rating: number
  comment: string
}
export type ProductReview = ProductReviewRequest & {
  id: string
  createdAt: string
}

export function useProductReviews(
  type: ReviewProductType,
  id: string,
  page: number
) {
  return useQuery({
    queryKey: ["product-reviews", type, id, page],
    queryFn: async () => {
      const { data } = await axios.get<
        ApiResponse<PageResponse<ProductReview>>
      >(`${type}/${id}/reviews`, { params: { page, size: 10 } })
      return data.data
    },
  })
}

export function useCreateProductReview(type: ReviewProductType, id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (request: ProductReviewRequest) => {
      const { data } = await axios.post<ApiResponse<ProductReview>>(
        `${type}/${id}/reviews`,
        request
      )
      return data.data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["product-reviews", type, id],
      })
      void queryClient.invalidateQueries({ queryKey: [type] })
      toast.success("Review published")
    },
    onError: (error) =>
      toast.error(apiErrorMessage(error, "Failed to publish review")),
  })
}
