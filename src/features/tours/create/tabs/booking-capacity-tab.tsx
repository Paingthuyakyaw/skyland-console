import { CalendarDays } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import type { TourFormState } from "@/features/tours/create/tour-form"
import { cn } from "@/lib/utils"
import type { BookingMode } from "@/store/server/tours/typed"

const BOOKING_MODES: Array<{ value: BookingMode; label: string }> = [
  { value: "SHARED", label: "Book Online" },
  { value: "PRIVATE", label: "Inquiry Only" },
  { value: "BOTH", label: "Both" },
]

export function BookingCapacityTab({
  form,
  onChange,
  onOpenAvailability,
}: {
  form: TourFormState
  onChange: (form: TourFormState) => void
  onOpenAvailability: () => void
}) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Capacity Rules</CardTitle>
          <p className="text-xs text-muted-foreground">
            Per-departure ceilings now live on each section in the Availability
            tab. These are the operating guardrails.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field>
            <FieldLabel>Minimum guests to operate</FieldLabel>
            <Input
              type="number"
              min={1}
              value={form.minGuestsToOperate}
              onChange={(event) =>
                onChange({ ...form, minGuestsToOperate: event.target.value })
              }
            />
            <p className="text-[11px] text-muted-foreground">
              Departures below this get a Needs Review flag.
            </p>
          </Field>
          <Field>
            <FieldLabel>Overbooking allowance</FieldLabel>
            <Input
              type="number"
              min={0}
              value={form.overbookingAllowance}
              placeholder="0"
              onChange={(event) =>
                onChange({ ...form, overbookingAllowance: event.target.value })
              }
            />
            <p className="text-[11px] text-muted-foreground">
              Extra seats sellable beyond a section&apos;s cap. Defaults to
              zero.
            </p>
          </Field>
          <Field>
            <FieldLabel>Booking cut-off (hours before departure)</FieldLabel>
            <Input
              type="number"
              min={0}
              value={form.bookingCutOffHours}
              onChange={(event) =>
                onChange({ ...form, bookingCutOffHours: event.target.value })
              }
            />
            <p className="text-[11px] text-muted-foreground">
              Bookings close {form.bookingCutOffHours || "0"} hours before
              departure. After cut-off, the tour switches to Inquiry Only.
            </p>
          </Field>
          <div className="flex items-center justify-between rounded-lg bg-muted/70 px-4 py-3">
            <div>
              <div className="text-sm font-bold">Same-day booking</div>
              <div className="text-xs text-muted-foreground">
                Allow bookings on the departure date
              </div>
            </div>
            <Switch
              checked={form.sameDayBookingAllowed}
              onCheckedChange={(sameDayBookingAllowed) =>
                onChange({ ...form, sameDayBookingAllowed })
              }
            />
          </div>
          <Field>
            <FieldLabel>Pay-on-arrival confirmation deadline (hours)</FieldLabel>
            <Input
              type="number"
              min={0}
              value={form.payOnArrivalConfirmationDeadline}
              onChange={(event) =>
                onChange({
                  ...form,
                  payOnArrivalConfirmationDeadline: event.target.value,
                })
              }
            />
          </Field>
          <div className="flex items-start gap-2.5 rounded-lg bg-primary-soft/50 px-3 py-2.5">
            <CalendarDays className="mt-0.5 size-4 shrink-0 text-primary" />
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              This is Tour booking policy; date-specific capacity is configured
              after creation in{" "}
              <button
                type="button"
                className="font-bold text-primary hover:underline"
                onClick={onOpenAvailability}
              >
                Availability
              </button>
              .
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-black tracking-wider text-muted-foreground uppercase">
            Booking Behaviour
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field>
            <FieldLabel>Booking Mode</FieldLabel>
            <div className="mt-1 flex flex-wrap gap-2">
              {BOOKING_MODES.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() =>
                    onChange({ ...form, bookingMode: item.value })
                  }
                  className={cn(
                    "rounded-lg px-4 py-2 text-xs font-bold transition-colors",
                    form.bookingMode === item.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-primary-soft hover:text-primary"
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
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
          <p className="text-[11px] text-muted-foreground">
            Maximum guests per booking must be equal to or greater than
            minimum guests per booking.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
