import { CustomDialog } from "@/components/custom-dialog"
import { Button } from "@/components/ui/button"
import type { ChangeImpactResponse } from "@/store/server/tours/typed"

type TourChangeImpactDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  impact: ChangeImpactResponse | null
  applying: boolean
  actionLabel: string
  onApply: () => void
  title?: string
  description?: string
  applyingLabel?: string
  impactUnavailableDescription?: string
}

function formatDate(value?: string) {
  if (!value) return "today"

  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date)
}

function hasAffectedBookings(impact: ChangeImpactResponse) {
  return (
    (impact.activeHolds ?? 0) > 0 ||
    (impact.pendingPaymentBookings ?? 0) > 0 ||
    (impact.confirmedBookings ?? 0) > 0
  )
}

function operationalAction(impact: ChangeImpactResponse) {
  switch (impact.requiredOperationalAction) {
    case "REBOOK_OR_CANCEL_CONFIRMED_BOOKINGS_REQUIRED":
      return "Follow up on the confirmed bookings after this change, including rebooking or cancellation where needed."
    case "RESOLVE_ACTIVE_HOLDS_AND_PENDING_PAYMENTS_REQUIRED":
      return "Review the active holds and pending payments after this change."
    default:
      return "No active holds or future bookings will be affected by this update."
  }
}

export function TourChangeImpactDialog({
  open,
  onOpenChange,
  impact,
  applying,
  actionLabel,
  onApply,
  title = "Tour change impact",
  description,
  applyingLabel = "Saving…",
  impactUnavailableDescription = "Reservation impact could not be calculated. You can still continue, but review active holds and confirmed bookings separately.",
}: TourChangeImpactDialogProps) {
  const hasAffected = impact ? hasAffectedBookings(impact) : false
  const counts = impact
    ? [
        { label: "Active holds", value: impact.activeHolds ?? 0 },
        { label: "Pending payment", value: impact.pendingPaymentBookings ?? 0 },
        { label: "Confirmed bookings", value: impact.confirmedBookings ?? 0 },
      ]
    : []

  return (
    <CustomDialog
      open={open}
      onOpenChange={onOpenChange}
      trigger={null}
      title={title}
      description={
        description ??
        (impact == null
          ? "Reservation impact could not be calculated. Review active holds and confirmed bookings before continuing."
          : hasAffected
            ? "Review the guest reservations that may be affected before continuing."
            : "This update is safe to apply to future departures.")
      }
      showDone={false}
      contentClassName="sm:max-w-lg"
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            disabled={applying}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="button" disabled={applying} onClick={onApply}>
            {applying ? applyingLabel : actionLabel}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {impact ? (
          <>
            <p
              role="alert"
              className={
                hasAffected
                  ? "rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm font-medium text-amber-800"
                  : "rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-800"
              }
            >
              {operationalAction(impact)}
            </p>

            <div className="grid grid-cols-3 gap-2">
              {counts.map((count) => (
                <div
                  key={count.label}
                  className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-center"
                >
                  <div className="text-lg font-bold tabular-nums">
                    {count.value}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {count.label}
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs text-muted-foreground">
              Impact is calculated for departures from{" "}
              {formatDate(impact.fromDate)}.
            </p>
          </>
        ) : (
          <p
            role="alert"
            className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm font-medium text-amber-800"
          >
            {impactUnavailableDescription}
          </p>
        )}
      </div>
    </CustomDialog>
  )
}
