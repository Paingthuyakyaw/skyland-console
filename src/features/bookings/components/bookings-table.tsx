import { Ban, Eye, RotateCcw } from "lucide-react"
import type { ReactNode } from "react"

import { ListPagination } from "@/components/list-pagination"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  BOOKING_STATUS_CLASS,
  BOOKING_STATUS_LABEL,
  canCancelBooking,
  canRefundBooking,
  formatBookingRef,
  formatDateTime,
  formatMoney,
  PAYMENT_STATUS_CLASS,
  PAYMENT_STATUS_LABEL,
} from "@/features/bookings/components/utils"
import { cn } from "@/lib/utils"
import type { BookingSummary } from "@/store/server/bookings/typed"

type BookingsTableProps = {
  bookings: BookingSummary[]
  isPending: boolean
  isError: boolean
  acting: boolean
  page: number
  pageSize: number
  totalPages: number
  totalElements: number
  onPageChange: (page: number) => void
  onView: (booking: BookingSummary) => void
  onRefund: (booking: BookingSummary) => void
  onCancel: (booking: BookingSummary) => void
}

function ActionTooltip({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <Tooltip>
      <TooltipTrigger render={<span className="inline-flex" />}>
        {children}
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

export function BookingsTable({
  bookings,
  isPending,
  isError,
  acting,
  page,
  pageSize,
  totalPages,
  totalElements,
  onPageChange,
  onView,
  onRefund,
  onCancel,
}: BookingsTableProps) {
  return (
    <TooltipProvider delay={200}>
      <Card className="gap-0 overflow-hidden py-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px]">
            <thead className="border-b border-border bg-muted/45">
              <tr>
                {[
                  "Reference",
                  "Customer",
                  "Created",
                  "Total",
                  "Payment",
                  "Status",
                  "Action",
                ].map((label) => (
                  <th
                    key={label}
                    className={cn(
                      "px-4 py-3 text-left text-[11px] font-bold tracking-wider text-muted-foreground uppercase",
                      label === "Action" &&
                        "sticky right-0 bg-muted/45 text-right"
                    )}
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {bookings.map((booking) => (
                <tr
                  key={booking.id}
                  onClick={() => onView(booking)}
                  className="cursor-pointer transition-colors hover:bg-primary-soft/35"
                >
                  <td className="px-4 py-4 font-bold text-primary">
                    {formatBookingRef(booking.id)}
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-medium text-foreground">
                      {booking.customerName || "—"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {booking.email || booking.phoneNumber || "—"}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm whitespace-nowrap text-muted-foreground">
                    {formatDateTime(booking.createdAt)}
                  </td>
                  <td className="px-4 py-4 text-sm font-bold text-foreground">
                    {formatMoney(booking.totalAmount, booking.currency)}
                  </td>
                  <td className="px-4 py-4">
                    <Badge
                      className={cn(
                        "border-transparent font-bold",
                        PAYMENT_STATUS_CLASS[booking.paymentStatus]
                      )}
                    >
                      {PAYMENT_STATUS_LABEL[booking.paymentStatus]}
                    </Badge>
                  </td>
                  <td className="px-4 py-4">
                    <Badge
                      className={cn(
                        "border-transparent font-bold",
                        BOOKING_STATUS_CLASS[booking.bookingStatus]
                      )}
                    >
                      {BOOKING_STATUS_LABEL[booking.bookingStatus]}
                    </Badge>
                  </td>
                  <td
                    className="sticky right-0 bg-card px-4 py-4"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <div className="flex items-center justify-end gap-1">
                      <ActionTooltip label="View">
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          aria-label={`View ${formatBookingRef(booking.id)}`}
                          onClick={() => onView(booking)}
                        >
                          <Eye />
                        </Button>
                      </ActionTooltip>
                      <ActionTooltip label="Refund">
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          aria-label={`Refund ${formatBookingRef(booking.id)}`}
                          disabled={
                            acting ||
                            !canRefundBooking(
                              booking.bookingStatus,
                              booking.paymentStatus
                            )
                          }
                          onClick={() => onRefund(booking)}
                        >
                          <RotateCcw />
                        </Button>
                      </ActionTooltip>
                      <ActionTooltip label="Cancel">
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          aria-label={`Cancel ${formatBookingRef(booking.id)}`}
                          disabled={
                            acting || !canCancelBooking(booking.bookingStatus)
                          }
                          onClick={() => onCancel(booking)}
                        >
                          <Ban />
                        </Button>
                      </ActionTooltip>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {isPending ? (
          <p className="px-6 py-12 text-center text-sm text-muted-foreground">
            Loading bookings…
          </p>
        ) : null}

        {isError ? (
          <p className="px-6 py-12 text-center text-sm text-destructive">
            Failed to load bookings.
          </p>
        ) : null}

        {!isPending && !isError && bookings.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-muted-foreground">
            No bookings match these filters.
          </p>
        ) : null}

        {!isPending && !isError ? (
          <ListPagination
            className="border-t border-border px-4 py-3"
            page={page}
            size={pageSize}
            totalPages={totalPages}
            totalElements={totalElements}
            onPageChange={onPageChange}
          />
        ) : null}
      </Card>
    </TooltipProvider>
  )
}
