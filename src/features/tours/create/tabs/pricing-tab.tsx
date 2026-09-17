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

export function PricingTab({ packageId }: { packageId?: string }) {
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
          <p className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
            Precedence
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Base Price → Group Tier → Seasonal Rule → Date Override → Promo Code
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Seasonal & date-specific pricing</CardTitle>
            <CardDescription>
              {packageId
                ? "Rules apply to this timeslot package."
                : "Save the tour first to add seasonal pricing rules."}
            </CardDescription>
          </div>
          <Button
            type="button"
            size="sm"
            disabled={!packageId}
            onClick={() =>
              setRuleDraft((current) => ({ ...current, open: true }))
            }
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
                      {rule.ruleType} · {rule.adjustmentType}{" "}
                      {rule.adjustmentValue}
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
                <DatePicker
                  value={ruleDraft.startDate}
                  onChange={(startDate) =>
                    setRuleDraft((current) => ({
                      ...current,
                      startDate,
                    }))
                  }
                />
              </Field>
              <Field>
                <FieldLabel>To</FieldLabel>
                <DatePicker
                  value={ruleDraft.endDate}
                  onChange={(endDate) =>
                    setRuleDraft((current) => ({
                      ...current,
                      endDate,
                    }))
                  }
                />
              </Field>
            </div>
          ) : null}
          {ruleDraft.ruleType === "SINGLE_DATE" ? (
            <Field>
              <FieldLabel>Date</FieldLabel>
              <DatePicker
                value={ruleDraft.singleDate}
                onChange={(singleDate) =>
                  setRuleDraft((current) => ({
                    ...current,
                    singleDate,
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
