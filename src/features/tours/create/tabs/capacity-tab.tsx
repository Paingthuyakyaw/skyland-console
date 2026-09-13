import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import type { TourFormState } from "@/features/tours/create/tour-form"

export function CapacityTab({
  form,
  onChange,
}: {
  form: TourFormState
  onChange: (form: TourFormState) => void
}) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Capacity Rules</CardTitle>
          <CardDescription>
            Operating guardrails. Per-date ceilings are set in Availability after
            the tour is created.
          </CardDescription>
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
            <p className="text-xs text-muted-foreground">
              Departures below this get a Needs Review flag.
            </p>
          </Field>
          <Field>
            <FieldLabel>Overbooking allowance</FieldLabel>
            <Input
              type="number"
              min={0}
              value={form.overbookingAllowance}
              onChange={(event) =>
                onChange({ ...form, overbookingAllowance: event.target.value })
              }
            />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cut-off & Hold Rules</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
        </CardContent>
      </Card>
    </div>
  )
}
