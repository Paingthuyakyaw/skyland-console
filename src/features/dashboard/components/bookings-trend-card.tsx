import { BookingsChart } from "@/features/dashboard/components/bookings-chart"
import { Card } from "@/components/ui/card"
import type { DailyBookings } from "@/store/server/dashboard/typed"

export function BookingsTrendCard({
  days,
  isPending,
  isError,
}: {
  days: DailyBookings[]
  isPending: boolean
  isError: boolean
}) {
  return (
    <Card className="gap-4 p-5">
      <div>
        <div className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
          Bookings
        </div>
        <h2 className="text-base leading-tight font-black text-foreground">
          Previous seven days
        </h2>
      </div>
      {isError ? (
        <p className="text-sm text-destructive">
          The seven-day booking chart could not be loaded.
        </p>
      ) : isPending ? (
        <div className="h-40 animate-pulse rounded-xl bg-muted" />
      ) : (
        <BookingsChart days={days} />
      )}
    </Card>
  )
}
