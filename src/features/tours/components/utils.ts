import type { TourStatus, TourSummary } from "@/store/server/tours/typed"

export function formatPrice(tour: TourSummary) {
  const currency = tour.currency || "AED"
  const price = tour.discountPrice ?? tour.adultPrice
  return `${currency} ${price.toLocaleString("en-US")}`
}

export function statusLabel(status: TourStatus, apiLabel?: string) {
  if (apiLabel) return apiLabel

  if (status === "PUBLISHED") return "Active"
  if (status === "SCHEDULED") return "Scheduled"
  return "Draft"
}

export function slugify(value: string) {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

  return slug || `category-${Date.now()}`
}

export function nextSortOrder(sortOrders: Array<number | undefined>) {
  const max = sortOrders.reduce<number>((current, value) => {
    if (typeof value !== "number") return current
    return Math.max(current, value)
  }, -1)

  return max + 1
}
