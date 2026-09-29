import { useMemo, useState } from "react"
import { Check } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { statusLabel as comboStatusLabel } from "@/features/combo-tours/components/utils"
import { statusLabel as holidayStatusLabel } from "@/features/holiday-packages/components/utils"
import { statusLabel as tourStatusLabel } from "@/features/tours/components/utils"
import {
  savePriceDrafts,
  type PriceProductType,
} from "@/features/website/components/price-save"
import { apiErrorMessage } from "@/store/server/api-error"
import { useComboTours } from "@/store/server/combo/tours"
import { useHolidayPackages } from "@/store/server/holiday/packages"
import { useTours } from "@/store/server/tours/tours"
import { COMBO_TOURS_ENABLED } from "@/lib/feature-flags"
import { cn } from "@/lib/utils"

type PriceRow = {
  id: string
  name: string
  type: PriceProductType
  price: number
  sale?: number
  status: string
  productId: string
  priceInput: string
  saleInput: string
}

const TYPE_CLASS: Record<PriceProductType, string> = {
  Tour: "bg-type-tour-bg text-type-tour",
  Combo: "bg-type-combo-bg text-type-combo",
  Package: "bg-type-package-bg text-type-package",
}

const TYPE_DOT: Record<PriceProductType, string> = {
  Tour: "#00afef",
  Combo: "#8b5cf6",
  Package: "#f0871f",
}

const STATUS_CLASS: Record<string, string> = {
  Active: "bg-status-confirmed-bg text-status-confirmed",
  Draft: "bg-status-pending-bg text-status-pending",
  Inactive: "bg-muted text-muted-foreground",
  Scheduled: "bg-status-pending-bg text-status-pending",
}

function toNumber(value: string) {
  if (value.trim() === "") return Number.NaN
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : Number.NaN
}

function parseSale(value: string) {
  if (value.trim() === "") return undefined
  const parsed = toNumber(value)
  return Number.isNaN(parsed) ? undefined : parsed
}

function rowValidationError(row: PriceRow) {
  const price = toNumber(row.priceInput)
  if (!Number.isFinite(price) || price < 0) return "Enter a valid base price."
  if (row.saleInput.trim() === "") return null
  const sale = toNumber(row.saleInput)
  if (!Number.isFinite(sale) || sale < 0) return "Enter a valid sale price."
  if (sale > price) return "Sale price cannot exceed the base price."
  return null
}

function isDirty(row: PriceRow) {
  const price = toNumber(row.priceInput)
  const sale = parseSale(row.saleInput)
  if (!Number.isFinite(price)) return true
  if (row.saleInput.trim() !== "" && sale === undefined) return true
  if (price !== row.price) return true
  return (sale ?? undefined) !== (row.sale ?? undefined)
}

