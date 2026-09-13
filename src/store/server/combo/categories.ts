import { axios } from "@/api"
import { queryClient } from "@/lib/query-client"
import { apiErrorMessage } from "@/store/server/api-error"
import type {
  ApiResponse,
  ComboCategory,
  PageResponse,
} from "@/store/server/combo/typed"
import { useMutation, useQuery } from "@tanstack/react-query"
import { toast } from "sonner"

export type CreateComboCategoryPayload = {
  name: string
}

export type UpdateComboCategoryPayload = {
  id: string
  name: string
}

export type DeleteComboCategoryPayload = {
  id: string
}

const COMBO_CATEGORIES_KEY = ["combo-categories"] as const

function invalidateComboCategories() {
  void queryClient.invalidateQueries({ queryKey: COMBO_CATEGORIES_KEY })
}

export const getComboCategories = async () => {
  const { data } = await axios.get<ApiResponse<PageResponse<ComboCategory>>>(
    "combo-tour-categories",
    {
      params: {
        size: 100,
      },
    }
  )
  return data.data?.content ?? []
}

export const useComboCategories = (enabled = true) => {
  return useQuery({
    queryKey: COMBO_CATEGORIES_KEY,
    queryFn: getComboCategories,
    enabled,
  })
}

export const createComboCategory = async (
  payload: CreateComboCategoryPayload
) => {
  const { data } = await axios.post<ApiResponse<ComboCategory>>(
    "combo-tour-categories",
    payload
  )
  return data
}

export function useCreateComboCategory() {
  return useMutation({
    mutationFn: createComboCategory,
    onSuccess: (response) => {
      toast.success(response.message || "Category created")
      invalidateComboCategories()
    },
    onError: (err) => {
      toast.error(apiErrorMessage(err, "Failed to create category"))
    },
  })
}

export const updateComboCategory = async ({
  id,
  name,
}: UpdateComboCategoryPayload) => {
  const { data } = await axios.put<ApiResponse<ComboCategory>>(
    `combo-tour-categories/${id}`,
    { name }
  )
  return data
}

export function useUpdateComboCategory() {
  return useMutation({
    mutationFn: updateComboCategory,
    onSuccess: (response) => {
      toast.success(response.message || "Category updated")
      invalidateComboCategories()
    },
    onError: (err) => {
      toast.error(apiErrorMessage(err, "Failed to update category"))
    },
  })
}

export const deleteComboCategory = async ({
  id,
}: DeleteComboCategoryPayload) => {
  const { data } = await axios.delete<ApiResponse<unknown>>(
    `combo-tour-categories/${id}`
  )
  return data
}

export function useDeleteComboCategory() {
  return useMutation({
    mutationFn: deleteComboCategory,
    onSuccess: (response) => {
      toast.success(response.message || "Category deleted")
      invalidateComboCategories()
    },
    onError: (err) => {
      toast.error(apiErrorMessage(err, "Failed to delete category"))
    },
  })
}
