import { Check, ChevronRight, Clock, Copy, Plus, Trash2, X } from "lucide-react"
import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { StringListField } from "@/features/tours/create/components/string-list-field"
import { PricingTab } from "@/features/tours/create/tabs/pricing-tab"
import {
  createEmptyPackage,
  createEmptyTimeslot,
  type PackageDraft,
  type TimeslotDraft,
  type TourFormState,
} from "@/features/tours/create/tour-form"
import type { TourResponse } from "@/store/server/tours/typed"

function crossesMidnight(start: string, end: string) {
  return Boolean(start && end && end < start)
}

function CopyId({ id, label }: { id: string; label: string }) {
  const [copied, setCopied] = useState(false)

  return (
    <button
      type="button"
      title={`Copy ${label}`}
      className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-input bg-muted/50 px-2 py-0.5 font-mono text-[11px] text-muted-foreground hover:border-primary hover:text-primary"
      onClick={() => {
        void navigator.clipboard?.writeText(id)
        setCopied(true)
        window.setTimeout(() => setCopied(false), 1400)
      }}
    >
      <span className="text-[9px] font-bold tracking-wider uppercase">
        {label}
      </span>
      <span className="max-w-[168px] truncate">{id}</span>
      {copied ? <Check className="size-3 text-emerald-600" /> : <Copy className="size-3" />}
    </button>
  )
}

