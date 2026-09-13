import { forwardRef, useEffect, useImperativeHandle, useState } from "react"
import { toast } from "sonner"

import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import type { SettingsTabHandle } from "@/features/settings/components/utils"
import { useTaxVat, useUpdateTaxVat } from "@/store/server/settings/settings"

type FormState = {
  vatRatePercent: string
  pricesTaxInclusive: boolean
  invoiceNumberingPrefix: string
  version: number
}

const EMPTY: FormState = {
  vatRatePercent: "5",
  pricesTaxInclusive: true,
  invoiceNumberingPrefix: "SKY-INV-",
  version: 0,
}

export const TaxTab = forwardRef<SettingsTabHandle>(function TaxTab(_, ref) {
  const { data, isPending, isError } = useTaxVat()
  const update = useUpdateTaxVat()
  const [form, setForm] = useState<FormState>(EMPTY)

  useEffect(() => {
    if (!data) return
    setForm({
      vatRatePercent: String(data.vatRatePercent ?? 5),
      pricesTaxInclusive: data.pricesTaxInclusive ?? true,
      invoiceNumberingPrefix: data.invoiceNumberingPrefix ?? "SKY-INV-",
      version: data.version ?? 0,
    })
  }, [data])

  useImperativeHandle(
    ref,
    () => ({
      save: async () => {
        const vat = Number(form.vatRatePercent)
        if (!Number.isFinite(vat) || vat < 0 || vat > 100) {
          toast.error("Enter a VAT rate between 0 and 100")
          return
        }
        if (!form.invoiceNumberingPrefix.trim()) {
          toast.error("Invoice numbering prefix is required")
          return
        }
        await update.mutateAsync({
          version: form.version,
          vatRatePercent: vat,
          pricesTaxInclusive: form.pricesTaxInclusive,
          invoiceNumberingPrefix: form.invoiceNumberingPrefix.trim(),
        })
      },
    }),
    [form, update]
  )

  if (isPending) {
    return (
      <p className="text-sm text-muted-foreground">Loading tax settings…</p>
    )
  }
  if (isError) {
    return (
      <p className="text-sm text-destructive">Failed to load tax settings.</p>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-foreground">Tax / VAT</h3>
      <Field>
        <FieldLabel htmlFor="vat-rate">VAT rate (%)</FieldLabel>
        <Input
          id="vat-rate"
          type="number"
          min="0"
          max="100"
          step="0.01"
          value={form.vatRatePercent}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              vatRatePercent: event.target.value,
            }))
          }
        />
      </Field>
      <label className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
        <span className="text-sm font-medium">Prices are tax-inclusive</span>
        <Switch
          checked={form.pricesTaxInclusive}
          onCheckedChange={(checked) =>
            setForm((current) => ({
              ...current,
              pricesTaxInclusive: checked,
            }))
          }
        />
      </label>
      <Field>
        <FieldLabel htmlFor="invoice-prefix">
          Invoice numbering prefix
        </FieldLabel>
        <Input
          id="invoice-prefix"
          value={form.invoiceNumberingPrefix}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              invoiceNumberingPrefix: event.target.value,
            }))
          }
        />
      </Field>
    </div>
  )
})
