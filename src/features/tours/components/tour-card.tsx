import { Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { formatPrice, statusLabel } from "@/features/tours/components/utils"
import type { TourSummary } from "@/store/server/tours/typed"
import { cn } from "@/lib/utils"

type TourCardProps = {
  tour: TourSummary
  onRequestDelete: (tour: TourSummary) => void
  deleting: boolean
}

export function TourCard({ tour, onRequestDelete, deleting }: TourCardProps) {
  const categoryName = tour.primaryCategory?.name
  const difficulty = tour.difficultyLabel
  const meta = [categoryName, difficulty].filter(Boolean).join(" · ")

  return (
    <Card className="group gap-0 overflow-hidden py-0">
      <div className="relative h-44 bg-muted">
        {tour.featuredImageUrl ? (
          <img
            src={tour.featuredImageUrl}
            alt={tour.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : null}
        <div className="absolute top-3 left-3">
          <Badge variant="secondary" className="font-bold">
            Tour
          </Badge>
        </div>
        <div className="absolute top-3 right-3">
          <Badge
            variant="outline"
            className={cn(
              "border-transparent font-bold",
              tour.status === "PUBLISHED" && "bg-emerald-100 text-emerald-800",
              tour.status === "DRAFT" && "bg-muted text-muted-foreground",
              tour.status === "SCHEDULED" && "bg-amber-100 text-amber-800"
            )}
          >
            {statusLabel(tour.status, tour.statusLabel)}
          </Badge>
        </div>
      </div>

      <CardContent className="p-4">
        <h2 className="font-black text-foreground">{tour.title}</h2>
        {meta ? (
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
            {meta}
          </p>
        ) : null}

        <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
          <span className="text-sm text-muted-foreground">
            from{" "}
            <b className="text-base text-foreground">{formatPrice(tour)}</b>
          </span>
          <Button
            type="button"
            size="icon-sm"
            variant="outline"
            aria-label={`Delete ${tour.title}`}
            disabled={deleting}
            onClick={() => onRequestDelete(tour)}
          >
            <Trash2 />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
