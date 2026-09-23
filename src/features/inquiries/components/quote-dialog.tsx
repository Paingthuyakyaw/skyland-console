import { useState } from "react"
import { toast } from "sonner"

import { CustomDialog } from "@/components/custom-dialog"
import { Button } from "@/components/ui/button"
import { DateTimePicker } from "@/components/ui/date-picker"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

type QuoteDialogProps = {
  open: boolean
  submitting: boolean
  attachmentRequired?: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (quote: {
    amount: number
    message: string
    expiresAt: string
    attachment?: File
  }) => void
}

export function QuoteDialog({
  open,
  submitting,
  attachmentRequired = false,
  onOpenChange,
  onConfirm,
}: QuoteDialogProps) {
  const [attachment, setAttachment] = useState<File | undefined>()
  const [amount, setAmount] = useState("")
  const [message, setMessage] = useState("")
  const [expiry, setExpiry] = useState("")

  const [openedAt] = useState(() => Date.now())

  const parsedAmount = Number(amount)
  const canSubmit =
    amount.trim().length > 0 &&
    Number.isFinite(parsedAmount) &&
    parsedAmount >= 0 &&
    message.trim().length > 0 &&
    expiry.trim().length > 0 &&
    new Date(expiry).getTime() > openedAt &&
    (!attachmentRequired || Boolean(attachment))

  return (
    <CustomDialog
      open={open}
      onOpenChange={onOpenChange}
      trigger={null}
      title="Record quote"
      description="Record the prepared quote and supporting document. This does not take payment or hold capacity."
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
            onClick={() => {
              if (new Date(expiry).getTime() <= Date.now()) {
                toast.error("Choose an expiry in the future.")
                return
              }
              onConfirm({
                amount: parsedAmount,
                message: message.trim(),
                expiresAt: expiry,
                attachment,
              })
            }}
          >
            {submitting ? "Recording…" : "Record quote"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {attachmentRequired ? (
          <Field>
            <FieldLabel htmlFor="quote-attachment">
              Quote attachment (required)
            </FieldLabel>
            <Input
              id="quote-attachment"
              key={String(open)}
              type="file"
              accept="application/pdf,image/jpeg,image/png"
              disabled={submitting}
              onChange={(event) => setAttachment(event.target.files?.[0])}
            />
            <p className="text-xs text-muted-foreground">
              PDF, JPEG or PNG. The file will be available in Quote history.
            </p>
          </Field>
        ) : null}
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
