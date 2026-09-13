import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type ListPaginationProps = {
  page: number
  size: number
  totalPages: number
  totalElements: number
  onPageChange: (page: number) => void
  className?: string
}

function visiblePages(current: number, total: number) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index)
  }

  const pages = new Set<number>([0, total - 1])
  for (let index = current - 1; index <= current + 1; index += 1) {
    if (index >= 0 && index < total) {
      pages.add(index)
    }
  }

  const sorted = [...pages].sort((a, b) => a - b)
  const items: Array<number | "ellipsis"> = []

  for (const [index, value] of sorted.entries()) {
    const previous = sorted[index - 1]
    if (index > 0 && previous !== undefined && value - previous > 1) {
      items.push("ellipsis")
    }
    items.push(value)
  }

  return items
}

export function ListPagination({
  page,
  size,
  totalPages,
  totalElements,
  onPageChange,
  className,
}: ListPaginationProps) {
  const resolvedElements = Math.max(totalElements, 0)
  const resolvedPages =
    totalPages > 0
      ? totalPages
      : resolvedElements > 0
        ? Math.max(1, Math.ceil(resolvedElements / size))
        : 0

  if (resolvedPages < 1) {
    return null
  }

  const start = resolvedElements === 0 ? 0 : page * size + 1
  const end = Math.min((page + 1) * size, resolvedElements)
  const pages = visiblePages(page, resolvedPages)

  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <p className="text-sm text-muted-foreground">
        Showing {start}–{end} of {resolvedElements}
      </p>
      <nav className="flex flex-wrap items-center gap-1" aria-label="Pagination">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page <= 0}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft />
          Previous
        </Button>
        {pages.map((item, index) =>
          item === "ellipsis" ? (
            <span
              key={`ellipsis-${index}`}
              className="px-1 text-sm text-muted-foreground"
            >
              …
            </span>
          ) : (
            <Button
              key={item}
              type="button"
              size="icon-sm"
              variant={item === page ? "default" : "outline"}
              aria-current={item === page ? "page" : undefined}
              aria-label={`Page ${item + 1}`}
              onClick={() => onPageChange(item)}
            >
              {item + 1}
            </Button>
          )
        )}
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page >= resolvedPages - 1}
          onClick={() => onPageChange(page + 1)}
        >
          Next
          <ChevronRight />
        </Button>
      </nav>
    </div>
  )
}
