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
  onEdit: (pkg: HolidayPackage) => void
  onRequestDelete: (pkg: HolidayPackage) => void
  deleting: boolean
}

export function HolidayPackageCard({
  pkg,
  onEdit,
  onRequestDelete,
  deleting,
}: HolidayPackageCardProps) {
  return (
    <Card className="group h-full gap-0 overflow-hidden py-0">
      <div className="relative h-44 shrink-0 bg-muted">
        {pkg.featuredImageUrl ? (
          <img
            src={pkg.featuredImageUrl}
            alt={pkg.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : null}
        <div className="absolute top-3 left-3">
          <Badge variant="secondary" className="font-bold">
            Package
          </Badge>
        </div>
        <div className="absolute top-3 right-3">
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

      <CardContent className="flex flex-1 flex-col p-4">
        <h2 className="line-clamp-1 min-h-6 font-black text-foreground">
          {pkg.title}
        </h2>
        <p className="mt-1 line-clamp-2 min-h-8 text-xs text-muted-foreground">
          {pkg.category?.name || "\u00a0"}
        </p>

        <div className="mt-auto">
          <div className="flex items-end justify-between border-t border-border pt-3">
            <div>
              <span className="text-xs text-muted-foreground">
                Inquiry price
              </span>
              <div className="font-black text-foreground">{formatPrice(pkg)}</div>
            </div>
          </div>

          <div className="mt-3 flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => onEdit(pkg)}
            >
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
        </div>
      </CardContent>
    </Card>
  )
}
