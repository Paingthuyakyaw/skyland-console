import { Link } from "@tanstack/react-router"
import { ChevronRight } from "lucide-react"

type Crumb = {
  label: string
  to?: "/staff"
}

export function StaffBreadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav className="mb-2 flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
      {items.map((item, index) => {
        const isLast = index === items.length - 1
        return (
          <span
            key={`${item.label}-${index}`}
            className="flex items-center gap-1"
          >
            {index > 0 ? <ChevronRight className="size-3.5" /> : null}
            {item.to && !isLast ? (
              <Link to={item.to} className="hover:text-foreground">
                {item.label}
              </Link>
            ) : (
              <span
                className={isLast ? "font-medium text-foreground" : undefined}
              >
                {item.label}
              </span>
            )}
          </span>
        )
      })}
    </nav>
  )
}
