import { Copy, History } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import type { TourFormState } from "@/features/tours/create/tour-form"
import { cn } from "@/lib/utils"
import { useAuditLogs } from "@/store/server/tours/availability"
import type { BookingMode, TourResponse, TourStatus } from "@/store/server/tours/typed"

const BOOKING_MODES: Array<{ value: BookingMode; label: string }> = [
  { value: "SHARED", label: "Book Online" },
  { value: "PRIVATE", label: "Inquiry Only" },
  { value: "BOTH", label: "Both" },
]

const PUBLISH_STATUSES: Array<{ value: TourStatus; label: string }> = [
  { value: "PUBLISHED", label: "Published" },
  { value: "DRAFT", label: "Draft" },
  { value: "SCHEDULED", label: "Scheduled" },
]

function PillGroup<T extends string>({
  items,
  value,
  onChange,
}: {
  items: Array<{ value: T; label: string }>
  value: T
  onChange: (value: T) => void
}) {
  return (
    <div className="mt-1 flex flex-wrap gap-2">
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          onClick={() => onChange(item.value)}
          className={cn(
            "rounded-lg px-4 py-2 text-xs font-bold transition-colors",
            value === item.value
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-primary-soft hover:text-primary"
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}

export function SettingsTab({
  form,
  onChange,
  createdTour,
}: {
  form: TourFormState
  onChange: (form: TourFormState) => void
  createdTour?: TourResponse
}) {
  const privateEnabled =
    form.bookingMode === "PRIVATE" || form.bookingMode === "BOTH"
  const audit = useAuditLogs({
    entityType: "TOUR",
    entityId: createdTour?.id,
    enabled: Boolean(createdTour?.id),
  })
  const entries = audit.data?.content ?? []

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-black tracking-wider text-muted-foreground uppercase">
              Booking Behaviour
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field>
              <FieldLabel>Booking Mode</FieldLabel>
              <PillGroup
                items={BOOKING_MODES}
                value={form.bookingMode}
                onChange={(bookingMode) => onChange({ ...form, bookingMode })}
              />
            </Field>
            <div className="flex items-center justify-between rounded-lg bg-muted/70 px-4 py-3">
              <div>
                <div className="text-sm font-bold">Instant Confirmation</div>
                <div className="text-xs text-muted-foreground">
                  Off = manual approval required
                </div>
              </div>
              <Switch
                checked={form.instantConfirmation}
                onCheckedChange={(instantConfirmation) =>
                  onChange({ ...form, instantConfirmation })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field>
                <FieldLabel>Min. guests / booking</FieldLabel>
                <Input
                  type="number"
                  min={1}
                  value={form.minGuestsPerBooking}
                  onChange={(event) =>
                    onChange({
                      ...form,
                      minGuestsPerBooking: event.target.value,
                    })
                  }
                />
              </Field>
              <Field>
                <FieldLabel>Max. guests / booking</FieldLabel>
                <Input
                  type="number"
                  min={1}
                  value={form.maxGuestsPerBooking}
                  onChange={(event) =>
                    onChange({
                      ...form,
                      maxGuestsPerBooking: event.target.value,
                    })
                  }
                />
              </Field>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-muted/70 px-4 py-3">
              <div>
                <div className="text-sm font-bold">Private Tour Option</div>
                <div className="text-xs text-muted-foreground">
                  Enables flat private-tour price
                </div>
              </div>
              <Switch
                checked={privateEnabled}
                onCheckedChange={(enabled) =>
                  onChange({
                    ...form,
                    bookingMode: enabled
                      ? form.bookingMode === "SHARED"
                        ? "BOTH"
                        : form.bookingMode
                      : "SHARED",
                  })
                }
              />
            </div>
            {privateEnabled ? (
              <Field>
                <FieldLabel>Private tour flat price (AED)</FieldLabel>
                <Input
                  type="number"
                  min={0}
                  value={form.privateTourPrice}
                  onChange={(event) =>
                    onChange({ ...form, privateTourPrice: event.target.value })
                  }
                />
              </Field>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-black tracking-wider text-muted-foreground uppercase">
              Publishing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Field>
              <FieldLabel>Publish status</FieldLabel>
              <PillGroup
                items={PUBLISH_STATUSES}
                value={form.status}
                onChange={(status) => onChange({ ...form, status })}
              />
            </Field>
            {form.status === "SCHEDULED" ? (
              <Field>
                <FieldLabel>Schedule date & time</FieldLabel>
                <Input
                  type="datetime-local"
                  value={form.scheduledPublishAt}
                  onChange={(event) =>
                    onChange({
                      ...form,
                      scheduledPublishAt: event.target.value,
                    })
                  }
                />
              </Field>
            ) : null}
            {(
              [
                ["isAttraction", "Attraction", form.isAttraction],
                ["isHot", "Hot tour", form.isHot],
                [
                  "hotelPickupIncluded",
                  "Hotel pickup included",
                  form.hotelPickupIncluded,
                ],
              ] as const
            ).map(([key, label, checked]) => (
              <div
                key={key}
                className="flex items-center justify-between rounded-lg bg-muted/70 px-4 py-3"
              >
                <div className="text-sm font-bold">{label}</div>
                <Switch
                  checked={checked}
                  onCheckedChange={(value) =>
                    onChange({ ...form, [key]: value })
                  }
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Copy className="size-4 text-muted-foreground" />
              Duplicate tour
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Creates a new Draft pre-filled from this tour&apos;s current
              settings.
            </p>
            <Button
              type="button"
              variant="outline"
              className="mt-3 w-full border-input"
              disabled
            >
              <Copy />
              Duplicate as Draft
            </Button>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Available after the tour is saved.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <History className="size-4 text-muted-foreground" />
              Change Log
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Read-only audit trail of edits to this tour.
            </p>
            <div className="mt-3 space-y-0">
              {entries.map((entry, index) => (
                <div
                  key={entry.id}
                  className="relative flex gap-3 pb-4 last:pb-0"
                >
                  <div className="flex flex-col items-center">
                    <div className="mt-1 size-2 shrink-0 rounded-full bg-primary" />
                    {index < entries.length - 1 ? (
                      <div className="w-px flex-1 bg-border" />
                    ) : null}
                  </div>
                  <div className="-mt-0.5 text-xs">
                    <div className="font-bold text-foreground">
                      {entry.action ?? "Updated tour"}
                    </div>
                    <div className="mt-0.5 text-muted-foreground">
                      {entry.createdAt
                        ? new Date(entry.createdAt).toLocaleString()
                        : "—"}
                    </div>
                  </div>
                </div>
              ))}
              {entries.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  {createdTour
                    ? "No audit entries yet."
                    : "Save the tour first to see the change log."}
                </p>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
