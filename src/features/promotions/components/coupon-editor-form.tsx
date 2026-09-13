import { Sparkles, TicketPercent } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
import { Textarea } from "@/components/ui/textarea"
import {
  couponDisplayStatus,
  DISPLAY_STATUS_CLASS,
  DISPLAY_STATUS_LABEL,
  formatCouponValue,
} from "@/features/promotions/components/utils"
import type { CouponFormState } from "@/features/promotions/coupon-form"
import { cn } from "@/lib/utils"
import type { DiscountType } from "@/store/server/promotions/typed"
import type { TourCategory } from "@/store/server/tours/typed"
import type { TourSummary } from "@/store/server/tours/typed"

const DISCOUNT_TYPES: Array<{ value: DiscountType; label: string }> = [
  { value: "PERCENTAGE", label: "Percentage" },
  { value: "FIXED_AMOUNT", label: "Fixed amount" },
]

const SCOPE_ITEMS = {
  ALL_TOURS: "All Tours",
  CATEGORY: "Specific category",
  SPECIFIC_TOUR: "Specific tour(s)",
} as const

type CouponEditorFormProps = {
  form: CouponFormState
  onChange: (form: CouponFormState) => void
  categories: TourCategory[]
  tours: TourSummary[]
  generatingCode: boolean
  onGenerateCode: () => void
}

function ToggleRow({
  title,
  desc,
  checked,
  onChange,
}: {
  title: string
  desc: string
  checked: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-muted/60 px-4 py-3">
      <div>
        <div className="text-sm font-bold text-foreground">{title}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  )
}

