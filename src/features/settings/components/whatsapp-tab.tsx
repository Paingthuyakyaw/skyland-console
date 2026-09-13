import { forwardRef, useEffect, useImperativeHandle, useState } from "react"
import { toast } from "sonner"

import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  optionalText,
  type SettingsTabHandle,
} from "@/features/settings/components/utils"
import {
  useUpdateWhatsAppIntegration,
  useWhatsAppIntegration,
} from "@/store/server/settings/settings"

type FormState = {
  connectedNumber: string
  verified: boolean
  autoReplyMessage: string
  autoReplyOutsideBusinessHoursEnabled: boolean
  version: number
}

const EMPTY: FormState = {
  connectedNumber: "",
  verified: false,
  autoReplyMessage: "",
  autoReplyOutsideBusinessHoursEnabled: false,
  version: 0,
}

export const WhatsAppTab = forwardRef<SettingsTabHandle>(
  function WhatsAppTab(_, ref) {
    const { data, isPending, isError } = useWhatsAppIntegration()
    const update = useUpdateWhatsAppIntegration()
    const [form, setForm] = useState<FormState>(EMPTY)

    useEffect(() => {
      if (!data) return
      setForm({
        connectedNumber: data.connectedNumber ?? "",
        verified: data.verified ?? false,
        autoReplyMessage: data.autoReplyMessage ?? "",
        autoReplyOutsideBusinessHoursEnabled:
          data.autoReplyOutsideBusinessHoursEnabled ?? false,
        version: data.version ?? 0,
      })
    }, [data])

    useImperativeHandle(
      ref,
      () => ({
        save: async () => {
          if (!form.autoReplyMessage.trim()) {
            toast.error("Auto-reply message is required")
            return
          }
          await update.mutateAsync({
            version: form.version,
            connectedNumber: optionalText(form.connectedNumber),
            verified: form.verified,
            autoReplyMessage: form.autoReplyMessage.trim(),
            autoReplyOutsideBusinessHoursEnabled:
              form.autoReplyOutsideBusinessHoursEnabled,
          })
        },
      }),
      [form, update]
    )

    if (isPending) {
      return <p className="text-sm text-muted-foreground">Loading WhatsApp…</p>
    }
    if (isError) {
      return (
        <p className="text-sm text-destructive">
          Failed to load WhatsApp settings.
        </p>
      )
    }

    return (
      <div className="space-y-4">
        <h3 className="font-bold text-foreground">WhatsApp Integration</h3>
        <Field>
          <FieldLabel htmlFor="wa-number">Connected number</FieldLabel>
          <Input
            id="wa-number"
            value={form.connectedNumber}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                connectedNumber: event.target.value,
              }))
            }
          />
          <p className="text-xs text-muted-foreground">
            Verified via WhatsApp Business API
          </p>
        </Field>
        <Field>
          <FieldLabel htmlFor="wa-reply">Auto-reply message</FieldLabel>
          <Textarea
            id="wa-reply"
            rows={4}
            value={form.autoReplyMessage}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                autoReplyMessage: event.target.value,
              }))
            }
          />
        </Field>
        <label className="flex items-center gap-3">
          <Switch
            checked={form.autoReplyOutsideBusinessHoursEnabled}
            onCheckedChange={(checked) =>
              setForm((current) => ({
                ...current,
                autoReplyOutsideBusinessHoursEnabled: checked,
              }))
            }
          />
          <span className="text-sm font-medium">
            Enable auto-reply outside business hours
          </span>
        </label>
        <label className="flex items-center gap-3">
          <Switch
            checked={form.verified}
            onCheckedChange={(checked) =>
              setForm((current) => ({ ...current, verified: checked }))
            }
          />
          <span className="text-sm font-medium">Number is verified</span>
        </label>
      </div>
    )
  }
)
