import type { NotificationEventType } from "@/store/server/settings/typed"

export type SettingsTabKey =
  | "company"
  | "whatsapp"
  | "currency"
  | "tax"
  | "notifications"
  | "analytics"

export type SettingsTabHandle = {
  save: () => Promise<void>
}

export const NOTIFICATION_EVENTS: Array<{
  eventType: NotificationEventType
  label: string
}> = [
  { eventType: "NEW_BOOKING", label: "New booking" },
  { eventType: "PAYMENT_RECEIVED", label: "Payment received" },
  { eventType: "BOOKING_CANCELLED", label: "Booking cancelled" },
  { eventType: "REMINDER_24H", label: "Reminder (24h before)" },
]

export const CURRENCY_LABELS: Record<string, string> = {
  AED: "AED — UAE Dirham",
  USD: "USD — US Dollar",
  EUR: "EUR — Euro",
}

export const EXCHANGE_SOURCE_ITEMS = {
  live: "Live (openexchangerates.org)",
  manual: "Manual",
} as const satisfies Record<string, string>

export function normalizeExchangeSource(value?: string) {
  const key = value?.trim().toLowerCase()
  if (key === "manual") return "manual"
  return "live"
}

export function currencyLabel(code: string) {
  return CURRENCY_LABELS[code] ?? code
}

export function optionalText(value: string) {
  const trimmed = value.trim()
  return trimmed === "" ? undefined : trimmed
}
