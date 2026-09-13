import { Search } from "lucide-react"

import { Input } from "@/components/ui/input"
import { ComboTourCard } from "@/features/combo-tours/components/combo-tour-card"
import type { ComboTour } from "@/store/server/combo/typed"

type ComboPackagesTabProps = {
  search: string
  onSearchChange: (value: string) => void
  tours: ComboTour[]
  isPending: boolean
  isError: boolean
  deleting: boolean
  onRequestDelete: (tour: ComboTour) => void
}

export function ComboPackagesTab({
  search,
  onSearchChange,
  tours,
  isPending,
  isError,
  deleting,
  onRequestDelete,
}: ComboPackagesTabProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search combo packages"
        />
      </div>

      {isPending ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          Loading combo tours…
        </p>
      ) : null}

      {isError ? (
        <p className="py-10 text-center text-sm text-destructive">
          Failed to load combo tours.
        </p>
      ) : null}

      {!isPending && !isError && tours.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          No combo packages yet.
        </p>
      ) : null}

      {!isPending && !isError && tours.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {tours.map((tour) => (
            <ComboTourCard
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
