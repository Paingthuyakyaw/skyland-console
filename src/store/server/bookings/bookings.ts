import { axios } from "@/api"
import { queryClient } from "@/lib/query-client"
import { apiErrorMessage } from "@/store/server/api-error"
import type {
  ApiResponse,
  BookingActionRequest,
  BookingDetail,
  BookingSummary,
  BookingsQueryParams,
  PageResponse,
} from "@/store/server/bookings/typed"
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query"
import { toast } from "sonner"

export type BookingActionPayload = {
  bookingId: string
  action: BookingActionRequest
}

const BOOKINGS_KEY = ["bookings"] as const

function invalidateBookings() {
  void queryClient.invalidateQueries({ queryKey: BOOKINGS_KEY })
}

export const getBookings = async (params: BookingsQueryParams = {}) => {
  const { data } = await axios.get<ApiResponse<PageResponse<BookingSummary>>>(
    "bookings",
    {
      params: {
        query: params.query || undefined,
        tourId: params.tourId,
        travelFrom: params.travelFrom,
        travelTo: params.travelTo,
        bookingStatus: params.bookingStatus,
        paymentStatus: params.paymentStatus,
        createdFrom: params.createdFrom,
        createdTo: params.createdTo,
        page: params.page ?? 0,
        size: params.size ?? 20,
        sort: params.sort ?? "createdAt",
        direction: params.direction ?? "desc",
      },
    }
  )
  return data.data
}

export const useBookings = (params: BookingsQueryParams = {}) => {
  return useQuery({
    queryKey: [...BOOKINGS_KEY, params],
    queryFn: () => getBookings(params),
    placeholderData: keepPreviousData,
  })
}

export const getBooking = async (bookingId: string) => {
  const { data } = await axios.get<ApiResponse<BookingDetail>>(
    `bookings/${bookingId}`
  )
  return data.data
}

export const useBooking = (bookingId: string, enabled = true) => {
  return useQuery({
    queryKey: [...BOOKINGS_KEY, bookingId],
    queryFn: () => getBooking(bookingId),
    enabled: enabled && Boolean(bookingId),
  })
}

export const cancelBooking = async ({
  bookingId,
  action,
}: BookingActionPayload) => {
  const { data } = await axios.post<ApiResponse<BookingDetail>>(
    `bookings/${bookingId}/cancel`,
    action
  )
  return data
}

export function useCancelBooking() {
  return useMutation({
    mutationFn: cancelBooking,
    onSuccess: (response) => {
      toast.success(response.message || "Booking cancelled")
      invalidateBookings()
    },
    onError: (err) => {
      toast.error(apiErrorMessage(err, "Failed to cancel booking"))
    },
  })
}

export const refundBooking = async ({
  bookingId,
  action,
}: BookingActionPayload) => {
  const { data } = await axios.post<ApiResponse<BookingDetail>>(
    `bookings/${bookingId}/refund`,
    action
  )
  return data
}

export function useRefundBooking() {
  return useMutation({
    mutationFn: refundBooking,
    onSuccess: (response) => {
      toast.success(response.message || "Refund requested")
      invalidateBookings()
    },
    onError: (err) => {
      toast.error(apiErrorMessage(err, "Failed to refund booking"))
    },
  })
}