export function PricesTab() {
  const {
    data: toursPage,
    isPending: toursPending,
    isError: toursError,
  } = useTours({ size: 50 })
  const {
    data: combosPage,
    isPending: combosPending,
    isError: combosError,
  } = useComboTours({ size: 50 }, COMBO_TOURS_ENABLED)
  const {
    data: packagesPage,
    isPending: packagesPending,
    isError: packagesError,
  } = useHolidayPackages({ size: 50 })
  const [edits, setEdits] = useState<
    Record<string, Pick<PriceRow, "priceInput" | "saleInput">>
  >({})
  const [saving, setSaving] = useState(false)
  const [rowErrors, setRowErrors] = useState<Record<string, string>>({})
  const [saveMessage, setSaveMessage] = useState("")

  const sourceRows = useMemo<
    Omit<PriceRow, "priceInput" | "saleInput">[]
  >(() => {
    const tours = (toursPage?.content ?? []).map((tour) => ({
      id: `tour-${tour.id}`,
      name: tour.title,
      type: "Tour" as const,
      price: tour.adultPrice,
      sale: tour.discountPrice,
      status: tourStatusLabel(tour.status, tour.statusLabel),
      productId: tour.id,
    }))
    const combos = COMBO_TOURS_ENABLED
      ? (combosPage?.content ?? []).map((tour) => ({
          id: `combo-${tour.id}`,
          name: tour.title,
          type: "Combo" as const,
          price: tour.comboPrice,
          sale: tour.discountPrice,
          status: comboStatusLabel(tour.status),
          productId: tour.id,
        }))
      : []
    const packages = (packagesPage?.content ?? []).map((pkg) => ({
      id: `package-${pkg.id}`,
      name: pkg.title,
      type: "Package" as const,
      price: pkg.fromPrice,
      sale: pkg.discountPrice,
      status: holidayStatusLabel(pkg.status),
      productId: pkg.id,
    }))
    return [...tours, ...combos, ...packages]
  }, [combosPage?.content, packagesPage?.content, toursPage?.content])

  const rows = useMemo(
    () =>
      sourceRows.map((row) => ({
        ...row,
        priceInput: edits[row.id]?.priceInput ?? String(row.price),
        saleInput:
          edits[row.id]?.saleInput ??
          (row.sale == null ? "" : String(row.sale)),
      })),
    [edits, sourceRows]
  )

  const dirtyRows = rows.filter(isDirty)
  const isPending =
    toursPending || (COMBO_TOURS_ENABLED && combosPending) || packagesPending
  const isError =
    toursError || (COMBO_TOURS_ENABLED && combosError) || packagesError

  const patch = (
    id: string,
    field: "priceInput" | "saleInput",
    value: string
  ) => {
    setRowErrors((current) => {
      const next = { ...current }
      delete next[id]
      return next
    })
    setSaveMessage("")
    const row = rows.find((item) => item.id === id)
    if (!row) return
    const nextRow = { ...row, [field]: value }
    setEdits((current) => {
      const next = { ...current }
      if (isDirty(nextRow)) {
        next[id] = {
          priceInput: nextRow.priceInput,
          saleInput: nextRow.saleInput,
        }
      } else {
        delete next[id]
      }
      return next
    })
  }

  const handleSave = async () => {
    if (dirtyRows.length === 0) {
      toast.message("No price changes to save")
      return
    }

    const validationErrors = Object.fromEntries(
      dirtyRows.flatMap((row) => {
        const error = rowValidationError(row)
        return error ? [[row.id, error]] : []
      })
    )
    const validRows = dirtyRows.filter((row) => !validationErrors[row.id])
    if (validRows.length === 0) {
      setRowErrors(validationErrors)
      setSaveMessage("Review the highlighted prices and try again.")
      return
    }

    setSaving(true)
    setRowErrors(validationErrors)
    setSaveMessage("")
    try {
      const result = await savePriceDrafts(
        validRows.map((row) => ({
          type: row.type,
          productId: row.productId,
          price: toNumber(row.priceInput),
          sale: parseSale(row.saleInput),
        }))
      )
      setEdits((current) => {
        const next = { ...current }
        for (const draft of result.saved) {
          delete next[`${draft.type.toLowerCase()}-${draft.productId}`]
        }
        return next
      })
      const failedCount =
        Object.keys(validationErrors).length + result.failed.length
      if (failedCount > 0) {
        setRowErrors({
          ...validationErrors,
          ...Object.fromEntries(
            result.failed.map(({ draft, error }) => [
              `${draft.type.toLowerCase()}-${draft.productId}`,
              apiErrorMessage(error, "Could not save this price. Try again."),
            ])
          ),
        })
        setSaveMessage(
          result.saved.length > 0
            ? `${result.saved.length} price${result.saved.length === 1 ? "" : "s"} saved. ${failedCount} need attention.`
            : "No prices were saved. Review the highlighted rows."
        )
      } else {
        toast.success(
          `${result.saved.length} price${result.saved.length === 1 ? "" : "s"} saved`
        )
      }
    } catch (error) {
      setSaveMessage(
        apiErrorMessage(error, "Failed to refresh prices. Please try again.")
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="gap-0 overflow-hidden py-0">
      <div className="px-5 py-4">
        <h3 className="font-bold text-foreground">Quick Price Edit</h3>
        <p className="text-xs text-muted-foreground">
          Fast bulk edits — for deeper changes open the full form in Products.
        </p>
        {saveMessage && (
          <p
            role="alert"
            className="mt-3 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
          >
            {saveMessage}
          </p>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px]">
          <thead className="border-y border-border bg-muted/40">
            <tr>
              {["Product", "Type", "Price", "Sale price", "Status"].map(
                (label) => (
                  <th
                    key={label}
                    className="px-4 py-3 text-left text-[11px] font-bold tracking-wider text-muted-foreground uppercase"
                  >
                    {label}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isPending ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-12 text-center text-sm text-muted-foreground"
                >
                  Loading products…
                </td>
              </tr>
            ) : null}

            {isError ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-12 text-center text-sm text-destructive"
                >
                  Failed to load products.
                </td>
              </tr>
            ) : null}

            {!isPending && !isError && rows.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-12 text-center text-sm text-muted-foreground"
                >
                  No products yet.
                </td>
              </tr>
            ) : null}

            {!isPending && !isError
              ? rows.map((row) => (
                  <tr key={row.id} className="hover:bg-muted/40">
                    <td className="px-4 py-3 font-medium text-foreground">
                      {row.name}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        className={cn(
                          "overflow-visible border-transparent font-bold",
                          TYPE_CLASS[row.type]
                        )}
                      >
                        <span
                          className="h-1.5 w-1.5 shrink-0 rounded-full"
                          style={{ background: TYPE_DOT[row.type] }}
                        />
                        {row.type}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        disabled={saving}
                        aria-invalid={Boolean(rowErrors[row.id])}
                        aria-describedby={
                          rowErrors[row.id]
                            ? `price-error-${row.id}`
                            : undefined
                        }
                        className={cn(
                          "h-9 w-28",
                          rowErrors[row.id] && "border-destructive"
                        )}
                        value={row.priceInput}
                        onChange={(event) =>
                          patch(row.id, "priceInput", event.target.value)
                        }
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Input
                        type="number"
                        min="0"
                        max={row.priceInput || undefined}
                        step="0.01"
                        disabled={saving}
                        aria-invalid={Boolean(rowErrors[row.id])}
                        aria-describedby={
                          rowErrors[row.id]
                            ? `price-error-${row.id}`
                            : undefined
                        }
                        className={cn(
                          "h-9 w-28",
                          rowErrors[row.id] && "border-destructive"
                        )}
                        value={row.saleInput}
                        onChange={(event) =>
                          patch(row.id, "saleInput", event.target.value)
                        }
                      />
                      {rowErrors[row.id] && (
                        <p
                          id={`price-error-${row.id}`}
                          className="mt-1 max-w-48 text-xs text-destructive"
                        >
                          {rowErrors[row.id]}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        className={cn(
                          "border-transparent font-bold",
                          STATUS_CLASS[row.status] ??
                            "bg-muted text-muted-foreground"
                        )}
                      >
                        {row.status}
                      </Badge>
                    </td>
                  </tr>
                ))
              : null}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end px-5 py-3">
        <Button
          type="button"
          variant="secondary"
          disabled={saving || isPending}
          onClick={() => {
            void handleSave()
          }}
        >
          <Check />
          {saving ? "Saving…" : "Save all changes"}
        </Button>
      </div>
    </Card>
  )
}
