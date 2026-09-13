import type { ComboTour, ComboTourStatus } from "@/store/server/combo/typed"

export function formatDuration(minutes?: number) {
  if (minutes == null || minutes <= 0) return "—"

  const days = Math.floor(minutes / (60 * 24))
  const hours = Math.floor((minutes % (60 * 24)) / 60)
  const mins = minutes % 60

  if (days > 0) {
    const nights = Math.max(days - 1, 0)
    if (nights > 0) return `${days} days / ${nights} nights`
    return days === 1 ? "1 day" : `${days} days`
  }

  if (hours > 0 && mins > 0) return `${hours}h ${mins}m`
  if (hours > 0) return hours === 1 ? "1 hour" : `${hours} hours`
  return `${mins} min`
}

export function formatPrice(tour: ComboTour) {
  const currency = tour.currency || "AED"
  const price = tour.discountPrice ?? tour.comboPrice
  return `From ${currency} ${price}`
}

export function statusLabel(status: ComboTourStatus) {
  return status === "PUBLISHED" ? "Active" : "Draft"
}
