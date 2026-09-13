import { axios } from "@/api"
import { queryClient } from "@/lib/query-client"
import { apiErrorMessage } from "@/store/server/api-error"
import type {
  ApiResponse,
  HolidayPackage,
  HolidayPackageDetail,
  HolidayPackageRequest,
  HolidayPackagesQueryParams,
  HolidayPackageUpdateRequest,
  PageResponse,
} from "@/store/server/holiday/typed"
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query"
import { toast } from "sonner"

export type DeleteHolidayPackagePayload = {
  id: string
}

export type UpdateHolidayPackagePayload = HolidayPackageUpdateRequest & {
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
    placeholderData: keepPreviousData,
  })
}

export const getHolidayPackage = async (id: string) => {
  const { data } = await axios.get<ApiResponse<HolidayPackageDetail>>(
    `holiday-packages/${id}`
  )
  return data.data
}

export function useHolidayPackage(id: string, enabled = true) {
  return useQuery({
    queryKey: [...HOLIDAY_PACKAGES_KEY, id],
    queryFn: () => getHolidayPackage(id),
    enabled: enabled && id.length > 0,
  })
}

export const updateHolidayPackage = async ({
  id,
  version,
  holidayPackage,
}: UpdateHolidayPackagePayload) => {
  const { data } = await axios.put<ApiResponse<HolidayPackageDetail>>(
    `holiday-packages/${id}`,
    { version, holidayPackage }
  )
  return data
}

export function useUpdateHolidayPackage() {
  return useMutation({
    mutationFn: updateHolidayPackage,
    onSuccess: (response, { id }) => {
      toast.success(response.message || "Holiday package updated")
      invalidateHolidayPackages()
      void queryClient.invalidateQueries({
        queryKey: [...HOLIDAY_PACKAGES_KEY, id],
      })
    },
    onError: (err) => {
      toast.error(apiErrorMessage(err, "Failed to update holiday package"))
    },
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
