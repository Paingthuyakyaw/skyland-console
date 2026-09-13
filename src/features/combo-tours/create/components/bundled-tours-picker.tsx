import { X } from "lucide-react"

import { cn } from "@/lib/utils"
import type { BundledTourDraft } from "@/features/combo-tours/create/combo-form"
import type { TourSummary } from "@/store/server/tours/typed"

export function BundledToursPicker({
  selected,
  tours,
  onChange,
}: {
  selected: BundledTourDraft[]
  tours: TourSummary[]
  onChange: (items: BundledTourDraft[]) => void
}) {
  const selectedIds = new Set(selected.map((item) => item.tourId))
  const extraSelected = selected.filter(
    (item) => !tours.some((tour) => tour.id === item.tourId)
  )

  const toggle = (tour: TourSummary) => {
    if (selectedIds.has(tour.id)) {
      onChange(selected.filter((item) => item.tourId !== tour.id))
      return
    }

    onChange([
      ...selected,
      { tourId: tour.id, quantity: 1, title: tour.title },
    ])
  }

  return (
    <div className="space-y-2">
      <span className="text-sm font-bold text-foreground">Bundled Tours</span>
      <div className="space-y-1.5">
        {tours.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border px-3 py-4 text-sm text-muted-foreground">
            No tours available to bundle yet.
          </p>
        ) : null}
        {tours.map((tour) => {
          const isSelected = selectedIds.has(tour.id)

          return (
            <button
              key={tour.id}
              type="button"
              onClick={() => toggle(tour)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors",
                isSelected
                  ? "border-primary/40 bg-primary/5 text-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-primary/20 hover:bg-muted/30"
              )}
            >
              <div
                className={cn(
                  "flex size-4 shrink-0 items-center justify-center rounded border transition-colors",
                  isSelected ? "border-primary bg-primary" : "border-border"
                )}
              >
                {isSelected ? (
                  <span className="text-[10px] font-black text-white">✓</span>
                ) : null}
              </div>
              <span className={isSelected ? "font-bold" : ""}>{tour.title}</span>
            </button>
          )
        })}
      </div>

      {extraSelected.map((item) => (
        <div
          key={item.tourId}
          className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-1.5 text-sm"
        >
          <span className="min-w-0 flex-1 font-medium text-foreground">
            {item.title || "Selected tour"}
          </span>
          <button
            type="button"
            className="text-muted-foreground hover:text-destructive"
            aria-label={`Remove ${item.title || "selected tour"}`}
            onClick={() =>
              onChange(selected.filter((current) => current.tourId !== item.tourId))
            }
          >
            <X className="size-3.5" />
          </button>
        </div>
      ))}
    </div>
  )
}
