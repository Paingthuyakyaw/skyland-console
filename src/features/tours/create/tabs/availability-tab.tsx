import {
  Ban,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Copy,
  History,
  LayoutGrid,
  Pencil,
  Plus,
  RefreshCw,
  X,
} from "lucide-react"
import { useMemo, useState } from "react"

import { CustomDialog } from "@/components/custom-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import {
  useApplyAvailabilityToOtherTours,
  useAuditLogs,
  useAvailabilityCalendar,
  useAvailabilityDay,
  useAvailabilityRules,
  useBlockAvailabilityDates,
  useBulkUpdateAvailability,
  useChangeImpact,
  useCopyAvailabilityMonth,
  useCreateAvailabilityRule,
  useDeleteAvailabilityRule,
  useReorderAvailabilityRules,
  useUpdateAvailabilityRule,
} from "@/store/server/tours/availability"
import { useTours } from "@/store/server/tours/tours"
import type {
  AvailabilityStatus,
  CalendarDayResponse,
  CalendarWindowResponse,
  RuleCategory,
  RuleEffectType,
  RuleRequest,
  RuleResponse,
  TimeslotResponse,
  TourResponse,
  Weekday,
} from "@/store/server/tours/typed"

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

const WEEKDAYS: Weekday[] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
]

const WEEKDAY_LABELS: Record<Weekday, string> = {
  MONDAY: "Mon",
  TUESDAY: "Tue",
  WEDNESDAY: "Wed",
  THURSDAY: "Thu",
  FRIDAY: "Fri",
  SATURDAY: "Sat",
  SUNDAY: "Sun",
}

const STATUS_COLORS: Record<AvailabilityStatus, string> = {
  OPEN: "border-emerald-200 bg-emerald-50 text-emerald-800",
  LIMITED: "border-amber-200 bg-amber-50 text-amber-800",
  SOLD_OUT: "border-red-200 bg-red-50 text-red-800",
  BLOCKED: "border-border bg-muted text-muted-foreground",
}

const CATEGORY_ITEMS = {
  SEASONAL: "Seasonal",
  RELIGIOUS_OBSERVANCE: "Religious observance",
  CUSTOM: "Custom",
} satisfies Record<RuleCategory, string>

const EFFECT_ITEMS = {
  BLOCK: "Block",
  ADJUST_PRICE: "Adjust price",
  ADJUST_CAPACITY: "Adjust capacity",
  SHIFT_TIME: "Shift time",
} satisfies Record<RuleEffectType, string>

