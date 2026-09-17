import { useEffect, useState } from "react"
import { Search } from "lucide-react"

import { PagePlaceholder } from "@/components/page-placeholder"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { InquiriesTable } from "@/features/inquiries/components/inquiries-table"
import { InquiryDrawer } from "@/features/inquiries/components/inquiry-drawer"
import type { ResolutionKind } from "@/features/inquiries/components/resolution-dialog"
import {
  isInquiryStatus,
  SALES_QUEUE_UI,
  STATUS_FILTER_ITEMS,
  type StatusFilter,
} from "@/features/inquiries/components/utils"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { useSalesCases } from "@/store/server/inquiries/inquiries"
import type { SalesQueue } from "@/store/server/inquiries/typed"

const PAGE_SIZE = 10

type InquiriesUi = {
  search: string
  status: StatusFilter
  page: number
  openId: string | null
  quoteOpen: boolean
  resolution: ResolutionKind | null
}

const InquiriesFeature = ({ kind }: { kind: SalesQueue }) => {
  const queue = SALES_QUEUE_UI[kind]
  const [ui, setUi] = useState<InquiriesUi>({
    search: "",
    status: "all",
    page: 0,
    openId: null,
    quoteOpen: false,
    resolution: null,
  })
  const debouncedSearch = useDebouncedValue(ui.search, 300)

  useEffect(() => {
    setUi((current) => (current.page === 0 ? current : { ...current, page: 0 }))
  }, [debouncedSearch, ui.status])

  const { data, isPending, isError } = useSalesCases(kind, {
    query: debouncedSearch.trim() || undefined,
    status: isInquiryStatus(ui.status) ? ui.status : undefined,
    page: ui.page,
    size: PAGE_SIZE,
  })

  const inquiries = data?.content ?? []
  const totalElements = data?.totalElements ?? inquiries.length
  const totalPages =
    data?.totalPages && data.totalPages > 0
      ? data.totalPages
      : inquiries.length > 0
        ? Math.max(1, Math.ceil(totalElements / PAGE_SIZE))
        : 0
  const newCount = inquiries.filter((inquiry) => inquiry.status === "NEW")
    .length

  useEffect(() => {
    if (totalPages <= 0) return
    setUi((current) => {
      const nextPage = Math.min(current.page, totalPages - 1)
      return nextPage === current.page
        ? current
        : { ...current, page: nextPage }
    })
  }, [ui.page, totalPages])

  return (
    <div>
      <PagePlaceholder
        title={queue.title}
        subtitle={queue.subtitle}
        actions={
          <Badge className="h-auto border-transparent bg-primary-soft px-2.5 py-0.5 text-xs font-bold text-primary">
            {newCount} NEW
          </Badge>
        }
      />

      <Card className="gap-0 overflow-hidden py-0">
        <div className="flex flex-wrap items-center gap-2 border-b border-border p-4">
          <div className="relative min-w-[200px] flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              value={ui.search}
              onChange={(event) =>
                setUi((current) => ({ ...current, search: event.target.value }))
              }
              placeholder="Search sales case, customer or product"
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
            <SelectTrigger className="h-10 w-44">
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
        </div>

        <InquiriesTable
          inquiries={inquiries}
          isPending={isPending}
          isError={isError}
          page={ui.page}
          pageSize={PAGE_SIZE}
          totalPages={totalPages}
          totalElements={totalElements}
          onPageChange={(page) => setUi((current) => ({ ...current, page }))}
          onView={(inquiry) =>
            setUi((current) => ({
              ...current,
              openId: inquiry.id,
              quoteOpen: false,
              resolution: null,
            }))
          }
        />
      </Card>

      <InquiryDrawer
        kind={kind}
        workflowId={ui.openId}
        quoteOpen={ui.quoteOpen}
        resolution={ui.resolution}
        onQuoteOpenChange={(quoteOpen) =>
          setUi((current) => ({ ...current, quoteOpen }))
        }
        onResolutionChange={(resolution) =>
          setUi((current) => ({ ...current, resolution }))
        }
        onClose={() =>
          setUi((current) => ({
            ...current,
            openId: null,
            quoteOpen: false,
            resolution: null,
          }))
        }
      />
    </div>
  )
}

export default InquiriesFeature
