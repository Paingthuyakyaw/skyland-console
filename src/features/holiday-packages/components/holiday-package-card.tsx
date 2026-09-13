import { Pencil, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  formatPrice,
  statusLabel,
} from "@/features/holiday-packages/components/utils"
import type { HolidayPackage } from "@/store/server/holiday/typed"
import { cn } from "@/lib/utils"

type HolidayPackageCardProps = {
  pkg: HolidayPackage
  onRequestDelete: (pkg: HolidayPackage) => void
  deleting: boolean
}

export function HolidayPackageCard({
  pkg,
  onRequestDelete,
  deleting,
}: HolidayPackageCardProps) {
  const tags =
    pkg.badges
      ?.map((badge) => badge.title)
      .filter((value): value is string => Boolean(value)) ?? []

  return (
    <Card className="group gap-0 overflow-hidden py-0">
      <div className="relative h-44 bg-muted">
        {pkg.featuredImageUrl ? (
          <img
            src={pkg.featuredImageUrl}
            alt={pkg.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : null}
        <div className="absolute left-3 top-3">
          <Badge variant="secondary" className="font-bold">
            Package
          </Badge>
        </div>
        <div className="absolute right-3 top-3">
          <Badge
            variant="outline"
            className={cn(
              "border-transparent font-bold",
              pkg.status === "ACTIVE"
                ? "bg-emerald-100 text-emerald-800"
                : "bg-muted text-muted-foreground"
            )}
          >
            {statusLabel(pkg.status)}
          </Badge>
        </div>
      </div>

      <CardContent className="p-4">
        <h2 className="font-black text-foreground">{pkg.title}</h2>
        {pkg.category?.name ? (
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
            {pkg.category.name}
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
            <span className="text-xs text-muted-foreground">Inquiry price</span>
            <div className="font-black text-foreground">{formatPrice(pkg)}</div>
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
            aria-label={`Delete ${pkg.title}`}
            disabled={deleting}
            onClick={() => onRequestDelete(pkg)}
          >
            <Trash2 />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
