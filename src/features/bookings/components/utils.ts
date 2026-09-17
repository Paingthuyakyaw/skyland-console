import type {
  BookingItem,
  BookingStatus,
  PaymentStatus,
  RefundStatus,
} from "@/store/server/bookings/typed"

export const BOOKING_STATUS_LABEL: Record<BookingStatus, string> = {
  PENDING_PAYMENT: "Pending payment",
  CONFIRMED: "Confirmed",
  CANCEL_PENDING: "Cancel pending",
  CANCELLED: "Cancelled",
  EXPIRED: "Expired",
  REFUND_PENDING: "Refund pending",
  REFUNDED: "Refunded",
  REVIEW_REQUIRED: "Review required",
}

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  REQUIRES_PAYMENT: "Unpaid",
  PROCESSING: "Processing",
  REQUIRES_ACTION: "Action required",
  SUCCEEDED: "Paid",
  FAILED: "Failed",
  CANCELLED: "Cancelled",
  REFUND_PENDING: "Refund pending",
  REFUNDED: "Refunded",
  DISPUTED: "Disputed",
}

export const BOOKING_STATUS_CLASS: Record<BookingStatus, string> = {
  PENDING_PAYMENT: "bg-status-new-bg text-status-new",
  CONFIRMED: "bg-status-confirmed-bg text-status-confirmed",
  CANCEL_PENDING: "bg-status-pending-bg text-status-pending",
  CANCELLED: "bg-status-cancelled-bg text-status-cancelled",
  EXPIRED: "bg-muted text-muted-foreground",
  REFUND_PENDING: "bg-status-pending-bg text-status-pending",
  REFUNDED: "bg-muted text-muted-foreground",
  REVIEW_REQUIRED: "bg-status-pending-bg text-status-pending",
}

export const PAYMENT_STATUS_CLASS: Record<PaymentStatus, string> = {
  REQUIRES_PAYMENT: "bg-status-pending-bg text-status-pending",
  PROCESSING: "bg-status-pending-bg text-status-pending",
  REQUIRES_ACTION: "bg-status-pending-bg text-status-pending",
  SUCCEEDED: "bg-status-confirmed-bg text-status-confirmed",
  FAILED: "bg-status-cancelled-bg text-status-cancelled",
  CANCELLED: "bg-status-cancelled-bg text-status-cancelled",
  REFUND_PENDING: "bg-status-pending-bg text-status-pending",
  REFUNDED: "bg-muted text-muted-foreground",
  DISPUTED: "bg-status-cancelled-bg text-status-cancelled",
}

export const REFUND_STATUS_CLASS: Record<RefundStatus, string> = {
  PENDING: "bg-status-pending-bg text-status-pending",
  SUCCEEDED: "bg-status-confirmed-bg text-status-confirmed",
  FAILED: "bg-status-cancelled-bg text-status-cancelled",
}

export const STATUS_FILTER_ITEMS = {
  all: "All statuses",
  PENDING_PAYMENT: BOOKING_STATUS_LABEL.PENDING_PAYMENT,
  CONFIRMED: BOOKING_STATUS_LABEL.CONFIRMED,
  CANCEL_PENDING: BOOKING_STATUS_LABEL.CANCEL_PENDING,
  CANCELLED: BOOKING_STATUS_LABEL.CANCELLED,
  EXPIRED: BOOKING_STATUS_LABEL.EXPIRED,
  REFUND_PENDING: BOOKING_STATUS_LABEL.REFUND_PENDING,
  REFUNDED: BOOKING_STATUS_LABEL.REFUNDED,
  REVIEW_REQUIRED: BOOKING_STATUS_LABEL.REVIEW_REQUIRED,
} as const

export const PAYMENT_FILTER_ITEMS = {
  all: "All payments",
  REQUIRES_PAYMENT: PAYMENT_STATUS_LABEL.REQUIRES_PAYMENT,
  PROCESSING: PAYMENT_STATUS_LABEL.PROCESSING,
  REQUIRES_ACTION: PAYMENT_STATUS_LABEL.REQUIRES_ACTION,
  SUCCEEDED: PAYMENT_STATUS_LABEL.SUCCEEDED,
  FAILED: PAYMENT_STATUS_LABEL.FAILED,
  CANCELLED: PAYMENT_STATUS_LABEL.CANCELLED,
  REFUND_PENDING: PAYMENT_STATUS_LABEL.REFUND_PENDING,
  REFUNDED: PAYMENT_STATUS_LABEL.REFUNDED,
  DISPUTED: PAYMENT_STATUS_LABEL.DISPUTED,
} as const

export type StatusFilter = keyof typeof STATUS_FILTER_ITEMS
export type PaymentFilter = keyof typeof PAYMENT_FILTER_ITEMS

export const CANCEL_REASON_ITEMS = {
  "Customer request": "Customer request",
  "Weather / supplier issue": "Weather / supplier issue",
  "Duplicate booking": "Duplicate booking",
  Other: "Other — add note",
} as const

export const REFUND_REASON_ITEMS = {
  "Customer request": "Customer request",
  "Duplicate booking": "Duplicate booking",
  "Policy refund": "Policy refund",
  Other: "Other — add note",
} as const

export function isBookingStatus(value: string): value is BookingStatus {
  return value in BOOKING_STATUS_LABEL
}

export function isPaymentStatus(value: string): value is PaymentStatus {
  return value in PAYMENT_STATUS_LABEL
}

export function formatBookingRef(id: string) {
  const compact = id.replace(/-/g, "").slice(0, 8).toUpperCase()
  return compact || id
}

export function formatMoney(amount?: number, currency = "AED") {
  if (typeof amount !== "number" || Number.isNaN(amount)) return "—"
  return `${currency} ${amount.toLocaleString("en-US")}`
}

export function formatDate(value?: string) {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(date)
}

export function formatDateTime(value?: string) {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

export function guestCount(item: BookingItem) {
  return (
    (item.adultCount ?? 0) + (item.childCount ?? 0) + (item.infantCount ?? 0)
  )
}

export function guestBreakdown(item: BookingItem) {
  const parts = [
    item.adultCount ? `${item.adultCount} Adults` : null,
    item.childCount ? `${item.childCount} Children` : null,
    item.infantCount ? `${item.infantCount} Infants` : null,
  ].filter(Boolean)
  return parts.join(" · ") || "—"
}

export function canCancelBooking(status: BookingStatus) {
  return (
    status === "PENDING_PAYMENT" ||
    status === "CONFIRMED" ||
    status === "REVIEW_REQUIRED"
  )
}

export function canRefundBooking(
  bookingStatus: BookingStatus,
  paymentStatus: PaymentStatus
) {
  if (bookingStatus === "REFUNDED" || paymentStatus === "REFUNDED") {
    return false
  }
  return (
    paymentStatus === "SUCCEEDED" ||
    paymentStatus === "REFUND_PENDING" ||
    bookingStatus === "REFUND_PENDING"
  )
}
