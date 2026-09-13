import { useNavigate } from "@tanstack/react-router"
import { useEffect, useMemo, useState } from "react"
import { Plus, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PagePlaceholder } from "@/components/page-placeholder"
import { DeletePromotionDialog } from "@/features/promotions/components/delete-promotion-dialog"
import { PromotionsTable } from "@/features/promotions/components/promotions-table"
import {
  couponDisplayStatus,
  type CouponDisplayStatus,
} from "@/features/promotions/components/utils"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import {
  useDeletePromotion,
  usePromotions,
} from "@/store/server/promotions/promotions"
import type {
  PromotionResponse,
  PromotionScopeType,
  PromotionStatus,
} from "@/store/server/promotions/typed"
import { useTourCategories } from "@/store/server/tours/categories"
import { useTours } from "@/store/server/tours/tours"

const STATUS_FILTER_ITEMS = {
  all: "All statuses",
  ACTIVE: "Active",
  SCHEDULED: "Scheduled",
  EXPIRED: "Expired",
  EXHAUSTED: "Exhausted",
  DISABLED: "Disabled",
} as const

const SCOPE_FILTER_ITEMS = {
  all: "All scopes",
  ALL_TOURS: "All Tours",
  CATEGORY: "Specific category",
  SPECIFIC_TOUR: "Specific tour",
} as const

const PAGE_SIZE = 10

type StatusFilter = keyof typeof STATUS_FILTER_ITEMS
type ScopeFilter = keyof typeof SCOPE_FILTER_ITEMS

type CouponToDelete = {
  id: string
  code: string
}

function isApiStatus(value: StatusFilter): value is PromotionStatus {
  return value === "ACTIVE" || value === "SCHEDULED" || value === "EXHAUSTED"
}

function matchesStatusFilter(
  promotion: PromotionResponse,
  status: StatusFilter
) {
  if (status === "all") return true
  return couponDisplayStatus(promotion) === (status as CouponDisplayStatus)
}

const PromotionsFeature = () => {
  const navigate = useNavigate()
  const [ui, setUi] = useState<{
    search: string
    status: StatusFilter
    scope: ScopeFilter
    page: number
    deleting: CouponToDelete | null
  }>({
    search: "",
    status: "all",
    scope: "all",
    page: 0,
    deleting: null,
  })
  const debouncedSearch = useDebouncedValue(ui.search, 300)
  const deletePromotion = useDeletePromotion()

  useEffect(() => {
    setUi((current) => ({ ...current, page: 0 }))
  }, [debouncedSearch, ui.status, ui.scope])

  const { data, isPending, isError } = usePromotions({
    query: debouncedSearch.trim() || undefined,
    status: isApiStatus(ui.status) ? ui.status : undefined,
    scopeType:
      ui.scope === "all" ? undefined : (ui.scope as PromotionScopeType),
    page: ui.page,
    size: PAGE_SIZE,
  })

  const { data: primaryCategories = [] } = useTourCategories(true, {
    level: "PRIMARY",
  })
  const { data: secondaryCategories = [] } = useTourCategories(true, {
    level: "SECONDARY",
  })
  const { data: toursPage } = useTours({ size: 100 })

  const scopeNames = useMemo(() => {
    const categories = new Map<string, string>()
    for (const category of [...primaryCategories, ...secondaryCategories]) {
      categories.set(category.id, category.name)
    }
    const tours = new Map<string, string>()
    for (const tour of toursPage?.content ?? []) {
      tours.set(tour.id, tour.title)
    }
    return { categories, tours }
  }, [primaryCategories, secondaryCategories, toursPage?.content])

  const promotions = (data?.content ?? []).filter((promotion) =>
    matchesStatusFilter(promotion, ui.status)
  )
  const totalElements = data?.totalElements ?? promotions.length
  const totalPages =
    data?.totalPages && data.totalPages > 0
      ? data.totalPages
      : promotions.length > 0
        ? Math.max(1, Math.ceil(totalElements / PAGE_SIZE))
        : 0

  useEffect(() => {
    if (totalPages > 0 && ui.page > totalPages - 1) {
      setUi((current) => ({ ...current, page: totalPages - 1 }))
    }
  }, [ui.page, totalPages])

  const handleConfirmDelete = () => {
    if (!ui.deleting) return

    deletePromotion.mutate(
      { id: ui.deleting.id },
      {
        onSuccess: () => {
          setUi((current) => ({ ...current, deleting: null }))
        },
      }
    )
  }

  return (
    <div>
      <PagePlaceholder
        title="Promotions & Coupons"
        subtitle="Create, target, and monitor checkout offers across your tours."
        actions={
          <Button
            type="button"
            onClick={() => {
              void navigate({ to: "/promotions/new" })
            }}
          >
            <Plus />
            Add New Coupon
          </Button>
        }
      />

      <Card className="mb-4 gap-0 py-4">
        <div className="grid gap-3 px-4 md:grid-cols-[minmax(0,1fr)_180px_220px]">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              value={ui.search}
              onChange={(event) =>
                setUi((current) => ({ ...current, search: event.target.value }))
              }
              placeholder="Search coupon code"
            />
          </div>
          <Select
            items={STATUS_FILTER_ITEMS}
            value={ui.status}
            onValueChange={(value) => {
              if (value && value in STATUS_FILTER_ITEMS) {
                setUi((current) => ({
                  ...current,
                  status: value as StatusFilter,
                }))
              }
            }}
          >
            <SelectTrigger className="h-10 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(STATUS_FILTER_ITEMS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            items={SCOPE_FILTER_ITEMS}
            value={ui.scope}
            onValueChange={(value) => {
              if (value && value in SCOPE_FILTER_ITEMS) {
                setUi((current) => ({
                  ...current,
                  scope: value as ScopeFilter,
                }))
              }
            }}
          >
            <SelectTrigger className="h-10 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(SCOPE_FILTER_ITEMS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      <PromotionsTable
        promotions={promotions}
        isPending={isPending}
        isError={isError}
        deleting={deletePromotion.isPending}
        scopeNames={scopeNames}
        page={ui.page}
        totalPages={totalPages}
        totalElements={totalElements}
        pageSize={PAGE_SIZE}
        onPageChange={(page) => setUi((current) => ({ ...current, page }))}
        onEdit={(promotion) => {
          void navigate({
            to: "/promotions/$id",
            params: { id: promotion.id },
          })
        }}
        onRequestDelete={(promotion) => {
          setUi((current) => ({
            ...current,
            deleting: { id: promotion.id, code: promotion.code },
          }))
        }}
      />

      <DeletePromotionDialog
        open={ui.deleting !== null}
        onOpenChange={(open) => {
          if (!open && !deletePromotion.isPending) {
            setUi((current) => ({ ...current, deleting: null }))
          }
        }}
        couponCode={ui.deleting?.code}
        deleting={deletePromotion.isPending}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}

export default PromotionsFeature
