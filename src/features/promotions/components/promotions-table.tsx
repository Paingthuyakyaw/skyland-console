import { Pencil, Trash2 } from "lucide-react"

import { ListPagination } from "@/components/list-pagination"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  couponDisplayStatus,
  DISPLAY_STATUS_CLASS,
  DISPLAY_STATUS_LABEL,
  DISCOUNT_TYPE_LABEL,
  formatCouponScope,
  formatCouponUsage,
  formatCouponValue,
} from "@/features/promotions/components/utils"
import type { PromotionResponse } from "@/store/server/promotions/typed"
import { cn } from "@/lib/utils"

type PromotionsTableProps = {
  promotions: PromotionResponse[]
  isPending: boolean
  isError: boolean
  deleting: boolean
  scopeNames: {
    categories: Map<string, string>
    tours: Map<string, string>
  }
  page: number
  totalPages: number
  totalElements: number
  pageSize: number
  onPageChange: (page: number) => void
  onEdit: (promotion: PromotionResponse) => void
  onRequestDelete: (promotion: PromotionResponse) => void
}

export function PromotionsTable({
  promotions,
  isPending,
  isError,
  deleting,
  scopeNames,
  page,
  totalPages,
  totalElements,
  pageSize,
  onPageChange,
  onEdit,
  onRequestDelete,
}: PromotionsTableProps) {
  return (
    <Card className="gap-0 overflow-hidden py-0">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px]">
          <thead className="border-b border-border bg-muted/45">
            <tr>
              {["Code", "Type", "Value", "Scope", "Usage", "Status", ""].map(
                (label) => (
                  <th
                    key={label || "actions"}
                    className="px-4 py-3 text-left text-[11px] font-bold tracking-wider text-muted-foreground uppercase"
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
              return (
                <tr
                  key={promotion.id}
                  onClick={() => onEdit(promotion)}
                  className="cursor-pointer transition-colors hover:bg-primary-soft/35"
                >
                  <td className="px-4 py-4">
                    <span className="rounded-md bg-primary-soft px-2 py-1 font-black tracking-wide text-primary">
                      {promotion.code}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <Badge
                      className={cn(
                        "border-transparent font-bold",
                        promotion.discountType === "PERCENTAGE"
                          ? "bg-primary-soft text-primary"
                          : "bg-secondary-soft text-secondary-foreground"
                      )}
                    >
                      {DISCOUNT_TYPE_LABEL[promotion.discountType]}
                    </Badge>
                  </td>
                  <td className="px-4 py-4 text-sm font-bold text-foreground">
                    {formatCouponValue(promotion.discountType, promotion.value)}
                  </td>
                  <td className="px-4 py-4 text-sm text-muted-foreground">
                    {formatCouponScope(promotion, scopeNames)}
                  </td>
                  <td className="px-4 py-4 text-sm text-muted-foreground">
                    {formatCouponUsage(promotion)}
                  </td>
                  <td className="px-4 py-4">
                    <Badge
                      className={cn(
                        "border-transparent font-bold",
                        DISPLAY_STATUS_CLASS[status]
                      )}
                    >
                      {DISPLAY_STATUS_LABEL[status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        aria-label={`Edit ${promotion.code}`}
                        onClick={(event) => {
                          event.stopPropagation()
                          onEdit(promotion)
                        }}
                      >
                        <Pencil />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        aria-label={`Delete ${promotion.code}`}
                        disabled={deleting}
                        onClick={(event) => {
                          event.stopPropagation()
                          onRequestDelete(promotion)
                        }}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {isPending ? (
        <p className="px-6 py-12 text-center text-sm text-muted-foreground">
          Loading coupons…
        </p>
      ) : null}

      {isError ? (
        <p className="px-6 py-12 text-center text-sm text-destructive">
          Failed to load coupons.
        </p>
      ) : null}

      {!isPending && !isError && promotions.length === 0 ? (
        <p className="px-6 py-12 text-center text-sm text-muted-foreground">
          No coupons match these filters.
        </p>
      ) : null}

      {!isPending && !isError ? (
        <ListPagination
          className="border-t border-border px-4 py-3"
          page={page}
          size={pageSize}
          totalPages={totalPages}
          totalElements={totalElements}
          onPageChange={onPageChange}
        />
      ) : null}
    </Card>
  )
}
