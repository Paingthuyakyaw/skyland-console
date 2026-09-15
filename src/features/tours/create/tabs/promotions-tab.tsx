import { useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { Plus } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  couponDisplayStatus,
  DISPLAY_STATUS_CLASS,
  DISPLAY_STATUS_LABEL,
  formatCouponUsage,
  formatCouponValue,
} from "@/features/promotions/components/utils"
import { usePromotions } from "@/store/server/promotions/promotions"
import type { TourResponse } from "@/store/server/tours/typed"
import { cn } from "@/lib/utils"

function appliesBecause(scopeType: string) {
  if (scopeType === "ALL_TOURS") return "All Tours"
  if (scopeType === "CATEGORY") return "Category"
  return "Specific Tour"
}

export function PromotionsTab({ createdTour }: { createdTour: TourResponse }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState("")
  const { data, isPending } = usePromotions({ query: query || undefined, size: 50 })
  const promotions = (data?.content ?? []).filter((promotion) => {
    if (promotion.scopeType === "ALL_TOURS") return true
    if (promotion.scopeType === "SPECIFIC_TOUR") {
      return promotion.scopeRefId === createdTour.id
    }
    if (promotion.scopeType === "CATEGORY") {
      return (
        promotion.scopeRefId === createdTour.primaryCategory?.id ||
        promotion.scopeRefId === createdTour.secondaryCategory?.id
      )
    }
    return false
  })

  return (
    <Card className="gap-0 overflow-hidden py-0">
      <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
        <div className="mr-auto">
          <h3 className="font-bold text-foreground">Related promotions</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Promotions are managed separately and never enter the Tour update
            payload.
          </p>
        </div>
        <Input
          className="h-9 w-48"
          placeholder="Search code"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <Button
          type="button"
          onClick={() => void navigate({ to: "/promotions/new" })}
        >
          <Plus className="size-4" />
          Create for this Tour
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
            <tr>
              {["Code", "Status", "Discount", "Applies because", "Dates", "Usage", ""].map(
                (label) => (
                  <th
                    key={label || "actions"}
                    className="px-4 py-2.5 text-left text-[11px] font-bold tracking-wider text-muted-foreground uppercase"
                  >
                    {label}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {promotions.map((promotion) => {
              const status = couponDisplayStatus(promotion)
              const dates = promotion.noEndDate
                ? `${promotion.startDate} – No end`
                : `${promotion.startDate} – ${promotion.endDate ?? "—"}`
              return (
                <tr key={promotion.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-bold text-foreground">
                    {promotion.code}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant="outline"
                      className={cn("border-transparent", DISPLAY_STATUS_CLASS[status])}
                    >
                      {DISPLAY_STATUS_LABEL[status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    {formatCouponValue(promotion.discountType, promotion.value)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {appliesBecause(promotion.scopeType)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{dates}</td>
                  <td className="px-4 py-3">{formatCouponUsage(promotion)}</td>
                  <td className="px-4 py-3">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        void navigate({
                          to: "/promotions/$id",
                          params: { id: promotion.id },
                        })
                      }
                    >
                      Open
                    </Button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between border-t border-border px-4 py-3 text-xs text-muted-foreground">
        <span>
          {isPending
            ? "Loading…"
            : promotions.length === 0
              ? "No related promotions yet."
              : `Showing ${promotions.length} promotion${promotions.length === 1 ? "" : "s"}`}
        </span>
      </div>
    </Card>
  )
}
