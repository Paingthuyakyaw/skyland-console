import { forwardRef, useEffect, useImperativeHandle, useState } from "react"

import { Switch } from "@/components/ui/switch"
import {
  NOTIFICATION_EVENTS,
  type SettingsTabHandle,
} from "@/features/settings/components/utils"
import type { NotificationRule } from "@/store/server/settings/typed"
import {
  useNotificationSettings,
  useUpdateNotificationSettings,
} from "@/store/server/settings/settings"

function defaultRules(): NotificationRule[] {
  return NOTIFICATION_EVENTS.map((event, index) => ({
    eventType: event.eventType,
    emailEnabled: true,
    smsEnabled: false,
    whatsappEnabled: index < 2,
  }))
}

export const NotificationsTab = forwardRef<SettingsTabHandle>(
  function NotificationsTab(_, ref) {
    const { data, isPending, isError } = useNotificationSettings()
    const update = useUpdateNotificationSettings()
    const [form, setForm] = useState<{
      rules: NotificationRule[]
      version: number
    }>({
      rules: defaultRules(),
      version: 0,
    })

    useEffect(() => {
      if (!data) return
      const incoming = data.rules ?? []
      setForm({
        rules: NOTIFICATION_EVENTS.map((event) => {
          const match = incoming.find(
            (rule) => rule.eventType === event.eventType
          )
          return (
            match ?? {
              eventType: event.eventType,
              emailEnabled: true,
              smsEnabled: false,
              whatsappEnabled: false,
            }
          )
        }),
        version: data.version ?? 0,
      })
    }, [data])

    useImperativeHandle(
      ref,
      () => ({
        save: async () => {
          await update.mutateAsync({
            version: form.version,
            rules: form.rules,
          })
        },
      }),
      [form, update]
    )

    const patch = (
      eventType: NotificationRule["eventType"],
      field: "emailEnabled" | "smsEnabled" | "whatsappEnabled",
      value: boolean
    ) => {
      setForm((current) => ({
        ...current,
        rules: current.rules.map((rule) =>
          rule.eventType === eventType ? { ...rule, [field]: value } : rule
        ),
      }))
    }

    if (isPending) {
      return (
        <p className="text-sm text-muted-foreground">Loading notifications…</p>
      )
    }
    if (isError) {
      return (
        <p className="text-sm text-destructive">
          Failed to load notification settings.
        </p>
      )
    }

    return (
      <div className="space-y-4">
        <h3 className="font-bold text-foreground">Notification Settings</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs font-bold text-muted-foreground uppercase">
              <th className="py-2">Event</th>
              <th className="text-center">Email</th>
              <th className="text-center">SMS</th>
              <th className="text-center">WhatsApp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {NOTIFICATION_EVENTS.map((event) => {
              const rule = form.rules.find(
                (item) => item.eventType === event.eventType
              ) ?? {
                eventType: event.eventType,
                emailEnabled: false,
                smsEnabled: false,
                whatsappEnabled: false,
              }
              return (
                <tr key={event.eventType}>
                  <td className="py-3 font-medium text-foreground">
                    {event.label}
                  </td>
                  {(
                    ["emailEnabled", "smsEnabled", "whatsappEnabled"] as const
                  ).map((field) => (
                    <td key={field} className="py-3 text-center">
                      <div className="flex justify-center">
                        <Switch
                          checked={rule[field]}
                          onCheckedChange={(checked) =>
                            patch(event.eventType, field, checked)
                          }
                        />
                      </div>
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    )
  }
)
