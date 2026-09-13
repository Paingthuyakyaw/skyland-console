import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CustomDialog } from "@/components/custom-dialog"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { TourFormState } from "@/features/tours/create/tour-form"
import {
  useCreatePricingRule,
  usePricingRules,
} from "@/store/server/tours/pricing"
import type {
  PricingAdjustmentType,
  PricingRuleType,
} from "@/store/server/tours/typed"

const RULE_TYPE_ITEMS = {
  ALL_YEAR: "All year",
  DATE_RANGE: "Date range",
  WEEKDAY_PATTERN: "Weekday pattern",
  SINGLE_DATE: "Single date",
} satisfies Record<PricingRuleType, string>

const ADJUSTMENT_ITEMS = {
  PERCENTAGE: "Percentage",
  FIXED_OVERRIDE: "Fixed override",
} satisfies Record<PricingAdjustmentType, string>

export function PricingTab({
  form,
  onChange,
  packageId,
}: {
  form: TourFormState
  onChange: (form: TourFormState) => void
  packageId?: string
}) {
  const { data: rules = [], isPending } = usePricingRules(packageId)
  const createRule = useCreatePricingRule(packageId)
  const [ruleDraft, setRuleDraft] = useState({
    open: false,
    name: "",
    ruleType: "DATE_RANGE" as PricingRuleType,
    adjustmentType: "PERCENTAGE" as PricingAdjustmentType,
    adjustmentValue: "10",
    startDate: "",
    endDate: "",
    singleDate: "",
  })

  const resetRuleDraft = () => {
    setRuleDraft({
      open: false,
      name: "",
      ruleType: "DATE_RANGE",
      adjustmentType: "PERCENTAGE",
      adjustmentValue: "10",
      startDate: "",
      endDate: "",
      singleDate: "",
    })
  }

  const handleCreateRule = () => {
    if (!packageId || !ruleDraft.name.trim()) return

    createRule.mutate(
      {
        timeslotPackageId: packageId,
        payload: {
          name: ruleDraft.name.trim(),
          ruleType: ruleDraft.ruleType,
          adjustmentType: ruleDraft.adjustmentType,
          adjustmentValue: Number(ruleDraft.adjustmentValue) || 0,
          priority: rules.length + 1,
          active: true,
          startDate: ruleDraft.startDate || undefined,
          endDate: ruleDraft.endDate || undefined,
          singleDate: ruleDraft.singleDate || undefined,
        },
      },
      {
        onSuccess: resetRuleDraft,
      }
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Precedence
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Base Price → Group Tier → Seasonal Rule → Date Override → Promo Code
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <Badge variant="secondary">Base</Badge>
            <CardTitle>Per-tour Price</CardTitle>
            <CardDescription>Standard adult price in AED.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Field>
              <FieldLabel>Adult (AED)</FieldLabel>
              <Input
                type="number"
                min={0}
                value={form.adultPrice}
                onChange={(event) =>
                  onChange({ ...form, adultPrice: event.target.value })
                }
              />
            </Field>
            <div className="rounded-lg bg-muted/40 px-3 py-2">
              <div className="text-[11px] text-muted-foreground">
                Live customer price
              </div>
              <div className="text-lg font-black">
                AED {form.adultPrice || "—"}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Badge variant="outline">Traveller Type</Badge>
            <CardTitle>Pax Tiers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(
              [
                ["Child", "childPrice", form.childPrice],
                ["Infant", "infantPrice", form.infantPrice],
                ["Senior", "seniorPrice", form.seniorPrice],
              ] as const
            ).map(([label, key, value]) => (
              <div key={key} className="flex items-center gap-2">
                <span className="w-14 text-xs font-bold text-muted-foreground">
                  {label}
                </span>
                <Input
                  type="number"
                  min={0}
                  value={value}
                  onChange={(event) =>
                    onChange({ ...form, [key]: event.target.value })
                  }
                />
                <span className="text-xs text-muted-foreground">AED</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Badge variant="secondary">Volume</Badge>
            <CardTitle>Group Tiers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(
              [
                ["4+", "groupPrice4", form.groupPrice4],
                ["10+", "groupPrice10", form.groupPrice10],
                ["20+", "groupPrice20", form.groupPrice20],
              ] as const
            ).map(([label, key, value]) => (
              <div key={key} className="flex items-center gap-2">
                <span className="w-10 text-xs font-bold text-muted-foreground">
                  {label}
                </span>
                <Input
                  type="number"
                  min={0}
                  value={value}
                  onChange={(event) =>
                    onChange({ ...form, [key]: event.target.value })
                  }
                />
                <span className="text-xs text-muted-foreground">AED</span>
              </div>
            ))}
            <Field>
              <FieldLabel>Private tour (flat rate)</FieldLabel>
              <Input
                type="number"
                min={0}
                value={form.privateTourPrice}
                onChange={(event) =>
                  onChange({ ...form, privateTourPrice: event.target.value })
                }
              />
            </Field>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Seasonal & date-specific pricing</CardTitle>
            <CardDescription>
              {packageId
                ? "Rules apply after the tour is created."
                : "Save the tour first to add seasonal pricing rules."}
            </CardDescription>
          </div>
          <Button
            type="button"
            size="sm"
            disabled={!packageId}
            onClick={() => setRuleDraft((current) => ({ ...current, open: true }))}
          >
            Add rule
          </Button>
        </CardHeader>
        <CardContent>
          {!packageId ? (
            <p className="text-sm text-muted-foreground">
              Create the tour to attach seasonal rules to its timeslot package.
            </p>
          ) : isPending ? (
            <p className="text-sm text-muted-foreground">Loading rules...</p>
          ) : rules.length === 0 ? (
            <p className="text-sm text-muted-foreground">No seasonal rules yet.</p>
          ) : (
            <div className="space-y-2">
              {rules.map((rule) => (
                <div
                  key={rule.id}
                  className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
                >
                  <div>
                    <div className="text-sm font-bold">{rule.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {rule.ruleType} · {rule.adjustmentType} {rule.adjustmentValue}
                    </div>
                  </div>
                  <Badge variant={rule.active ? "default" : "secondary"}>
                    {rule.active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <CustomDialog
        open={ruleDraft.open}
        onOpenChange={(open) =>
          setRuleDraft((current) =>
            open ? { ...current, open: true } : { ...current, open: false }
          )
        }
        trigger={null}
        title="Add pricing rule"
        showDone={false}
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setRuleDraft((current) => ({ ...current, open: false }))
              }
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={createRule.isPending || !ruleDraft.name.trim()}
              onClick={handleCreateRule}
            >
              {createRule.isPending ? "Saving..." : "Add rule"}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Field>
            <FieldLabel>Rule name</FieldLabel>
            <Input
              value={ruleDraft.name}
              onChange={(event) =>
                setRuleDraft((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
            />
          </Field>
          <Field>
            <FieldLabel>Type</FieldLabel>
            <Select
              items={RULE_TYPE_ITEMS}
              value={ruleDraft.ruleType}
              onValueChange={(value) => {
                if (
                  value === "ALL_YEAR" ||
                  value === "DATE_RANGE" ||
                  value === "WEEKDAY_PATTERN" ||
                  value === "SINGLE_DATE"
                ) {
                  setRuleDraft((current) => ({ ...current, ruleType: value }))
                }
              }}
            >
              <SelectTrigger className="h-10 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL_YEAR">All year</SelectItem>
                <SelectItem value="DATE_RANGE">Date range</SelectItem>
                <SelectItem value="WEEKDAY_PATTERN">Weekday pattern</SelectItem>
                <SelectItem value="SINGLE_DATE">Single date</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          {ruleDraft.ruleType === "DATE_RANGE" ||
          ruleDraft.ruleType === "WEEKDAY_PATTERN" ? (
            <div className="grid grid-cols-2 gap-3">
              <Field>
                <FieldLabel>From</FieldLabel>
                <Input
                  type="date"
                  value={ruleDraft.startDate}
                  onChange={(event) =>
                    setRuleDraft((current) => ({
                      ...current,
                      startDate: event.target.value,
                    }))
                  }
                />
              </Field>
              <Field>
                <FieldLabel>To</FieldLabel>
                <Input
                  type="date"
                  value={ruleDraft.endDate}
                  onChange={(event) =>
                    setRuleDraft((current) => ({
                      ...current,
                      endDate: event.target.value,
                    }))
                  }
                />
              </Field>
            </div>
          ) : null}
          {ruleDraft.ruleType === "SINGLE_DATE" ? (
            <Field>
              <FieldLabel>Date</FieldLabel>
              <Input
                type="date"
                value={ruleDraft.singleDate}
                onChange={(event) =>
                  setRuleDraft((current) => ({
                    ...current,
                    singleDate: event.target.value,
                  }))
                }
              />
            </Field>
          ) : null}
          <Field>
            <FieldLabel>Adjustment</FieldLabel>
            <Select
              items={ADJUSTMENT_ITEMS}
              value={ruleDraft.adjustmentType}
              onValueChange={(value) => {
                if (value === "PERCENTAGE" || value === "FIXED_OVERRIDE") {
                  setRuleDraft((current) => ({
                    ...current,
                    adjustmentType: value,
                  }))
                }
              }}
            >
              <SelectTrigger className="h-10 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                <SelectItem value="FIXED_OVERRIDE">Fixed override</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel>Value</FieldLabel>
            <Input
              type="number"
              value={ruleDraft.adjustmentValue}
              onChange={(event) =>
                setRuleDraft((current) => ({
                  ...current,
                  adjustmentValue: event.target.value,
                }))
              }
            />
          </Field>
        </div>
      </CustomDialog>
    </div>
  )
}
