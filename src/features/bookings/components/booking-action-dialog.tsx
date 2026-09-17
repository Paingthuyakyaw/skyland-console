import { useEffect, useState } from "react"

import { CustomDialog } from "@/components/custom-dialog"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  CANCEL_REASON_ITEMS,
  REFUND_REASON_ITEMS,
} from "@/features/bookings/components/utils"

export type BookingActionKind = "cancel" | "refund"

type BookingActionDialogProps = {
  open: boolean
  kind: BookingActionKind | null
  submitting: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (reason: string) => void
}

function reasonItems(kind: BookingActionKind | null) {
  return kind === "refund" ? REFUND_REASON_ITEMS : CANCEL_REASON_ITEMS
}

export function BookingActionDialog({
  open,
  kind,
  submitting,
  onOpenChange,
  onConfirm,
}: BookingActionDialogProps) {
  const items = reasonItems(kind)
  const defaultReason = Object.keys(items)[0] ?? "Customer request"
  const [reason, setReason] = useState(defaultReason)
  const [note, setNote] = useState("")

  useEffect(() => {
    if (!open) return
    setReason(Object.keys(reasonItems(kind))[0] ?? "Customer request")
    setNote("")
  }, [open, kind])

  const needsNote = reason === "Other"
  const title = kind === "refund" ? "Refund booking" : "Cancel booking"
  const confirmLabel =
    kind === "refund" ? "Confirm refund" : "Confirm cancellation"

  const handleConfirm = () => {
    const trimmedNote = note.trim()
    if (needsNote && !trimmedNote) return
    const value =
      reason === "Other"
        ? trimmedNote
        : trimmedNote
          ? `${reason}: ${trimmedNote}`
          : reason
    onConfirm(value)
  }

  return (
    <CustomDialog
      open={open}
      onOpenChange={onOpenChange}
      trigger={null}
      title={title}
      description={
        kind === "refund"
          ? "This requests a refund through the connected payment gateway."
          : "This cancels the reservation and records the reason against the booking."
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
            Close
          </Button>
          <Button
            type="button"
            variant={kind === "refund" ? "default" : "destructive"}
            disabled={submitting || (needsNote && !note.trim())}
            onClick={handleConfirm}
          >
            {submitting
              ? kind === "refund"
                ? "Refunding…"
                : "Cancelling…"
              : confirmLabel}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field>
          <FieldLabel>Reason</FieldLabel>
          <Select
            items={items}
            value={reason}
            onValueChange={(value) => {
              if (value && value in items) setReason(value)
            }}
          >
            <SelectTrigger className="h-10 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(items).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field>
          <FieldLabel>{needsNote ? "Note (required)" : "Note"}</FieldLabel>
          <Textarea
            rows={4}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder={
              needsNote
                ? "Add the cancellation or refund reason…"
                : "Optional extra detail"
            }
          />
        </Field>
      </div>
    </CustomDialog>
  )
}
