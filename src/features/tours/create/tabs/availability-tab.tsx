import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  History,
  RefreshCw,
  X,
} from "lucide-react"
import { useMemo, useState } from "react"

import { CustomDialog } from "@/components/custom-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DatePicker } from "@/components/ui/date-picker"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { PrivateTourOptionsSummary } from "@/features/tours/create/components/private-tour-options-summary"
import { apiErrorMessage } from "@/store/server/api-error"
import {
  useAuditLogs,
  useAvailabilityCalendar,
  useAvailabilityDay,
  useAvailabilityPricePreviews,
  useBulkUpdateAvailability,
} from "@/store/server/tours/availability"
import { useTour } from "@/store/server/tours/tours"
import type {
  AvailabilityStatus,
  CalendarDayResponse,
  CalendarWindowResponse,
  DatePrices,
  TimeslotResponse,
  TourResponse,
  Weekday,
} from "@/store/server/tours/typed"

type CalendarUiStatus = AvailabilityStatus | "NOT_CONFIGURED"
type BulkSlotState = {
  unlimited: boolean
  capacity: string
  prices: Record<keyof DatePrices, string>
  groupPrices: Record<string, string>
  blocked: boolean
}

const FARE_LABELS: Record<keyof DatePrices, string> = {
  adult: "Adult",
  child: "Child",
  infant: "Infant",
  senior: "Senior",
  privateTour: "Private tour total",
}
const FARE_KEYS = Object.keys(FARE_LABELS) as (keyof DatePrices)[]

function slotFareKeys(slot?: TimeslotResponse) {
  const hasLegacyPrivate = slot?.packages?.some(
    (pkg) => !pkg.privateTourOptions?.length && pkg.privateTourPrice != null
  )
  return FARE_KEYS.filter((fare) => fare !== "privateTour" || hasLegacyPrivate)
}

function groupTierKey(packageId: string, minPax: number) {
  return `${packageId}:${minPax}`
}

type AvailabilityUi = {
  year: number
  month: number
  selectedDate: string | null
  dialog: "bulk" | null
  bulk: {
    mode: "DATE_RANGE" | "WEEKDAY_PATTERN"
    from: string
    to: string
    weekdays: Weekday[]
    dayUnlimited: boolean
    dayMax: string
    slots: Record<string, BulkSlotState>
  }
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

const MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
]

const CALENDAR_WEEKDAYS: Array<{ label: string; value: Weekday }> = [
  { label: "Sun", value: "SUNDAY" },
  { label: "Mon", value: "MONDAY" },
  { label: "Tue", value: "TUESDAY" },
  { label: "Wed", value: "WEDNESDAY" },
  { label: "Thu", value: "THURSDAY" },
  { label: "Fri", value: "FRIDAY" },
  { label: "Sat", value: "SATURDAY" },
]

const STATUS_COLORS: Record<CalendarUiStatus, string> = {
  OPEN: "border-emerald-200 bg-emerald-50 text-emerald-800",
  LIMITED: "border-amber-200 bg-amber-50 text-amber-800",
  SOLD_OUT: "border-red-200 bg-red-50 text-red-800",
  BLOCKED: "border-border bg-muted text-muted-foreground",
  NOT_CONFIGURED:
    "border-dashed border-border/60 bg-muted/30 text-muted-foreground/50",
}

const STATUS_DOTS: Record<CalendarUiStatus, string> = {
  OPEN: "bg-emerald-500",
  LIMITED: "bg-amber-500",
  SOLD_OUT: "bg-red-500",
  BLOCKED: "bg-slate-400",
  NOT_CONFIGURED: "bg-muted-foreground/30",
}

const STATUS_LABELS: Record<CalendarUiStatus, string> = {
  OPEN: "Open",
  LIMITED: "Limited",
  SOLD_OUT: "Sold Out",
  BLOCKED: "Blocked",
  NOT_CONFIGURED: "Not Configured",
}

function monthKey(year: number, month: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}`
}

function dateKey(year: number, month: number, day: number) {
  return `${monthKey(year, month)}-${String(day).padStart(2, "0")}`
}

function pad(value: number) {
  return String(value).padStart(2, "0")
}

function formatAuditTime(value?: string) {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return `${date.getDate()} ${MONTH_SHORT[date.getMonth()]} ${date.getFullYear()}, ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function auditActor(changes?: Record<string, unknown>) {
  const name =
    changes?.actorName ?? changes?.actor ?? changes?.performedBy ?? changes?.who
  return typeof name === "string" && name.trim() ? name.trim() : undefined
}

