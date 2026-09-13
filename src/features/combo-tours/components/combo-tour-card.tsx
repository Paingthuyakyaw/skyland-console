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
  onRequestDelete: (tour: ComboTour) => void
  deleting: boolean
}

export function ComboTourCard({
  tour,
  onRequestDelete,
  deleting,
}: ComboTourCardProps) {
  const tags =
    tour.badges
      ?.map((badge) => badge.title)
      .filter((value): value is string => Boolean(value)) ?? []

  return (
    <Card className="group gap-0 overflow-hidden py-0">
      <div className="relative h-44 bg-muted">
        {tour.imageUrl ? (
          <img
            src={tour.imageUrl}
            alt={tour.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : null}
        <div className="absolute left-3 top-3">
          <Badge variant="secondary" className="font-bold">
            Combo
          </Badge>
        </div>
        <div className="absolute right-3 top-3">
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

      <CardContent className="p-4">
        <h2 className="font-black text-foreground">{tour.title}</h2>
        {tour.primaryCategory?.name ? (
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
            {tour.primaryCategory.name}
          </p>
        ) : null}

        {tags.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-1">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        <div className="mt-3 flex justify-between border-t border-border pt-3">
          <div>
            <span className="text-xs text-muted-foreground">Bundle price</span>
            <div className="font-black text-foreground">{formatPrice(tour)}</div>
          </div>
          <div className="text-right text-xs text-muted-foreground">
            <div>{formatDuration(tour.durationMinutes)}</div>
          </div>
        </div>

        <div className="mt-3 flex gap-2">
          <Button type="button" size="sm" variant="outline" className="flex-1">
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
      </CardContent>
    </Card>
  )
}
