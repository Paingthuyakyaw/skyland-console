import { X } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { BundledToursPicker } from "@/features/combo-tours/create/components/bundled-tours-picker"
import type {
  ComboDifficulty,
  ComboTourFormState,
} from "@/features/combo-tours/create/combo-form"
import { ChipListField } from "@/features/holiday-packages/create/components/chip-list-field"
import type { TourSummary } from "@/store/server/tours/typed"

const DIFFICULTY_ITEMS = {
  EASY: "Easy",
  MODERATE: "Moderate",
  HARD: "Active",
} satisfies Record<ComboDifficulty, string>

export function TripDetailsTab({
  form,
  onChange,
  tours,
}: {
  form: ComboTourFormState
  onChange: (
    form:
      | ComboTourFormState
      | ((current: ComboTourFormState) => ComboTourFormState)
  ) => void
  tours: TourSummary[]
}) {
  const [newDay, setNewDay] = useState("")

  const addDay = () => {
    const description = newDay.trim()
    if (!description) return
    onChange({
      ...form,
      itinerary: [...form.itinerary, { description }],
    })
    setNewDay("")
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel>Duration</FieldLabel>
            <Input
              value={form.duration}
              onChange={(event) =>
                onChange({ ...form, duration: event.target.value })
              }
            />
          </Field>
          <Field>
            <FieldLabel>Minimum age</FieldLabel>
            <Input
              type="number"
              min={0}
              max={120}
              value={form.minimumAge}
              onChange={(event) =>
                onChange({ ...form, minimumAge: event.target.value })
              }
            />
          </Field>
          <Field>
            <FieldLabel>Difficulty</FieldLabel>
            <Select
              items={DIFFICULTY_ITEMS}
              value={form.difficulty}
              onValueChange={(value) => {
                if (
                  value === "EASY" ||
                  value === "MODERATE" ||
                  value === "HARD"
                ) {
                  onChange({ ...form, difficulty: value })
                }
              }}
            >
              <SelectTrigger className="h-10 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EASY">Easy</SelectItem>
                <SelectItem value="MODERATE">Moderate</SelectItem>
                <SelectItem value="HARD">Active</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel>Languages</FieldLabel>
            <Input
              value={form.languages}
              onChange={(event) =>
                onChange({ ...form, languages: event.target.value })
              }
            />
          </Field>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3">
          <div>
            <p className="text-sm font-bold text-foreground">
              Airport / pickup transfer
            </p>
            <p className="text-xs text-muted-foreground">
              Include airport transfer in this combo
            </p>
          </div>
          <Switch
            checked={form.hotelPickupIncluded}
            onCheckedChange={(checked) =>
              onChange({ ...form, hotelPickupIncluded: checked })
            }
          />
        </div>
        <BundledToursPicker
          selected={form.items}
          tours={tours}
          onChange={(items) => onChange({ ...form, items })}
        />
        <ChipListField
          label="Inclusions"
          items={form.inclusions}
          onChange={(inclusions) =>
            onChange((current) => ({ ...current, inclusions }))
          }
        />
        <ChipListField
          label="Exclusions"
          items={form.exclusions}
          onChange={(exclusions) =>
            onChange((current) => ({ ...current, exclusions }))
          }
        />
      </div>

      <div className="space-y-3">
        <span className="text-sm font-bold text-foreground">Itinerary</span>
        <div className="space-y-2">
          {form.itinerary.map((day, index) => (
            <div
              key={`day-${index}`}
              className="flex h-10 items-center gap-2 rounded-lg border border-border bg-card px-3"
            >
              <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-black text-primary">
                {index + 1}
              </div>
              <Input
                className="h-auto min-h-0 flex-1 border-0 bg-transparent p-0 shadow-none focus-visible:border-transparent focus-visible:ring-0"
                value={day.description}
                onChange={(event) =>
                  onChange({
                    ...form,
                    itinerary: form.itinerary.map((item, itemIndex) =>
                      itemIndex === index
                        ? { ...item, description: event.target.value }
                        : item
                    ),
                  })
                }
              />
              <button
                type="button"
                className="shrink-0 text-muted-foreground hover:text-destructive"
                aria-label={`Remove day ${index + 1}`}
                onClick={() =>
                  onChange({
                    ...form,
                    itinerary: form.itinerary.filter(
                      (_, itemIndex) => itemIndex !== index
                    ),
                  })
                }
              >
                <X className="size-4" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Day description…"
            value={newDay}
            onChange={(event) => setNewDay(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault()
                addDay()
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            className="h-10 shrink-0"
            onClick={addDay}
          >
            Add day
          </Button>
        </div>
      </div>
    </div>
  )
}
