import type { ReactNode } from "react"

import { ListPagination } from "@/components/list-pagination"
import { Card } from "@/components/ui/card"

export function ReportTable({
  columns,
  isPending,
  isError,
  isEmpty,
  error,
  empty,
  page,
  pageSize,
  totalPages,
  totalElements,
  onPageChange,
  children,
}: {
  columns: string[]
  isPending: boolean
  isError: boolean
  isEmpty: boolean
  error: string
  empty: string
  page: number
  pageSize: number
  totalPages: number
  totalElements: number
  onPageChange: (page: number) => void
  children: ReactNode
}) {
  return (
    <Card className="gap-0 overflow-hidden py-0">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-border bg-muted/40">
            <tr>
              {columns.map((column) => (
                <th
                  key={column}
                  className="px-5 py-2.5 text-left text-[11px] font-bold tracking-wider text-muted-foreground uppercase"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          {!isPending && !isError && !isEmpty ? (
            <tbody>{children}</tbody>
          ) : null}
        </table>
      </div>
      {isPending ? (
        <p className="px-6 py-12 text-center text-sm text-muted-foreground">
          Loading report…
        </p>
      ) : null}
      {isError ? (
        <p className="px-6 py-12 text-center text-sm text-destructive">
          {error}
        </p>
      ) : null}
      {!isPending && !isError && isEmpty ? (
        <p className="px-6 py-12 text-center text-sm text-muted-foreground">
          {empty}
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
