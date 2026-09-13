import { Search } from "lucide-react"

import { Input } from "@/components/ui/input"
import { TourCard } from "@/features/tours/components/tour-card"
import type { TourSummary } from "@/store/server/tours/typed"

type ToursGridProps = {
  search: string
  onSearchChange: (value: string) => void
  tours: TourSummary[]
  isPending: boolean
  isError: boolean
  deleting: boolean
  onRequestDelete: (tour: TourSummary) => void
}

export function ToursGrid({
  search,
  onSearchChange,
  tours,
  isPending,
  isError,
  deleting,
  onRequestDelete,
}: ToursGridProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search tours"
        />
      </div>

      {isPending ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          Loading tours…
        </p>
      ) : null}

      {isError ? (
        <p className="py-10 text-center text-sm text-destructive">
          Failed to load tours.
        </p>
      ) : null}

      {!isPending && !isError && tours.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          No tours yet.
        </p>
      ) : null}

      {!isPending && !isError && tours.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {tours.map((tour) => (
            <TourCard
              key={tour.id}
              tour={tour}
              deleting={deleting}
              onRequestDelete={onRequestDelete}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}
