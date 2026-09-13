import { useRef, useState } from "react"
import {
  Bell,
  Building2,
  ChartNoAxesCombined,
  Coins,
  MessageCircle,
  Receipt,
} from "lucide-react"

import { PagePlaceholder } from "@/components/page-placeholder"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { AnalyticsTab } from "@/features/settings/components/analytics-tab"
import { CompanyTab } from "@/features/settings/components/company-tab"
import { CurrencyTab } from "@/features/settings/components/currency-tab"
import { NotificationsTab } from "@/features/settings/components/notifications-tab"
import { TaxTab } from "@/features/settings/components/tax-tab"
import type {
  SettingsTabHandle,
  SettingsTabKey,
} from "@/features/settings/components/utils"
import { WhatsAppTab } from "@/features/settings/components/whatsapp-tab"
import { cn } from "@/lib/utils"

const TABS = [
  { key: "company", label: "Company Information", icon: Building2 },
  { key: "whatsapp", label: "WhatsApp", icon: MessageCircle },
  { key: "currency", label: "Currencies", icon: Coins },
  { key: "tax", label: "Tax / VAT", icon: Receipt },
  { key: "notifications", label: "Notifications", icon: Bell },
  {
    key: "analytics",
    label: "Analytics & Tracking",
    icon: ChartNoAxesCombined,
  },
] as const satisfies ReadonlyArray<{
  key: SettingsTabKey
  label: string
  icon: typeof Building2
}>

const SettingsFeature = () => {
  const [ui, setUi] = useState<{
    tab: SettingsTabKey
    saving: boolean
  }>({
    tab: "company",
    saving: false,
  })
  const saveRef = useRef<SettingsTabHandle>(null)

  const handleSave = async () => {
    if (!saveRef.current) return
    setUi((current) => ({ ...current, saving: true }))
    try {
      await saveRef.current.save()
    } finally {
      setUi((current) => ({ ...current, saving: false }))
    }
  }

  return (
    <div>
      <PagePlaceholder
        title="Settings"
        subtitle="Configure the Skyland console and public website settings."
        actions={
          <Button
            type="button"
            disabled={ui.saving}
            onClick={() => {
              void handleSave()
            }}
          >
            {ui.saving ? "Saving…" : "Save changes"}
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <Card className="h-fit gap-0 p-2 lg:col-span-1">
          {TABS.map((item) => {
            const Icon = item.icon
            const active = ui.tab === item.key
            return (
              <button
                key={item.key}
                type="button"
                onClick={() =>
                  setUi((current) => ({ ...current, tab: item.key }))
                }
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-bold transition-colors",
                  active
                    ? "bg-primary text-white"
                    : "text-foreground/75 hover:bg-muted"
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4",
                    active ? "text-white" : "text-muted-foreground"
                  )}
                />
                {item.label}
              </button>
            )
          })}
        </Card>

        <Card className="p-6 lg:col-span-3">
          {ui.tab === "company" ? <CompanyTab ref={saveRef} /> : null}
          {ui.tab === "whatsapp" ? <WhatsAppTab ref={saveRef} /> : null}
          {ui.tab === "currency" ? <CurrencyTab ref={saveRef} /> : null}
          {ui.tab === "tax" ? <TaxTab ref={saveRef} /> : null}
          {ui.tab === "notifications" ? (
            <NotificationsTab ref={saveRef} />
          ) : null}
          {ui.tab === "analytics" ? <AnalyticsTab ref={saveRef} /> : null}
        </Card>
      </div>
    </div>
  )
}

export default SettingsFeature
