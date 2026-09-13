import { Pencil, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  formatDuration,
  formatPrice,
  statusLabel,
} from "@/features/combo-tours/components/utils"
import type { ComboTour } from "@/store/server/combo/typed"
import { cn } from "@/lib/utils"

type ComboTourCardProps = {
  tour: ComboTour
  onEdit: (tour: ComboTour) => void
  onRequestDelete: (tour: ComboTour) => void
  deleting: boolean
}

export function ComboTourCard({
  tour,
  onEdit,
  onRequestDelete,
  deleting,
}: ComboTourCardProps) {
  const tags =
    tour.badges
      ?.map((badge) => badge.title)
      .filter((value): value is string => Boolean(value)) ?? []

  return (
    <Card className="group h-full gap-0 overflow-hidden py-0">
      <div className="relative h-44 shrink-0 bg-muted">
        {tour.imageUrl ? (
          <img
            src={tour.imageUrl}
            alt={tour.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : null}
        <div className="absolute top-3 left-3">
          <Badge variant="secondary" className="font-bold">
            Combo
          </Badge>
        </div>
        <div className="absolute top-3 right-3">
          <Badge
            variant="outline"
            className={cn(
              "border-transparent font-bold",
              tour.status === "PUBLISHED"
                ? "bg-emerald-100 text-emerald-800"
                : "bg-muted text-muted-foreground"
            )}
          >
            {statusLabel(tour.status)}
          </Badge>
        </div>
      </div>

      <CardContent className="flex flex-1 flex-col p-4">
        <h2 className="line-clamp-1 min-h-6 font-black text-foreground">
          {tour.title}
        </h2>
        <p className="mt-1 line-clamp-2 min-h-8 text-xs text-muted-foreground">
          {tour.primaryCategory?.name || "\u00a0"}
        </p>

        <div className="mt-2 flex min-h-5 flex-wrap gap-1">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-auto">
          <div className="flex items-end justify-between border-t border-border pt-3">
            <div>
              <span className="text-xs text-muted-foreground">Bundle price</span>
              <div className="font-black text-foreground">{formatPrice(tour)}</div>
            </div>
            <div className="text-right text-xs text-muted-foreground">
              {formatDuration(tour.durationMinutes)}
            </div>
          </div>

          <div className="mt-3 flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => onEdit(tour)}
            >
              <Pencil className="size-3.5" />
              Edit
            </Button>
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
        </div>
      </CardContent>
    </Card>
  )
}
