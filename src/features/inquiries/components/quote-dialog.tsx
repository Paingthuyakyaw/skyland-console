import { useEffect, useState } from "react"

import { CustomDialog } from "@/components/custom-dialog"
import { Button } from "@/components/ui/button"
import { DateTimePicker } from "@/components/ui/date-picker"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

type QuoteDialogProps = {
  open: boolean
  submitting: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (quote: {
    amount: number
    message: string
    expiresAt: string
  }) => void
}

export function QuoteDialog({
  open,
  submitting,
  onOpenChange,
  onConfirm,
}: QuoteDialogProps) {
  const [amount, setAmount] = useState("")
  const [message, setMessage] = useState("")
  const [expiry, setExpiry] = useState("")

  useEffect(() => {
    if (!open) return
    setAmount("")
    setMessage("")
    setExpiry("")
  }, [open])

  const parsedAmount = Number(amount)
  const canSubmit =
    amount.trim().length > 0 &&
    Number.isFinite(parsedAmount) &&
    parsedAmount >= 0 &&
    message.trim().length > 0 &&
    expiry.trim().length > 0

  return (
    <CustomDialog
      open={open}
      onOpenChange={onOpenChange}
      trigger={null}
      title="Record quote"
      description="Send a staff quote for this inquiry. This does not take payment or hold capacity."
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
            disabled={submitting || !canSubmit}
            onClick={() =>
              onConfirm({
                amount: parsedAmount,
                message: message.trim(),
                expiresAt: expiry,
              })
            }
          >
            {submitting ? "Sending…" : "Send quote record"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field>
          <FieldLabel>Quote amount (AED)</FieldLabel>
          <Input
            type="number"
            min={0}
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel>Quote message</FieldLabel>
          <Textarea
            rows={3}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Include inclusions, hotel notes, or next steps…"
          />
        </Field>
        <Field>
          <FieldLabel>Expiry date and time</FieldLabel>
          <DateTimePicker
            value={expiry}
            onChange={setExpiry}
            placeholder="Pick expiry date and time"
          />
        </Field>
      </div>
    </CustomDialog>
  )
}
