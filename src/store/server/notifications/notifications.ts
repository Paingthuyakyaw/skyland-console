import { axios } from "@/api"
import { queryClient } from "@/lib/query-client"
import type { ApiResponse, PageResponse } from "@/store/server/cms/typed"
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query"

export type NotificationEventType =
  | "NEW_CONTACT_INQUIRY"
  | "NEW_SUBSCRIPTION"
  | "NEW_BOOKING"
  | "PAYMENT_RECEIVED"
  | "BOOKING_CANCELLED"
  | "TOUR_INQUIRY"
  | "COMBO_QUOTE"
  | "HOLIDAY_QUOTE"

export type AdminNotification = {
  id: string
  eventType: NotificationEventType
  referenceId: string
  createdAt: string
  read: boolean
}

const NOTIFICATIONS_KEY = ["admin", "notifications"] as const

export function useAdminNotifications(enabled: boolean, page = 0, size = 10) {
  return useQuery({
    queryKey: [...NOTIFICATIONS_KEY, "list", page, size],
    enabled,
    queryFn: async () => {
      const response = await axios.get<ApiResponse<PageResponse<AdminNotification>>>(
        "notifications",
        { params: { page, size } }
      )
      return response.data.data
    },
    refetchInterval: 30_000,
    placeholderData: keepPreviousData,
  })
}

export function useUnreadNotificationCount(enabled: boolean) {
  return useQuery({
    queryKey: [...NOTIFICATIONS_KEY, "unread-count"],
    enabled,
    queryFn: async () => {
      const response = await axios.get<ApiResponse<{ count: number }>>(
        "notifications/unread-count"
      )
      return response.data.data.count
    },
    refetchInterval: 30_000,
  })
}

export function useMarkNotificationRead() {
  return useMutation({
    mutationFn: async (id: string) => {
      await axios.put(`notifications/${id}/read`)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_KEY })
    },
  })
}

export function notificationDestination(item: AdminNotification) {
  const id = encodeURIComponent(item.referenceId)
  switch (item.eventType) {
    case "NEW_CONTACT_INQUIRY":
      return `/website?tab=contact-inquiries&item=${id}`
    case "NEW_SUBSCRIPTION":
      return `/website?tab=subscriptions&item=${id}`
    case "NEW_BOOKING":
    case "PAYMENT_RECEIVED":
    case "BOOKING_CANCELLED":
      return `/bookings?booking=${id}`
    case "TOUR_INQUIRY":
      return `/inquiries?workflow=${id}`
    case "COMBO_QUOTE":
      return `/combo-quotes?workflow=${id}`
    case "HOLIDAY_QUOTE":
      return `/holiday-quotes?workflow=${id}`
  }
}

export function notificationTitle(type: NotificationEventType) {
  switch (type) {
    case "NEW_CONTACT_INQUIRY": return "New contact inquiry"
    case "NEW_SUBSCRIPTION": return "New email subscription"
    case "NEW_BOOKING": return "New booking"
    case "PAYMENT_RECEIVED": return "Payment received"
    case "BOOKING_CANCELLED": return "Booking cancelled"
    case "TOUR_INQUIRY": return "New tour inquiry"
    case "COMBO_QUOTE": return "New combo quote request"
    case "HOLIDAY_QUOTE": return "New holiday quote request"
  }
}
