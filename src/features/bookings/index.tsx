import { useEffect, useState } from "react"
import { Search } from "lucide-react"
import { toast } from "sonner"

import { PagePlaceholder } from "@/components/page-placeholder"
import { Card } from "@/components/ui/card"
import { DatePicker } from "@/components/ui/date-picker"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  BookingActionDialog,
  type BookingActionKind,
} from "@/features/bookings/components/booking-action-dialog"
import { BookingDrawer } from "@/features/bookings/components/booking-drawer"
import { BookingsTable } from "@/features/bookings/components/bookings-table"
import {
  isBookingStatus,
  isPaymentStatus,
  PAYMENT_FILTER_ITEMS,
  STATUS_FILTER_ITEMS,
  type PaymentFilter,
  type StatusFilter,
} from "@/features/bookings/components/utils"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import {
  useBookings,
  useCancelBooking,
  useRefundBooking,
} from "@/store/server/bookings/bookings"
import type { BookingSummary } from "@/store/server/bookings/typed"

const PAGE_SIZE = 10

type PendingAction = {
  kind: BookingActionKind
  booking: BookingSummary
}

type BookingsUi = {
  search: string
  status: StatusFilter
  payment: PaymentFilter
  travelFrom: string
  travelTo: string
  page: number
  openId: string | null
  action: PendingAction | null
}

const BookingFeature = () => {
  const [ui, setUi] = useState<BookingsUi>({
    search: "",
    status: "all",
    payment: "all",
    travelFrom: "",
    travelTo: "",
    page: 0,
    openId: null,
    action: null,
  })
  const debouncedSearch = useDebouncedValue(ui.search, 300)
  const cancelBooking = useCancelBooking()
  const refundBooking = useRefundBooking()
  const acting = cancelBooking.isPending || refundBooking.isPending

  useEffect(() => {
    setUi((current) => (current.page === 0 ? current : { ...current, page: 0 }))
  }, [debouncedSearch, ui.status, ui.payment, ui.travelFrom, ui.travelTo])

  const { data, isPending, isError } = useBookings({
    query: debouncedSearch.trim() || undefined,
    bookingStatus: isBookingStatus(ui.status) ? ui.status : undefined,
    paymentStatus: isPaymentStatus(ui.payment) ? ui.payment : undefined,
    travelFrom: ui.travelFrom || undefined,
    travelTo: ui.travelTo || undefined,
    page: ui.page,
    size: PAGE_SIZE,
  })

  const bookings = data?.content ?? []
  const totalElements = data?.totalElements ?? bookings.length
  const totalPages =
    data?.totalPages && data.totalPages > 0
      ? data.totalPages
      : bookings.length > 0
        ? Math.max(1, Math.ceil(totalElements / PAGE_SIZE))
        : 0

  useEffect(() => {
    if (totalPages <= 0) return
    setUi((current) => {
      const nextPage = Math.min(current.page, totalPages - 1)
      return nextPage === current.page
        ? current
        : { ...current, page: nextPage }
    })
  }, [ui.page, totalPages])

  const handleConfirmAction = (reason: string) => {
    if (!ui.action) return
    if (typeof ui.action.booking.version !== "number") {
      toast.error("This booking cannot be updated because it has no version.")
      return
    }

    const payload = {
      bookingId: ui.action.booking.id,
      action: { version: ui.action.booking.version, reason },
    }

    if (ui.action.kind === "cancel") {
      cancelBooking.mutate(payload, {
        onSuccess: () => setUi((current) => ({ ...current, action: null })),
      })
      return
    }

    refundBooking.mutate(payload, {
      onSuccess: () => setUi((current) => ({ ...current, action: null })),
    })
  }

  return (
    <div>
      <PagePlaceholder
        title="Booking Management"
        subtitle="Track, confirm and manage every reservation across all product types."
      />

      <Card className="mb-4 gap-0 py-4">
        <div className="flex flex-wrap items-center gap-3 px-4">
          <div className="relative min-w-[200px] flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              value={ui.search}
              onChange={(event) =>
                setUi((current) => ({ ...current, search: event.target.value }))
              }
              placeholder="Search reference, customer, phone or email…"
            />
          </div>
          <Select
            items={STATUS_FILTER_ITEMS}
            value={ui.status}
            onValueChange={(value) => {
              if (value && value in STATUS_FILTER_ITEMS) {
                setUi((current) => ({
                  ...current,
                  status: value as StatusFilter,
                }))
              }
            }}
          >
            <SelectTrigger className="h-10 w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(STATUS_FILTER_ITEMS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            items={PAYMENT_FILTER_ITEMS}
            value={ui.payment}
            onValueChange={(value) => {
              if (value && value in PAYMENT_FILTER_ITEMS) {
                setUi((current) => ({
                  ...current,
                  payment: value as PaymentFilter,
                }))
              }
            }}
          >
            <SelectTrigger className="h-10 w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(PAYMENT_FILTER_ITEMS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DatePicker
            value={ui.travelFrom}
            onChange={(travelFrom) =>
              setUi((current) => ({
                ...current,
                travelFrom,
              }))
            }
            className="w-[11.5rem] shrink-0"
            placeholder="Travel from"
            aria-label="Travel from"
          />
          <DatePicker
            value={ui.travelTo}
            onChange={(travelTo) =>
              setUi((current) => ({
                ...current,
                travelTo,
              }))
            }
            className="w-[11.5rem] shrink-0"
            placeholder="Travel to"
            aria-label="Travel to"
          />
        </div>
      </Card>

      <BookingsTable
        bookings={bookings}
        isPending={isPending}
        isError={isError}
        acting={acting}
        page={ui.page}
        pageSize={PAGE_SIZE}
        totalPages={totalPages}
        totalElements={totalElements}
        onPageChange={(page) => setUi((current) => ({ ...current, page }))}
        onView={(booking) =>
          setUi((current) => ({ ...current, openId: booking.id }))
        }
        onRefund={(booking) =>
          setUi((current) => ({
            ...current,
            action: { kind: "refund", booking },
          }))
        }
        onCancel={(booking) =>
          setUi((current) => ({
            ...current,
            action: { kind: "cancel", booking },
          }))
        }
      />

      <BookingDrawer
        bookingId={ui.openId}
        onClose={() => setUi((current) => ({ ...current, openId: null }))}
      />

      <BookingActionDialog
        open={ui.action !== null}
        kind={ui.action?.kind ?? null}
        submitting={acting}
        onOpenChange={(open) => {
          if (!open && !acting) {
            setUi((current) => ({ ...current, action: null }))
          }
        }}
        onConfirm={handleConfirmAction}
      />
    </div>
  )
}

export default BookingFeature
