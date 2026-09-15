import { Minus, Plus, X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  createEmptyAddon,
  type AddonDraft,
  type TourFormState,
} from "@/features/tours/create/tour-form"

function AddonRow({
  addon,
  onChange,
  onRemove,
}: {
  addon: AddonDraft
  onChange: (addon: AddonDraft) => void
  onRemove: () => void
}) {
  const patch = (next: Partial<AddonDraft>) => onChange({ ...addon, ...next })

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-3">
      <div className="min-w-0 flex-1 space-y-1.5">
        <Input
          value={addon.name}
          onChange={(event) => patch({ name: event.target.value })}
          className="h-8 text-sm font-bold"
          placeholder="Add-on name"
        />
        <div className="flex items-center gap-2">
          <Input
            value={addon.desc}
            onChange={(event) => patch({ desc: event.target.value })}
            className="h-7 flex-1 text-xs text-muted-foreground"
            placeholder="e.g. 30-min ride"
          />
          <span className="shrink-0 text-xs text-muted-foreground">·</span>
          <div className="flex shrink-0 items-center gap-1">
            <span className="text-xs text-muted-foreground">AED</span>
            <Input
              type="number"
              min={0}
              value={addon.pricePerPerson}
              onChange={(event) =>
                patch({ pricePerPerson: Number(event.target.value) || 0 })
              }
              className="h-7 w-20 text-xs font-bold"
            />
            <span className="text-xs text-muted-foreground">/person</span>
          </div>
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-center gap-1">
        <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
          Max qty
        </span>
        <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/40 p-0.5">
          <button
            type="button"
            onClick={() => patch({ maxCap: Math.max(0, addon.maxCap - 1) })}
            className="flex size-6 items-center justify-center rounded-md hover:bg-card hover:text-primary"
          >
            <Minus className="size-3.5" />
          </button>
          <span className="w-7 text-center text-sm font-black text-foreground">
            {addon.maxCap}
          </span>
          <button
            type="button"
            onClick={() => patch({ maxCap: addon.maxCap + 1 })}
            className="flex size-6 items-center justify-center rounded-md hover:bg-card hover:text-primary"
          >
            <Plus className="size-3.5" />
          </button>
        </div>
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
      >
        <X className="size-4" />
      </button>
    </div>
  )
}

export function AddonsTab({
  form,
  onChange,
}: {
  form: TourFormState
  onChange: (form: TourFormState) => void
}) {
  const preview = form.addons.find((addon) => addon.name.trim())
  const previewPrice = preview?.pricePerPerson ?? 0

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
      <Card className="xl:col-span-2">
        <CardHeader>
          <CardTitle>Optional add-ons</CardTitle>
          <p className="text-xs text-muted-foreground">
            Customers select add-ons before adding a Tour to cart. Existing cart
            and booking snapshots are not changed by later add-on edits.
          </p>
        </CardHeader>
        <CardContent className="space-y-2.5">
          {form.addons.map((addon, index) => (
            <AddonRow
              key={addon.key}
              addon={addon}
              onChange={(nextAddon) =>
                onChange({
                  ...form,
                  addons: form.addons.map((item, itemIndex) =>
                    itemIndex === index ? nextAddon : item
                  ),
                })
              }
              onRemove={() =>
                onChange({
                  ...form,
                  addons: form.addons.filter(
                    (_, itemIndex) => itemIndex !== index
                  ),
                })
              }
            />
          ))}
          <button
            type="button"
            onClick={() =>
              onChange({
                ...form,
                addons: [...form.addons, createEmptyAddon()],
              })
            }
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-input py-3 text-sm text-muted-foreground hover:border-primary hover:text-primary"
          >
            <Plus className="size-4" />
            Add another add-on
          </button>
        </CardContent>
      </Card>

      <Card className="h-fit">
        <CardContent className="space-y-3">
          <Badge variant="secondary">Customer preview</Badge>
          <h3 className="font-bold text-foreground">
            {preview?.name || "Add-on name"}
          </h3>
          <p className="text-xs text-muted-foreground">
            {preview?.desc || "Description appears here"}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold">AED {previewPrice}</span>
            <div className="rounded-lg border border-border px-3 py-1 text-xs font-bold">
              − &nbsp; 1 &nbsp; +
            </div>
          </div>
          <div className="border-t border-border pt-3 text-sm font-black text-foreground">
            Subtotal <span className="float-right">AED {previewPrice}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