function dayStatus(data?: CalendarDayResponse): CalendarUiStatus {
  if (!data) return "NOT_CONFIGURED"
  return data.status
}

function reasonLabel(reason?: string) {
  if (!reason) return "Blocked"
  if (reason === "DEPARTURE_NOT_CONFIGURED") return "Blocked"
  return reason
}

function usedQuantity(data: CalendarDayResponse) {
  return (
    (data.confirmedQuantity ?? 0) +
    (data.heldQuantity ?? 0) +
    (data.reservedQuantity ?? 0)
  )
}

function dayStatRows(day: CalendarDayResponse): [string, string][] {
  const remaining =
    day.remainingCapacity == null && day.maxCapacity == null
      ? "Unlimited"
      : String(
          day.remainingCapacity ??
            Math.max(0, (day.maxCapacity ?? 0) - usedQuantity(day))
        )
  return [
    [
      "Max daily cap",
      day.maxCapacity == null ? "Unlimited" : String(day.maxCapacity),
    ],
    ["Remaining", remaining],
    ["Confirmed", String(day.confirmedQuantity ?? day.bookedCount ?? 0)],
    ["Held", String(day.heldQuantity ?? 0)],
    ["Reserved", String(day.reservedQuantity ?? 0)],
  ]
}

function windowStatRows(
  window: CalendarWindowResponse,
  slot?: TimeslotResponse
): [string, string][] {
  const fareRows = slotFareKeys(slot)
    .filter((fare) => window.prices?.[fare] != null)
    .map((fare): [string, string] => [
      FARE_LABELS[fare],
      `${window.prices![fare]} AED`,
    ])
  return [
    ...(fareRows.length
      ? fareRows
      : window.price != null
        ? [["Price", `${window.price} AED`] as [string, string]]
        : [["Fares", "Package/date rates"] as [string, string]]),
    ["Cap", window.capacity == null ? "∞" : String(window.capacity)],
    [
      "Rem",
      window.remainingCapacity == null ? "∞" : String(window.remainingCapacity),
    ],
    ["Conf", String(window.confirmedQuantity ?? window.bookedCount ?? 0)],
    ["Held", String(window.heldQuantity ?? 0)],
    ["Res", String(window.reservedQuantity ?? 0)],
  ]
}

function createAvailabilityUi(): AvailabilityUi {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  return {
    year,
    month,
    selectedDate: null,
    dialog: null,
    bulk: {
      mode: "DATE_RANGE",
      from: dateKey(year, month, 1),
      to: dateKey(year, month, daysInMonth),
      weekdays: ["FRIDAY", "SATURDAY"],
      dayUnlimited: false,
      dayMax: "",
      slots: {},
    },
  }
}

function defaultBulkSlot(): BulkSlotState {
  return {
    unlimited: false,
    capacity: "",
    prices: { adult: "", child: "", infant: "", senior: "", privateTour: "" },
    groupPrices: {},
    blocked: false,
  }
}

function positiveCapacity(value: string) {
  const number = Number(value)
  return (
    value.trim() !== "" &&
    Number.isInteger(number) &&
    number > 0 &&
    number <= 2_147_483_647
  )
}

