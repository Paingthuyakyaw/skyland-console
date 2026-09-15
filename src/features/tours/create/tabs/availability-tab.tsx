import {
  AlertTriangle,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  GripVertical,
  History,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react"
import { useMemo, useState } from "react"

import { CustomDialog } from "@/components/custom-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import {
  useAuditLogs,
  useAvailabilityCalendar,
  useAvailabilityDay,
  useAvailabilityRules,
  useBulkUpdateAvailability,
  useCreateAvailabilityRule,
  useDeleteAvailabilityRule,
  useReorderAvailabilityRules,
  useUpdateAvailabilityRule,
} from "@/store/server/tours/availability"
import type {
  AdjustmentMode,
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

type CalendarUiStatus = AvailabilityStatus | "NOT_CONFIGURED"
type AvailabilitySubTab = "calendar" | "rules"
type AvailabilityDialog = "bulk" | "rule" | null

type RuleFormState = RuleRequest & {
  applyToAll: boolean
}

type BulkSlotState = {
  unlimited: boolean
  capacity: string
  blocked: boolean
}

type AvailabilityUi = {
  subTab: AvailabilitySubTab
  year: number
  month: number
  selectedDate: string | null
  dialog: AvailabilityDialog
  editingRule: RuleResponse | null
  ruleForm: RuleFormState
  dragRuleId: string | null
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

const CATEGORY_LABELS: Record<RuleCategory, string> = {
  SEASONAL: "Seasonal",
  RELIGIOUS_OBSERVANCE: "Religious Observance",
  CUSTOM: "Custom",
}

const CATEGORY_COLORS: Record<RuleCategory, string> = {
  SEASONAL: "bg-sky-100 text-sky-800",
  RELIGIOUS_OBSERVANCE: "bg-orange-100 text-orange-800",
  CUSTOM: "bg-muted text-muted-foreground",
}

const CAPACITY_MODE_ITEMS = {
  PERCENTAGE: "Percentage",
  FLAT_AMOUNT: "Flat amount",
} satisfies Record<AdjustmentMode, string>

const RULE_EFFECT_ITEMS = {
  BLOCK: "Block, close timeslots to new bookings",
  ADJUST_CAPACITY: "Adjust capacity, change seat count",
  SHIFT_TIME: "Shift time, move start and end time",
} satisfies Record<Exclude<RuleEffectType, "ADJUST_PRICE">, string>

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

function emptyRule(): RuleFormState {
  const today = new Date()
  const start = dateKey(today.getFullYear(), today.getMonth(), today.getDate())
  const end = dateKey(
    today.getFullYear(),
    today.getMonth(),
    new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
  )
  return {
    name: "",
    category: "SEASONAL",
    dateRangeStart: start,
    dateRangeEnd: end,
    daysOfWeek: [],
    targetWindowIds: [],
    effectType: "BLOCK",
    capacityAdjustmentMode: "FLAT_AMOUNT",
    capacityAdjustmentValue: 0,
    shiftedStartTime: "",
    shiftedEndTime: "",
    priority: 1,
    active: true,
    applyToAll: true,
  }
}

function ruleToForm(rule: RuleResponse): RuleFormState {
  return {
    name: rule.name,
    category: rule.category,
    dateRangeStart: rule.dateRangeStart,
    dateRangeEnd: rule.dateRangeEnd,
    daysOfWeek: rule.daysOfWeek ?? [],
    targetWindowIds: rule.targetWindowIds ?? [],
    effectType:
      rule.effectType === "ADJUST_PRICE" ? "BLOCK" : rule.effectType,
    priceAdjustmentMode: rule.priceAdjustmentMode,
    priceAdjustmentValue: rule.priceAdjustmentValue,
    capacityAdjustmentMode: rule.capacityAdjustmentMode ?? "FLAT_AMOUNT",
    capacityAdjustmentValue: rule.capacityAdjustmentValue ?? 0,
    shiftedStartTime: rule.shiftedStartTime ?? "",
    shiftedEndTime: rule.shiftedEndTime ?? "",
    priority: rule.priority,
    active: rule.active ?? true,
    applyToAll: !rule.targetWindowIds?.length,
  }
}

function buildRuleRequest(
  form: RuleFormState,
  priority: number
): RuleRequest {
  const request: RuleRequest = {
    name: form.name.trim(),
    category: form.category,
    dateRangeStart: form.dateRangeStart,
    dateRangeEnd: form.dateRangeEnd,
    effectType: form.effectType,
    priority,
    active: form.active ?? true,
  }

  if (form.daysOfWeek && form.daysOfWeek.length > 0) {
    request.daysOfWeek = form.daysOfWeek
  }
  if (!form.applyToAll && form.targetWindowIds && form.targetWindowIds.length > 0) {
    request.targetWindowIds = form.targetWindowIds
  }
  if (form.effectType === "ADJUST_CAPACITY") {
    request.capacityAdjustmentMode = form.capacityAdjustmentMode ?? "FLAT_AMOUNT"
    request.capacityAdjustmentValue = form.capacityAdjustmentValue ?? 0
  }
  if (form.effectType === "SHIFT_TIME") {
    if (form.shiftedStartTime) request.shiftedStartTime = form.shiftedStartTime
    if (form.shiftedEndTime) request.shiftedEndTime = form.shiftedEndTime
  }

  return request
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
    [
      "Confirmed",
      String(day.confirmedQuantity ?? day.bookedCount ?? 0),
    ],
    ["Held", String(day.heldQuantity ?? 0)],
    ["Reserved", String(day.reservedQuantity ?? 0)],
  ]
}

function windowStatRows(window: CalendarWindowResponse): [string, string][] {
  return [
    ["Cap", window.capacity == null ? "∞" : String(window.capacity)],
    [
      "Rem",
      window.remainingCapacity == null ? "∞" : String(window.remainingCapacity),
    ],
    [
      "Conf",
      String(window.confirmedQuantity ?? window.bookedCount ?? 0),
    ],
    ["Held", String(window.heldQuantity ?? 0)],
    ["Res", String(window.reservedQuantity ?? 0)],
  ]
}

function ruleWeekdaySummary(rule: RuleResponse) {
  if (!rule.daysOfWeek?.length) return "All days"
  const labels = CALENDAR_WEEKDAYS.filter((day) =>
    rule.daysOfWeek?.includes(day.value)
  ).map((day) => day.label)
  return labels.join(", ") || "All days"
}

function ruleTimeslotSummary(
  rule: RuleResponse,
  timeslots: TimeslotResponse[]
) {
  if (!rule.targetWindowIds?.length) return "All timeslots"
  const names = timeslots
    .filter((slot) => rule.targetWindowIds?.includes(slot.id))
    .map((slot) => slot.name)
  return names.length > 0 ? names.join(", ") : "Selected timeslots"
}

function ruleEffectSummary(rule: RuleResponse) {
  if (rule.effectType === "BLOCK") return "Block"
  if (rule.effectType === "SHIFT_TIME") {
    return `Shift → ${rule.shiftedStartTime || "?"} – ${rule.shiftedEndTime || "?"}`
  }
  if (rule.effectType === "ADJUST_CAPACITY") {
    const value = rule.capacityAdjustmentValue ?? 0
    const sign = value >= 0 ? "+" : ""
    return rule.capacityAdjustmentMode === "PERCENTAGE"
      ? `${sign}${value}%`
      : `${sign}${value} seats`
  }
  if (rule.effectType === "ADJUST_PRICE") {
    const value = rule.priceAdjustmentValue ?? 0
    const sign = value >= 0 ? "+" : ""
    return `${sign}${value}${rule.priceAdjustmentMode === "PERCENTAGE" ? "%" : ""} price`
  }
  return "—"
}

function createAvailabilityUi(): AvailabilityUi {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  return {
    subTab: "calendar",
    year,
    month,
    selectedDate: null,
    dialog: null,
    editingRule: null,
    ruleForm: emptyRule(),
    dragRuleId: null,
    bulk: {
      mode: "DATE_RANGE",
      from: dateKey(year, month, 1),
      to: dateKey(year, month, daysInMonth),
      weekdays: ["FRIDAY", "SATURDAY"],
      dayUnlimited: false,
      dayMax: "60",
      slots: {},
    },
  }
}

function defaultBulkSlot(): BulkSlotState {
  return { unlimited: false, capacity: "20", blocked: false }
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
    subTab,
    year,
    month,
    selectedDate,
    dialog,
    editingRule,
    ruleForm,
    dragRuleId,
    bulk,
  } = ui
  const currentMonth = monthKey(year, month)
  const today = new Date()

  const calendar = useAvailabilityCalendar(tourId, currentMonth)
  const dayDetail = useAvailabilityDay(tourId, selectedDate)
  const rulesQuery = useAvailabilityRules(tourId)
  const audit = useAuditLogs({
    entityType: "TOUR",
    entityId: tourId,
    enabled: Boolean(tourId),
  })

  const createRule = useCreateAvailabilityRule(tourId)
  const updateRule = useUpdateAvailabilityRule(tourId)
  const deleteRule = useDeleteAvailabilityRule(tourId)
  const reorderRules = useReorderAvailabilityRules(tourId)
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

  const rules = rulesQuery.data ?? []

  if (!tourId) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <CalendarDays className="size-10 text-muted-foreground/40" />
          <div>
            <p className="text-sm font-bold">Save the tour to configure availability</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Availability needs a saved tour ID and timeslot IDs before calendar
              dates, capacity, and advanced rules can be configured.
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
          dayMax: "60",
          slots: Object.fromEntries(
            timeslots.map((slot) => [slot.id, defaultBulkSlot()])
          ),
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
            weekdays:
              bulk.mode === "WEEKDAY_PATTERN" ? bulk.weekdays : undefined,
          },
          maxCapacityForDay: bulk.dayUnlimited
            ? undefined
            : Number(bulk.dayMax) || undefined,
          windows: timeslots.map((slot) => {
            const state = bulk.slots[slot.id] ?? defaultBulkSlot()
            return {
              timeslotId: slot.id,
              blocked: state.blocked || undefined,
              maxCapacity:
                state.blocked || state.unlimited
                  ? undefined
                  : Number(state.capacity) || undefined,
            }
          }),
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
      ruleForm: ruleToForm(rule),
    }))
  }

  const handleSaveRule = () => {
    if (!ruleForm.name.trim() || !ruleForm.dateRangeStart || !ruleForm.dateRangeEnd) {
      return
    }
    const priority = editingRule
      ? (editingRule.priority ?? rules.findIndex((rule) => rule.id === editingRule.id) + 1)
      : rules.length + 1
    const payload = buildRuleRequest(ruleForm, Math.max(1, priority))

    if (editingRule) {
      updateRule.mutate(
        {
          tourId,
          ruleId: editingRule.id,
          payload: {
            version: editingRule.version ?? 0,
            rule: payload,
          },
        },
        { onSuccess: closeDialog }
      )
      return
    }

    createRule.mutate({ tourId, rule: payload }, { onSuccess: closeDialog })
  }

  const handleToggleRule = (rule: RuleResponse, active: boolean) => {
    updateRule.mutate({
      tourId,
      ruleId: rule.id,
      payload: {
        version: rule.version ?? 0,
        rule: {
          ...buildRuleRequest(ruleToForm(rule), rule.priority ?? 1),
          active,
        },
      },
    })
  }

  const handleDropRule = (targetId: string) => {
    if (!dragRuleId || dragRuleId === targetId) {
      setUi((current) => ({ ...current, dragRuleId: null }))
      return
    }
    const from = rules.findIndex((rule) => rule.id === dragRuleId)
    const to = rules.findIndex((rule) => rule.id === targetId)
    if (from < 0 || to < 0) {
      setUi((current) => ({ ...current, dragRuleId: null }))
      return
    }
    const next = [...rules]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    setUi((current) => ({ ...current, dragRuleId: null }))
    reorderRules.mutate({
      tourId,
      ruleIds: next.map((rule) => rule.id),
    })
  }

  const selected = selectedDate
    ? (dayDetail.data ?? daysByDate.get(selectedDate))
    : undefined
  const selectedStatus = dayStatus(selected)
  const showShiftPreview = Boolean(
    ruleForm.shiftedStartTime || ruleForm.shiftedEndTime
  )
  const shiftPreview = `${ruleForm.shiftedStartTime || "?"} – ${ruleForm.shiftedEndTime || "?"}`

  const patchRuleForm = (patch: Partial<RuleFormState>) => {
    setUi((current) => ({
      ...current,
      ruleForm: { ...current.ruleForm, ...patch },
    }))
  }

  return (
    <div className="space-y-4">
      <Tabs
        value={subTab}
        onValueChange={(value) => {
          if (value === "calendar" || value === "rules") {
            setUi((current) => ({ ...current, subTab: value }))
          }
        }}
        className="gap-4"
      >
        <TabsList variant="line" className="w-full justify-start border-b border-border">
          <TabsTrigger value="calendar">Calendar and Capacity</TabsTrigger>
          <TabsTrigger value="rules">Advanced Rules</TabsTrigger>
        </TabsList>

        {subTab === "calendar" ? (
          <TabsContent value="calendar" className="space-y-4">
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
                          className="py-1 text-center text-[11px] font-bold uppercase tracking-wider text-muted-foreground"
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
                                <span className="mt-0.5 text-[10px] font-bold leading-tight">
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
                          setUi((current) => ({ ...current, selectedDate: null }))
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
                            <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
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

                      <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
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
                                {windowStatRows(window).map(([label, value]) => (
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
                          Click any calendar date for a read-only view of its
                          timeslot breakdown and capacity figures.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
        ) : null}

        {subTab === "rules" ? (
          <TabsContent value="rules" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-start justify-between gap-3">
                <div>
                  <CardTitle>Advanced Rules</CardTitle>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Rules override calendar settings and are applied in priority
                    order (1 = highest). Saving recalculates effective availability.
                  </p>
                </div>
                <Button type="button" size="sm" variant="outline" onClick={openCreateRule}>
                  <Plus className="size-3.5" />
                  Add Rule
                </Button>
              </CardHeader>
              <CardContent className="space-y-2">
                {rules.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-input py-8 text-center text-sm text-muted-foreground">
                    No rules yet. Rules can block dates, adjust timeslot capacity,
                    or shift departure times.
                  </div>
                ) : null}
                {rules.map((rule, index) => {
                  const active = rule.active ?? true
                  const priority = rule.priority ?? index + 1
                  return (
                    <div
                      key={rule.id}
                      draggable
                      onDragStart={() =>
                        setUi((current) => ({ ...current, dragRuleId: rule.id }))
                      }
                      onDragOver={(event) => {
                        event.preventDefault()
                      }}
                      onDrop={(event) => {
                        event.preventDefault()
                        handleDropRule(rule.id)
                      }}
                      onDragEnd={() =>
                        setUi((current) => ({ ...current, dragRuleId: null }))
                      }
                      className={cn(
                        "flex items-center gap-3 rounded-lg border px-4 py-3",
                        active
                          ? "border-border bg-card"
                          : "border-border/50 bg-muted/20 opacity-70",
                        dragRuleId === rule.id && "ring-2 ring-primary/40"
                      )}
                    >
                      <GripVertical className="size-4 shrink-0 cursor-grab text-muted-foreground/40" />
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-[11px] font-black text-muted-foreground">
                        {priority}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={cn(
                              "text-sm font-bold",
                              active ? "text-foreground" : "text-muted-foreground"
                            )}
                          >
                            {rule.name}
                          </span>
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 text-[10px] font-bold",
                              CATEGORY_COLORS[rule.category]
                            )}
                          >
                            {CATEGORY_LABELS[rule.category]}
                          </span>
                        </div>
                        <div className="mt-0.5 flex flex-wrap gap-x-3 text-[11px] text-muted-foreground">
                          <span>
                            {ruleWeekdaySummary(rule)} · {rule.dateRangeStart} –{" "}
                            {rule.dateRangeEnd}
                          </span>
                          <span>·</span>
                          <span>{ruleTimeslotSummary(rule, timeslots)}</span>
                          <span>·</span>
                          <span className="font-bold text-foreground">
                            {ruleEffectSummary(rule)}
                          </span>
                        </div>
                      </div>
                      <Switch
                        checked={active}
                        disabled={updateRule.isPending}
                        onCheckedChange={(checked) =>
                          handleToggleRule(rule, checked)
                        }
                      />
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
                        disabled={deleteRule.isPending}
                        onClick={() =>
                          deleteRule.mutate({ tourId, ruleId: rule.id })
                        }
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            <Card className="border-primary/15 bg-primary/5">
              <CardContent className="flex items-start gap-3 pt-4">
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-primary" />
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  <span className="font-bold text-foreground">Execution order:</span>{" "}
                  Rules are evaluated by priority (1 = highest). A BLOCK rule at
                  priority 1 prevents lower-priority rules from applying on the
                  same dates. ADJUST_CAPACITY has no numeric effect on timeslots
                  configured as Unlimited.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        ) : null}
      </Tabs>

      <CustomDialog
        open={dialog === "bulk"}
        onOpenChange={(open) =>
          setUi((current) => ({ ...current, dialog: open ? "bulk" : null }))
        }
        trigger={null}
        title="Bulk update availability"
        description="Configure capacity and blocked status across a date range or weekday pattern."
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
                {mode === "DATE_RANGE" ? "Date Range" : "Weekday Pattern"}
              </button>
            ))}
          </div>

          {bulk.mode === "DATE_RANGE" ? (
            <div className="grid grid-cols-2 gap-3">
              <Field>
                <FieldLabel>Start date</FieldLabel>
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
                <FieldLabel>End date</FieldLabel>
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
          ) : (
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
                      setUi((current) => ({
                        ...current,
                        bulk: {
                          ...current.bulk,
                          weekdays: current.bulk.weekdays.includes(day.value)
                            ? current.bulk.weekdays.filter(
                                (item) => item !== day.value
                              )
                            : [...current.bulk.weekdays, day.value],
                        },
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
          )}

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
                    setUi((current) => ({
                      ...current,
                      bulk: { ...current.bulk, dayUnlimited },
                    }))
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
                  value={bulk.dayMax}
                  onChange={(event) =>
                    setUi((current) => ({
                      ...current,
                      bulk: { ...current.bulk, dayMax: event.target.value },
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
                  setUi((current) => ({
                    ...current,
                    bulk: {
                      ...current.bulk,
                      slots: {
                        ...current.bulk.slots,
                        [slot.id]: {
                          ...(current.bulk.slots[slot.id] ?? defaultBulkSlot()),
                          ...patch,
                        },
                      },
                    },
                  }))
                }
                return (
                  <div key={slot.id} className="rounded-lg border border-border p-3">
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
                    {!state.blocked ? (
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
                              value={state.capacity}
                              onChange={(event) =>
                                patchSlot({ capacity: event.target.value })
                              }
                            />
                          </Field>
                        ) : null}
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

      <CustomDialog
        open={dialog === "rule"}
        onOpenChange={(open) =>
          setUi((current) => ({ ...current, dialog: open ? "rule" : null }))
        }
        trigger={null}
        title={editingRule ? "Edit availability rule" : "Add availability rule"}
        description="Rules override per-date calendar settings and are applied in priority order."
        showDone={false}
        contentClassName="sm:max-w-lg"
        footer={
          <>
            <Button type="button" variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={
                !ruleForm.name.trim() ||
                !ruleForm.dateRangeStart ||
                !ruleForm.dateRangeEnd ||
                createRule.isPending ||
                updateRule.isPending
              }
              onClick={handleSaveRule}
            >
              {editingRule ? "Save changes" : "Add rule"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field>
            <FieldLabel>Rule name</FieldLabel>
            <Input
              value={ruleForm.name}
              placeholder="e.g. Summer Closure"
              onChange={(event) => patchRuleForm({ name: event.target.value })}
            />
          </Field>
          <Field>
            <FieldLabel>Category</FieldLabel>
            <Select
              items={CATEGORY_LABELS}
              value={ruleForm.category}
              onValueChange={(value) => {
                if (
                  value === "SEASONAL" ||
                  value === "RELIGIOUS_OBSERVANCE" ||
                  value === "CUSTOM"
                ) {
                  patchRuleForm({ category: value })
                }
              }}
            >
              <SelectTrigger className="h-10 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SEASONAL">Seasonal</SelectItem>
                <SelectItem value="RELIGIOUS_OBSERVANCE">
                  Religious Observance
                </SelectItem>
                <SelectItem value="CUSTOM">Custom</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field>
              <FieldLabel>Start date</FieldLabel>
              <Input
                type="date"
                value={ruleForm.dateRangeStart}
                onChange={(event) =>
                  patchRuleForm({ dateRangeStart: event.target.value })
                }
              />
            </Field>
            <Field>
              <FieldLabel>End date</FieldLabel>
              <Input
                type="date"
                value={ruleForm.dateRangeEnd}
                onChange={(event) =>
                  patchRuleForm({ dateRangeEnd: event.target.value })
                }
              />
            </Field>
          </div>
          <div>
            <Label>
              Weekdays{" "}
              <span className="text-[11px] font-normal text-muted-foreground">
                (optional, empty means every day in range)
              </span>
            </Label>
            <div className="mt-1.5 flex gap-1.5">
              {CALENDAR_WEEKDAYS.map((day) => {
                const selectedWeekday = ruleForm.daysOfWeek?.includes(day.value)
                return (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => {
                      const current = ruleForm.daysOfWeek ?? []
                      patchRuleForm({
                        daysOfWeek: selectedWeekday
                          ? current.filter((item) => item !== day.value)
                          : [...current, day.value],
                      })
                    }}
                    className={cn(
                      "h-9 flex-1 rounded-lg text-xs font-bold",
                      selectedWeekday
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {day.label}
                  </button>
                )
              })}
            </div>
          </div>
          <div className="space-y-3 rounded-lg border border-border p-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-bold">Apply to all timeslots</div>
              <Switch
                checked={ruleForm.applyToAll}
                onCheckedChange={(applyToAll) =>
                  patchRuleForm({
                    applyToAll,
                    targetWindowIds: applyToAll ? [] : ruleForm.targetWindowIds,
                  })
                }
              />
            </div>
            {!ruleForm.applyToAll ? (
              <div className="space-y-1.5">
                {timeslots.map((slot) => {
                  const checked = ruleForm.targetWindowIds?.includes(slot.id)
                  return (
                    <label
                      key={slot.id}
                      className="flex cursor-pointer items-center gap-3 rounded-lg border border-border px-3 py-2.5"
                    >
                      <input
                        type="checkbox"
                        checked={Boolean(checked)}
                        onChange={() => {
                          const current = ruleForm.targetWindowIds ?? []
                          patchRuleForm({
                            targetWindowIds: checked
                              ? current.filter((id) => id !== slot.id)
                              : [...current, slot.id],
                          })
                        }}
                      />
                      <div>
                        <div className="text-sm font-medium">{slot.name}</div>
                        <div className="text-[11px] text-muted-foreground">
                          {slot.startTime} – {slot.endTime}
                        </div>
                      </div>
                    </label>
                  )
                })}
                {timeslots.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    No timeslots available.
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
          <Field>
            <FieldLabel>Effect</FieldLabel>
            <Select
              items={RULE_EFFECT_ITEMS}
              value={
                ruleForm.effectType === "ADJUST_PRICE"
                  ? "BLOCK"
                  : ruleForm.effectType
              }
              onValueChange={(value) => {
                if (
                  value === "BLOCK" ||
                  value === "ADJUST_CAPACITY" ||
                  value === "SHIFT_TIME"
                ) {
                  patchRuleForm({ effectType: value })
                }
              }}
            >
              <SelectTrigger className="h-10 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BLOCK">
                  Block, close timeslots to new bookings
                </SelectItem>
                <SelectItem value="ADJUST_CAPACITY">
                  Adjust capacity, change seat count
                </SelectItem>
                <SelectItem value="SHIFT_TIME">
                  Shift time, move start and end time
                </SelectItem>
              </SelectContent>
            </Select>
          </Field>
          {ruleForm.effectType === "ADJUST_CAPACITY" ? (
            <div className="space-y-3 rounded-lg border border-border p-3">
              <Field>
                <FieldLabel>Adjustment mode</FieldLabel>
                <Select
                  items={CAPACITY_MODE_ITEMS}
                  value={ruleForm.capacityAdjustmentMode ?? "FLAT_AMOUNT"}
                  onValueChange={(value) => {
                    if (value === "PERCENTAGE" || value === "FLAT_AMOUNT") {
                      patchRuleForm({
                        capacityAdjustmentMode: value,
                      })
                    }
                  }}
                >
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENTAGE">
                      Percentage, e.g. -25 reduces by 25 percent
                    </SelectItem>
                    <SelectItem value="FLAT_AMOUNT">
                      Flat amount, e.g. +10 adds 10 seats
                    </SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel>
                  {ruleForm.capacityAdjustmentMode === "PERCENTAGE"
                    ? "Adjustment (percent)"
                    : "Adjustment (seats)"}
                </FieldLabel>
                <Input
                  type="number"
                  value={ruleForm.capacityAdjustmentValue ?? 0}
                  placeholder={
                    ruleForm.capacityAdjustmentMode === "PERCENTAGE"
                      ? "e.g. -25"
                      : "e.g. 10"
                  }
                  onChange={(event) =>
                    patchRuleForm({
                      capacityAdjustmentValue: Number(event.target.value) || 0,
                    })
                  }
                />
              </Field>
              <div className="flex items-start gap-2 rounded-lg bg-muted/50 px-3 py-2.5">
                <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber-600" />
                <p className="text-[11px] text-muted-foreground">
                  This adjustment affects only timeslots with a finite configured
                  capacity. It has no numeric effect on timeslots set to Unlimited.
                </p>
              </div>
            </div>
          ) : null}
          {ruleForm.effectType === "SHIFT_TIME" ? (
            <div className="space-y-3 rounded-lg border border-border p-3">
              <Field>
                <FieldLabel>Shifted start</FieldLabel>
                <Input
                  type="time"
                  value={ruleForm.shiftedStartTime ?? ""}
                  onChange={(event) =>
                    patchRuleForm({ shiftedStartTime: event.target.value })
                  }
                />
              </Field>
              <Field>
                <FieldLabel>Shifted finish</FieldLabel>
                <Input
                  type="time"
                  value={ruleForm.shiftedEndTime ?? ""}
                  onChange={(event) =>
                    patchRuleForm({ shiftedEndTime: event.target.value })
                  }
                />
              </Field>
              {showShiftPreview ? (
                <p className="rounded-lg bg-muted/50 px-3 py-2 text-xs">
                  <span className="font-bold">Preview: </span>
                  original times shift to{" "}
                  <span className="font-bold">{shiftPreview}</span>
                </p>
              ) : null}
            </div>
          ) : null}
          <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
            <div>
              <div className="text-sm font-bold">Active</div>
              <div className="text-[11px] text-muted-foreground">
                Inactive rules are stored but not applied
              </div>
            </div>
            <Switch
              checked={ruleForm.active ?? true}
              onCheckedChange={(active) => patchRuleForm({ active })}
            />
          </div>
        </div>
      </CustomDialog>
    </div>
  )
}
