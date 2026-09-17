import { useEffect, type ReactNode } from "react"
import { X } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { QuoteDialog } from "@/features/inquiries/components/quote-dialog"
import {
  ResolutionDialog,
  type ResolutionKind,
} from "@/features/inquiries/components/resolution-dialog"
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
  resolveItem,
  SALES_QUEUE_UI,
  toIsoDateTime,
} from "@/features/inquiries/components/utils"
import { cn } from "@/lib/utils"
import {
  useAcceptSalesCase,
  useCloseSalesCase,
  useDeclineSalesCase,
  useQuoteSalesCase,
  useSalesCase,
  useStartProcessingSalesCase,
} from "@/store/server/inquiries/inquiries"
import type { SalesQueue } from "@/store/server/inquiries/typed"

type InquiryDrawerProps = {
  kind: SalesQueue
  workflowId: string | null
  quoteOpen: boolean
  resolution: ResolutionKind | null
  onQuoteOpenChange: (open: boolean) => void
  onResolutionChange: (kind: ResolutionKind | null) => void
  onClose: () => void
}

function DrawerSection({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section>
      <h3 className="mb-2 text-xs font-bold tracking-wider text-muted-foreground uppercase">
        {title}
      </h3>
      {children}
    </section>
  )
}

export function InquiryDrawer({
  kind,
  workflowId,
  quoteOpen,
  resolution,
  onQuoteOpenChange,
  onResolutionChange,
  onClose,
}: InquiryDrawerProps) {
  const queue = SALES_QUEUE_UI[kind]
  const open = Boolean(workflowId)
  const { data, isPending, isError } = useSalesCase(
    kind,
    workflowId ?? "",
    open
  )
  const startProcessing = useStartProcessingSalesCase(kind)
  const quoteInquiry = useQuoteSalesCase(kind)
  const acceptInquiry = useAcceptSalesCase(kind)
  const declineInquiry = useDeclineSalesCase(kind)
  const closeInquiry = useCloseSalesCase(kind)
  const submitting =
    startProcessing.isPending ||
    quoteInquiry.isPending ||
    acceptInquiry.isPending ||
    declineInquiry.isPending ||
    closeInquiry.isPending

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !quoteOpen && !resolution) onClose()
    }
    window.addEventListener("keydown", onKeyDown)
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onKeyDown)
      document.body.style.overflow = previous
    }
  }, [open, quoteOpen, resolution, onClose])

  const requireVersion = () => {
    if (typeof data?.version !== "number") {
      toast.error("This inquiry cannot be updated because it has no version.")
      return null
    }
    return data.version
  }

  const handleStartProcessing = () => {
    if (!data) return
    const version = requireVersion()
    if (version === null) return
    startProcessing.mutate({ workflowId: data.id, action: { version } })
  }

  const handleQuote = (quote: {
    amount: number
    message: string
    expiresAt: string
  }) => {
    if (!data) return
    const version = requireVersion()
    if (version === null) return
    quoteInquiry.mutate(
      {
        workflowId: data.id,
        action: {
          version,
          amount: quote.amount,
          currency: "AED",
          message: quote.message,
          expiresAt: toIsoDateTime(quote.expiresAt),
        },
      },
      { onSuccess: () => onQuoteOpenChange(false) }
    )
  }

  const handleAccept = () => {
    if (!data) return
    const version = requireVersion()
    if (version === null) return
    acceptInquiry.mutate({ workflowId: data.id, action: { version } })
  }

  const handleResolution = (reason: string) => {
    if (!data || !resolution) return
    const version = requireVersion()
    if (version === null) return
    const payload = {
      workflowId: data.id,
      action: { version, reason },
    }
    if (resolution === "DECLINED") {
      declineInquiry.mutate(payload, {
        onSuccess: () => onResolutionChange(null),
      })
      return
    }
    closeInquiry.mutate(payload, {
      onSuccess: () => onResolutionChange(null),
    })
  }

  if (!open) return null

  const status = isInquiryStatus(data?.status) ? data.status : null
  const products = data?.items ?? []
  const dialogOpen = quoteOpen || resolution !== null

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        className="absolute inset-0 bg-black/20"
        aria-label="Close inquiry details"
        onClick={() => {
          if (!dialogOpen) onClose()
        }}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="inquiry-drawer-title"
        className="absolute inset-y-0 right-0 flex w-full max-w-xl flex-col bg-card shadow-xl ring-1 ring-foreground/10"
      >
        {isPending ? (
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="text-lg font-black text-foreground">
                {queue.title}
              </h2>
              <button
                type="button"
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
                onClick={onClose}
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="px-6 py-12 text-center text-sm text-muted-foreground">
              Loading inquiry…
            </p>
          </div>
        ) : null}

        {isError || (!isPending && !data) ? (
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="text-lg font-black text-foreground">
                {queue.title}
              </h2>
              <button
                type="button"
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
                onClick={onClose}
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="px-6 py-12 text-center text-sm text-destructive">
              Failed to load inquiry.
            </p>
          </div>
        ) : null}

        {data ? (
          <>
            <div className="flex items-start justify-between border-b border-border px-6 py-5">
              <div>
                <div className="text-xs font-bold text-primary">
                  SHARED SALES CASE · VERSION {data.version ?? "—"}
                </div>
                <h2
                  id="inquiry-drawer-title"
                  className="mt-1 text-xl font-black text-foreground"
                >
                  {formatCaseRef(data.salesCaseId || data.id)}
                </h2>
                <Badge
                  className={cn(
                    "mt-2 h-auto border-transparent px-2.5 py-0.5 text-xs font-bold",
                    status
                      ? INQUIRY_STATUS_CLASS[status]
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {status
                    ? INQUIRY_STATUS_LABEL[status]
                    : data.status?.replaceAll("_", " ") || "—"}
                </Badge>
              </div>
              <button
                type="button"
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
                onClick={onClose}
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
              <Card className="p-4">
                <div className="font-bold text-foreground">
                  {customerName(data)}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {[data.email, data.country, data.phoneNumber]
                    .filter(Boolean)
                    .join(" · ") || "—"}
                </div>
                {data.hotelType || data.roomCount ? (
                  <div className="mt-2 text-sm text-muted-foreground">
                    {[
                      data.hotelType
                        ? `Hotel preference: ${data.hotelType}`
                        : null,
                      data.roomCount ? `Rooms: ${data.roomCount}` : null,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </div>
                ) : null}
              </Card>

              {isMixedCase(data) ? (
                <div className="rounded-lg border border-primary/20 bg-primary-soft/45 p-3 text-xs text-foreground">
                  This is one shared sales case and may also appear in another
                  product queue. Its ID, status, and version are shared
                  everywhere.
                </div>
              ) : null}

              <DrawerSection title="Selected products">
                <Card className="space-y-2 p-4">
                  {products.length > 0 ? (
                    products.map((item, index) => {
                      const product = resolveItem(
                        item,
                        data.productType ?? queue.chip
                      )
                      return (
                        <div
                          key={item.id || `${data.id}-${index}`}
                          className="flex items-start justify-between gap-3 text-sm"
                        >
                          <span className="font-medium">{product.title}</span>
                          <span className="text-right text-muted-foreground">
                            Indicative only — not a final quote
                          </span>
                        </div>
                      )
                    })
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      No products attached.
                    </div>
                  )}
                </Card>
              </DrawerSection>

              <Card className="p-4">
                <h3 className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                  Travel requirements
                </h3>
                <div className="mt-2 text-sm">
                  Requested: {formatDate(data.requestedDate)} ·{" "}
                  {partySummary(data)}
                </div>
                {queue.inquiryOnly ? (
                  <div className="mt-3 rounded-lg bg-status-pending-bg p-2.5 text-xs font-bold text-status-pending">
                    Inquiry only — no capacity hold or online price lock
                  </div>
                ) : null}
                {data.description || data.customerDetails?.customerRemarks ? (
                  <p className="mt-3 text-sm text-muted-foreground">
                    {data.description || data.customerDetails?.customerRemarks}
                  </p>
                ) : null}
              </Card>

              <Card className="p-4">
                <h3 className="mb-2 text-xs font-bold tracking-wider text-muted-foreground uppercase">
                  Quote history
                </h3>
                <div className="border-l-2 border-primary pl-3 text-sm">
                  <b>
                    {status
                      ? INQUIRY_STATUS_LABEL[status]
                      : data.status?.replaceAll("_", " ") || "—"}
                  </b>
                  <div className="text-xs text-muted-foreground">
                    {formatRelativeTime(data.updatedAt)}
                  </div>
                </div>
                {data.staffQuote?.amount != null ? (
                  <div className="mt-3 border-l-2 border-secondary pl-3 text-sm">
                    <b>
                      Quote recorded:{" "}
                      {formatMoney(
                        data.staffQuote.amount,
                        data.staffQuote.currency
                      )}
                    </b>
                    <div className="text-xs text-muted-foreground">
                      Expires {formatDateTime(data.staffQuote.expiresAt)}
                    </div>
                    {data.staffQuote.message ? (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {data.staffQuote.message}
                      </p>
                    ) : null}
                  </div>
                ) : null}
                {data.resolutionReason ? (
                  <div className="mt-3 border-l-2 border-muted-foreground/40 pl-3 text-sm">
                    <b>Resolution</b>
                    <p className="text-sm text-muted-foreground">
                      {data.resolutionReason}
                    </p>
                  </div>
                ) : null}
              </Card>

              {status === "NEW" ? (
                <Button
                  type="button"
                  disabled={submitting}
                  onClick={handleStartProcessing}
                >
                  {startProcessing.isPending ? "Starting…" : "Start processing"}
                </Button>
              ) : null}

              {status === "IN_PROGRESS" ? (
                <Button
                  type="button"
                  disabled={submitting}
                  onClick={() => onQuoteOpenChange(true)}
                >
                  Record quote
                </Button>
              ) : null}

              {status === "QUOTED" ? (
                <div className="flex gap-2">
                  <Button
                    type="button"
                    disabled={submitting}
                    onClick={handleAccept}
                  >
                    {acceptInquiry.isPending ? "Saving…" : "Mark accepted"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={submitting}
                    onClick={() => onResolutionChange("DECLINED")}
                  >
                    Decline
                  </Button>
                </div>
              ) : null}

              {status === "ACCEPTED" || status === "DECLINED" ? (
                <Button
                  type="button"
                  variant="outline"
                  disabled={submitting}
                  onClick={() => onResolutionChange("CLOSED")}
                >
                  Close case
                </Button>
              ) : null}
            </div>
          </>
        ) : null}
      </aside>

      <QuoteDialog
        open={quoteOpen}
        submitting={quoteInquiry.isPending}
        onOpenChange={(nextOpen) => {
          if (!nextOpen && !quoteInquiry.isPending) onQuoteOpenChange(false)
        }}
        onConfirm={handleQuote}
      />

      <ResolutionDialog
        open={resolution !== null}
        kind={resolution}
        submitting={declineInquiry.isPending || closeInquiry.isPending}
        onOpenChange={(nextOpen) => {
          if (
            !nextOpen &&
            !declineInquiry.isPending &&
            !closeInquiry.isPending
          ) {
            onResolutionChange(null)
          }
        }}
        onConfirm={handleResolution}
      />
    </div>
  )
}
