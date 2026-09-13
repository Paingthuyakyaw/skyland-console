import { todayIsoDate } from "@/features/promotions/components/utils"
import type {
  DiscountType,
  PromotionRequest,
  PromotionResponse,
  PromotionScopeType,
} from "@/store/server/promotions/typed"

export const DEFAULT_EXPIRED_MESSAGE =
  "This offer has expired or reached its usage limit. Please explore our current offers."

const CODE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_-]{2,79}$/

export type CouponFormState = {
  code: string
  discountType: DiscountType
  value: string
  minSpend: string
  scopeType: PromotionScopeType
  scopeRefId: string
  startDate: string
  endDate: string
  noEndDate: boolean
  totalUsesAllowed: string
  unlimitedUses: boolean
  usesPerCustomer: string
  firstTimeCustomersOnly: boolean
  isManuallyDisabled: boolean
  expiredOrExhaustedMessage: string
  usedCount: number
  version?: number
}

export function createInitialCouponForm(): CouponFormState {
  return {
    code: "",
    discountType: "PERCENTAGE",
    value: "10",
    minSpend: "",
    scopeType: "ALL_TOURS",
    scopeRefId: "",
    startDate: todayIsoDate(),
    endDate: "",
    noEndDate: true,
    totalUsesAllowed: "100",
    unlimitedUses: false,
    usesPerCustomer: "1",
    firstTimeCustomersOnly: false,
    isManuallyDisabled: false,
    expiredOrExhaustedMessage: DEFAULT_EXPIRED_MESSAGE,
    usedCount: 0,
  }
}

export function promotionToForm(promotion: PromotionResponse): CouponFormState {
  return {
    code: promotion.code,
    discountType: promotion.discountType,
    value: String(promotion.value),
    minSpend:
      typeof promotion.minSpend === "number" ? String(promotion.minSpend) : "",
    scopeType: promotion.scopeType,
    scopeRefId: promotion.scopeRefId ?? "",
    startDate: promotion.startDate,
    endDate: promotion.endDate ?? "",
    noEndDate: promotion.noEndDate,
    totalUsesAllowed:
      typeof promotion.totalUsesAllowed === "number"
        ? String(promotion.totalUsesAllowed)
        : "",
    unlimitedUses: promotion.unlimitedUses,
    usesPerCustomer: String(promotion.usesPerCustomer ?? 1),
    firstTimeCustomersOnly: promotion.firstTimeCustomersOnly,
    isManuallyDisabled: promotion.isManuallyDisabled,
    expiredOrExhaustedMessage:
      promotion.expiredOrExhaustedMessage || DEFAULT_EXPIRED_MESSAGE,
    usedCount: promotion.usedCount ?? 0,
    version: promotion.version,
  }
}

export function validateCouponForm(form: CouponFormState): string[] {
  const errors: string[] = []
  const code = form.code.trim()

  if (!code) {
    errors.push("Coupon code is required")
  } else if (!CODE_PATTERN.test(code)) {
    errors.push(
      "Code must be 3–80 characters and start with a letter or number"
    )
  }

  const value = Number(form.value)
  if (!form.value.trim() || Number.isNaN(value) || value < 0.01) {
    errors.push("Discount value must be greater than 0")
  } else if (form.discountType === "PERCENTAGE" && value > 100) {
    errors.push("Percentage off cannot exceed 100")
  }

  if (form.minSpend.trim()) {
    const minSpend = Number(form.minSpend)
    if (Number.isNaN(minSpend) || minSpend < 0) {
      errors.push("Minimum spend must be 0 or more")
    }
  }

  if (!form.startDate) {
    errors.push("Start date is required")
  }
  if (!form.noEndDate && !form.endDate) {
    errors.push("End date is required, or turn on No end date")
  }

  if (!form.unlimitedUses) {
    const limit = Number(form.totalUsesAllowed)
    if (
      !form.totalUsesAllowed.trim() ||
      !Number.isInteger(limit) ||
      limit < 1
    ) {
      errors.push("Total uses must be at least 1, or turn on Unlimited uses")
    }
  }

  const perCustomer = Number(form.usesPerCustomer)
  if (!Number.isInteger(perCustomer) || perCustomer < 1) {
    errors.push("Uses per customer must be at least 1")
  }

  if (form.scopeType !== "ALL_TOURS" && !form.scopeRefId) {
    errors.push(
      form.scopeType === "CATEGORY" ? "Select a category" : "Select a tour"
    )
  }

  if (!form.expiredOrExhaustedMessage.trim()) {
    errors.push("Customer message is required")
  }

  return errors
}

export function buildPromotionRequest(form: CouponFormState): PromotionRequest {
  const request: PromotionRequest = {
    code: form.code.trim().toUpperCase(),
    discountType: form.discountType,
    value: Number(form.value),
    scopeType: form.scopeType,
    startDate: form.startDate,
    noEndDate: form.noEndDate,
    unlimitedUses: form.unlimitedUses,
    usesPerCustomer: Number(form.usesPerCustomer) || 1,
    firstTimeCustomersOnly: form.firstTimeCustomersOnly,
    usedCount: form.usedCount,
    isManuallyDisabled: form.isManuallyDisabled,
    expiredOrExhaustedMessage: form.expiredOrExhaustedMessage.trim(),
  }

  if (form.minSpend.trim()) {
    request.minSpend = Number(form.minSpend)
  }
  if (form.scopeType !== "ALL_TOURS" && form.scopeRefId) {
    request.scopeRefId = form.scopeRefId
  }
  if (!form.noEndDate && form.endDate) {
    request.endDate = form.endDate
  }
  if (!form.unlimitedUses) {
    request.totalUsesAllowed = Number(form.totalUsesAllowed)
  }

  return request
}
