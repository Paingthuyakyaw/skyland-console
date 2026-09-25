import { useState } from "react"

import {
  METHOD_COLORS,
  formatCompact,
  formatMoney,
  formatMonth,
} from "@/features/payments/components/utils"
import type { AmountGroup, MonthlyRevenue } from "@/store/server/payments/typed"

function share(amount: number, total: number) {
  if (total <= 0) return 0
  return Math.round((amount / total) * 100)
}

export function MethodDonut({ groups }: { groups: AmountGroup[] }) {
  const total = groups.reduce((sum, group) => sum + group.amount, 0)
  const radius = 44
  const circumference = 2 * Math.PI * radius
  let cursor = 0

  if (groups.length === 0 || total <= 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        No collected payments in this range.
      </p>
    )
  }

  return (
    <div>
      <svg
        viewBox="0 0 160 160"
        className="mx-auto h-48 w-48"
        role="img"
        aria-label="Collected amount by payment method"
      >
        <g transform="rotate(-90 80 80)">
          {groups.map((group, index) => {
            const length = (group.amount / total) * circumference
            const dash = `${length} ${circumference - length}`
            const offset = -cursor
            cursor += length
            return (
              <circle
                key={group.name}
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                stroke={METHOD_COLORS[index % METHOD_COLORS.length]}
                strokeWidth="22"
                strokeDasharray={dash}
                strokeDashoffset={offset}
              />
            )
          })}
        </g>
      </svg>
      <div className="space-y-1.5">
        {groups.map((group, index) => (
          <div
            key={group.name}
            className="flex items-center justify-between gap-3 text-sm"
          >
            <span className="flex min-w-0 items-center gap-2">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{
                  background: METHOD_COLORS[index % METHOD_COLORS.length],
                }}
              />
              <span className="truncate text-foreground">{group.name}</span>
            </span>
            <span className="font-bold text-foreground">
              {share(group.amount, total)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function OptionBars({ groups }: { groups: AmountGroup[] }) {
  const [active, setActive] = useState<number | null>(null)
  const max = Math.max(1, ...groups.map((group) => group.amount))

  if (groups.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        No payment options in this range.
      </p>
    )
  }

  const width = 320
  const height = 180
  const pad = { left: 36, right: 8, top: 8, bottom: 36 }
  const innerWidth = width - pad.left - pad.right
  const innerHeight = height - pad.top - pad.bottom
  const slot = innerWidth / groups.length
  const barWidth = Math.min(36, slot * 0.55)

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-48 w-full"
        role="img"
        aria-label="Collected amount by tour payment option"
      >
        {[0, 0.5, 1].map((step) => {
          const y = pad.top + innerHeight - step * innerHeight
          return (
            <text
              key={step}
              x={pad.left - 6}
              y={y + 3}
              textAnchor="end"
              className="fill-muted-foreground text-[10px]"
            >
              {formatCompact(max * step)}
            </text>
          )
        })}
        {groups.map((group, index) => {
          const barHeight = (group.amount / max) * innerHeight
          const x = pad.left + slot * index + (slot - barWidth) / 2
          const y = pad.top + innerHeight - barHeight
          return (
            <g
              key={group.name}
              onMouseEnter={() => setActive(index)}
              onMouseLeave={() => setActive(null)}
            >
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx="6"
                fill={METHOD_COLORS[index % METHOD_COLORS.length]}
              />
              <text
                x={x + barWidth / 2}
                y={height - 14}
                textAnchor="middle"
                className="fill-muted-foreground text-[10px]"
              >
                {group.name.replaceAll("_", " ")}
              </text>
            </g>
          )
        })}
      </svg>
      {active !== null && groups[active] ? (
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-lg">
          <div className="font-bold text-foreground">{groups[active].name}</div>
          <div className="text-muted-foreground">
            {formatMoney(groups[active].amount)}
          </div>
        </div>
      ) : null}
    </div>
  )
}

export function MonthlyLine({ points }: { points: MonthlyRevenue[] }) {
  const [active, setActive] = useState<number | null>(null)

  if (points.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        No monthly revenue in this range.
      </p>
    )
  }

  const width = 320
  const height = 180
  const pad = { left: 36, right: 8, top: 12, bottom: 28 }
  const innerWidth = width - pad.left - pad.right
  const innerHeight = height - pad.top - pad.bottom
  const max = Math.max(1, ...points.map((point) => point.amount))
  const coords = points.map((point, index) => {
    const x =
      pad.left +
      (points.length === 1
        ? innerWidth / 2
        : (index / (points.length - 1)) * innerWidth)
    const y = pad.top + innerHeight - (point.amount / max) * innerHeight
    return { ...point, x, y }
  })
  const line = coords
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ")
  const hovered = active === null ? null : coords[active]

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-48 w-full"
        role="img"
        aria-label="Monthly net revenue"
      >
        {[0, 0.5, 1].map((step) => {
          const y = pad.top + innerHeight - step * innerHeight
          return (
            <text
              key={step}
              x={pad.left - 6}
              y={y + 3}
              textAnchor="end"
              className="fill-muted-foreground text-[10px]"
            >
              {formatCompact(max * step)}
            </text>
          )
        })}
        <path
          d={line}
          fill="none"
          stroke="#00afef"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {coords.map((point, index) => (
          <g key={`${point.month}-${index}`}>
            <circle cx={point.x} cy={point.y} r="3" fill="#00afef" />
            <text
              x={point.x}
              y={height - 8}
              textAnchor="middle"
              className="fill-muted-foreground text-[10px]"
            >
              {formatMonth(point.month)}
            </text>
            <rect
              x={point.x - innerWidth / Math.max(points.length, 1) / 2}
              y={pad.top}
              width={innerWidth / Math.max(points.length, 1)}
              height={innerHeight}
              fill="transparent"
              onMouseEnter={() => setActive(index)}
              onMouseLeave={() => setActive(null)}
            />
          </g>
        ))}
      </svg>
      {hovered ? (
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-lg">
          <div className="font-bold text-foreground">
            {formatMonth(hovered.month)}
          </div>
          <div className="text-muted-foreground">
            {formatMoney(hovered.amount)}
          </div>
        </div>
      ) : null}
    </div>
  )
}
