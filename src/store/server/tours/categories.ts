import { axios } from "@/api"
import { queryClient } from "@/lib/query-client"
import { apiErrorMessage } from "@/store/server/api-error"
import type {
  ApiResponse,
  PageResponse,
  TourCategory,
  TourCategoryLevel,
} from "@/store/server/tours/typed"
import { useMutation, useQuery } from "@tanstack/react-query"
import { toast } from "sonner"

export type TourCategoriesQueryParams = {
  query?: string
  level?: TourCategoryLevel
  parentId?: string
}

export type CreatePrimaryTourCategoryPayload = {
  name: string
  slug: string
  level: "PRIMARY"
  sortOrder: number
  imageMediaAssetId?: string
}

export type CreateSecondaryTourCategoryPayload = {
  name: string
  slug: string
  level: "SECONDARY"
  parentId: string
  sortOrder: number
}

export type CreateTourCategoryPayload =
  | CreatePrimaryTourCategoryPayload
  | CreateSecondaryTourCategoryPayload

export function buildCreateTourCategoryBody(
  payload: CreateTourCategoryPayload
) {
  if (payload.level === "PRIMARY") {
    return {
      name: payload.name,
      slug: payload.slug,
      level: "PRIMARY" as const,
      sortOrder: payload.sortOrder,
      imageMediaAssetId: payload.imageMediaAssetId,
    }
  }

  return {
    name: payload.name,
    slug: payload.slug,
    level: "SECONDARY" as const,
    parentId: payload.parentId,
    sortOrder: payload.sortOrder,
  }
}

export type UpdateTourCategoryPayload = {
  id: string
  version: number
  name: string
  slug: string
  level: TourCategoryLevel
  parentId?: string
  sortOrder: number
  imageMediaAssetId?: string
}

export type DeleteTourCategoryPayload = {
  id: string
}

const TOUR_CATEGORIES_KEY = ["tour-categories"] as const

function invalidateTourCategories() {
  void queryClient.invalidateQueries({ queryKey: TOUR_CATEGORIES_KEY })
}

export const getTourCategories = async (
  params: TourCategoriesQueryParams = {}
) => {
  const { data } = await axios.get<ApiResponse<PageResponse<TourCategory>>>(
    "tour-categories",
    {
      params: {
        query: params.query || undefined,
        level: params.level,
        parentId: params.parentId,
        size: 100,
        sort: "sortOrder",
        direction: "asc",
      },
    }
  )
  return data.data?.content ?? []
}

export const useTourCategories = (
  enabled = true,
  params: TourCategoriesQueryParams = {}
) => {
  return useQuery({
    queryKey: [
      ...TOUR_CATEGORIES_KEY,
      params.level ?? null,
      params.parentId ?? null,
      params.query ?? null,
    ],
    queryFn: () => getTourCategories(params),
    enabled,
  })
}

export const createTourCategory = async (
  payload: CreateTourCategoryPayload
) => {
  const { data } = await axios.post<ApiResponse<TourCategory>>(
    "tour-categories",
    buildCreateTourCategoryBody(payload)
  )
  return data
}

export function useCreateTourCategory() {
  return useMutation({
    mutationFn: createTourCategory,
    onSuccess: (response) => {
      toast.success(response.message || "Category created")
      invalidateTourCategories()
    },
    onError: (err) => {
      toast.error(apiErrorMessage(err, "Failed to create category"))
    },
  })
}

export const updateTourCategory = async ({
  id,
  version,
  name,
  slug,
  level,
  parentId,
  sortOrder,
  imageMediaAssetId,
}: UpdateTourCategoryPayload) => {
  const { data } = await axios.put<ApiResponse<TourCategory>>(
    `tour-categories/${id}`,
    {
      version,
      category: {
        name,
        slug,
        level,
        parentId,
        sortOrder,
        imageMediaAssetId,
      },
    }
  )
  return data
}

export function useUpdateTourCategory() {
  return useMutation({
    mutationFn: updateTourCategory,
    onSuccess: (response) => {
      toast.success(response.message || "Category updated")
      invalidateTourCategories()
    },
    onError: (err) => {
      toast.error(apiErrorMessage(err, "Failed to update category"))
    },
  })
}

export const deleteTourCategory = async ({
  id,
}: DeleteTourCategoryPayload) => {
  const { data } = await axios.delete<ApiResponse<unknown>>(
    `tour-categories/${id}`
  )
  return data
}

export function useDeleteTourCategory() {
  return useMutation({
    mutationFn: deleteTourCategory,
    onSuccess: (response) => {
      toast.success(response.message || "Category deleted")
      invalidateTourCategories()
    },
    onError: (err) => {
      toast.error(apiErrorMessage(err, "Failed to delete category"))
    },
  })
}
