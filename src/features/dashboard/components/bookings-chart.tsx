import { useState } from "react"

import { formatChartDay } from "@/features/dashboard/components/utils"
import type { DailyBookings } from "@/store/server/dashboard/typed"

const WIDTH = 560
const HEIGHT = 168
const PAD = { left: 8, right: 8, top: 16, bottom: 28 }

export function BookingsChart({ days }: { days: DailyBookings[] }) {
  const [active, setActive] = useState<number | null>(null)

  if (days.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
        No bookings in the last seven days.
      </div>
    )
  }

  const innerWidth = WIDTH - PAD.left - PAD.right
  const innerHeight = HEIGHT - PAD.top - PAD.bottom
  const max = Math.max(1, ...days.map((day) => day.totalBookings))
  const points = days.map((day, index) => {
    const x =
      PAD.left +
      (days.length === 1
        ? innerWidth / 2
        : (index / (days.length - 1)) * innerWidth)
    const y = PAD.top + innerHeight - (day.totalBookings / max) * innerHeight
    return { ...day, x, y }
  })
  const line = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ")
  const baseline = PAD.top + innerHeight
  const area = `${line} L ${points[points.length - 1].x} ${baseline} L ${points[0].x} ${baseline} Z`
  const hovered = active === null ? null : points[active]

  return (
    <div className="relative h-40">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="h-full w-full"
        role="img"
        aria-label="Bookings over the previous seven days"
        onMouseLeave={() => setActive(null)}
      >
        <defs>
          <linearGradient id="dashboard-bookings" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00afef" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#00afef" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#dashboard-bookings)" />
        <path
          d={line}
          fill="none"
          stroke="#00afef"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {points.map((point, index) => (
          <g key={point.date}>
            <text
              x={point.x}
              y={HEIGHT - 6}
              textAnchor="middle"
              className="fill-muted-foreground text-[11px]"
            >
              {formatChartDay(point.date)}
            </text>
            <circle
              cx={point.x}
              cy={point.y}
              r={active === index ? 4 : 0}
              fill="#00afef"
            />
            <rect
              x={point.x - innerWidth / Math.max(days.length, 1) / 2}
              y={PAD.top}
              width={innerWidth / Math.max(days.length, 1)}
              height={innerHeight}
              fill="transparent"
              onMouseEnter={() => setActive(index)}
            />
          </g>
        ))}
      </svg>
      {hovered ? (
        <div
          className="pointer-events-none absolute top-0 rounded-lg border border-border bg-card px-3 py-2 text-xs shadow-lg"
          style={{
            left: `${(hovered.x / WIDTH) * 100}%`,
            transform: "translateX(-50%)",
          }}
        >
          <div className="font-bold text-foreground">
            {formatChartDay(hovered.date)}
          </div>
          <div className="mt-0.5 text-muted-foreground">
            Bookings:{" "}
            <span className="font-bold text-foreground">
              {hovered.totalBookings}
            </span>
          </div>
        </div>
      ) : null}
    </div>
  )
}
