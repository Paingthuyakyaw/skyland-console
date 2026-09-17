import { useEffect, useState } from "react"

import { CustomDialog } from "@/components/custom-dialog"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"

export type ResolutionKind = "DECLINED" | "CLOSED"

type ResolutionDialogProps = {
  open: boolean
  kind: ResolutionKind | null
  submitting: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (reason: string) => void
}

export function ResolutionDialog({
  open,
  kind,
  submitting,
  onOpenChange,
  onConfirm,
}: ResolutionDialogProps) {
  const [reason, setReason] = useState("")

  useEffect(() => {
    if (!open) return
    setReason("")
  }, [open, kind])

  const isDecline = kind === "DECLINED"
  const title = isDecline ? "Decline inquiry" : "Close case"
  const confirmLabel = isDecline ? "Decline" : "Close case"

  return (
    <CustomDialog
      open={open}
      onOpenChange={onOpenChange}
      trigger={null}
      title={title}
      description={
        isDecline
          ? "This marks the quote as declined and records a reason on the sales case."
          : "This closes the sales case after it has been accepted or declined."
      }
      showDone={false}
      contentClassName="sm:max-w-md"
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            disabled={submitting}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant={isDecline ? "destructive" : "outline"}
            disabled={submitting || !reason.trim()}
            onClick={() => onConfirm(reason.trim())}
          >
            {submitting ? "Saving…" : confirmLabel}
          </Button>
        </>
      }
    >
      <Field>
        <FieldLabel>Reason</FieldLabel>
        <Textarea
          rows={4}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder={
            isDecline
              ? "Why was this inquiry declined?"
              : "Why is this case being closed?"
          }
        />
      </Field>
    </CustomDialog>
  )
}
