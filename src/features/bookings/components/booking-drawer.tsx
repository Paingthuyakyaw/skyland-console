import { useEffect, useMemo, useState, type ReactNode } from "react"
import { Ban, User, X } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  BookingActionDialog,
  type BookingActionKind,
} from "@/features/bookings/components/booking-action-dialog"
import {
  BOOKING_STATUS_CLASS,
  BOOKING_STATUS_LABEL,
  canCancelBooking,
  canRefundBooking,
  formatBookingRef,
  formatDate,
  formatDateTime,
  formatMoney,
  guestBreakdown,
  guestCount,
  PAYMENT_STATUS_CLASS,
  PAYMENT_STATUS_LABEL,
  REFUND_STATUS_CLASS,
} from "@/features/bookings/components/utils"
import { cn } from "@/lib/utils"
import {
  useBooking,
  useCancelBooking,
  useRefundBooking,
} from "@/store/server/bookings/bookings"
import type { BookingItem } from "@/store/server/bookings/typed"
import { useTours } from "@/store/server/tours/tours"

type BookingDrawerProps = {
  bookingId: string | null
  onClose: () => void
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-medium text-foreground">
        {value}
      </span>
    </div>
  )
}

function DrawerSection({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <div>
      <h4 className="mb-1 text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
        {title}
      </h4>
      <div className="divide-y divide-border/70">{children}</div>
    </div>
  )
}

function itemTitle(item: BookingItem, tours: Map<string, string>) {
  if (item.tourId && tours.has(item.tourId)) {
    return tours.get(item.tourId)
  }
  return item.tourId ? `Tour ${formatBookingRef(item.tourId)}` : "Tour"
}