export function CouponEditorForm({
  form,
  onChange,
  categories,
  tours,
  generatingCode,
  onGenerateCode,
}: CouponEditorFormProps) {
  const patch = (next: Partial<CouponFormState>) =>
    onChange({ ...form, ...next })
  const preview = couponDisplayStatus({
    isManuallyDisabled: form.isManuallyDisabled,
    status: "ACTIVE",
    endDate: form.endDate || undefined,
    noEndDate: form.noEndDate,
    unlimitedUses: form.unlimitedUses,
    totalUsesAllowed: form.unlimitedUses
      ? undefined
      : Number(form.totalUsesAllowed) || undefined,
    usedCount: form.usedCount,
    startDate: form.startDate,
  })
  const usageLabel = form.unlimitedUses
    ? `${form.usedCount} used`
    : `${form.usedCount} of ${form.totalUsesAllowed || 100} used`
  const categoryItems = Object.fromEntries(
    categories.map((category) => [category.id, category.name])
  )
  const tourItems = Object.fromEntries(
    tours.map((tour) => [tour.id, tour.title])
  )
  const value = Number(form.value)
  const previewValue = Number.isNaN(value) ? 0 : value

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Offer details</CardTitle>
            <CardDescription>
              Set the customer-facing code, amount, and where this offer
              applies.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <Field>
              <FieldLabel>Coupon code</FieldLabel>
              <div className="flex gap-2">
                <Input
                  value={form.code}
                  onChange={(event) =>
                    patch({ code: event.target.value.toUpperCase() })
                  }
                  placeholder="SUMMER25"
                />
                <Button
                  type="button"
                  variant="outline"
                  disabled={generatingCode}
                  onClick={onGenerateCode}
                >
                  <Sparkles />
                  {generatingCode ? "Generating…" : "Generate"}
                </Button>
              </div>
            </Field>

            <Field>
              <FieldLabel>Discount type</FieldLabel>
              <div className="grid grid-cols-2 gap-2">
                {DISCOUNT_TYPES.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => patch({ discountType: type.value })}
                    className={cn(
                      "rounded-lg border px-4 py-2.5 text-sm font-bold",
                      form.discountType === type.value
                        ? "border-primary bg-primary-soft text-primary"
                        : "border-border bg-card text-muted-foreground hover:bg-muted"
                    )}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel>
                  {form.discountType === "PERCENTAGE" ? "% off" : "AED off"}
                </FieldLabel>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.value}
                  onChange={(event) => patch({ value: event.target.value })}
                />
              </Field>
              <Field>
                <FieldLabel>Minimum spend (AED)</FieldLabel>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="No minimum"
                  value={form.minSpend}
                  onChange={(event) => patch({ minSpend: event.target.value })}
                />
              </Field>
            </div>

            <Field>
              <FieldLabel>Applies to</FieldLabel>
              <Select
                items={SCOPE_ITEMS}
                value={form.scopeType}
                onValueChange={(value) => {
                  if (
                    value === "ALL_TOURS" ||
                    value === "CATEGORY" ||
                    value === "SPECIFIC_TOUR"
                  ) {
                    patch({
                      scopeType: value,
                      scopeRefId: value === "ALL_TOURS" ? "" : form.scopeRefId,
                    })
                  }
                }}
              >
                <SelectTrigger className="h-10 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL_TOURS">All Tours</SelectItem>
                  <SelectItem value="CATEGORY">Specific category</SelectItem>
                  <SelectItem value="SPECIFIC_TOUR">
                    Specific tour(s)
                  </SelectItem>
                </SelectContent>
              </Select>
            </Field>

            {form.scopeType === "CATEGORY" ? (
              <Field>
                <FieldLabel>Categories</FieldLabel>
                <Select
                  items={categoryItems}
                  value={form.scopeRefId || null}
                  onValueChange={(value) => {
                    if (typeof value === "string") {
                      patch({ scopeRefId: value })
                    }
                  }}
                >
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.parent?.name
                          ? `${category.name} (${category.parent.name})`
                          : category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            ) : null}

            {form.scopeType === "SPECIFIC_TOUR" ? (
              <Field>
                <FieldLabel>Tours</FieldLabel>
                <Select
                  items={tourItems}
                  value={form.scopeRefId || null}
                  onValueChange={(value) => {
                    if (typeof value === "string") {
                      patch({ scopeRefId: value })
                    }
                  }}
                >
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue placeholder="Select a tour" />
                  </SelectTrigger>
                  <SelectContent>
                    {tours.map((tour) => (
                      <SelectItem key={tour.id} value={tour.id}>
                        {tour.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Validity & usage</CardTitle>
            <CardDescription>
              Controls are evaluated automatically at checkout.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel>Start date</FieldLabel>
                <Input
                  type="date"
                  value={form.startDate}
                  onChange={(event) => patch({ startDate: event.target.value })}
                />
              </Field>
              <Field>
                <FieldLabel>End date</FieldLabel>
                <Input
                  type="date"
                  disabled={form.noEndDate}
                  value={form.endDate}
                  onChange={(event) => patch({ endDate: event.target.value })}
                />
              </Field>
            </div>

            <ToggleRow
              title="No end date"
              desc="Keep the offer valid until manually disabled."
              checked={form.noEndDate}
              onChange={(noEndDate) => patch({ noEndDate })}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel>Total uses allowed</FieldLabel>
                <Input
                  type="number"
                  min="1"
                  disabled={form.unlimitedUses}
                  placeholder="100"
                  value={form.totalUsesAllowed}
                  onChange={(event) =>
                    patch({ totalUsesAllowed: event.target.value })
                  }
                />
              </Field>
              <Field>
                <FieldLabel>Uses per customer</FieldLabel>
                <Input
                  type="number"
                  min="1"
                  value={form.usesPerCustomer}
                  onChange={(event) =>
                    patch({ usesPerCustomer: event.target.value })
                  }
                />
              </Field>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <ToggleRow
                title="Unlimited uses"
                desc="No overall redemption cap."
                checked={form.unlimitedUses}
                onChange={(unlimitedUses) => patch({ unlimitedUses })}
              />
              <ToggleRow
                title="First-time customers only"
                desc="Applies to each customer's first booking."
                checked={form.firstTimeCustomersOnly}
                onChange={(firstTimeCustomersOnly) =>
                  patch({ firstTimeCustomersOnly })
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer message</CardTitle>
            <CardDescription>
              Shown when a code is expired or has reached its redemption limit.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Field>
              <FieldLabel>
                Message shown for an expired or exhausted code
              </FieldLabel>
              <Textarea
                rows={3}
                value={form.expiredOrExhaustedMessage}
                onChange={(event) =>
                  patch({ expiredOrExhaustedMessage: event.target.value })
                }
              />
            </Field>
          </CardContent>
        </Card>
      </div>

      <aside className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TicketPercent className="size-5 text-primary" />
              Live status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg bg-muted/70 p-4">
              <Badge
                className={cn(
                  "border-transparent font-bold",
                  DISPLAY_STATUS_CLASS[preview]
                )}
              >
                {DISPLAY_STATUS_LABEL[preview]}
              </Badge>
              <p className="mt-3 text-sm font-bold text-foreground">
                {formatCouponValue(form.discountType, previewValue)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {SCOPE_ITEMS[form.scopeType]} · {usageLabel}
              </p>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              Status changes automatically as dates and limits are reached.
              Disable always takes precedence.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <ToggleRow
              title="Disable this coupon"
              desc="Immediately prevents new redemptions regardless of dates or limits."
              checked={form.isManuallyDisabled}
              onChange={(isManuallyDisabled) => patch({ isManuallyDisabled })}
            />
          </CardContent>
        </Card>
      </aside>
    </div>
  )
}
