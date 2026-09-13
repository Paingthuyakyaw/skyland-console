import type {
  HolidayPackage,
  HolidayPackageStatus,
} from "@/store/server/holiday/typed"

export function formatPrice(pkg: HolidayPackage) {
  const currency = pkg.currency || "AED"
  const price = pkg.discountPrice ?? pkg.fromPrice
  return `From ${currency} ${price}`
}

export function statusLabel(status: HolidayPackageStatus) {
  return status === "ACTIVE" ? "Active" : "Inactive"
}
