import type { BannerType, BlogStatus } from "@/store/server/cms/typed"

export const BANNER_TYPE_ITEMS = {
  HOME: "Homepage",
  TOUR: "Tour",
  HOLIDAY_PACKAGE: "Holiday package",
  COMBO_TOUR: "Combo tour",
  OTHER: "Other",
} as const satisfies Record<BannerType, string>

export const BLOG_STATUS_ITEMS = {
  PUBLISHED: "Published",
  DRAFT: "Draft",
} as const satisfies Record<BlogStatus, string>

export function formatCmsDate(value?: string) {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function statusClass(active: boolean) {
  return active
    ? "bg-status-confirmed-bg text-status-confirmed"
    : "bg-muted text-muted-foreground"
}

export function blogStatusClass(status: BlogStatus) {
  return status === "PUBLISHED"
    ? "bg-status-confirmed-bg text-status-confirmed"
    : "bg-status-pending-bg text-status-pending"
}