function monthKey(year: number, month: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}`
}

function dateKey(year: number, month: number, day: number) {
  return `${monthKey(year, month)}-${String(day).padStart(2, "0")}`
}

function emptyRule(): RuleRequest {
  const today = new Date()
  const start = today.toISOString().slice(0, 10)
  const end = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    .toISOString()
    .slice(0, 10)
  return {
    name: "",
    category: "CUSTOM",
    dateRangeStart: start,
    dateRangeEnd: end,
    effectType: "BLOCK",
    priority: 1,
    active: true,
  }
}

function ruleToRequest(rule: RuleResponse): RuleRequest {
  return {
    name: rule.name,
    category: rule.category,
    dateRangeStart: rule.dateRangeStart,
    dateRangeEnd: rule.dateRangeEnd,
    daysOfWeek: rule.daysOfWeek,
    targetWindowIds: rule.targetWindowIds,
    effectType: rule.effectType,
    priceAdjustmentMode: rule.priceAdjustmentMode,
    priceAdjustmentValue: rule.priceAdjustmentValue,
    capacityAdjustmentMode: rule.capacityAdjustmentMode,
    capacityAdjustmentValue: rule.capacityAdjustmentValue,
    shiftedStartTime: rule.shiftedStartTime,
    shiftedEndTime: rule.shiftedEndTime,
    priority: rule.priority,
    active: rule.active,
  }
}

type AvailabilityDialog = "bulk" | "block" | "copy" | "apply" | "rule" | null

type AvailabilityUi = {
  year: number
  month: number
  selectedDate: string | null
  dialog: AvailabilityDialog
  editingRule: RuleResponse | null
  ruleForm: RuleRequest
  bulk: {
    mode: "DATE_RANGE" | "WEEKDAY_PATTERN"
    from: string
    to: string
    weekdays: Weekday[]
    dayMax: string
    caps: Record<string, string>
    prices: Record<string, string>
    blocked: boolean
  }
  block: { from: string; to: string }
  copy: { target: string; overwrite: boolean }
  apply: { from: string; to: string; ids: string[]; overwrite: boolean }
}

function createAvailabilityUi(): AvailabilityUi {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const next = new Date(year, month + 1, 1)
  return {
    year,
    month,
    selectedDate: null,
    dialog: null,
    editingRule: null,
    ruleForm: emptyRule(),
    bulk: {
      mode: "DATE_RANGE",
      from: dateKey(year, month, 1),
      to: dateKey(year, month, daysInMonth),
      weekdays: ["FRIDAY", "SATURDAY"],
      dayMax: "60",
      caps: {},
      prices: {},
      blocked: false,
    },
    block: {
      from: dateKey(year, month, 1),
      to: dateKey(year, month, 1),
    },
    copy: {
      target: monthKey(next.getFullYear(), next.getMonth()),
      overwrite: false,
    },
    apply: {
      from: dateKey(year, month, 1),
      to: dateKey(year, month, daysInMonth),
      ids: [],
      overwrite: false,
    },
  }
}

export function AvailabilityTab({
  createdTour,
}: {
  createdTour?: TourResponse
}) {
  const tourId = createdTour?.id
  const timeslots = createdTour?.timeslots ?? []
  const [ui, setUi] = useState(createAvailabilityUi)
  const {
    year,
    month,
    selectedDate,
    dialog,
    editingRule,
    ruleForm,
    bulk,
    block,
    copy,
    apply,
  } = ui
  const currentMonth = monthKey(year, month)

  const calendar = useAvailabilityCalendar(tourId, currentMonth)
  const dayDetail = useAvailabilityDay(tourId, selectedDate)
  const rulesQuery = useAvailabilityRules(tourId)
  const impact = useChangeImpact(tourId)
  const audit = useAuditLogs({
    entityType: "TOUR",
    entityId: tourId,
    enabled: Boolean(tourId),
  })
  const { data: toursPage } = useTours({ size: 50 })
  const otherTours = (toursPage?.content ?? []).filter(
    (tour) => tour.id !== tourId
  )

  const createRule = useCreateAvailabilityRule(tourId)
  const updateRule = useUpdateAvailabilityRule(tourId)
  const deleteRule = useDeleteAvailabilityRule(tourId)
  const reorderRules = useReorderAvailabilityRules(tourId)
  const bulkUpdate = useBulkUpdateAvailability(tourId)
  const copyMonth = useCopyAvailabilityMonth(tourId)
  const applyToTours = useApplyAvailabilityToOtherTours(tourId)
  const blockDates = useBlockAvailabilityDates(tourId)

  const daysByDate = useMemo(() => {
    const map = new Map<string, CalendarDayResponse>()
    for (const day of calendar.data ?? []) {
      map.set(day.date, day)
    }
    return map
  }, [calendar.data])

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const leadingBlanks = firstDay === 0 ? 6 : firstDay - 1
  const cells: Array<number | null> = [
    ...Array(leadingBlanks).fill(null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  if (!tourId) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <CalendarDays className="size-10 text-muted-foreground/40" />
          <div>
            <p className="text-sm font-bold">Save the tour first</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Availability calendar, rules, and bulk actions need a tour id.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const closeDialog = () =>
    setUi((current) => ({ ...current, dialog: null }))

  const openBulk = () => {
    setUi((current) => {
      const days = new Date(current.year, current.month + 1, 0).getDate()
      return {
        ...current,
        dialog: "bulk",
        bulk: {
          ...current.bulk,
          caps: Object.fromEntries(timeslots.map((slot) => [slot.id, "20"])),
          prices: Object.fromEntries(timeslots.map((slot) => [slot.id, "0"])),
          from: dateKey(current.year, current.month, 1),
          to: dateKey(current.year, current.month, days),
        },
      }
    })
  }

  const handleBulk = () => {
    bulkUpdate.mutate(
      {
        tourId,
        payload: {
          selection: {
            mode: bulk.mode,
            from: bulk.from,
            to: bulk.to,
            weekdays: bulk.mode === "WEEKDAY_PATTERN" ? bulk.weekdays : undefined,
          },
          maxCapacityForDay: Number(bulk.dayMax) || undefined,
          windows: timeslots.map((slot) => ({
            timeslotId: slot.id,
            maxCapacity: Number(bulk.caps[slot.id]) || undefined,
            price: Number(bulk.prices[slot.id]) || undefined,
            blocked: bulk.blocked || undefined,
          })),
        },
      },
      { onSuccess: closeDialog }
    )
  }

  const handleBlock = () => {
    blockDates.mutate(
      {
        tourId,
        payload: {
          from: block.from,
          to: block.to,
          timeslotIds: timeslots.map((slot) => slot.id),
          defaultCapacity: 0,
        },
      },
      { onSuccess: closeDialog }
    )
  }

  const handleCopy = () => {
    copyMonth.mutate(
      {
        tourId,
        payload: {
          sourceMonth: currentMonth,
          targetMonth: copy.target,
          overwrite: copy.overwrite,
        },
      },
      { onSuccess: closeDialog }
    )
  }

  const handleApply = () => {
    applyToTours.mutate(
      {
        tourId,
        payload: {
          targetTourIds: apply.ids,
          from: apply.from,
          to: apply.to,
          overwrite: apply.overwrite,
        },
      },
      { onSuccess: closeDialog }
    )
  }

  const openCreateRule = () => {
    setUi((current) => ({
      ...current,
      dialog: "rule",
      editingRule: null,
      ruleForm: emptyRule(),
    }))
  }

  const openEditRule = (rule: RuleResponse) => {
    setUi((current) => ({
      ...current,
      dialog: "rule",
      editingRule: rule,
      ruleForm: ruleToRequest(rule),
    }))
  }

  const handleReorderRule = (ruleId: string, direction: -1 | 1) => {
    const rules = rulesQuery.data ?? []
    const index = rules.findIndex((rule) => rule.id === ruleId)
    const nextIndex = index + direction
    if (index < 0 || nextIndex < 0 || nextIndex >= rules.length) return
    const next = [...rules]
    const [moved] = next.splice(index, 1)
    next.splice(nextIndex, 0, moved)
    reorderRules.mutate({
      tourId,
      ruleIds: next.map((rule) => rule.id),
    })
  }

  const handleSaveRule = () => {
    if (!ruleForm.name.trim()) return
    if (editingRule) {
      updateRule.mutate(
        {
          tourId,
          ruleId: editingRule.id,
          payload: {
            version: editingRule.version ?? 0,
            rule: ruleForm,
          },
        },
        { onSuccess: closeDialog }
      )
      return
    }
    createRule.mutate(
      { tourId, rule: ruleForm },
      { onSuccess: closeDialog }
    )
  }

  const selected = selectedDate
    ? dayDetail.data ?? daysByDate.get(selectedDate)
    : undefined

  return (
    <div className="space-y-4">
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
      <div className="space-y-4 xl:col-span-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                onClick={() =>
                  setUi((current) =>
                    current.month === 0
                      ? { ...current, year: current.year - 1, month: 11 }
                      : { ...current, month: current.month - 1 }
                  )
                }
              >
                <ChevronLeft />
              </Button>
              <CardTitle>
                {MONTH_NAMES[month]} {year}
              </CardTitle>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                onClick={() =>
                  setUi((current) =>
                    current.month === 11
                      ? { ...current, year: current.year + 1, month: 0 }
                      : { ...current, month: current.month + 1 }
                  )
                }
              >
                <ChevronRight />
              </Button>
            </div>
            <div className="flex gap-2">
              <Button type="button" size="sm" variant="outline" onClick={openBulk}>
                Bulk Actions
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() =>
                  setUi((current) => ({ ...current, dialog: "block" }))
                }
              >
                <Ban />
                Block Dates
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-2 grid grid-cols-7 text-center text-[11px] font-bold text-muted-foreground">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((label) => (
                <div key={label}>{label}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {cells.map((day, index) => {
                if (!day) return <div key={`empty-${index}`} />
                const key = dateKey(year, month, day)
                const data = daysByDate.get(key)
                const status: AvailabilityStatus = data?.status ?? "OPEN"
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
                      "relative flex min-h-16 flex-col items-center rounded-lg border p-1.5 text-center",
                      STATUS_COLORS[status],
                      selectedDate === key && "ring-2 ring-primary ring-offset-1"
                    )}
                  >
                    <span className="text-sm font-bold">{day}</span>
                    {data ? (
                      <span className="mt-0.5 text-[10px] font-medium">
                        {data.bookedCount ?? 0}/{data.maxCapacity ?? 0}
                      </span>
                    ) : (
                      <span className="mt-0.5 text-[10px] text-muted-foreground">
                        —
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recurring Rules</CardTitle>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Rules override individual date settings.
              </p>
            </div>
            <Button type="button" size="sm" variant="outline" onClick={openCreateRule}>
              <Plus />
              Add Rule
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {(rulesQuery.data ?? []).map((rule, index) => (
              <div
                key={rule.id}
                className="flex items-center gap-3 rounded-lg border border-border px-4 py-3"
              >
                <RefreshCw className="size-4 shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold">{rule.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {rule.dateRangeStart} – {rule.dateRangeEnd} · {rule.effectType}
                  </div>
                </div>
                <Badge variant="secondary">{rule.category}</Badge>
                <div className="flex flex-col">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-xs"
                    disabled={index === 0 || reorderRules.isPending}
                    onClick={() => handleReorderRule(rule.id, -1)}
                  >
                    <ChevronUp />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-xs"
                    disabled={
                      index === (rulesQuery.data ?? []).length - 1 ||
                      reorderRules.isPending
                    }
                    onClick={() => handleReorderRule(rule.id, 1)}
                  >
                    <ChevronDown />
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  onClick={() => openEditRule(rule)}
                >
                  <Pencil />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  onClick={() => deleteRule.mutate({ tourId, ruleId: rule.id })}
                >
                  <X />
                </Button>
              </div>
            ))}
            {(rulesQuery.data ?? []).length === 0 ? (
              <p className="text-xs text-muted-foreground">No recurring rules.</p>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {selected ? (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{selected.date}</CardTitle>
                <p className="mt-1 text-xs capitalize text-muted-foreground">
                  {selected.status.toLowerCase().replace("_", " ")}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                onClick={() =>
                  setUi((current) => ({ ...current, selectedDate: null }))
                }
              >
                <X />
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-muted/40 px-2 py-2">
                  <div className="text-lg font-black">
                    {selected.confirmedQuantity ?? selected.bookedCount ?? 0}
                  </div>
                  <div className="text-[10px] font-bold text-muted-foreground">
                    Confirmed
                  </div>
                </div>
                <div className="rounded-lg bg-muted/40 px-2 py-2">
                  <div className="text-lg font-black">
                    {selected.heldQuantity ?? 0}
                  </div>
                  <div className="text-[10px] font-bold text-muted-foreground">
                    Held
                  </div>
                </div>
                <div className="rounded-lg bg-muted/40 px-2 py-2">
                  <div className="text-lg font-black">
                    {selected.reservedQuantity ?? 0}
                  </div>
                  <div className="text-[10px] font-bold text-muted-foreground">
                    Reserved
                  </div>
                </div>
              </div>
              {selected.unavailabilityReason ? (
                <p className="rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                  {selected.unavailabilityReason}
                </p>
              ) : null}
              {(selected.windows ?? []).map(
                (window: CalendarWindowResponse) => (
                <div key={window.id} className="rounded-lg border border-border p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold">
                        {window.timeslotName ?? "Timeslot"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {window.startTime} – {window.endTime}
                      </div>
                    </div>
                    <Badge variant="outline">{window.status}</Badge>
                  </div>
                  <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                    <span>
                      Capacity{" "}
                      <span className="font-bold text-foreground">
                        {window.bookedCount ?? 0}/{window.capacity ?? 0}
                      </span>
                    </span>
                    <span>
                      Remaining{" "}
                      <span className="font-bold text-foreground">
                        {window.remainingCapacity ?? "—"}
                      </span>
                    </span>
                  </div>
                  <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
                    <span>Confirmed {window.confirmedQuantity ?? 0}</span>
                    <span>Held {window.heldQuantity ?? 0}</span>
                    <span>Reserved {window.reservedQuantity ?? 0}</span>
                  </div>
                  {window.unavailabilityReason ? (
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {window.unavailabilityReason}
                    </p>
                  ) : null}
                </div>
              )
              )}
              {(selected.windows ?? []).length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No windows for this date.
                </p>
              ) : null}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center gap-3 py-10 text-center text-muted-foreground">
              <CalendarDays className="size-10 opacity-30" />
              <div>
                <p className="text-sm font-bold">Select a date</p>
                <p className="mt-0.5 text-xs">
                  Click any date to view capacity and prices.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Change impact</CardTitle>
            <p className="text-xs text-muted-foreground">
              Live holds and future bookings that would be affected by availability
              changes.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg border border-border px-2 py-2.5">
                <div className="text-xl font-black text-amber-700">
                  {impact.data?.activeHolds ?? 0}
                </div>
                <div className="text-[10px] font-bold text-muted-foreground">
                  Active holds
                </div>
              </div>
              <div className="rounded-lg border border-border px-2 py-2.5">
                <div className="text-xl font-black">
                  {impact.data?.pendingPaymentBookings ?? 0}
                </div>
                <div className="text-[10px] font-bold text-muted-foreground">
                  Pending
                </div>
              </div>
              <div className="rounded-lg border border-border px-2 py-2.5">
                <div className="text-xl font-black text-emerald-700">
                  {impact.data?.confirmedBookings ?? 0}
                </div>
                <div className="text-[10px] font-bold text-muted-foreground">
                  Confirmed
                </div>
              </div>
            </div>
            {impact.data?.requiredOperationalAction ? (
              <p className="rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
                {impact.data.requiredOperationalAction}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                {impact.isPending
                  ? "Checking impact…"
                  : "No operational action required."}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Copy & apply</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="w-full"
              onClick={() =>
                setUi((current) => ({ ...current, dialog: "copy" }))
              }
            >
              <Copy />
              Copy Month Setup
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="w-full"
              onClick={() =>
                setUi((current) => ({ ...current, dialog: "apply" }))
              }
            >
              <LayoutGrid />
              Apply to Other Tours
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="size-4 text-muted-foreground" />
              Calendar Audit Log
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-64 space-y-2 overflow-y-auto">
            {(audit.data?.content ?? []).map((entry) => (
              <div key={entry.id} className="rounded-lg bg-muted/40 px-3 py-2 text-xs">
                <div className="font-bold">
                  {entry.createdAt
                    ? new Date(entry.createdAt).toLocaleString()
                    : "—"}
                </div>
                <div className="text-muted-foreground">{entry.action}</div>
              </div>
            ))}
            {(audit.data?.content ?? []).length === 0 ? (
              <p className="text-xs text-muted-foreground">No audit entries yet.</p>
            ) : null}
          </CardContent>
        </Card>
      </div>
      </div>

      <CustomDialog
        open={dialog === "bulk"}
        onOpenChange={(open) =>
          setUi((current) => ({ ...current, dialog: open ? "bulk" : null }))
        }
        trigger={null}
        title="Bulk update availability"
        showDone={false}
        contentClassName="sm:max-w-lg"
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
          <div className="flex gap-2">
            {(["DATE_RANGE", "WEEKDAY_PATTERN"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() =>
                  setUi((current) => ({
                    ...current,
                    bulk: { ...current.bulk, mode },
                  }))
                }
                className={cn(
                  "flex-1 rounded-lg px-4 py-2 text-xs font-bold",
                  bulk.mode === mode
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {mode === "DATE_RANGE" ? "Date range" : "Weekday pattern"}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field>
              <FieldLabel>From</FieldLabel>
              <Input
                type="date"
                value={bulk.from}
                onChange={(event) =>
                  setUi((current) => ({
                    ...current,
                    bulk: { ...current.bulk, from: event.target.value },
                  }))
                }
              />
            </Field>
            <Field>
              <FieldLabel>To</FieldLabel>
              <Input
                type="date"
                value={bulk.to}
                onChange={(event) =>
                  setUi((current) => ({
                    ...current,
                    bulk: { ...current.bulk, to: event.target.value },
                  }))
                }
              />
            </Field>
          </div>
          {bulk.mode === "WEEKDAY_PATTERN" ? (
            <div className="flex flex-wrap gap-1.5">
              {WEEKDAYS.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() =>
                    setUi((current) => ({
                      ...current,
                      bulk: {
                        ...current.bulk,
                        weekdays: current.bulk.weekdays.includes(day)
                          ? current.bulk.weekdays.filter((item) => item !== day)
                          : [...current.bulk.weekdays, day],
                      },
                    }))
                  }
                  className={cn(
                    "h-9 rounded-lg px-2 text-xs font-bold",
                    bulk.weekdays.includes(day)
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {WEEKDAY_LABELS[day]}
                </button>
              ))}
            </div>
          ) : null}
          <Field>
            <FieldLabel>Day maximum</FieldLabel>
            <Input
              type="number"
              value={bulk.dayMax}
              onChange={(event) =>
                setUi((current) => ({
                  ...current,
                  bulk: { ...current.bulk, dayMax: event.target.value },
                }))
              }
            />
          </Field>
          <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
            <div>
              <div className="text-sm font-bold">Block these dates</div>
              <div className="text-xs text-muted-foreground">
                Sends blocked=true on each timeslot window.
              </div>
            </div>
            <Switch
              checked={bulk.blocked}
              onCheckedChange={(blocked) =>
                setUi((current) => ({
                  ...current,
                  bulk: { ...current.bulk, blocked },
                }))
              }
            />
          </div>
          {timeslots.map((slot: TimeslotResponse) => (
            <div
              key={slot.id}
              className="grid grid-cols-2 gap-2 rounded-lg border border-border p-2.5"
            >
              <div className="col-span-2 text-sm font-bold">{slot.name}</div>
              <Field>
                <FieldLabel>Max cap</FieldLabel>
                <Input
                  type="number"
                  value={bulk.caps[slot.id] ?? ""}
                  onChange={(event) =>
                    setUi((current) => ({
                      ...current,
                      bulk: {
                        ...current.bulk,
                        caps: {
                          ...current.bulk.caps,
                          [slot.id]: event.target.value,
                        },
                      },
                    }))
                  }
                />
              </Field>
              <Field>
                <FieldLabel>Price</FieldLabel>
                <Input
                  type="number"
                  value={bulk.prices[slot.id] ?? ""}
                  onChange={(event) =>
                    setUi((current) => ({
                      ...current,
                      bulk: {
                        ...current.bulk,
                        prices: {
                          ...current.bulk.prices,
                          [slot.id]: event.target.value,
                        },
                      },
                    }))
                  }
                />
              </Field>
            </div>
          ))}
        </div>
      </CustomDialog>

      <CustomDialog
        open={dialog === "block"}
        onOpenChange={(open) =>
          setUi((current) => ({ ...current, dialog: open ? "block" : null }))
        }
        trigger={null}
        title="Block dates"
        showDone={false}
        footer={
          <>
            <Button type="button" variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={blockDates.isPending || timeslots.length === 0}
              onClick={handleBlock}
            >
              {blockDates.isPending ? "Blocking..." : "Block"}
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-3">
          <Field>
            <FieldLabel>From</FieldLabel>
            <Input
              type="date"
              value={block.from}
              onChange={(event) =>
                setUi((current) => ({
                  ...current,
                  block: { ...current.block, from: event.target.value },
                }))
              }
            />
          </Field>
          <Field>
            <FieldLabel>To</FieldLabel>
            <Input
              type="date"
              value={block.to}
              onChange={(event) =>
                setUi((current) => ({
                  ...current,
                  block: { ...current.block, to: event.target.value },
                }))
              }
            />
          </Field>
        </div>
      </CustomDialog>

      <CustomDialog
        open={dialog === "copy"}
        onOpenChange={(open) =>
          setUi((current) => ({ ...current, dialog: open ? "copy" : null }))
        }
        trigger={null}
        title="Copy month setup"
        showDone={false}
        footer={
          <>
            <Button type="button" variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={copyMonth.isPending}
              onClick={handleCopy}
            >
              {copyMonth.isPending ? "Copying..." : "Copy"}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Field>
            <FieldLabel>Copy to (YYYY-MM)</FieldLabel>
            <Input
              value={copy.target}
              onChange={(event) =>
                setUi((current) => ({
                  ...current,
                  copy: { ...current.copy, target: event.target.value },
                }))
              }
            />
          </Field>
          <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
            <div className="text-sm font-bold">Overwrite existing dates</div>
            <Switch
              checked={copy.overwrite}
              onCheckedChange={(overwrite) =>
                setUi((current) => ({
                  ...current,
                  copy: { ...current.copy, overwrite },
                }))
              }
            />
          </div>
        </div>
      </CustomDialog>

      <CustomDialog
        open={dialog === "apply"}
        onOpenChange={(open) =>
          setUi((current) => ({ ...current, dialog: open ? "apply" : null }))
        }
        trigger={null}
        title="Apply to other tours"
        showDone={false}
        footer={
          <>
            <Button type="button" variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={applyToTours.isPending || apply.ids.length === 0}
              onClick={handleApply}
            >
              {applyToTours.isPending
                ? "Applying..."
                : `Apply to ${apply.ids.length}`}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field>
              <FieldLabel>From</FieldLabel>
              <Input
                type="date"
                value={apply.from}
                onChange={(event) =>
                  setUi((current) => ({
                    ...current,
                    apply: { ...current.apply, from: event.target.value },
                  }))
                }
              />
            </Field>
            <Field>
              <FieldLabel>To</FieldLabel>
              <Input
                type="date"
                value={apply.to}
                onChange={(event) =>
                  setUi((current) => ({
                    ...current,
                    apply: { ...current.apply, to: event.target.value },
                  }))
                }
              />
            </Field>
          </div>
          <div className="max-h-56 space-y-2 overflow-y-auto">
            {otherTours.map((tour) => (
              <label
                key={tour.id}
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-border px-3 py-2.5"
              >
                <input
                  type="checkbox"
                  checked={apply.ids.includes(tour.id)}
                  onChange={() =>
                    setUi((current) => ({
                      ...current,
                      apply: {
                        ...current.apply,
                        ids: current.apply.ids.includes(tour.id)
                          ? current.apply.ids.filter((id) => id !== tour.id)
                          : [...current.apply.ids, tour.id],
                      },
                    }))
                  }
                />
                <span className="text-sm font-medium">{tour.title}</span>
              </label>
            ))}
            {otherTours.length === 0 ? (
              <p className="text-xs text-muted-foreground">No other tours.</p>
            ) : null}
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
            <div className="text-sm font-bold">Overwrite</div>
            <Switch
              checked={apply.overwrite}
              onCheckedChange={(overwrite) =>
                setUi((current) => ({
                  ...current,
                  apply: { ...current.apply, overwrite },
                }))
              }
            />
          </div>
        </div>
      </CustomDialog>

      <CustomDialog
        open={dialog === "rule"}
        onOpenChange={(open) =>
          setUi((current) => ({ ...current, dialog: open ? "rule" : null }))
        }
        trigger={null}
        title={editingRule ? "Edit rule" : "Add recurring rule"}
        showDone={false}
        footer={
          <>
            <Button type="button" variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={
                !ruleForm.name.trim() ||
                createRule.isPending ||
                updateRule.isPending
              }
              onClick={handleSaveRule}
            >
              {editingRule ? "Save" : "Add rule"}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Field>
            <FieldLabel>Rule name</FieldLabel>
            <Input
              value={ruleForm.name}
              onChange={(event) =>
                setUi((current) => ({
                  ...current,
                  ruleForm: { ...current.ruleForm, name: event.target.value },
                }))
              }
            />
          </Field>
          <Field>
            <FieldLabel>Category</FieldLabel>
            <Select
              items={CATEGORY_ITEMS}
              value={ruleForm.category}
              onValueChange={(value) => {
                if (
                  value === "SEASONAL" ||
                  value === "RELIGIOUS_OBSERVANCE" ||
                  value === "CUSTOM"
                ) {
                  setUi((current) => ({
                    ...current,
                    ruleForm: { ...current.ruleForm, category: value },
                  }))
                }
              }}
            >
              <SelectTrigger className="h-10 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SEASONAL">Seasonal</SelectItem>
                <SelectItem value="RELIGIOUS_OBSERVANCE">
                  Religious observance
                </SelectItem>
                <SelectItem value="CUSTOM">Custom</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field>
              <FieldLabel>From</FieldLabel>
              <Input
                type="date"
                value={ruleForm.dateRangeStart}
                onChange={(event) =>
                  setUi((current) => ({
                    ...current,
                    ruleForm: {
                      ...current.ruleForm,
                      dateRangeStart: event.target.value,
                    },
                  }))
                }
              />
            </Field>
            <Field>
              <FieldLabel>To</FieldLabel>
              <Input
                type="date"
                value={ruleForm.dateRangeEnd}
                onChange={(event) =>
                  setUi((current) => ({
                    ...current,
                    ruleForm: {
                      ...current.ruleForm,
                      dateRangeEnd: event.target.value,
                    },
                  }))
                }
              />
            </Field>
          </div>
          <Field>
            <FieldLabel>Effect</FieldLabel>
            <Select
              items={EFFECT_ITEMS}
              value={ruleForm.effectType}
              onValueChange={(value) => {
                if (
                  value === "BLOCK" ||
                  value === "ADJUST_PRICE" ||
                  value === "ADJUST_CAPACITY" ||
                  value === "SHIFT_TIME"
                ) {
                  setUi((current) => ({
                    ...current,
                    ruleForm: { ...current.ruleForm, effectType: value },
                  }))
                }
              }}
            >
              <SelectTrigger className="h-10 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BLOCK">Block</SelectItem>
                <SelectItem value="ADJUST_PRICE">Adjust price</SelectItem>
                <SelectItem value="ADJUST_CAPACITY">Adjust capacity</SelectItem>
                <SelectItem value="SHIFT_TIME">Shift time</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          {ruleForm.effectType === "ADJUST_PRICE" ? (
            <Field>
              <FieldLabel>Price adjustment (%)</FieldLabel>
              <Input
                type="number"
                value={ruleForm.priceAdjustmentValue ?? ""}
                onChange={(event) =>
                  setUi((current) => ({
                    ...current,
                    ruleForm: {
                      ...current.ruleForm,
                      priceAdjustmentMode: "PERCENTAGE",
                      priceAdjustmentValue: Number(event.target.value) || 0,
                    },
                  }))
                }
              />
            </Field>
          ) : null}
          {ruleForm.effectType === "ADJUST_CAPACITY" ? (
            <Field>
              <FieldLabel>Capacity adjustment</FieldLabel>
              <Input
                type="number"
                value={ruleForm.capacityAdjustmentValue ?? ""}
                onChange={(event) =>
                  setUi((current) => ({
                    ...current,
                    ruleForm: {
                      ...current.ruleForm,
                      capacityAdjustmentMode: "FLAT_AMOUNT",
                      capacityAdjustmentValue: Number(event.target.value) || 0,
                    },
                  }))
                }
              />
            </Field>
          ) : null}
          {ruleForm.effectType === "SHIFT_TIME" ? (
            <div className="grid grid-cols-2 gap-3">
              <Field>
                <FieldLabel>Start</FieldLabel>
                <Input
                  type="time"
                  value={ruleForm.shiftedStartTime ?? ""}
                  onChange={(event) =>
                    setUi((current) => ({
                      ...current,
                      ruleForm: {
                        ...current.ruleForm,
                        shiftedStartTime: event.target.value,
                      },
                    }))
                  }
                />
              </Field>
              <Field>
                <FieldLabel>End</FieldLabel>
                <Input
                  type="time"
                  value={ruleForm.shiftedEndTime ?? ""}
                  onChange={(event) =>
                    setUi((current) => ({
                      ...current,
                      ruleForm: {
                        ...current.ruleForm,
                        shiftedEndTime: event.target.value,
                      },
                    }))
                  }
                />
              </Field>
            </div>
          ) : null}
        </div>
      </CustomDialog>
    </div>
  )
}
