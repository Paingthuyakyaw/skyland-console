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
import { ChipListField } from "@/features/holiday-packages/create/components/chip-list-field"
import type { HolidayPackageFormState } from "@/features/holiday-packages/create/holiday-form"
import type {
  HolidayPackageDifficulty,
  HolidayPackageHotelTier,
} from "@/store/server/holiday/typed"

const DIFFICULTY_ITEMS = {
  EASY: "Easy",
  MODERATE: "Moderate",
  HARD: "Active",
} satisfies Record<HolidayPackageDifficulty, string>

const HOTEL_TIER_ITEMS = {
  THREE_STAR: "3-star",
  FOUR_STAR: "4-star",
  FIVE_STAR: "5-star",
} satisfies Record<HolidayPackageHotelTier, string>

export function TripDetailsTab({
  form,
  onChange,
}: {
  form: HolidayPackageFormState
  onChange: (form: HolidayPackageFormState) => void
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
              placeholder="4 days / 3 nights"
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
        <Field>
          <FieldLabel>Hotel tier</FieldLabel>
          <Select
            items={HOTEL_TIER_ITEMS}
            value={form.hotelTier}
            onValueChange={(value) => {
              if (
                value === "THREE_STAR" ||
                value === "FOUR_STAR" ||
                value === "FIVE_STAR"
              ) {
                onChange({ ...form, hotelTier: value })
              }
            }}
          >
            <SelectTrigger className="h-10 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="THREE_STAR">3-star</SelectItem>
              <SelectItem value="FOUR_STAR">4-star</SelectItem>
              <SelectItem value="FIVE_STAR">5-star</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <div className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3">
          <div>
            <p className="text-sm font-bold text-foreground">
              Airport / pickup transfer
            </p>
            <p className="text-xs text-muted-foreground">
              Include airport transfer in this package
            </p>
          </div>
          <Switch
            checked={form.airportTransferIncluded}
            onCheckedChange={(checked) =>
              onChange({ ...form, airportTransferIncluded: checked })
            }
          />
        </div>
        <ChipListField
          label="Inclusions"
          items={form.inclusions}
          onChange={(inclusions) => onChange({ ...form, inclusions })}
        />
        <ChipListField
          label="Exclusions"
          items={form.exclusions}
          onChange={(exclusions) => onChange({ ...form, exclusions })}
        />
        <ChipListField
          label="What to bring"
          items={form.whatToBring}
          onChange={(whatToBring) => onChange({ ...form, whatToBring })}
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