function bulkInputError(
  bulk: AvailabilityUi["bulk"],
  timeslots: TimeslotResponse[]
) {
  if (!bulk.from || !bulk.to) return "Choose a start and end date."
  if (bulk.to < bulk.from) return "End date must be on or after start date."
  const start = new Date(`${bulk.from}T00:00:00Z`)
  const end = new Date(`${bulk.to}T00:00:00Z`)
  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime()) ||
    start.toISOString().slice(0, 10) !== bulk.from ||
    end.toISOString().slice(0, 10) !== bulk.to ||
    end.getTime() - start.getTime() > 366 * 86_400_000
  ) {
    return "Choose a valid date range of no more than one year."
  }
  if (bulk.mode === "WEEKDAY_PATTERN" && bulk.weekdays.length === 0) {
    return "Select at least one weekday."
  }
  if (bulk.mode === "WEEKDAY_PATTERN") {
    const days = Math.floor((end.getTime() - start.getTime()) / 86_400_000) + 1
    const hasSelectedDay = Array.from(
      { length: days },
      (_, index) =>
        CALENDAR_WEEKDAYS[
          new Date(start.getTime() + index * 86_400_000).getUTCDay()
        ].value
    ).some((weekday) => bulk.weekdays.includes(weekday))
    if (!hasSelectedDay) {
      return "The selected weekdays do not occur in this date range."
    }
  }
  if (timeslots.length === 0)
    return "Add a timeslot before updating availability."
  if (!bulk.dayUnlimited && !positiveCapacity(bulk.dayMax)) {
    return "Enter a positive whole number for daily capacity, or choose Unlimited."
  }
  const invalidSlot = timeslots.find((slot) => {
    const state = bulk.slots[slot.id] ?? defaultBulkSlot()
    return !state.unlimited && !positiveCapacity(state.capacity)
  })
  if (invalidSlot) {
    return `Enter a positive whole number for ${invalidSlot.name}, or choose Unlimited.`
  }
  for (const slot of timeslots) {
    const invalidFare = slotFareKeys(slot).find((fare) => {
      const price = (bulk.slots[slot.id] ?? defaultBulkSlot()).prices[
        fare
      ].trim()
      return price !== "" && !/^\d{1,10}(\.\d{1,2})?$/.test(price)
    })
    if (invalidFare) {
      return `Enter a non-negative ${FARE_LABELS[invalidFare].toLowerCase()} price with up to two decimals for ${slot.name}.`
    }
    for (const pkg of slot.packages ?? []) {
      for (const tier of pkg.groupPriceTiers ?? []) {
        const price =
          (bulk.slots[slot.id] ?? defaultBulkSlot()).groupPrices[
            groupTierKey(pkg.id, tier.minPax)
          ]?.trim() ?? ""
        if (price !== "" && !/^\d{1,10}(\.\d{1,2})?$/.test(price)) {
          return `Enter a non-negative group price with up to two decimals for ${pkg.name} (${tier.minPax}+ guests).`
        }
      }
    }
  }
  return null
}

