import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { CustomDialog } from "@/components/custom-dialog"
import { DatePicker } from "@/components/ui/date-picker"
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
import {
  useCreatePricingRule,
  usePricingRules,
  useUpdatePricingRule,
} from "@/store/server/tours/pricing"
import type {
  DatePrices,
  PricingRuleRequest,
  PricingRuleResponse,
  PricingRuleType,
  Weekday,
} from "@/store/server/tours/typed"

const RULE_TYPES: Record<PricingRuleType, string> = {
  SINGLE_DATE: "Single date",
  DATE_RANGE: "Date range",
  WEEKDAY_PATTERN: "Weekdays",
  ALL_YEAR: "All year",
}
const MODES = {
  INDIVIDUAL: "Individual prices (AED)",
  PERCENTAGE: "Percentage adjustment",
  FIXED_OVERRIDE: "One fixed rate for all passengers",
}
const PRICE_LABELS = {
  adult: "Adult",
  child: "Child",
  infant: "Infant",
  senior: "Senior",
  privateTour: "Private tour (one total)",
}
const WEEKDAYS: Weekday[] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
]
type Draft = {
  id?: string
  version?: number
  name: string
  ruleType: PricingRuleType
  startDate: string
  endDate: string
  singleDate: string
  weekdays: Weekday[]
  mode: keyof typeof MODES
  value: string
  priority: string
  active: boolean
  prices: Record<keyof DatePrices, string>
}
const emptyDraft = (): Draft => ({
  name: "",
  ruleType: "SINGLE_DATE",
  startDate: "",
  endDate: "",
  singleDate: "",
  weekdays: [],
  mode: "INDIVIDUAL",
  value: "10",
  priority: "0",
  active: true,
  prices: { adult: "", child: "", infant: "", senior: "", privateTour: "" },
})
function editDraft(rule: PricingRuleResponse): Draft {
  return {
    ...emptyDraft(),
    id: rule.id,
    version: rule.version,
    name: rule.name,
    ruleType: rule.ruleType,
    startDate: rule.startDate ?? "",
    endDate: rule.endDate ?? "",
    singleDate: rule.singleDate ?? "",
    weekdays: rule.weekdays ?? [],
    mode: rule.prices ? "INDIVIDUAL" : rule.adjustmentType,
    value: String(rule.adjustmentValue),
    priority: String(rule.priority),
    active: rule.active,
    prices: Object.fromEntries(
      Object.keys(PRICE_LABELS).map((key) => [
        key,
        rule.prices?.[key as keyof DatePrices] == null
          ? ""
          : String(rule.prices[key as keyof DatePrices]),
      ])
    ) as Draft["prices"],
  }
}
function period(rule: PricingRuleRequest) {
  if (rule.ruleType === "SINGLE_DATE") return rule.singleDate
  if (rule.ruleType === "DATE_RANGE")
    return `${rule.startDate} – ${rule.endDate} (inclusive)`
  if (rule.ruleType === "WEEKDAY_PATTERN")
    return rule.weekdays?.map((day) => day.slice(0, 3)).join(", ")
  return "All year"
}
function payload(draft: Draft): PricingRuleRequest | null {
  const priority = Number(draft.priority)
  if (
    !draft.name.trim() ||
    !draft.priority.trim() ||
    !Number.isInteger(priority) ||
    Math.abs(priority) > 2147483647
  )
    return null
  if (draft.ruleType === "SINGLE_DATE" && !draft.singleDate) return null
  if (
    draft.ruleType === "DATE_RANGE" &&
    (!draft.startDate || !draft.endDate || draft.endDate < draft.startDate)
  )
    return null
  if (draft.ruleType === "WEEKDAY_PATTERN" && !draft.weekdays.length)
    return null
  const prices: DatePrices = {}
  if (draft.mode === "INDIVIDUAL") {
    for (const key of Object.keys(PRICE_LABELS) as (keyof DatePrices)[]) {
      const input = draft.prices[key].trim()
      if (!input) continue
      if (!/^\d+(\.\d{1,2})?$/.test(input) || Number(input) > 9999999999.99)
        return null
      prices[key] = Number(input)
    }
    if (!Object.keys(prices).length) return null
  } else if (
    !draft.value.trim() ||
    !Number.isFinite(Number(draft.value)) ||
    Number(draft.value) < (draft.mode === "PERCENTAGE" ? -100 : 0)
  )
    return null
  return {
    name: draft.name.trim(),
    ruleType: draft.ruleType,
    priority,
    active: draft.active,
    ...(draft.ruleType === "SINGLE_DATE"
      ? { singleDate: draft.singleDate }
      : {}),
    ...(draft.ruleType === "DATE_RANGE"
      ? { startDate: draft.startDate, endDate: draft.endDate }
      : {}),
    ...(draft.ruleType === "WEEKDAY_PATTERN"
      ? { weekdays: draft.weekdays }
      : {}),
    adjustmentType: draft.mode === "INDIVIDUAL" ? "FIXED_OVERRIDE" : draft.mode,
    adjustmentValue: draft.mode === "INDIVIDUAL" ? 0 : Number(draft.value),
    ...(draft.mode === "INDIVIDUAL" ? { prices } : {}),
  }
}

