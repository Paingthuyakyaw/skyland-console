import type {
  DiscountType,
  PromotionResponse,
  PromotionScopeType,
} from "@/store/server/promotions/typed"

export type CouponDisplayStatus =
  "ACTIVE" | "SCHEDULED" | "EXHAUSTED" | "EXPIRED" | "DISABLED"

export const DISPLAY_STATUS_LABEL: Record<CouponDisplayStatus, string> = {
  ACTIVE: "Active",
  SCHEDULED: "Scheduled",
  EXHAUSTED: "Exhausted",
  EXPIRED: "Expired",
  DISABLED: "Disabled",
}

export const DISPLAY_STATUS_CLASS: Record<CouponDisplayStatus, string> = {
  ACTIVE: "bg-status-confirmed-bg text-status-confirmed",
  SCHEDULED: "bg-status-new-bg text-status-new",
  EXHAUSTED: "bg-status-pending-bg text-status-pending",
  EXPIRED: "bg-muted text-muted-foreground",
  DISABLED: "bg-status-cancelled-bg text-status-cancelled",
}

export const DISCOUNT_TYPE_LABEL: Record<DiscountType, string> = {
  PERCENTAGE: "Percentage",
  FIXED_AMOUNT: "Fixed",
}

export const SCOPE_TYPE_LABEL: Record<PromotionScopeType, string> = {
  ALL_TOURS: "All Tours",
  CATEGORY: "Specific category",
  SPECIFIC_TOUR: "Specific tour",
}

export function todayIsoDate() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function couponDisplayStatus(
  promotion: Pick<
    PromotionResponse,
    | "isManuallyDisabled"
    | "status"
    | "endDate"
    | "noEndDate"
    | "unlimitedUses"
    | "totalUsesAllowed"
    | "usedCount"
    | "startDate"
  >
): CouponDisplayStatus {
  if (promotion.isManuallyDisabled) return "DISABLED"

  const today = todayIsoDate()
  const used = promotion.usedCount ?? 0
  const limit = promotion.totalUsesAllowed
  if (!promotion.unlimitedUses && typeof limit === "number" && used >= limit) {
    return "EXHAUSTED"
  }
  if (promotion.endDate && !promotion.noEndDate && promotion.endDate < today) {
    return "EXPIRED"
  }
  if (promotion.status === "EXHAUSTED") return "EXHAUSTED"
  if (promotion.status === "SCHEDULED" || promotion.startDate > today) {
    return "SCHEDULED"
  }
  return "ACTIVE"
}

export function formatCouponValue(discountType: DiscountType, value: number) {
  if (discountType === "PERCENTAGE") return `${value}% off`
  return `AED ${value} off`
}

export function formatCouponUsage(promotion: PromotionResponse) {
  const used = promotion.usedCount ?? 0
  if (promotion.unlimitedUses || !promotion.totalUsesAllowed) {
    return `${used} used`
  }
  return `${used} of ${promotion.totalUsesAllowed} used`
}

export function formatCouponScope(
  promotion: PromotionResponse,
  names: { categories: Map<string, string>; tours: Map<string, string> }
) {
  if (promotion.scopeType === "ALL_TOURS") return "All Tours"
  const refId = promotion.scopeRefId ?? ""
  if (promotion.scopeType === "CATEGORY") {
    return `Category: ${names.categories.get(refId) || "Unknown"}`
  }
  return `Tour: ${names.tours.get(refId) || "Unknown"}`
}