export function TimeslotsPackagesTab({
  form,
  onChange,
  createdTour,
}: {
  form: TourFormState
  onChange: (form: TourFormState) => void
  createdTour?: TourResponse
}) {
  const [pricingPackageId, setPricingPackageId] = useState<string | null>(null)
  const saved = Boolean(createdTour)
  const savedPackages = createdTour?.timeslots?.flatMap((slot) =>
    (slot.packages ?? []).map((pkg) => ({
      ...pkg,
      timeslotName: slot.name,
    }))
  )

  const updateSlot = (key: string, patch: Partial<TimeslotDraft>) => {
    onChange({
      ...form,
      timeslots: form.timeslots.map((slot) =>
        slot.key === key ? { ...slot, ...patch } : slot
      ),
    })
  }

  const updatePackage = (
    slotKey: string,
    packageKey: string,
    patch: Partial<PackageDraft>
  ) => {
    onChange({
      ...form,
      timeslots: form.timeslots.map((slot) =>
        slot.key !== slotKey
          ? slot
          : {
              ...slot,
              packages: slot.packages.map((pkg) =>
                pkg.key === packageKey ? { ...pkg, ...patch } : pkg
              ),
            }
      ),
    })
  }

  if (pricingPackageId) {
    return (
      <div className="space-y-4">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setPricingPackageId(null)}
        >
          Back to packages
        </Button>
        <PricingTab packageId={pricingPackageId} />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
      <div className="space-y-4 xl:col-span-3">
        <Card>
          <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>Tour → Timeslot → Timeslot Package</CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">
                Set standard checkout prices here. Package IDs and advanced
                pricing are available after the first save.
              </p>
            </div>
            <Badge variant="secondary">
              {saved ? "Aggregate update" : "Included in first save"}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap items-center gap-1.5 rounded-lg bg-muted/50 px-3 py-2 text-[11px] font-bold text-muted-foreground">
              <span className="rounded bg-primary-soft px-2 py-0.5 text-primary">
                Timeslot
              </span>
              <ChevronRight className="size-3" />
              <span className="rounded bg-muted px-2 py-0.5">
                Timeslot Package
              </span>
              <span className="ml-auto font-medium tracking-normal text-muted-foreground normal-case">
                Checkout pricing is resolved from the selected package.
              </span>
            </div>

            {form.timeslots.map((slot) => {
              const midnight = crossesMidnight(slot.startTime, slot.endTime)
              return (
                <div
                  key={slot.key}
                  className="overflow-hidden rounded-xl border border-border"
                >
                  <div className="flex flex-wrap items-center gap-2 border-b border-border bg-primary-soft/40 px-3 py-2.5">
                    <Clock className="size-4 shrink-0 text-primary" />
                    <input
                      value={slot.name}
                      placeholder="Timeslot name"
                      className="min-w-0 flex-1 bg-transparent text-sm font-bold text-foreground outline-none placeholder:text-muted-foreground/60"
                      onChange={(event) =>
                        updateSlot(slot.key, { name: event.target.value })
                      }
                    />
                    <Input
                      type="time"
                      value={slot.startTime}
                      className="h-8 w-[104px] px-2 text-xs"
                      onChange={(event) =>
                        updateSlot(slot.key, { startTime: event.target.value })
                      }
                    />
                    <span className="text-muted-foreground">–</span>
                    <Input
                      type="time"
                      value={slot.endTime}
                      className="h-8 w-[104px] px-2 text-xs"
                      onChange={(event) =>
                        updateSlot(slot.key, { endTime: event.target.value })
                      }
                    />
                    {midnight ? (
                      <Badge variant="outline" className="text-[10px]">
                        Crosses midnight
                      </Badge>
                    ) : null}
                    <span className="rounded-full bg-card px-2 py-0.5 text-[11px] font-bold text-muted-foreground">
                      {slot.packages.length} pkg
                    </span>
                    <button
                      type="button"
                      className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      onClick={() =>
                        onChange({
                          ...form,
                          timeslots: form.timeslots.filter(
                            (item) => item.key !== slot.key
                          ),
                        })
                      }
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>

                  <div className="space-y-2.5 bg-muted/20 p-3">
                    {slot.packages.map((pkg) => {
                      const savedPkg = savedPackages?.find(
                        (item) =>
                          item.name === pkg.name &&
                          item.timeslotName === slot.name
                      )
                      return (
                        <PackageCard
                          key={pkg.key}
                          pkg={pkg}
                          savedId={savedPkg?.id}
                          onChange={(patch) =>
                            updatePackage(slot.key, pkg.key, patch)
                          }
                          onFeature={(featured) => {
                            onChange({
                              ...form,
                              timeslots: form.timeslots.map((item) =>
                                item.key !== slot.key
                                  ? item
                                  : {
                                      ...item,
                                      packages: item.packages.map((entry) => ({
                                        ...entry,
                                        featured:
                                          entry.key === pkg.key
                                            ? featured
                                            : featured
                                              ? false
                                              : entry.featured,
                                      })),
                                    }
                              ),
                            })
                          }}
                          onRemove={() =>
                            updateSlot(slot.key, {
                              packages: slot.packages.filter(
                                (item) => item.key !== pkg.key
                              ),
                            })
                          }
                          onOpenPricing={
                            savedPkg?.id
                              ? () => setPricingPackageId(savedPkg.id)
                              : undefined
                          }
                        />
                      )
                    })}
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline"
                      onClick={() =>
                        updateSlot(slot.key, {
                          packages: [
                            ...slot.packages,
                            createEmptyPackage(slot.packages.length === 0),
                          ],
                        })
                      }
                    >
                      <Plus className="size-3.5" />
                      Add package to {slot.name || "timeslot"}
                    </button>
                  </div>
                </div>
              )
            })}

            <button
              type="button"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:underline"
              onClick={() =>
                onChange({
                  ...form,
                  timeslots: [...form.timeslots, createEmptyTimeslot()],
                })
              }
            >
              <Plus className="size-3.5" />
              Add Timeslot
            </button>
          </CardContent>
        </Card>
      </div>

      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Package pricing</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-muted-foreground">
            The selected package determines the final customer price. Calendar
            availability never exposes editable prices.
          </p>
          <div className="mt-4 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
            Timeslots, not calendar window IDs, are shown to staff throughout
            this editor.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function PackageCard({
  pkg,
  savedId,
  onChange,
  onFeature,
  onRemove,
  onOpenPricing,
}: {
  pkg: PackageDraft
  savedId?: string
  onChange: (patch: Partial<PackageDraft>) => void
  onFeature: (featured: boolean) => void
  onRemove: () => void
  onOpenPricing?: () => void
}) {
  const updateTier = (
    index: number,
    patch: { minPax?: number; pricePerPax?: number }
  ) => {
    onChange({
      groupPriceTiers: pkg.groupPriceTiers.map((tier, itemIndex) =>
        itemIndex === index ? { ...tier, ...patch } : tier
      ),
    })
  }

  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="mb-2.5 flex flex-wrap items-center gap-2">
        <span className="flex size-6 items-center justify-center rounded-md bg-muted text-[10px] font-black">
          PKG
        </span>
        <input
          value={pkg.name}
          placeholder="Package name"
          className="min-w-0 flex-1 bg-transparent text-sm font-bold text-foreground outline-none placeholder:text-muted-foreground/60"
          onChange={(event) => onChange({ name: event.target.value })}
        />
        {pkg.featured ? (
          <Badge variant="secondary" className="text-[10px] tracking-wider uppercase">
            Featured
          </Badge>
        ) : null}
        <button
          type="button"
          className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          onClick={onRemove}
        >
          <X className="size-4" />
        </button>
      </div>

      {savedId || onOpenPricing ? (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          {savedId ? <CopyId id={savedId} label="timeslotPackageId" /> : <span />}
          {onOpenPricing ? (
            <Button type="button" size="sm" variant="outline" onClick={onOpenPricing}>
              Advanced pricing
            </Button>
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-2.5 sm:grid-cols-2">
        <Field>
          <FieldLabel className="text-[11px] text-muted-foreground">
            Vehicle type
          </FieldLabel>
          <Input
            value={pkg.vehicleType}
            className="h-9"
            onChange={(event) => onChange({ vehicleType: event.target.value })}
          />
        </Field>
        <Field>
          <FieldLabel className="text-[11px] text-muted-foreground">
            Private tour price (AED)
          </FieldLabel>
          <Input
            type="number"
            min={0}
            value={pkg.privateTourPrice ?? 0}
            className="h-9"
            onChange={(event) =>
              onChange({ privateTourPrice: Number(event.target.value) || 0 })
            }
          />
        </Field>
      </div>

      <Field className="mt-2.5">
        <FieldLabel className="text-[11px] text-muted-foreground">
          Description
        </FieldLabel>
        <Input
          value={pkg.description}
          placeholder="Shown at checkout"
          className="h-9"
          onChange={(event) => onChange({ description: event.target.value })}
        />
      </Field>

      <div className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {(
          [
            ["Adult", "adultPrice", pkg.adultPrice],
            ["Child", "childPrice", pkg.childPrice ?? 0],
            ["Infant", "infantPrice", pkg.infantPrice ?? 0],
            ["Senior", "seniorPrice", pkg.seniorPrice ?? 0],
          ] as const
        ).map(([label, key, value]) => (
          <Field key={key}>
            <FieldLabel className="text-[11px] text-muted-foreground">
              {label} (AED)
            </FieldLabel>
            <Input
              type="number"
              min={0}
              value={value}
              className="h-9"
              onChange={(event) =>
                onChange({ [key]: Number(event.target.value) || 0 })
              }
            />
          </Field>
        ))}
      </div>

      <div className="mt-2.5 flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
        <span className="text-xs font-bold text-foreground">
          Featured package
        </span>
        <Switch checked={pkg.featured} onCheckedChange={onFeature} />
      </div>

      <div className="mt-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-muted-foreground">
            Group price tiers
          </span>
          <button
            type="button"
            className="text-xs font-bold text-primary hover:underline"
            onClick={() =>
              onChange({
                groupPriceTiers: [
                  ...pkg.groupPriceTiers,
                  { minPax: 10, pricePerPax: pkg.adultPrice },
                ],
              })
            }
          >
            Add tier
          </button>
        </div>
        {pkg.groupPriceTiers.map((tier, index) => (
          <div key={`${pkg.key}-tier-${index}`} className="flex items-center gap-2">
            <Input
              type="number"
              min={1}
              value={tier.minPax}
              className="h-8 w-20"
              onChange={(event) =>
                updateTier(index, { minPax: Number(event.target.value) || 1 })
              }
            />
            <span className="text-xs text-muted-foreground">pax</span>
            <Input
              type="number"
              min={0}
              value={tier.pricePerPax}
              className="h-8 flex-1"
              onChange={(event) =>
                updateTier(index, {
                  pricePerPax: Number(event.target.value) || 0,
                })
              }
            />
            <span className="text-xs text-muted-foreground">AED</span>
            <button
              type="button"
              className="rounded-md p-1 text-muted-foreground hover:text-destructive"
              onClick={() =>
                onChange({
                  groupPriceTiers: pkg.groupPriceTiers.filter(
                    (_, itemIndex) => itemIndex !== index
                  ),
                })
              }
            >
              <X className="size-3.5" />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-3">
        <StringListField
          label="Package checklist"
          values={pkg.checklist}
          onChange={(checklist) => onChange({ checklist })}
          placeholder="What this package includes"
          addLabel="Add checklist item"
        />
      </div>
    </div>
  )
}
