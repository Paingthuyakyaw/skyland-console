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
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query"
import { toast } from "sonner"

export type DeleteTourPayload = {
  id: string
}

export type ArchiveTimeslotPayload = {
  tourId: string
  timeslotId: string
  version: number
}

export type ArchiveTimeslotPackagePayload = ArchiveTimeslotPayload & {
  packageId: string
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
    placeholderData: keepPreviousData,
  })
}

export const getTour = async (id: string) => {
  const { data } = await axios.get<ApiResponse<TourResponse>>(`tours/${id}`)
  return data.data
}

export function useTour(id: string, enabled = true) {
  return useQuery({
    queryKey: [...TOURS_KEY, id],
    queryFn: () => getTour(id),
    enabled: enabled && id.length > 0,
  })
}

export const updateTour = async ({
  id,
  version,
  tour,
}: {
  id: string
  version: number
  tour: TourRequest
}) => {
  const { data } = await axios.put<ApiResponse<TourResponse>>(`tours/${id}`, {
    version,
    tour,
  })
  return data
}

export const deleteTour = async ({ id }: DeleteTourPayload) => {
  const { data } = await axios.delete<ApiResponse<TourSummary | unknown>>(
    `tours/${id}`
  )
  return data
}

/**
 * Retires a sellable timeslot without deleting the historical record used by
 * existing bookings. This is deliberately separate from aggregate tour PUTs.
 */
export const archiveTimeslot = async ({
  tourId,
  timeslotId,
  version,
}: ArchiveTimeslotPayload) => {
  const { data } = await axios.delete<ApiResponse<TourResponse>>(
    `tours/${tourId}/timeslots/${timeslotId}`,
    { params: { version } }
  )
  return data
}

/** Retires one sellable package while retaining booking and audit history. */
export const archiveTimeslotPackage = async ({
  tourId,
  timeslotId,
  packageId,
  version,
}: ArchiveTimeslotPackagePayload) => {
  const { data } = await axios.delete<ApiResponse<TourResponse>>(
    `tours/${tourId}/timeslots/${timeslotId}/packages/${packageId}`,
    { params: { version } }
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
      queryClient.setQueryData([...TOURS_KEY, response.data.id], response.data)
      toast.success(response.message || "Tour created")
      invalidateTours()
    },
    onError: (err) => {
      toast.error(apiErrorMessage(err, "Failed to create tour"))
    },
  })
}

export function useUpdateTour() {
  return useMutation({
    mutationFn: updateTour,
    onSuccess: (response, { id }) => {
      queryClient.setQueryData([...TOURS_KEY, id], response.data)
      toast.success(response.message || "Tour updated")
      invalidateTours()
      void queryClient.invalidateQueries({ queryKey: [...TOURS_KEY, id] })
    },
    onError: (err) => {
      toast.error(apiErrorMessage(err, "Failed to update tour"))
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

function invalidateArchivedCatalog(tourId: string) {
  invalidateTours()
  void queryClient.invalidateQueries({
    queryKey: ["tour-availability", tourId],
  })
}

export function useArchiveTimeslot() {
  return useMutation({
    mutationFn: archiveTimeslot,
    onSuccess: (response, { tourId }) => {
      toast.success(response.message || "Timeslot archived")
      invalidateArchivedCatalog(tourId)
    },
    onError: (err) => {
      toast.error(apiErrorMessage(err, "Failed to archive the timeslot"))
    },
  })
}

export function useArchiveTimeslotPackage() {
  return useMutation({
    mutationFn: archiveTimeslotPackage,
    onSuccess: (response, { tourId }) => {
      toast.success(response.message || "Timeslot package archived")
      invalidateArchivedCatalog(tourId)
    },
    onError: (err) => {
      toast.error(
        apiErrorMessage(err, "Failed to archive the timeslot package")
      )
    },
  })
}
