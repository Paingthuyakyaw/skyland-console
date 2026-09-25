import { Link } from "@tanstack/react-router"
import { ArrowUpRight, MessageSquare } from "lucide-react"

import { Card } from "@/components/ui/card"

export function InquiriesCard({
  count,
  isPending,
  isError,
}: {
  count?: number
  isPending: boolean
  isError: boolean
}) {
  return (
    <Card className="gap-4 p-5">
      <div>
        <div className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
          Action Queue
        </div>
        <h2 className="text-base leading-tight font-black text-foreground">
          Needs Attention
        </h2>
      </div>

      {isError ? (
        <p className="text-sm text-destructive">
          New tour inquiries could not be loaded.
        </p>
      ) : (
        <Link
          to="/inquiries"
          className="flex items-center gap-3 rounded-[10px] border border-border px-3 py-3 transition-colors hover:border-primary hover:bg-primary-soft/30"
        >
          <div className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-primary-soft">
            <MessageSquare className="size-4 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-bold text-foreground">
              New inquiries awaiting quote
            </div>
            <div className="text-xs text-muted-foreground">
              Tour inquiries with NEW status
            </div>
          </div>
          <span className="shrink-0 rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-black text-primary">
            {isPending ? "—" : `${count ?? 0} new`}
          </span>
        </Link>
      )}

      <Link
        to="/inquiries"
        className="flex items-center gap-1 self-start text-xs font-bold text-primary hover:underline"
      >
        Open tour inquiries <ArrowUpRight className="size-3.5" />
      </Link>
    </Card>
  )
}
