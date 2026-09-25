import { Link } from "@tanstack/react-router"

import { Card } from "@/components/ui/card"
import type { TopTour } from "@/store/server/dashboard/typed"

export function TopToursSection({
  tours,
  isPending,
  isError,
}: {
  tours: TopTour[]
  isPending: boolean
  isError: boolean
}) {
  const topTours = tours.slice(0, 3)

  return (
    <Card className="gap-4 p-5">
      <div>
        <div className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
          This month
        </div>
        <h2 className="text-base leading-tight font-black text-foreground">
          Top-selling tours
        </h2>
      </div>
      {isError ? (
        <p className="text-sm text-destructive">
          Top-selling tours could not be loaded.
        </p>
      ) : isPending ? (
        <div className="h-24 animate-pulse rounded-xl bg-muted" />
      ) : topTours.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No tour sales this month yet.
        </p>
      ) : (
        <div className="space-y-1.5">
          {topTours.map((tour, index) => (
            <Link
              key={tour.tourId}
              to="/tours/$id"
              params={{ id: tour.tourId }}
              className="flex w-full items-center gap-3 rounded-lg bg-muted/40 px-3 py-2 text-left text-sm transition-colors hover:bg-primary-soft/50"
            >
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-black text-white">
                {index + 1}
              </span>
              <span className="flex-1 truncate font-medium text-foreground">
                {tour.name}
              </span>
              <span className="font-black text-foreground">
                {tour.totalCount}
              </span>
            </Link>
          ))}
        </div>
      )}
    </Card>
  )
}
