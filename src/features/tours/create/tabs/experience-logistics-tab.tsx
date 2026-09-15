import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { StringListField } from "@/features/tours/create/components/string-list-field"
import type { TourFormState } from "@/features/tours/create/tour-form"
import type { TourDifficulty } from "@/store/server/tours/typed"

const DIFFICULTY_ITEMS = {
  EASY: "Easy",
  MODERATE: "Moderate",
  HARD: "Hard",
} satisfies Record<TourDifficulty, string>

const DIFFICULTY_LABEL: Record<TourDifficulty, string> = {
  EASY: "Easy",
  MODERATE: "Moderate",
  HARD: "Challenging",
}

export function ExperienceLogisticsTab({
  form,
  onChange,
  tourCreated,
  onOpenTab,
}: {
  form: TourFormState
  onChange: (form: TourFormState) => void
  tourCreated: boolean
  onOpenTab: (tab: string) => void
}) {
  const languages = form.languagesOffered.filter(Boolean)
  const pickupIncluded = form.hotelPickupIncluded ? "Included" : "Not included"

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Experience details</CardTitle>
            <p className="text-sm text-muted-foreground">
              The operational information guests need before booking.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel>Duration</FieldLabel>
                <div className="relative">
                  <Input
                    type="number"
                    min={1}
                    value={form.duration}
                    className="pr-16"
                    onChange={(event) =>
                      onChange({ ...form, duration: event.target.value })
                    }
                  />
                  <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground">
                    hours
                  </span>
                </div>
              </Field>
              <Field>
                <FieldLabel>Minimum age</FieldLabel>
                <Input
                  type="number"
                  min={0}
                  value={form.minimumAge}
                  onChange={(event) =>
                    onChange({ ...form, minimumAge: event.target.value })
                  }
                />
              </Field>
            </div>
            <Field>
              <FieldLabel>Meeting point</FieldLabel>
              <Input
                value={form.meetingPoint}
                placeholder="e.g. Dubai Mall, Grand Entrance"
                onChange={(event) =>
                  onChange({ ...form, meetingPoint: event.target.value })
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
                  <SelectItem value="HARD">Challenging</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel>Tour video URL (optional)</FieldLabel>
              <Input
                value={form.videoUrl}
                placeholder="https://"
                onChange={(event) =>
                  onChange({ ...form, videoUrl: event.target.value })
                }
              />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-3">
            <div>
              <CardTitle>Departure structure</CardTitle>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Timeslots and customer-facing packages are maintained in their
                dedicated workspace.
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => onOpenTab("timeslots")}
            >
              Open timeslots
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2">
              {form.timeslots.map((slot) => (
                <div
                  key={slot.key}
                  className="rounded-lg bg-muted/45 px-3 py-2 text-xs"
                >
                  <span className="font-bold text-foreground">
                    {slot.name || "Untitled timeslot"}
                  </span>
                  <span className="ml-2 text-muted-foreground">
                    {slot.startTime || "—"}–{slot.endTime || "—"}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel>Languages offered</FieldLabel>
              <Input
                value={form.languagesOffered.join(", ")}
                placeholder="English, Arabic"
                onChange={(event) =>
                  onChange({
                    ...form,
                    languagesOffered: event.target.value
                      .split(",")
                      .map((item) => item.trim())
                      .filter(Boolean),
                  })
                }
              />
            </Field>
            <Field>
              <FieldLabel>Pickup zones</FieldLabel>
              <Input
                value={form.pickupZones.join(", ")}
                placeholder="Downtown Dubai, Marina"
                onChange={(event) =>
                  onChange({
                    ...form,
                    pickupZones: event.target.value
                      .split(",")
                      .map((item) => item.trim())
                      .filter(Boolean),
                  })
                }
              />
            </Field>
            <StringListField
              label="Inclusions"
              values={form.inclusions}
              onChange={(inclusions) => onChange({ ...form, inclusions })}
              placeholder="Hotel pickup"
              addLabel="Add inclusion"
              tone="include"
            />
            <StringListField
              label="Exclusions"
              values={form.exclusions}
              onChange={(exclusions) => onChange({ ...form, exclusions })}
              placeholder="Personal expenses"
              addLabel="Add exclusion"
              tone="exclude"
            />
            <div className="sm:col-span-2">
              <StringListField
                label="What to bring"
                values={form.whatToBring}
                onChange={(whatToBring) => onChange({ ...form, whatToBring })}
                placeholder="Sunscreen"
                addLabel="Add item"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Customer preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <PreviewRow
              label="Duration"
              value={`${form.duration || "—"} hours`}
            />
            <PreviewRow
              label="Difficulty"
              value={DIFFICULTY_LABEL[form.difficulty]}
            />
            <PreviewRow
              label="Minimum age"
              value={form.minimumAge ? `${form.minimumAge}+` : "Any"}
            />
            <PreviewRow label="Hotel pickup" value={pickupIncluded} />
            <PreviewRow
              label="Meeting point"
              value={form.meetingPoint || "Not set"}
            />
            <PreviewRow
              label="Languages"
              value={languages.join(", ") || "English"}
            />
            <PreviewRow
              label="Included"
              value={
                form.inclusions.filter(Boolean).join(", ") || "None listed"
              }
            />
            <PreviewRow
              label="Excluded"
              value={
                form.exclusions.filter(Boolean).join(", ") || "None listed"
              }
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Availability hand-off</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Date-specific capacity and closures are configured only after the
              tour and its timeslots are saved.
            </p>
            <Button
              type="button"
              variant="outline"
              className="mt-4 w-full"
              disabled={!tourCreated}
              onClick={() => onOpenTab("availability")}
            >
              Manage availability
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-xs font-bold text-muted-foreground">{label}</span>
      <span className="text-right text-xs font-medium text-foreground">
        {value}
      </span>
    </div>
  )
}
