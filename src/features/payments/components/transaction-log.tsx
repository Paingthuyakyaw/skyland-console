import { ListPagination } from "@/components/list-pagination"
import { Card } from "@/components/ui/card"
import {
  formatDateTime,
  formatLabel,
  formatMoney,
} from "@/features/payments/components/utils"
import type { TransactionLog } from "@/store/server/payments/typed"

const COLUMNS = [
  "Booking ref",
  "Customer",
  "Type",
  "Amount",
  "Method",
  "Status",
  "Date",
  "Event",
]

export function TransactionLogTable({
  rows,
  isPending,
  isError,
  page,
  pageSize,
  totalPages,
  totalElements,
  onPageChange,
}: {
  rows: TransactionLog[]
  isPending: boolean
  isError: boolean
  page: number
  pageSize: number
  totalPages: number
  totalElements: number
  onPageChange: (page: number) => void
}) {
  return (
    <Card className="mt-4 gap-0 overflow-hidden py-0">
      <div className="px-5 py-4">
        <h2 className="font-bold text-foreground">Transaction Log</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-y border-border bg-muted/40">
            <tr>
              {COLUMNS.map((column) => (
                <th
                  key={column}
                  className="px-5 py-2.5 text-left text-[11px] font-bold tracking-wider text-muted-foreground uppercase"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          {!isPending && !isError && rows.length > 0 ? (
            <tbody className="divide-y divide-border">
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-muted/50">
                  <td className="px-5 py-3 text-sm font-bold text-primary">
                    {row.bookingRef || "—"}
                  </td>
                  <td className="px-5 py-3 text-sm font-medium text-foreground">
                    {row.customerName || "—"}
                  </td>
                  <td className="px-5 py-3 text-sm text-foreground">
                    {formatLabel(row.paymentType)}
                  </td>
                  <td className="px-5 py-3 text-sm font-bold text-foreground">
                    {formatMoney(row.amount)}
                  </td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">
                    {formatLabel(row.method)}
                  </td>
                  <td className="px-5 py-3 text-sm text-foreground">
                    {formatLabel(row.status)}
                  </td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">
                    {formatDateTime(row.dateTime)}
                  </td>
                  <td className="px-5 py-3 text-sm text-foreground">
                    {formatLabel(row.eventType)}
                  </td>
                </tr>
              ))}
            </tbody>
          ) : null}
        </table>
      </div>
      {isPending ? (
        <p className="px-6 py-12 text-center text-sm text-muted-foreground">
          Loading transactions…
        </p>
      ) : null}
      {isError ? (
        <p className="px-6 py-12 text-center text-sm text-destructive">
          Transactions could not be loaded.
        </p>
      ) : null}
      {!isPending && !isError && rows.length === 0 ? (
        <p className="px-6 py-12 text-center text-sm text-muted-foreground">
          No transactions in this date range.
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
