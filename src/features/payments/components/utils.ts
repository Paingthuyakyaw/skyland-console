export function formatMoney(amount?: number) {
  if (typeof amount !== "number" || Number.isNaN(amount)) return "—"
  return `AED ${amount.toLocaleString("en-US", { maximumFractionDigits: 0 })}`
}

function pad(value: number) {
  return String(value).padStart(2, "0")
}

function toDateValue(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function defaultPaymentRange(now = new Date()) {
  const from = new Date(now.getFullYear(), now.getMonth() - 6, 1)
  return { from: toDateValue(from), to: toDateValue(now) }
}

export function isValidRange(from: string, to: string) {
  return Boolean(from && to && from <= to)
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

export function formatLabel(value?: string) {
  if (!value) return "—"
  return value.replaceAll("_", " ").replaceAll("-", " ")
}

export function formatMonth(value: string) {
  const date = new Date(
    `${value.length === 7 ? `${value}-01` : value}T00:00:00`
  )
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat("en-GB", { month: "short" }).format(date)
}

export function formatCompact(amount: number) {
  if (amount >= 1000) return `${Math.round(amount / 1000)}k`
  return String(Math.round(amount))
}

export const METHOD_COLORS = [
  "#00afef",
  "#a8cf38",
  "#f0871f",
  "#8b5cf6",
  "#d98a00",
  "#e04a4a",
]