export function BookingDrawer({ bookingId, onClose }: BookingDrawerProps) {
  const open = Boolean(bookingId)
  const { data, isPending, isError } = useBooking(bookingId ?? "", open)
  const { data: toursPage } = useTours({ size: 100 })
  const cancelBooking = useCancelBooking()
  const refundBooking = useRefundBooking()
  const [action, setAction] = useState<BookingActionKind | null>(null)

  const tours = useMemo(() => {
    const names = new Map<string, string>()
    for (const tour of toursPage?.content ?? []) {
      names.set(tour.id, tour.title)
    }
    return names
  }, [toursPage?.content])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !action) onClose()
    }
    window.addEventListener("keydown", onKeyDown)
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onKeyDown)
      document.body.style.overflow = previous
    }
  }, [open, action, onClose])

  useEffect(() => {
    setAction(null)
  }, [bookingId])

  const summary = data?.summary
  const submitting = cancelBooking.isPending || refundBooking.isPending
  const showCancel = summary ? canCancelBooking(summary.bookingStatus) : false
  const showRefund = summary
    ? canRefundBooking(summary.bookingStatus, summary.paymentStatus)
    : false

  const handleAction = (reason: string) => {
    if (!summary) return
    if (typeof summary.version !== "number") {
      toast.error("This booking cannot be updated because it has no version.")
      return
    }

    const payload = {
      bookingId: summary.id,
      action: { version: summary.version, reason },
    }

    if (action === "cancel") {
      cancelBooking.mutate(payload, {
        onSuccess: () => setAction(null),
      })
      return
    }

    refundBooking.mutate(payload, {
      onSuccess: () => setAction(null),
    })
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        className="absolute inset-0 bg-black/20"
        aria-label="Close booking details"
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-drawer-title"
        className="absolute inset-y-0 right-0 flex w-full max-w-xl flex-col bg-card shadow-xl ring-1 ring-foreground/10"
      >
        {isPending ? (
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="text-lg font-black text-foreground">Booking</h2>
              <button
                type="button"
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
                onClick={onClose}
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="px-6 py-12 text-center text-sm text-muted-foreground">
              Loading booking…
            </p>
          </div>
        ) : null}

        {isError || (!isPending && !summary) ? (
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="text-lg font-black text-foreground">Booking</h2>
              <button
                type="button"
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
                onClick={onClose}
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="px-6 py-12 text-center text-sm text-destructive">
              Failed to load booking.
            </p>
          </div>
        ) : null}

        {summary ? (
          <>
            <div className="flex items-start justify-between border-b border-border px-6 py-4">
              <div>
                <div className="text-sm text-muted-foreground">
                  Bookings / {formatBookingRef(summary.id)}
                </div>
                <div className="mt-1.5 flex items-center gap-2">
                  <h2
                    id="booking-drawer-title"
                    className="text-xl font-black text-foreground"
                  >
                    {formatBookingRef(summary.id)}
                  </h2>
                  <Badge
                    className={cn(
                      "border-transparent font-bold",
                      BOOKING_STATUS_CLASS[summary.bookingStatus]
                    )}
                  >
                    {BOOKING_STATUS_LABEL[summary.bookingStatus]}
                  </Badge>
                </div>
              </div>
              <button
                type="button"
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
                onClick={onClose}
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
              <Card className="flex flex-row items-center gap-3 bg-muted/40 p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-soft text-primary">
                  <User className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-foreground">
                    {summary.customerName || "—"}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    {[summary.email, summary.phoneNumber]
                      .filter(Boolean)
                      .join(" · ") || "—"}
                  </div>
                </div>
              </Card>

              <DrawerSection title="Booking">
                <Row
                  key="created"
                  label="Created"
                  value={formatDateTime(summary.createdAt)}
                />
                <Row
                  key="expires"
                  label="Expires"
                  value={formatDateTime(summary.expiresAt)}
                />
                <Row
                  key="payment"
                  label="Payment"
                  value={
                    <Badge
                      className={cn(
                        "border-transparent font-bold",
                        PAYMENT_STATUS_CLASS[summary.paymentStatus]
                      )}
                    >
                      {PAYMENT_STATUS_LABEL[summary.paymentStatus]}
                    </Badge>
                  }
                />
              </DrawerSection>

              {data?.items && data.items.length > 0 ? (
                <div>
                  <h4 className="mb-2 text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                    Tours included ({data.items.length})
                  </h4>
                  <div className="space-y-2">
                    {data.items.map((item, index) => (
                      <div
                        key={item.id || `item-${index}`}
                        className="rounded-lg border border-border bg-card px-3 py-2.5"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-soft text-[11px] font-black text-primary">
                            {index + 1}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-bold text-foreground">
                              {itemTitle(item, tours)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatDate(item.travelDate)}
                              {item.departureAt
                                ? ` · ${formatDateTime(item.departureAt)}`
                                : ""}
                              {` · ${guestCount(item)} guests`}
                            </div>
                          </div>
                          <span className="text-sm font-bold text-foreground">
                            {formatMoney(
                              item.lineTotal ?? item.subtotal,
                              summary.currency
                            )}
                          </span>
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                          {guestBreakdown(item)}
                          {item.privateTour ? " · Private tour" : ""}
                          {item.promotionCode ? ` · ${item.promotionCode}` : ""}
                        </div>
                        {item.addons && item.addons.length > 0 ? (
                          <div className="mt-2 space-y-1 border-t border-border pt-2">
                            {item.addons.map((addon, addonIndex) => (
                              <div
                                key={
                                  addon.addonId ||
                                  addon.code ||
                                  `addon-${item.id || index}-${addonIndex}`
                                }
                                className="flex justify-between text-xs"
                              >
                                <span className="text-muted-foreground">
                                  {addon.title || addon.code || "Add-on"}
                                  {addon.quantity ? ` × ${addon.quantity}` : ""}
                                </span>
                                <span className="font-medium text-foreground">
                                  {formatMoney(
                                    addon.subtotal,
                                    summary.currency
                                  )}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <DrawerSection title="Traveler & preferences">
                <Row
                  key="nationality"
                  label="Nationality"
                  value={
                    data?.customerDetails?.leadNationalityCountryCode || "—"
                  }
                />
                <Row
                  key="country"
                  label="Country"
                  value={
                    data?.customerDetails?.billingAddress?.countryCode || "—"
                  }
                />
                <Row
                  key="city"
                  label="City"
                  value={data?.customerDetails?.billingAddress?.city || "—"}
                />
                {data?.customerDetails?.billingAddress?.line1 ? (
                  <Row
                    key="address"
                    label="Address"
                    value={[
                      data.customerDetails.billingAddress.line1,
                      data.customerDetails.billingAddress.line2,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  />
                ) : null}
                {data?.customerDetails?.customerRemarks ? (
                  <Row
                    key="remarks"
                    label="Special requests"
                    value={data.customerDetails.customerRemarks}
                  />
                ) : null}
              </DrawerSection>

              <Card className="bg-muted/40 p-4">
                <h4 className="mb-2 text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                  Price breakdown
                </h4>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Base</span>
                    <span className="font-medium">
                      {formatMoney(summary.baseSubtotal, summary.currency)}
                    </span>
                  </div>
                  {(summary.addonSubtotal ?? 0) > 0 ? (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Add-ons</span>
                      <span className="font-medium">
                        {formatMoney(summary.addonSubtotal, summary.currency)}
                      </span>
                    </div>
                  ) : null}
                  <div className="mt-1 flex justify-between border-t border-border pt-2 text-base font-black text-foreground">
                    <span>Total</span>
                    <span>
                      {formatMoney(summary.totalAmount, summary.currency)}
                    </span>
                  </div>
                </div>
              </Card>

              {data?.payments && data.payments.length > 0 ? (
                <DrawerSection title="Payments">
                  {data.payments.map((payment) => (
                    <Row
                      key={payment.id}
                      label={formatDateTime(payment.createdAt)}
                      value={
                        <span className="flex flex-col items-end gap-1">
                          <span>
                            {formatMoney(payment.amount, payment.currency)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {[payment.provider, payment.status]
                              .filter(Boolean)
                              .join(" · ") || "—"}
                          </span>
                        </span>
                      }
                    />
                  ))}
                </DrawerSection>
              ) : null}

              {data?.refunds && data.refunds.length > 0 ? (
                <DrawerSection title="Refunds">
                  {data.refunds.map((refund) => (
                    <Row
                      key={refund.id}
                      label={formatDateTime(refund.createdAt)}
                      value={
                        <span className="flex flex-col items-end gap-1">
                          <span>
                            {formatMoney(refund.amount, refund.currency)}
                          </span>
                          {refund.status ? (
                            <Badge
                              className={cn(
                                "border-transparent font-bold",
                                REFUND_STATUS_CLASS[refund.status]
                              )}
                            >
                              {refund.status}
                            </Badge>
                          ) : null}
                        </span>
                      }
                    />
                  ))}
                </DrawerSection>
              ) : null}
            </div>

            {showCancel || showRefund ? (
              <div className="flex flex-wrap gap-2 border-t border-border px-6 py-4">
                {showRefund ? (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setAction("refund")}
                  >
                    Refund
                  </Button>
                ) : null}
                {showCancel ? (
                  <Button
                    type="button"
                    variant="destructive"
                    className="ml-auto"
                    onClick={() => setAction("cancel")}
                  >
                    <Ban className="h-4 w-4" />
                    Cancel
                  </Button>
                ) : null}
              </div>
            ) : null}
          </>
        ) : null}
      </aside>

      <BookingActionDialog
        open={action !== null}
        kind={action}
        submitting={submitting}
        onOpenChange={(nextOpen) => {
          if (!nextOpen && !submitting) setAction(null)
        }}
        onConfirm={handleAction}
      />
    </div>
  )
}
