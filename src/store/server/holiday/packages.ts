import { axios } from "@/api"
import { queryClient } from "@/lib/query-client"
import { apiErrorMessage } from "@/store/server/api-error"
import type {
  ApiResponse,
  HolidayPackage,
  HolidayPackageDetail,
  HolidayPackageRequest,
  HolidayPackagesQueryParams,
  PageResponse,
} from "@/store/server/holiday/typed"
import { useMutation, useQuery } from "@tanstack/react-query"
import { toast } from "sonner"

export type DeleteHolidayPackagePayload = {
  id: string
}

const HOLIDAY_PACKAGES_KEY = ["holiday-packages"] as const

function invalidateHolidayPackages() {
  void queryClient.invalidateQueries({ queryKey: HOLIDAY_PACKAGES_KEY })
}

export const getHolidayPackages = async (
  params: HolidayPackagesQueryParams = {}
) => {
  const { data } = await axios.get<ApiResponse<PageResponse<HolidayPackage>>>(
    "holiday-packages",
    {
      params: {
        query: params.query || undefined,
        status: params.status,
        categoryId: params.categoryId,
        difficulty: params.difficulty,
        hotelTier: params.hotelTier,
        page: params.page ?? 0,
        size: params.size ?? 20,
        sort: params.sort ?? "createdAt",
        direction: params.direction ?? "desc",
      },
    }
  )
  return data.data
}

export const useHolidayPackages = (params: HolidayPackagesQueryParams = {}) => {
  return useQuery({
    queryKey: [...HOLIDAY_PACKAGES_KEY, params],
    queryFn: () => getHolidayPackages(params),
  })
}

export const deleteHolidayPackage = async ({
  id,
}: DeleteHolidayPackagePayload) => {
  const { data } = await axios.delete<ApiResponse<HolidayPackage | unknown>>(
    `holiday-packages/${id}`
  )
  return data
}

export const createHolidayPackage = async (payload: HolidayPackageRequest) => {
  const { data } = await axios.post<ApiResponse<HolidayPackageDetail>>(
    "holiday-packages",
    payload
  )
  return data
}

export function useCreateHolidayPackage() {
  return useMutation({
    mutationFn: createHolidayPackage,
    onSuccess: (response) => {
      toast.success(response.message || "Holiday package created")
      invalidateHolidayPackages()
    },
    onError: (err) => {
      toast.error(apiErrorMessage(err, "Failed to create holiday package"))
    },
  })
}

export function useDeleteHolidayPackage() {
  return useMutation({
    mutationFn: deleteHolidayPackage,
    onSuccess: (response) => {
      toast.success(response.message || "Holiday package deleted")
      invalidateHolidayPackages()
    },
    onError: (err) => {
      toast.error(apiErrorMessage(err, "Failed to delete holiday package"))
    },
  })
}
