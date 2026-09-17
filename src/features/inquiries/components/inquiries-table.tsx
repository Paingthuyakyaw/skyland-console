import { Eye } from "lucide-react"
import type { ReactNode } from "react"

import { ListPagination } from "@/components/list-pagination"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  customerName,
  formatCaseRef,
  formatDate,
  formatDateTime,
  formatMoney,
  formatRelativeTime,
  INQUIRY_STATUS_CLASS,
  INQUIRY_STATUS_LABEL,
  isInquiryStatus,
  isMixedCase,
  partySummary,
} from "@/features/inquiries/components/utils"
import { cn } from "@/lib/utils"
import type { ProductWorkflow } from "@/store/server/inquiries/typed"

type InquiriesTableProps = {
  inquiries: ProductWorkflow[]
  isPending: boolean
  isError: boolean
  page: number
  pageSize: number
  totalPages: number
  totalElements: number
  onPageChange: (page: number) => void
  onView: (inquiry: ProductWorkflow) => void
}

function ActionTooltip({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <Tooltip>
      <TooltipTrigger render={<span className="inline-flex" />}>
        {children}
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

export function InquiriesTable({
  inquiries,
  isPending,
  isError,
  page,
  pageSize,
  totalPages,
  totalElements,
  onPageChange,
  onView,
}: InquiriesTableProps) {
  return (
    <TooltipProvider delay={200}>
      <div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1360px] text-sm">
            <thead className="border-b border-border bg-muted/45">
              <tr>
                {[
                  "Sales case ID",
                  "Customer",
                  "Products",
                  "Requested date",
                  "Party / rooms",
                  "Staff quote & expiry",
                  "Status",
                  "Updated",
                  "Actions",
                ].map((label) => (
                  <th
                    key={label}
                    className={cn(
                      "px-4 py-3 text-left text-xs font-bold tracking-wider whitespace-nowrap text-muted-foreground uppercase",
                      label === "Products" && "min-w-[360px]",
                      label === "Actions" &&
                        "sticky right-0 z-10 bg-muted text-right"
                    )}
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
          <tbody className="divide-y divide-border">
            {inquiries.map((inquiry) => {
              const status = isInquiryStatus(inquiry.status)
                ? inquiry.status
                : null
              const products = inquiry.items ?? []
              return (
                <tr
                  key={inquiry.id}
                  onClick={() => onView(inquiry)}
                  className="cursor-pointer transition-colors hover:bg-primary-soft/35"
                >
                  <td className="px-4 py-3 text-sm font-bold whitespace-nowrap text-primary">
                    {formatCaseRef(inquiry.salesCaseId || inquiry.id)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-bold text-foreground">
                      {customerName(inquiry)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {inquiry.email || inquiry.phoneNumber || "—"}
                    </div>
                  </td>
                  <td className="min-w-[360px] px-4 py-3">
                    {products.length > 0 ? (
                      products.map((item, index) => (
                        <div
                          key={item.id || `${inquiry.id}-${index}`}
                          className="mb-1 text-sm whitespace-nowrap last:mb-0"
                        >
                          {item.productTitleSnapshot?.trim() || "—"}
                        </div>
                      ))
                    ) : (
                      <span className="text-sm">—</span>
                    )}
                    {isMixedCase(inquiry) ? (
                      <div className="mt-1 text-xs text-muted-foreground">
                        One shared sales case · also appears in another queue
                      </div>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-sm whitespace-nowrap text-muted-foreground">
                    {formatDate(inquiry.requestedDate)}
                  </td>
                  <td className="px-4 py-3 text-sm whitespace-nowrap text-muted-foreground">
                    {partySummary(inquiry)}
                  </td>
                  <td className="px-4 py-3">
                    {inquiry.staffQuote?.amount != null ? (
                      <>
                        <div className="text-sm font-bold text-foreground">
                          {formatMoney(
                            inquiry.staffQuote.amount,
                            inquiry.staffQuote.currency
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Expires {formatDateTime(inquiry.staffQuote.expiresAt)}
                        </div>
                      </>
                    ) : (
                      <span className="text-sm">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      className={cn(
                        "h-auto border-transparent px-2.5 py-0.5 text-xs font-bold",
                        status
                          ? INQUIRY_STATUS_CLASS[status]
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {status
                        ? INQUIRY_STATUS_LABEL[status]
                        : inquiry.status?.replaceAll("_", " ") || "—"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm whitespace-nowrap text-muted-foreground">
                    {formatRelativeTime(inquiry.updatedAt)}
                  </td>
                  <td
                    className="sticky right-0 z-10 bg-card px-4 py-3"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <div className="flex items-center justify-end">
                      <ActionTooltip label="View">
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          aria-label={`View ${formatCaseRef(inquiry.salesCaseId || inquiry.id)}`}
                          onClick={() => onView(inquiry)}
                        >
                          <Eye />
                        </Button>
                      </ActionTooltip>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {isPending && inquiries.length === 0 ? (
        <p className="px-6 py-12 text-center text-sm text-muted-foreground">
          Loading inquiries…
        </p>
      ) : null}

      {isError && inquiries.length === 0 ? (
        <p className="px-6 py-12 text-center text-sm text-destructive">
          Failed to load tour inquiries.
        </p>
      ) : null}

      {!isPending && !isError && inquiries.length === 0 ? (
        <p className="px-6 py-12 text-center text-sm text-muted-foreground">
          No inquiries match these filters.
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
      </div>
    </TooltipProvider>
  )
}
