import type {
  InquiryStatus,
  ProductType,
  ProductWorkflow,
  SalesQueue,
  WorkflowItem,
} from "@/store/server/inquiries/typed"

export const INQUIRY_STATUS_LABEL: Record<InquiryStatus, string> = {
  NEW: "NEW",
  IN_PROGRESS: "IN PROGRESS",
  QUOTED: "QUOTED",
  ACCEPTED: "ACCEPTED",
  DECLINED: "DECLINED",
  CLOSED: "CLOSED",
}

export const INQUIRY_STATUS_CLASS: Record<InquiryStatus, string> = {
  NEW: "bg-primary-soft text-primary",
  IN_PROGRESS: "bg-status-pending-bg text-status-pending",
  QUOTED: "bg-secondary-soft text-secondary-foreground",
  ACCEPTED: "bg-status-confirmed-bg text-status-confirmed",
  DECLINED: "bg-muted text-muted-foreground",
  CLOSED: "bg-muted text-muted-foreground",
}

export const PRODUCT_TYPE_LABEL: Record<ProductType, string> = {
  TOUR: "Tour",
  COMBO_TOUR: "Combo",
  HOLIDAY_PACKAGE: "Holiday package",
}

export const PRODUCT_TYPE_CLASS: Record<ProductType, string> = {
  TOUR: "bg-primary-soft text-primary",
  COMBO_TOUR: "bg-type-combo-bg text-type-combo",
  HOLIDAY_PACKAGE: "bg-type-package-bg text-type-package",
}

export const STATUS_FILTER_ITEMS = {
  all: "All statuses",
  NEW: INQUIRY_STATUS_LABEL.NEW,
  IN_PROGRESS: INQUIRY_STATUS_LABEL.IN_PROGRESS,
  QUOTED: INQUIRY_STATUS_LABEL.QUOTED,
  ACCEPTED: INQUIRY_STATUS_LABEL.ACCEPTED,
  DECLINED: INQUIRY_STATUS_LABEL.DECLINED,
  CLOSED: INQUIRY_STATUS_LABEL.CLOSED,
} as const

export type StatusFilter = keyof typeof STATUS_FILTER_ITEMS

export const SALES_QUEUE_UI: Record<
  SalesQueue,
  {
    title: string
    subtitle: string
    chip: ProductType
    inquiryOnly: boolean
  }
> = {
  tour: {
    title: "Tour Inquiries",
    subtitle:
      "Inquiry-only Tour sales cases. No capacity hold or online price lock.",
    chip: "TOUR",
    inquiryOnly: true,
  },
  combo: {
    title: "Combo Tour Quote Requests",
    subtitle:
      "Quote requests managed as sales cases — not checkout or payment records.",
    chip: "COMBO_TOUR",
    inquiryOnly: false,
  },
  holiday: {
    title: "Holiday Package Quote Requests",
    subtitle:
      "Holiday quote cases, separate from the legacy Holiday Package Inquiry desk.",
    chip: "HOLIDAY_PACKAGE",
    inquiryOnly: false,
  },
}

export type ProductLabel = {
  title: string
  type: ProductType
}

export function isInquiryStatus(value?: string): value is InquiryStatus {
  return Boolean(value && value in INQUIRY_STATUS_LABEL)
}

export function formatCaseRef(id?: string) {
  if (!id) return "—"
  const compact = id.replace(/-/g, "").slice(0, 8).toUpperCase()
  return compact ? `CASE-${compact}` : id
}

export function customerName(inquiry: ProductWorkflow) {
  const name = [inquiry.firstName, inquiry.lastName]
    .filter(Boolean)
    .join(" ")
    .trim()
  return name || "—"
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

export function formatRelativeTime(value?: string) {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  const diffMs = Date.now() - date.getTime()
  const minute = 60_000
  const hour = 60 * minute
  const day = 24 * hour
  if (diffMs < minute) return "Just now"
  if (diffMs < hour) {
    const count = Math.round(diffMs / minute)
    return `${count} min ago`
  }
  if (diffMs < day) {
    const count = Math.round(diffMs / hour)
    return `${count} h ago`
  }
  if (diffMs < 2 * day) return "Yesterday"
  return formatDate(value)
}

export function partySummary(inquiry: ProductWorkflow) {
  const parts = [
    inquiry.totalAdults
      ? `${inquiry.totalAdults} adult${inquiry.totalAdults === 1 ? "" : "s"}`
      : null,
    inquiry.totalChild
      ? `${inquiry.totalChild} child${inquiry.totalChild === 1 ? "" : "ren"}`
      : null,
    inquiry.totalInfants
      ? `${inquiry.totalInfants} infant${inquiry.totalInfants === 1 ? "" : "s"}`
      : null,
    inquiry.roomCount
      ? `${inquiry.roomCount} room${inquiry.roomCount === 1 ? "" : "s"}`
      : null,
  ].filter(Boolean)
  return parts.join(" · ") || "—"
}

export function isMixedCase(inquiry: ProductWorkflow) {
  return (inquiry.salesCaseProductTypes?.length ?? 0) > 1
}

export function isProductType(value?: string): value is ProductType {
  return Boolean(value && value in PRODUCT_TYPE_LABEL)
}

export function resolveItem(
  item: WorkflowItem,
  fallbackType: ProductType = "TOUR"
): ProductLabel {
  const type = isProductType(item.productType) ? item.productType : fallbackType
  return {
    title: item.productTitleSnapshot?.trim() || "—",
    type,
  }
}

export function toIsoDateTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toISOString()
}
