export type PeriodKey = "today" | "thisWeek" | "thisMonth"

export const PERIODS: { key: PeriodKey; label: string; compare: string }[] = [
  { key: "today", label: "Today", compare: "vs yesterday" },
  { key: "thisWeek", label: "This week", compare: "vs last week" },
  { key: "thisMonth", label: "This month", compare: "vs last month" },
]

export function formatRevenue(amount?: number) {
  if (typeof amount !== "number" || Number.isNaN(amount)) return "—"
  return `AED ${amount.toLocaleString("en-US", { maximumFractionDigits: 0 })}`
}

export function periodChange(current: number, previous: number) {
  if (previous === 0) {
    if (current === 0) return { direction: "flat" as const, label: "0%" }
    return { direction: "up" as const, label: "New" }
  }

  const percent = ((current - previous) / previous) * 100
  const rounded = Math.round(percent * 10) / 10
  if (rounded === 0) return { direction: "flat" as const, label: "0%" }
  return {
    direction: rounded > 0 ? ("up" as const) : ("down" as const),
    label: `${Math.abs(rounded)}%`,
  }
}

export function formatChartDay(value: string) {
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
  }).format(date)
}

export function dashboardDateLine(now = new Date()) {
  const date = new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(now)
  return `${date} · Here's what's happening at Skyland today.`
}