export function AvailabilityTab({
  createdTour,
}: {
  createdTour?: TourResponse
}) {
  const tourId = createdTour?.id
  const tourDetails = useTour(tourId ?? "", Boolean(tourId))
  // Availability updates use the persisted detail response so recently archived or changed
  // timeslots cannot be submitted from stale editor state.
  const timeslots = tourDetails.data?.timeslots ?? createdTour?.timeslots ?? []
  const [ui, setUi] = useState(createAvailabilityUi)
  const [bulkError, setBulkError] = useState("")
  const { year, month, selectedDate, dialog, bulk } = ui
  const currentMonth = monthKey(year, month)
  const today = new Date()

  const calendar = useAvailabilityCalendar(tourId, currentMonth)
  const dayDetail = useAvailabilityDay(tourId, selectedDate)
  const pricePreviews = useAvailabilityPricePreviews(tourId, selectedDate)
  const audit = useAuditLogs({
    entityType: "TOUR",
    entityId: tourId,
    enabled: Boolean(tourId),
  })

  const bulkUpdate = useBulkUpdateAvailability(tourId)

  const daysByDate = useMemo(() => {
    const map = new Map<string, CalendarDayResponse>()
    for (const day of calendar.data ?? []) {
      map.set(day.date, day)
    }
    return map
  }, [calendar.data])

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: Array<number | null> = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  if (!tourId) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <CalendarDays className="size-10 text-muted-foreground/40" />
          <div>
            <p className="text-sm font-bold">
              Save the tour to configure availability
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Availability needs a saved tour ID and timeslot IDs before
              calendar dates and capacity can be configured.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const closeDialog = () => setUi((current) => ({ ...current, dialog: null }))

  const shiftMonth = (delta: -1 | 1) => {
    setUi((current) => {
      const next = new Date(current.year, current.month + delta, 1)
      return {
        ...current,
        year: next.getFullYear(),
        month: next.getMonth(),
        selectedDate: null,
      }
    })
  }

  const openBulk = () => {
    setBulkError("")
    setUi((current) => {
      const days = new Date(current.year, current.month + 1, 0).getDate()
      return {
        ...current,
        dialog: "bulk",
        bulk: {
          ...current.bulk,
          mode: "DATE_RANGE",
          from: dateKey(current.year, current.month, 1),
          to: dateKey(current.year, current.month, days),
          dayUnlimited: false,
          dayMax: "",
          slots: Object.fromEntries(
            timeslots.map((slot) => [slot.id, defaultBulkSlot()])
          ),
        },
      }
    })
  }

  const updateBulk = (
    change: (current: AvailabilityUi["bulk"]) => AvailabilityUi["bulk"]
  ) => {
    setBulkError("")
    setUi((current) => ({ ...current, bulk: change(current.bulk) }))
  }

  const handleBulk = () => {
    const inputError = bulkInputError(bulk, timeslots)
    if (inputError) {
      setBulkError(inputError)
      return
    }
    setBulkError("")
    bulkUpdate.mutate(
      {
        tourId,
        payload: {
          selection: {
            mode: bulk.mode,
            from: bulk.from,
            to: bulk.to,
            weekdays:
              bulk.mode === "WEEKDAY_PATTERN" ? bulk.weekdays : undefined,
          },
          maxCapacityForDay: bulk.dayUnlimited
            ? undefined
            : Number(bulk.dayMax),
          windows: timeslots.map((slot) => {
            const state = bulk.slots[slot.id] ?? defaultBulkSlot()
            return {
              timeslotId: slot.id,
              blocked: state.blocked,
              maxCapacity: state.unlimited ? undefined : Number(state.capacity),
              prices: Object.fromEntries(
                slotFareKeys(slot)
                  .filter((fare) => state.prices[fare].trim() !== "")
                  .map((fare) => [fare, Number(state.prices[fare])])
              ) as DatePrices,
              groupPrices: (slot.packages ?? []).flatMap((pkg) =>
                (pkg.groupPriceTiers ?? []).flatMap((tier) => {
                  const value =
                    state.groupPrices[groupTierKey(pkg.id, tier.minPax)]?.trim()
                  return value
                    ? [
                        {
                          timeslotPackageId: pkg.id,
                          minPax: tier.minPax,
                          pricePerPax: Number(value),
                        },
                      ]
                    : []
                })
              ),
            }
          }),
        },
      },
      {
        onSuccess: closeDialog,
        onError: (error) =>
          setBulkError(
            apiErrorMessage(
              error,
              "Could not update availability. Please try again."
            )
          ),
      }
    )
  }

  const selected = selectedDate
    ? (dayDetail.data ?? daysByDate.get(selectedDate))
    : undefined
  const selectedStatus = dayStatus(selected)
  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold">Calendar and Capacity</h2>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <Card>
            <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  onClick={() => shiftMonth(-1)}
                >
                  <ChevronLeft />
                </Button>
                <CardTitle className="w-44 text-center">
                  {MONTH_NAMES[month]} {year}
                </CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  onClick={() => shiftMonth(1)}
                >
                  <ChevronRight />
                </Button>
              </div>
              <Button type="button" size="sm" onClick={openBulk}>
                <RefreshCw className="size-3.5" />
                Bulk Update
              </Button>
            </CardHeader>
            <CardContent>
              <div className="mb-3 flex flex-wrap items-center gap-3">
                {(Object.keys(STATUS_LABELS) as CalendarUiStatus[]).map(
                  (status) => (
                    <div key={status} className="flex items-center gap-1.5">
                      <div
                        className={cn(
                          "size-2.5 rounded-full",
                          STATUS_DOTS[status]
                        )}
                      />
                      <span className="text-[11px] text-muted-foreground">
                        {STATUS_LABELS[status]}
                      </span>
                    </div>
                  )
                )}
              </div>

              <div className="mb-1 grid grid-cols-7 gap-1">
                {CALENDAR_WEEKDAYS.map((day) => (
                  <div
                    key={day.value}
                    className="py-1 text-center text-[11px] font-bold tracking-wider text-muted-foreground uppercase"
                  >
                    {day.label}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {cells.map((day, index) => {
                  if (!day) return <div key={`empty-${index}`} />
                  const key = dateKey(year, month, day)
                  const data = daysByDate.get(key)
                  const status = dayStatus(data)
                  const isToday =
                    day === today.getDate() &&
                    month === today.getMonth() &&
                    year === today.getFullYear()
                  const confirmed = data?.confirmedQuantity ?? 0
                  const held = data?.heldQuantity ?? 0
                  const reserved = data?.reservedQuantity ?? 0
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() =>
                        setUi((current) => ({
                          ...current,
                          selectedDate:
                            current.selectedDate === key ? null : key,
                        }))
                      }
                      className={cn(
                        "relative flex min-h-17 flex-col items-start rounded-lg border p-1.5 text-left transition-all hover:opacity-90",
                        STATUS_COLORS[status],
                        selectedDate === key &&
                          "ring-2 ring-primary ring-offset-1"
                      )}
                    >
                      <span
                        className={cn(
                          "text-sm font-bold",
                          isToday && "text-primary underline underline-offset-2"
                        )}
                      >
                        {day}
                      </span>
                      {status === "NOT_CONFIGURED" ? (
                        <span className="mt-0.5 text-[9px] leading-tight opacity-50">
                          —
                        </span>
                      ) : null}
                      {status === "BLOCKED" ? (
                        <span className="mt-0.5 text-[9px] leading-tight opacity-70">
                          {reasonLabel(data?.unavailabilityReason)}
                        </span>
                      ) : null}
                      {status !== "NOT_CONFIGURED" &&
                      status !== "BLOCKED" &&
                      data ? (
                        <>
                          <span className="mt-0.5 text-[10px] leading-tight font-bold">
                            {data.maxCapacity == null
                              ? "∞"
                              : `${usedQuantity(data)}/${data.maxCapacity}`}
                          </span>
                          <div className="mt-0.5 text-[9px] leading-tight opacity-70">
                            C:{confirmed} H:{held} R:{reserved}
                          </div>
                        </>
                      ) : null}
                    </button>
                  )
                })}
              </div>

              <p className="mt-3 text-[11px] text-muted-foreground">
                Click a date to view timeslot details. Use{" "}
                <button
                  type="button"
                  className="font-bold text-primary hover:underline"
                  onClick={openBulk}
                >
                  Bulk Update
                </button>{" "}
                to configure capacity. C = confirmed · H = held · R = reserved.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="size-4 text-muted-foreground" />
                Calendar Audit Log
              </CardTitle>
            </CardHeader>
            <CardContent className="max-h-48 space-y-2 overflow-y-auto">
              {(audit.data?.content ?? []).map((entry) => {
                const actor = auditActor(entry.changes)
                return (
                  <div
                    key={entry.id}
                    className="rounded-lg bg-muted/40 px-3 py-2 text-xs"
                  >
                    <div className="font-bold">
                      {formatAuditTime(entry.createdAt)}
                    </div>
                    <div className="text-muted-foreground">
                      {actor
                        ? `${actor} · ${entry.action ?? ""}`
                        : (entry.action ?? "—")}
                    </div>
                  </div>
                )
              })}
              {(audit.data?.content ?? []).length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No audit entries yet.
                </p>
              ) : null}
            </CardContent>
          </Card>
        </div>

        <div>
          {selected ? (
            <Card>
              <CardHeader className="flex flex-row items-start justify-between gap-2">
                <div>
                  <CardTitle>{selected.date}</CardTitle>
                  <div className="mt-1 flex items-center gap-1.5">
                    <div
                      className={cn(
                        "size-2 rounded-full",
                        STATUS_DOTS[selectedStatus]
                      )}
                    />
                    <span className="text-xs text-muted-foreground">
                      {STATUS_LABELS[selectedStatus]}
                    </span>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  onClick={() =>
                    setUi((current) => ({
                      ...current,
                      selectedDate: null,
                    }))
                  }
                >
                  <X />
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-1.5">
                  {dayStatRows(selected).map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-lg bg-muted/40 px-2.5 py-1.5 text-[11px]"
                    >
                      <div className="text-[9px] font-bold tracking-wider text-muted-foreground uppercase">
                        {label}
                      </div>
                      <div className="font-black">{value}</div>
                    </div>
                  ))}
                </div>

                {selected.unavailabilityReason ? (
                  <p className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs">
                    <span className="font-bold text-muted-foreground">
                      Reason:{" "}
                    </span>
                    {reasonLabel(selected.unavailabilityReason)}
                  </p>
                ) : null}

                <div className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                  Timeslots
                </div>
                {(selected.windows ?? []).map(
                  (window: CalendarWindowResponse) => {
                    const windowStatus = dayStatus({
                      date: selected.date,
                      status: window.status,
                    })
                    return (
                      <div
                        key={window.id}
                        className="rounded-lg border border-border p-3"
                      >
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <div>
                            <div className="text-sm font-bold">
                              {window.timeslotName ?? "Timeslot"}
                            </div>
                            <div className="text-[11px] text-muted-foreground">
                              {window.startTime} – {window.endTime}
                            </div>
                          </div>
                          <span
                            className={cn(
                              "flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold",
                              STATUS_COLORS[windowStatus]
                            )}
                          >
                            <span
                              className={cn(
                                "size-1.5 rounded-full",
                                STATUS_DOTS[windowStatus]
                              )}
                            />
                            {STATUS_LABELS[windowStatus]}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-1 text-[11px]">
                          {windowStatRows(
                            window,
                            timeslots.find(
                              (slot) => slot.id === window.timeslotId
                            )
                          ).map(([label, value]) => (
                            <div
                              key={label}
                              className="rounded bg-muted/40 px-1.5 py-1 text-center"
                            >
                              <div className="text-[9px] font-bold text-muted-foreground">
                                {label}
                              </div>
                              <div className="font-black">{value}</div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 space-y-2 border-t border-border pt-3">
                          <div className="text-[11px] font-bold text-muted-foreground">
                            Effective package prices for this date (AED)
                          </div>
                          {pricePreviews.isPending ? (
                            <p className="text-xs text-muted-foreground">
                              Loading prices…
                            </p>
                          ) : pricePreviews.isError ? (
                            <p className="text-xs text-destructive">
                              Could not load date prices.
                            </p>
                          ) : (
                            pricePreviews.data
                              ?.filter(
                                (preview) =>
                                  preview.timeslotId === window.timeslotId
                              )
                              .map((preview) => (
                                <div
                                  key={preview.timeslotPackageId}
                                  className="rounded-md bg-muted/30 p-2 text-xs"
                                >
                                  <div className="font-bold">
                                    {timeslots
                                      .find(
                                        (slot) => slot.id === preview.timeslotId
                                      )
                                      ?.packages?.find(
                                        (pkg) =>
                                          pkg.id === preview.timeslotPackageId
                                      )?.name ?? "Package"}
                                  </div>
                                  <div className="mt-2">
                                    <PrivateTourOptionsSummary
                                      options={
                                        timeslots
                                          .find(
                                            (slot) =>
                                              slot.id === preview.timeslotId
                                          )
                                          ?.packages?.find(
                                            (pkg) =>
                                              pkg.id ===
                                              preview.timeslotPackageId
                                          )?.privateTourOptions ?? []
                                      }
                                      prices={preview.privateTourOptions}
                                    />
                                  </div>
                                  <div className="mt-1 grid grid-cols-2 gap-x-3 gap-y-1">
                                    {FARE_KEYS.filter(
                                      (fare) => preview.prices[fare] != null
                                    ).map((fare) => (
                                      <div
                                        key={fare}
                                        className="flex justify-between gap-2"
                                      >
                                        <span>{FARE_LABELS[fare]}</span>
                                        <strong>
                                          {preview.prices[fare]} AED
                                        </strong>
                                      </div>
                                    ))}
                                    {preview.groupPrices.map((group) => (
                                      <div
                                        key={group.minPax}
                                        className="flex justify-between gap-2"
                                      >
                                        <span>
                                          Adult, {group.minPax}+ guests
                                        </span>
                                        <strong>
                                          {group.adultPricePerPax} AED
                                        </strong>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))
                          )}
                          <p className="text-[11px] text-muted-foreground">
                            Guest fares are per person; private tour is a flat
                            booking price. Group previews use the shown adult
                            guest count.
                          </p>
                        </div>
                        {window.unavailabilityReason ? (
                          <p className="mt-1.5 text-[11px] text-muted-foreground">
                            <span className="font-bold">Reason:</span>{" "}
                            {reasonLabel(window.unavailabilityReason)}
                          </p>
                        ) : null}
                      </div>
                    )
                  }
                )}
                {(selected.windows ?? []).length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    No windows for this date.
                  </p>
                ) : null}
                <p className="rounded-lg bg-muted/40 px-3 py-2 text-[11px] text-muted-foreground">
                  Read-only. Configure capacity via{" "}
                  <button
                    type="button"
                    className="font-bold text-primary hover:underline"
                    onClick={openBulk}
                  >
                    Bulk Update
                  </button>
                  .
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center gap-3 py-10 text-center text-muted-foreground">
                <CalendarDays className="size-10 opacity-30" />
                <div>
                  <p className="text-sm font-bold">Select a date</p>
                  <p className="mt-0.5 text-xs">
                    Click any calendar date for a read-only view of its timeslot
                    breakdown and capacity figures.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <CustomDialog
        open={dialog === "bulk"}
        onOpenChange={(open) =>
          setUi((current) => ({ ...current, dialog: open ? "bulk" : null }))
        }
        trigger={null}
        title="Bulk update availability"
        description="Configure capacity, status, and fares across a date range or weekday pattern."
        showDone={false}
        contentClassName="sm:max-w-2xl"
        footer={
          <>
            <Button type="button" variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={bulkUpdate.isPending}
              onClick={handleBulk}
            >
              {bulkUpdate.isPending ? "Applying..." : "Apply"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {bulkError ? (
            <p
              role="alert"
              className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {bulkError}
            </p>
          ) : null}
          <p className="text-xs text-muted-foreground">
            This replaces capacity, blocked status, and calendar fare overrides
            for the selected dates. Enter only the fares you want to change;
            blank fares use package or date-rule pricing.
          </p>
          <div className="flex gap-2">
            {(["DATE_RANGE", "WEEKDAY_PATTERN"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => updateBulk((current) => ({ ...current, mode }))}
                className={cn(
                  "flex-1 rounded-lg px-4 py-2 text-xs font-bold",
                  bulk.mode === mode
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {mode === "DATE_RANGE" ? "Date Range" : "Weekday Pattern"}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field>
              <FieldLabel>Start date</FieldLabel>
              <DatePicker
                value={bulk.from}
                onChange={(from) =>
                  updateBulk((current) => ({ ...current, from }))
                }
              />
            </Field>
            <Field>
              <FieldLabel>End date</FieldLabel>
              <DatePicker
                value={bulk.to}
                onChange={(to) => updateBulk((current) => ({ ...current, to }))}
              />
            </Field>
          </div>
          {bulk.mode === "WEEKDAY_PATTERN" ? (
            <div>
              <Label>
                Weekdays{" "}
                <span className="font-normal text-muted-foreground">
                  (applies to the selected range)
                </span>
              </Label>
              <div className="mt-1.5 flex gap-1.5">
                {CALENDAR_WEEKDAYS.map((day) => (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() =>
                      updateBulk((current) => ({
                        ...current,
                        weekdays: current.weekdays.includes(day.value)
                          ? current.weekdays.filter(
                              (item) => item !== day.value
                            )
                          : [...current.weekdays, day.value],
                      }))
                    }
                    className={cn(
                      "h-9 flex-1 rounded-lg text-xs font-bold",
                      bulk.weekdays.includes(day.value)
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="space-y-3 rounded-lg border border-border p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-bold">Daily max capacity</div>
                <div className="text-[11px] text-muted-foreground">
                  Overall ceiling across all timeslots
                </div>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground">
                Unlimited
                <Switch
                  checked={bulk.dayUnlimited}
                  onCheckedChange={(dayUnlimited) =>
                    updateBulk((current) => ({ ...current, dayUnlimited }))
                  }
                />
              </div>
            </div>
            {!bulk.dayUnlimited ? (
              <Field>
                <FieldLabel>Max guests per day</FieldLabel>
                <Input
                  type="number"
                  min={1}
                  max={2147483647}
                  step={1}
                  placeholder="e.g. 60"
                  value={bulk.dayMax}
                  onChange={(event) =>
                    updateBulk((current) => ({
                      ...current,
                      dayMax: event.target.value,
                    }))
                  }
                />
              </Field>
            ) : null}
          </div>

          <div>
            <Label>Timeslots</Label>
            <div className="mt-1.5 space-y-2">
              {timeslots.map((slot) => {
                const state = bulk.slots[slot.id] ?? defaultBulkSlot()
                const patchSlot = (patch: Partial<BulkSlotState>) => {
                  updateBulk((current) => ({
                    ...current,
                    slots: {
                      ...current.slots,
                      [slot.id]: {
                        ...(current.slots[slot.id] ?? defaultBulkSlot()),
                        ...patch,
                      },
                    },
                  }))
                }
                return (
                  <div
                    key={slot.id}
                    className="rounded-lg border border-border p-3"
                  >
                    <div className="mb-2.5 flex items-center justify-between">
                      <div>
                        <div className="text-sm font-bold">{slot.name}</div>
                        <div className="text-[11px] text-muted-foreground">
                          {slot.startTime} – {slot.endTime}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground">
                        Blocked
                        <Switch
                          checked={state.blocked}
                          onCheckedChange={(blocked) => patchSlot({ blocked })}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground">
                        Unlimited
                        <Switch
                          checked={state.unlimited}
                          onCheckedChange={(unlimited) =>
                            patchSlot({ unlimited })
                          }
                        />
                      </div>
                      {!state.unlimited ? (
                        <Field className="flex-1">
                          <FieldLabel>Max capacity</FieldLabel>
                          <Input
                            type="number"
                            min={1}
                            max={2147483647}
                            step={1}
                            placeholder="e.g. 20"
                            value={state.capacity}
                            onChange={(event) =>
                              patchSlot({ capacity: event.target.value })
                            }
                          />
                        </Field>
                      ) : null}
                    </div>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      {slotFareKeys(slot).map((fare) => (
                        <Field key={fare}>
                          <FieldLabel>
                            {fare === "privateTour"
                              ? "Private total for packages without options"
                              : FARE_LABELS[fare]}{" "}
                            (AED)
                          </FieldLabel>
                          <Input
                            type="number"
                            min={0}
                            step={0.01}
                            placeholder="Package/date rate"
                            value={state.prices[fare]}
                            onChange={(event) =>
                              patchSlot({
                                prices: {
                                  ...state.prices,
                                  [fare]: event.target.value,
                                },
                              })
                            }
                          />
                        </Field>
                      ))}
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Leave a fare blank to use its package or date-rule price.
                      Named private options keep their own total booking prices.
                    </p>
                    {(slot.packages ?? [])
                      .filter((pkg) => pkg.privateTourOptions?.length)
                      .map((pkg) => (
                        <div
                          key={pkg.id}
                          className="mt-3 space-y-2 border-t border-border pt-3"
                        >
                          <p className="text-xs font-bold">{pkg.name}</p>
                          <PrivateTourOptionsSummary
                            options={pkg.privateTourOptions ?? []}
                          />
                        </div>
                      ))}
                    {(slot.packages ?? []).some(
                      (pkg) => pkg.privateTourOptions?.length
                    ) ? (
                      <p className="mt-2 text-xs text-muted-foreground">
                        Update private option names, descriptions, and prices in
                        Timeslots & Packages. Bulk Update changes availability
                        without changing these choices.
                      </p>
                    ) : null}
                    {(slot.packages ?? []).some(
                      (pkg) => pkg.groupPriceTiers?.length
                    ) ? (
                      <div className="mt-3 space-y-3 border-t border-border pt-3">
                        <p className="text-xs font-bold">
                          Group tier prices by package (AED per adult)
                        </p>
                        {(slot.packages ?? [])
                          .filter((pkg) => pkg.groupPriceTiers?.length)
                          .map((pkg) => (
                            <div
                              key={pkg.id}
                              className="rounded-md bg-muted/30 p-2"
                            >
                              <p className="mb-2 text-xs font-semibold">
                                {pkg.name}
                              </p>
                              <div className="grid gap-2 sm:grid-cols-2">
                                {pkg.groupPriceTiers.map((tier) => {
                                  const key = groupTierKey(pkg.id, tier.minPax)
                                  return (
                                    <Field key={key}>
                                      <FieldLabel>
                                        {tier.minPax}+ guests · package{" "}
                                        {tier.pricePerPax} AED
                                      </FieldLabel>
                                      <Input
                                        type="number"
                                        min={0}
                                        step={0.01}
                                        placeholder="Package/date rate"
                                        value={state.groupPrices[key] ?? ""}
                                        onChange={(event) =>
                                          patchSlot({
                                            groupPrices: {
                                              ...state.groupPrices,
                                              [key]: event.target.value,
                                            },
                                          })
                                        }
                                      />
                                    </Field>
                                  )
                                })}
                              </div>
                            </div>
                          ))}
                        <p className="text-xs text-muted-foreground">
                          Leave a group tier blank to use its package or
                          date-rule price. An entered guest fare takes
                          precedence for that fare type.
                        </p>
                      </div>
                    ) : null}
                  </div>
                )
              })}
              {timeslots.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  This tour has no timeslots yet.
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </CustomDialog>
    </div>
  )
}
