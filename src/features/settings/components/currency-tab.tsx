import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react"
import { toast } from "sonner"

import { Field, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  currencyLabel,
  EXCHANGE_SOURCE_ITEMS,
  normalizeExchangeSource,
  type SettingsTabHandle,
} from "@/features/settings/components/utils"
import type { CurrencyOption } from "@/store/server/settings/typed"
import {
  useCurrencySettings,
  useUpdateCurrencySettings,
} from "@/store/server/settings/settings"

const DEFAULT_OPTIONS: CurrencyOption[] = [
  { code: "AED", enabled: true },
  { code: "USD", enabled: true },
  { code: "EUR", enabled: false },
]

type FormState = {
  defaultCurrency: string
  exchangeRateSource: string
  options: CurrencyOption[]
  version: number
}

export const CurrencyTab = forwardRef<SettingsTabHandle>(
  function CurrencyTab(_, ref) {
    const { data, isPending, isError } = useCurrencySettings()
    const update = useUpdateCurrencySettings()
    const [form, setForm] = useState<FormState>({
      defaultCurrency: "AED",
      exchangeRateSource: "live",
      options: DEFAULT_OPTIONS,
      version: 0,
    })

    useEffect(() => {
      if (!data) return
      const options =
        data.options && data.options.length > 0 ? data.options : DEFAULT_OPTIONS
      setForm({
        defaultCurrency: data.defaultCurrency || "AED",
        exchangeRateSource: normalizeExchangeSource(data.exchangeRateSource),
        options,
        version: data.version ?? 0,
      })
    }, [data])

    const currencyItems = useMemo(() => {
      const items: Record<string, string> = {}
      for (const option of form.options) {
        items[option.code] = currencyLabel(option.code)
      }
      return items
    }, [form.options])

    useImperativeHandle(
      ref,
      () => ({
        save: async () => {
          if (!form.defaultCurrency.trim()) {
            toast.error("Default currency is required")
            return
          }
          const options = form.options.map((option) =>
            option.code === form.defaultCurrency
              ? { ...option, enabled: true }
              : option
          )
          await update.mutateAsync({
            version: form.version,
            defaultCurrency: form.defaultCurrency,
            exchangeRateSource: form.exchangeRateSource.toUpperCase(),
            options,
          })
        },
      }),
      [form, update]
    )

    if (isPending) {
      return (
        <p className="text-sm text-muted-foreground">Loading currencies…</p>
      )
    }
    if (isError) {
      return (
        <p className="text-sm text-destructive">
          Failed to load currency settings.
        </p>
      )
    }

    return (
      <div className="space-y-4">
        <h3 className="font-bold text-foreground">Currency</h3>
        <Field>
          <FieldLabel>Default currency</FieldLabel>
          <Select
            items={currencyItems}
            value={form.defaultCurrency}
            onValueChange={(value) => {
              if (typeof value === "string") {
                setForm((current) => ({ ...current, defaultCurrency: value }))
              }
            }}
          >
            <SelectTrigger className="h-10 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {form.options.map((option) => (
                <SelectItem key={option.code} value={option.code}>
                  {currencyLabel(option.code)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <div className="space-y-2">
          <span className="text-[13px] font-bold text-foreground">
            Enabled currencies
          </span>
          {form.options.map((option) => (
            <label
              key={option.code}
              className="flex items-center justify-between rounded-lg border border-border px-4 py-2.5"
            >
              <span className="text-sm">{currencyLabel(option.code)}</span>
              <Switch
                checked={option.enabled}
                onCheckedChange={(checked) =>
                  setForm((current) => ({
                    ...current,
                    options: current.options.map((item) =>
                      item.code === option.code
                        ? { ...item, enabled: checked }
                        : item
                    ),
                  }))
                }
              />
            </label>
          ))}
        </div>
        <Field>
          <FieldLabel>Exchange rate source</FieldLabel>
          <Select
            items={EXCHANGE_SOURCE_ITEMS}
            value={form.exchangeRateSource}
            onValueChange={(value) => {
              if (value === "live" || value === "manual") {
                setForm((current) => ({
                  ...current,
                  exchangeRateSource: value,
                }))
              }
            }}
          >
            <SelectTrigger className="h-10 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(EXCHANGE_SOURCE_ITEMS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>
    )
  }
)
