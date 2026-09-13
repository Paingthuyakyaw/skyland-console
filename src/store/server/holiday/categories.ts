import { axios } from "@/api"
import { queryClient } from "@/lib/query-client"
import { apiErrorMessage } from "@/store/server/api-error"
import type {
  ApiResponse,
  HolidayPackageCategory,
  PageResponse,
} from "@/store/server/holiday/typed"
import { useMutation, useQuery } from "@tanstack/react-query"
import { toast } from "sonner"

export type CreateHolidayPackageCategoryPayload = {
  name: string
}

export type UpdateHolidayPackageCategoryPayload = {
  id: string
  name: string
}

export type DeleteHolidayPackageCategoryPayload = {
  id: string
}

const HOLIDAY_PACKAGE_CATEGORIES_KEY = ["holiday-package-categories"] as const

function invalidateHolidayPackageCategories() {
  void queryClient.invalidateQueries({
    queryKey: HOLIDAY_PACKAGE_CATEGORIES_KEY,
  })
}

export const getHolidayPackageCategories = async () => {
  const { data } = await axios.get<
    ApiResponse<PageResponse<HolidayPackageCategory>>
  >("holiday-package-categories", {
    params: {
      size: 100,
    },
  })
  return data.data?.content ?? []
}

export const useHolidayPackageCategories = (enabled = true) => {
  return useQuery({
    queryKey: HOLIDAY_PACKAGE_CATEGORIES_KEY,
    queryFn: getHolidayPackageCategories,
    enabled,
  })
}

export const createHolidayPackageCategory = async (
  payload: CreateHolidayPackageCategoryPayload
) => {
  const { data } = await axios.post<ApiResponse<HolidayPackageCategory>>(
    "holiday-package-categories",
    payload
  )
  return data
}

export function useCreateHolidayPackageCategory() {
  return useMutation({
    mutationFn: createHolidayPackageCategory,
    onSuccess: (response) => {
      toast.success(response.message || "Category created")
      invalidateHolidayPackageCategories()
    },
    onError: (err) => {
      toast.error(apiErrorMessage(err, "Failed to create category"))
    },
  })
}

export const updateHolidayPackageCategory = async ({
  id,
  name,
}: UpdateHolidayPackageCategoryPayload) => {
  const { data } = await axios.put<ApiResponse<HolidayPackageCategory>>(
    `holiday-package-categories/${id}`,
    { name }
  )
  return data
}

export function useUpdateHolidayPackageCategory() {
  return useMutation({
    mutationFn: updateHolidayPackageCategory,
    onSuccess: (response) => {
      toast.success(response.message || "Category updated")
      invalidateHolidayPackageCategories()
    },
    onError: (err) => {
      toast.error(apiErrorMessage(err, "Failed to update category"))
    },
  })
}

export const deleteHolidayPackageCategory = async ({
  id,
}: DeleteHolidayPackageCategoryPayload) => {
  const { data } = await axios.delete<ApiResponse<unknown>>(
    `holiday-package-categories/${id}`
  )
  return data
}

export function useDeleteHolidayPackageCategory() {
  return useMutation({
    mutationFn: deleteHolidayPackageCategory,
    onSuccess: (response) => {
      toast.success(response.message || "Category deleted")
      invalidateHolidayPackageCategories()
    },
    onError: (err) => {
      toast.error(apiErrorMessage(err, "Failed to delete category"))
    },
  })
}