export function PricingTab({ packageId }: { packageId?: string }) {
  const [page, setPage] = useState(0)
  const { data, isPending, isError } = usePricingRules(packageId, page)
  const create = useCreatePricingRule(packageId)
  const update = useUpdatePricingRule(packageId)
  const [draft, setDraft] = useState<Draft | null>(null)
  const patch = (value: Partial<Draft>) =>
    setDraft((current) => (current ? { ...current, ...value } : current))
  const busy = create.isPending || update.isPending
  const request = draft ? payload(draft) : null
  const save = () => {
    if (!packageId || !draft || !request) return
    const options = { onSuccess: () => setDraft(null) }
    if (draft.id && draft.version != null)
      update.mutate(
        { id: draft.id, version: draft.version, rule: request },
        options
      )
    else if (!draft.id)
      create.mutate({ timeslotPackageId: packageId, payload: request }, options)
  }
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6 text-sm text-muted-foreground">
          Default package prices → group tier → one matching date rule →
          promotion. A single date wins over a date range, then weekdays, then
          all year. Higher priority wins within the same type. Existing cart
          holds and bookings keep their saved prices.
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <div>
            <CardTitle>Date & seasonal prices</CardTitle>
            <CardDescription>
              Override this package’s defaults for travel dates, including
              holidays and peak seasons.
            </CardDescription>
          </div>
          <Button
            type="button"
            size="sm"
            disabled={!packageId}
            onClick={() => setDraft(emptyDraft())}
          >
            Add date price
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {!packageId ? (
            <p>Save the tour first to configure date prices.</p>
          ) : isPending ? (
            <p>Loading prices…</p>
          ) : isError ? (
            <p className="text-destructive">Unable to load pricing rules.</p>
          ) : !data?.content.length ? (
            <p className="text-sm text-muted-foreground">
              No date overrides. Default package prices apply.
            </p>
          ) : (
            data.content.map((rule) => (
              <div
                key={rule.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-4"
              >
                <div className="space-y-1">
                  <div className="text-sm font-bold">{rule.name}</div>
                  <p className="text-xs text-muted-foreground">
                    {period(rule)} · Priority {rule.priority}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {rule.prices
                      ? (Object.keys(PRICE_LABELS) as (keyof DatePrices)[])
                          .filter((key) => rule.prices?.[key] != null)
                          .map(
                            (key) =>
                              `${PRICE_LABELS[key]}: AED ${rule.prices![key]!.toFixed(2)}`
                          )
                          .join(" · ")
                      : `${rule.adjustmentType === "PERCENTAGE" ? `${rule.adjustmentValue}%` : `AED ${rule.adjustmentValue} per passenger / private total`}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={rule.active ? "default" : "secondary"}>
                    {rule.active ? "Active" : "Inactive"}
                  </Badge>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={rule.version == null}
                    onClick={() => setDraft(editDraft(rule))}
                  >
                    Edit
                  </Button>
                </div>
              </div>
            ))
          )}
          {data && data.totalPages > 1 ? (
            <div className="flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <span className="text-sm">
                {page + 1} / {data.totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                disabled={page + 1 >= data.totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>
      <CustomDialog
        open={draft !== null}
        onOpenChange={(open) => {
          if (!open && !busy) setDraft(null)
        }}
        trigger={null}
        title={draft?.id ? "Edit date price" : "Add date price"}
        showDone={false}
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={() => setDraft(null)}
            >
              Cancel
            </Button>
            <Button type="button" disabled={busy || !request} onClick={save}>
              {busy ? "Saving…" : "Save price rule"}
            </Button>
          </>
        }
      >
        {draft ? (
          <div className="space-y-4">
            <Field>
              <FieldLabel>Rule name</FieldLabel>
              <Input
                maxLength={160}
                value={draft.name}
                onChange={(event) => patch({ name: event.target.value })}
                placeholder="New Year’s Eve"
              />
            </Field>
            <Field>
              <FieldLabel>Travel dates</FieldLabel>
              <Select
                items={RULE_TYPES}
                value={draft.ruleType}
                onValueChange={(value) => {
                  if (value && value in RULE_TYPES)
                    patch({ ruleType: value as PricingRuleType })
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(RULE_TYPES).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            {draft.ruleType === "SINGLE_DATE" ? (
              <Field>
                <FieldLabel>Date</FieldLabel>
                <DatePicker
                  value={draft.singleDate}
                  onChange={(singleDate) => patch({ singleDate })}
                />
              </Field>
            ) : null}
            {draft.ruleType === "DATE_RANGE" ? (
              <div className="grid grid-cols-2 gap-3">
                <Field>
                  <FieldLabel>From (inclusive)</FieldLabel>
                  <DatePicker
                    value={draft.startDate}
                    onChange={(startDate) => patch({ startDate })}
                  />
                </Field>
                <Field>
                  <FieldLabel>To (inclusive)</FieldLabel>
                  <DatePicker
                    value={draft.endDate}
                    onChange={(endDate) => patch({ endDate })}
                  />
                </Field>
              </div>
            ) : null}
            {draft.ruleType === "WEEKDAY_PATTERN" ? (
              <div className="flex flex-wrap gap-3">
                {WEEKDAYS.map((day) => (
                  <label key={day} className="flex items-center gap-1 text-sm">
                    <input
                      type="checkbox"
                      checked={draft.weekdays.includes(day)}
                      onChange={(event) =>
                        patch({
                          weekdays: event.target.checked
                            ? [...draft.weekdays, day]
                            : draft.weekdays.filter((value) => value !== day),
                        })
                      }
                    />
                    {day.slice(0, 3)}
                  </label>
                ))}
              </div>
            ) : null}
            <Field>
              <FieldLabel>Pricing method</FieldLabel>
              <Select
                items={MODES}
                value={draft.mode}
                onValueChange={(value) => {
                  if (value && value in MODES)
                    patch({ mode: value as Draft["mode"] })
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(MODES).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            {draft.mode === "INDIVIDUAL" ? (
              <>
                <p className="text-xs text-muted-foreground">
                  Enter at least one price. Blank fields keep their default or
                  group price. Enter 0 for free admission. Private tour is a
                  separate flat amount.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {(Object.keys(PRICE_LABELS) as (keyof DatePrices)[]).map(
                    (key) => (
                      <Field key={key}>
                        <FieldLabel>{PRICE_LABELS[key]} (AED)</FieldLabel>
                        <Input
                          type="number"
                          min={0}
                          step="0.01"
                          placeholder="Keep default"
                          value={draft.prices[key]}
                          onChange={(event) =>
                            patch({
                              prices: {
                                ...draft.prices,
                                [key]: event.target.value,
                              },
                            })
                          }
                        />
                      </Field>
                    )
                  )}
                </div>
              </>
            ) : (
              <Field>
                <FieldLabel>
                  {draft.mode === "PERCENTAGE"
                    ? "Percentage (negative for discount)"
                    : "Fixed rate (AED)"}
                </FieldLabel>
                <Input
                  type="number"
                  min={draft.mode === "PERCENTAGE" ? -100 : 0}
                  step="0.01"
                  value={draft.value}
                  onChange={(event) => patch({ value: event.target.value })}
                />
              </Field>
            )}
            <Field>
              <FieldLabel>Priority</FieldLabel>
              <Input
                type="number"
                step={1}
                value={draft.priority}
                onChange={(event) => patch({ priority: event.target.value })}
              />
            </Field>
            <label className="flex items-center justify-between text-sm">
              Active
              <Switch
                checked={draft.active}
                onCheckedChange={(active) => patch({ active })}
              />
            </label>
          </div>
        ) : null}
      </CustomDialog>
    </div>
  )
}
