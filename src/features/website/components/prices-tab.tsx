import { useEffect, useMemo, useState } from "react"
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
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : Number.NaN
}

function parseSale(value: string) {
  if (value.trim() === "") return undefined
  const parsed = toNumber(value)
  return Number.isNaN(parsed) ? undefined : parsed
}

function isDirty(row: PriceRow) {
  const price = toNumber(row.priceInput)
  const sale = parseSale(row.saleInput)
  if (price !== row.price) return true
  return (sale ?? undefined) !== row.sale
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
  } = useComboTours({ size: 50 })
  const {
    data: packagesPage,
    isPending: packagesPending,
    isError: packagesError,
  } = useHolidayPackages({ size: 50 })
  const [rows, setRows] = useState<PriceRow[]>([])
  const [saving, setSaving] = useState(false)

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
    const combos = (combosPage?.content ?? []).map((tour) => ({
      id: `combo-${tour.id}`,
      name: tour.title,
      type: "Combo" as const,
      price: tour.comboPrice,
      sale: tour.discountPrice,
      status: comboStatusLabel(tour.status),
      productId: tour.id,
    }))
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

  const sourceKey = sourceRows
    .map((row) => `${row.id}:${row.price}:${row.sale ?? ""}`)
    .join("|")

  useEffect(() => {
    setRows(
      sourceRows.map((row) => ({
        ...row,
        priceInput: String(row.price),
        saleInput: row.sale == null ? "" : String(row.sale),
      }))
    )
  }, [sourceKey, sourceRows])

  const dirtyRows = rows.filter(isDirty)
  const isPending = toursPending || combosPending || packagesPending
  const isError = toursError || combosError || packagesError

  const patch = (
    id: string,
    field: "priceInput" | "saleInput",
    value: string
  ) => {
    setRows((current) =>
      current.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    )
  }

  const handleSave = async () => {
    if (dirtyRows.length === 0) {
      toast.message("No price changes to save")
      return
    }

    for (const row of dirtyRows) {
      const price = toNumber(row.priceInput)
      if (Number.isNaN(price) || price < 0) {
        toast.error(`Enter a valid price for ${row.name}`)
        return
      }
      if (row.saleInput.trim() !== "") {
        const sale = toNumber(row.saleInput)
        if (Number.isNaN(sale) || sale < 0) {
          toast.error(`Enter a valid sale price for ${row.name}`)
          return
        }
      }
    }

    setSaving(true)
    try {
      await savePriceDrafts(
        dirtyRows.map((row) => ({
          type: row.type,
          productId: row.productId,
          price: toNumber(row.priceInput),
          sale: parseSale(row.saleInput),
        }))
      )
      toast.success("Prices saved")
    } catch (error) {
      toast.error(apiErrorMessage(error, "Failed to save prices"))
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
                        className="h-9 w-28"
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
                        className="h-9 w-28"
                        value={row.saleInput}
                        onChange={(event) =>
                          patch(row.id, "saleInput", event.target.value)
                        }
                      />
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
