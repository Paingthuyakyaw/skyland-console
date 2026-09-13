import { forwardRef, useEffect, useImperativeHandle, useState } from "react"

import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import type { SettingsTabHandle } from "@/features/settings/components/utils"
import {
  useAnalyticsTracking,
  useUpdateAnalyticsTracking,
} from "@/store/server/settings/settings"

type FormState = {
  ga4MeasurementId: string
  googleAdsConversionId: string
  metaPixelId: string
  microsoftClarityProjectId: string
  googleSearchConsoleVerification: string
  bingWebmasterVerification: string
  fullGa4EcommerceTracking: boolean
  conversionTracking: boolean
  callTracking: boolean
  whatsappClickTracking: boolean
  version: number
}

const EMPTY: FormState = {
  ga4MeasurementId: "",
  googleAdsConversionId: "",
  metaPixelId: "",
  microsoftClarityProjectId: "",
  googleSearchConsoleVerification: "",
  bingWebmasterVerification: "",
  fullGa4EcommerceTracking: true,
  conversionTracking: true,
  callTracking: true,
  whatsappClickTracking: true,
  version: 0,
}

const TOGGLES = [
  {
    key: "fullGa4EcommerceTracking",
    title: "Full GA4 e-commerce tracking",
    hint: "Enabled by default for product views, checkout and transaction data.",
  },
  {
    key: "conversionTracking",
    title: "Conversion tracking",
    hint: "Fires for completed bookings and submitted holiday-package inquiries.",
  },
  {
    key: "callTracking",
    title: "Call tracking",
    hint: "Tracks clicks on the website phone number.",
  },
  {
    key: "whatsappClickTracking",
    title: "WhatsApp click tracking",
    hint: "Tracks WhatsApp button clicks as events.",
  },
] as const

export const AnalyticsTab = forwardRef<SettingsTabHandle>(
  function AnalyticsTab(_, ref) {
    const { data, isPending, isError } = useAnalyticsTracking()
    const update = useUpdateAnalyticsTracking()
    const [form, setForm] = useState<FormState>(EMPTY)

    useEffect(() => {
      if (!data) return
      setForm({
        ga4MeasurementId: data.ga4MeasurementId ?? "",
        googleAdsConversionId: data.googleAdsConversionId ?? "",
        metaPixelId: data.metaPixelId ?? "",
        microsoftClarityProjectId: data.microsoftClarityProjectId ?? "",
        googleSearchConsoleVerification:
          data.googleSearchConsoleVerification ?? "",
        bingWebmasterVerification: data.bingWebmasterVerification ?? "",
        fullGa4EcommerceTracking: data.fullGa4EcommerceTracking ?? true,
        conversionTracking: data.conversionTracking ?? true,
        callTracking: data.callTracking ?? true,
        whatsappClickTracking: data.whatsappClickTracking ?? true,
        version: data.version ?? 0,
      })
    }, [data])

    useImperativeHandle(
      ref,
      () => ({
        save: async () => {
          await update.mutateAsync({
            version: form.version,
            ga4MeasurementId: form.ga4MeasurementId.trim(),
            googleAdsConversionId: form.googleAdsConversionId.trim(),
            metaPixelId: form.metaPixelId.trim(),
            microsoftClarityProjectId: form.microsoftClarityProjectId.trim(),
            googleSearchConsoleVerification:
              form.googleSearchConsoleVerification.trim(),
            bingWebmasterVerification: form.bingWebmasterVerification.trim(),
            fullGa4EcommerceTracking: form.fullGa4EcommerceTracking,
            conversionTracking: form.conversionTracking,
            callTracking: form.callTracking,
            whatsappClickTracking: form.whatsappClickTracking,
          })
        },
      }),
      [form, update]
    )

    if (isPending) {
      return <p className="text-sm text-muted-foreground">Loading analytics…</p>
    }
    if (isError) {
      return (
        <p className="text-sm text-destructive">
          Failed to load analytics settings.
        </p>
      )
    }

    return (
      <div className="space-y-5">
        <div>
          <h3 className="font-bold text-foreground">Analytics & Tracking</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure website measurement, advertising and behavioral analytics.
          </p>
        </div>
        <div className="rounded-lg border border-primary/25 bg-primary-soft/45 p-4 text-sm text-foreground">
          <b>Consent Mode protected.</b> All tracking respects the cookie
          consent banner via Consent Mode — nothing fires until consent is
          given.
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="ga4">GA4 Measurement ID</FieldLabel>
            <Input
              id="ga4"
              placeholder="G-XXXXXXXXXX"
              value={form.ga4MeasurementId}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  ga4MeasurementId: event.target.value,
                }))
              }
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="ads">Google Ads Conversion ID</FieldLabel>
            <Input
              id="ads"
              placeholder="AW-XXXXXXXXX"
              value={form.googleAdsConversionId}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  googleAdsConversionId: event.target.value,
                }))
              }
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="meta-pixel">Meta Pixel ID</FieldLabel>
            <Input
              id="meta-pixel"
              placeholder="Meta Pixel ID"
              value={form.metaPixelId}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  metaPixelId: event.target.value,
                }))
              }
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="clarity">
              Microsoft Clarity Project ID
            </FieldLabel>
            <Input
              id="clarity"
              placeholder="Project ID"
              value={form.microsoftClarityProjectId}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  microsoftClarityProjectId: event.target.value,
                }))
              }
            />
            <p className="text-xs text-muted-foreground">
              Recommended for the first three months after launch
            </p>
          </Field>
          <Field>
            <FieldLabel htmlFor="gsc">
              Google Search Console verification
            </FieldLabel>
            <Input
              id="gsc"
              placeholder="Verification meta tag value"
              value={form.googleSearchConsoleVerification}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  googleSearchConsoleVerification: event.target.value,
                }))
              }
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="bing">
              Bing Webmaster Tools verification
            </FieldLabel>
            <Input
              id="bing"
              placeholder="Verification meta tag value"
              value={form.bingWebmasterVerification}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  bingWebmasterVerification: event.target.value,
                }))
              }
            />
          </Field>
        </div>
        <div className="space-y-2">
          {TOGGLES.map((item) => (
            <label
              key={item.key}
              className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
            >
              <span>
                <b className="block text-sm">{item.title}</b>
                <span className="text-xs text-muted-foreground">
                  {item.hint}
                </span>
              </span>
              <Switch
                checked={form[item.key]}
                onCheckedChange={(checked) =>
                  setForm((current) => ({ ...current, [item.key]: checked }))
                }
              />
            </label>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Server-side tracking through Conversions API is used where possible
          for Google Ads and Meta.
        </p>
      </div>
    )
  }
)
