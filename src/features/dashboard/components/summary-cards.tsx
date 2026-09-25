import { Link } from "@tanstack/react-router"
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarCheck,
  Minus,
  Wallet,
  type LucideIcon,
} from "lucide-react"

import {
  PERIODS,
  formatRevenue,
  periodChange,
  type PeriodKey,
} from "@/features/dashboard/components/utils"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type {
  DashboardSummary,
  PeriodSummary,
} from "@/store/server/dashboard/typed"

type Metric = "bookings" | "revenue"

const METRICS: {
  key: Metric
  label: string
  icon: LucideIcon
  iconClass: string
  to: "/bookings" | "/payments"
}[] = [
  {
    key: "bookings",
    label: "Bookings",
    icon: CalendarCheck,
    iconClass: "bg-primary-soft text-primary",
    to: "/bookings",
  },
  {
    key: "revenue",
    label: "Net revenue",
    icon: Wallet,
    iconClass: "bg-secondary-soft text-secondary-foreground",
    to: "/payments",
  },
]

function metricValue(
  period: PeriodSummary | undefined,
  metric: Metric,
  pending: boolean
) {
  if (pending || !period) return "—"
  if (metric === "bookings") return String(period.totalBookings)
  return formatRevenue(period.totalRevenue)
}

function ChangePill({
  current,
  previous,
}: {
  current: number
  previous: number
}) {
  const change = periodChange(current, previous)
  const Icon =
    change.direction === "down"
      ? ArrowDownRight
      : change.direction === "up"
        ? ArrowUpRight
        : Minus
  const signed =
    change.direction === "down"
      ? `-${change.label}`
      : change.direction === "up" && change.label !== "New"
        ? `+${change.label}`
        : change.label

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-bold",
        change.direction === "down"
          ? "bg-status-cancelled-bg text-status-cancelled"
          : change.direction === "up"
            ? "bg-status-confirmed-bg text-status-confirmed"
            : "bg-muted text-muted-foreground"
      )}
    >
      <Icon className="size-3" />
      {signed}
    </span>
  )
}

function SummaryCard({
  periodKey,
  metric,
  summary,
  pending,
}: {
  periodKey: PeriodKey
  metric: (typeof METRICS)[number]
  summary?: DashboardSummary
  pending: boolean
}) {
  const period = PERIODS.find((item) => item.key === periodKey) ?? PERIODS[0]
  const metrics = summary?.[periodKey]
  const Icon = metric.icon
  const current =
    metric.key === "bookings"
      ? (metrics?.totalBookings ?? 0)
      : (metrics?.totalRevenue ?? 0)
  const previous =
    metric.key === "bookings"
      ? (metrics?.previousBookings ?? 0)
      : (metrics?.previousRevenue ?? 0)

  return (
    <Card className="gap-3 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="text-sm font-bold text-foreground">
          {period.label} {metric.label.toLowerCase()}
        </div>
        {metrics ? <ChangePill current={current} previous={previous} /> : null}
      </div>
      <div className="flex items-end justify-between gap-3">
        <div>
          <Link
            to={metric.to}
            className="text-2xl font-black text-foreground hover:text-primary"
          >
            {metricValue(metrics, metric.key, pending)}
          </Link>
          <div className="mt-1 text-xs text-muted-foreground">
            {period.compare}
          </div>
        </div>
        <div
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-full",
            metric.iconClass
          )}
        >
          <Icon className="size-4" />
        </div>
      </div>
    </Card>
  )
}

export function SummaryCards({
  summary,
  isPending,
  isError,
}: {
  summary?: DashboardSummary
  isPending: boolean
  isError: boolean
}) {
  if (isError) {
    return (
      <Card className="p-5">
        <p className="text-sm text-destructive">
          Bookings and revenue could not be loaded.
        </p>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {METRICS.map((metric) =>
        PERIODS.map((period) => (
          <SummaryCard
            key={`${metric.key}-${period.key}`}
            periodKey={period.key}
            metric={metric}
            summary={summary}
            pending={isPending}
          />
        ))
      )}
    </div>
  )
}
