import { ImagePlus, Minus, Plus, Star, X } from "lucide-react"
import { useRef } from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { StringListField } from "@/features/tours/create/components/string-list-field"
import {
  applyTitleChange,
  createEmptyAddon,
  createEmptyTimeslot,
  type AddonDraft,
  type TourFormState,
} from "@/features/tours/create/tour-form"
import { useUploadMediaAsset } from "@/store/server/tours/media"
import type { CancellationPolicyOption } from "@/store/server/tours/typed"
import type { TourCategory } from "@/store/server/tours/typed"
import type { TourDifficulty } from "@/store/server/tours/typed"

const DIFFICULTY_ITEMS = {
  EASY: "Easy",
  MODERATE: "Moderate",
  HARD: "Hard",
} satisfies Record<TourDifficulty, string>

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

export function BasicInfoTab({
  form,
  onChange,
  primaryCategories,
  secondaryCategories,
  cancellationPolicies,
}: {
  form: TourFormState
  onChange: (form: TourFormState) => void
  primaryCategories: TourCategory[]
  secondaryCategories: TourCategory[]
  cancellationPolicies: CancellationPolicyOption[]
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const upload = useUploadMediaAsset()
  const primaryItems = Object.fromEntries(
    primaryCategories.map((category) => [category.id, category.name])
  )
  const secondaryItems = Object.fromEntries(
    secondaryCategories.map((category) => [category.id, category.name])
  )
  const policyItems = Object.fromEntries(
    cancellationPolicies.map((policy) => [policy.id, policy.name])
  )

  const handleUpload = async (files: FileList | null) => {
    if (!files?.length) return

    for (const file of Array.from(files)) {
      const response = await upload.mutateAsync({ file, folderPath: "tours" })
      const asset = response.data
      if (!asset?.id) continue

      onChange({
        ...form,
        images: [
          ...form.images,
          {
            mediaAssetId: asset.id,
            url: asset.url ?? "",
            featured: form.images.length === 0,
          },
        ],
      })
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field>
              <FieldLabel>Tour title</FieldLabel>
              <Input
                value={form.title}
                placeholder="e.g. Evening Desert Safari"
                onChange={(event) =>
                  onChange(applyTitleChange(form, event.target.value))
                }
              />
            </Field>
            <Field>
              <FieldLabel>URL slug</FieldLabel>
              <Input
                value={form.slug}
                placeholder="evening-desert-safari"
                onChange={(event) =>
                  onChange({
                    ...form,
                    slug: event.target.value,
                    slugTouched: true,
                  })
                }
              />
            </Field>
            <Field>
              <FieldLabel>Short description</FieldLabel>
              <Input
                value={form.shortDescription}
                placeholder="One-line pitch for this tour"
                onChange={(event) =>
                  onChange({ ...form, shortDescription: event.target.value })
                }
              />
            </Field>
            <Field>
              <FieldLabel>Long description</FieldLabel>
              <Textarea
                rows={5}
                value={form.longDescription}
                placeholder="Full experience description"
                onChange={(event) =>
                  onChange({ ...form, longDescription: event.target.value })
                }
              />
            </Field>
            <div className="grid gap-3 md:grid-cols-3">
              <Field>
                <FieldLabel>Primary category</FieldLabel>
                <Select
                  items={primaryItems}
                  value={form.primaryCategoryId || null}
                  onValueChange={(value) => {
                    if (typeof value === "string") {
                      onChange({
                        ...form,
                        primaryCategoryId: value,
                        secondaryCategoryId: "",
                      })
                    }
                  }}
                >
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue placeholder="Select primary category" />
                  </SelectTrigger>
                  <SelectContent>
                    {primaryCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel>Secondary category</FieldLabel>
                <Select
                  items={secondaryItems}
                  value={form.secondaryCategoryId || null}
                  onValueChange={(value) => {
                    if (typeof value === "string") {
                      onChange({ ...form, secondaryCategoryId: value })
                    }
                  }}
                >
                  <SelectTrigger className="h-10 w-full">
                    <SelectValue placeholder="Select secondary category" />
                  </SelectTrigger>
                  <SelectContent>
                    {secondaryCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel>Duration (hours)</FieldLabel>
                <Input
                  type="number"
                  min={1}
                  value={form.duration}
                  onChange={(event) =>
                    onChange({ ...form, duration: event.target.value })
                  }
                />
              </Field>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gallery</CardTitle>
          </CardHeader>
          <CardContent>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(event) => {
                void handleUpload(event.target.files)
                event.target.value = ""
              }}
            />
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {form.images.map((image) => (
                <div
                  key={image.mediaAssetId}
                  className="group relative aspect-square overflow-hidden rounded-lg"
                >
                  {image.url ? (
                    <img
                      src={image.url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted text-xs text-muted-foreground">
                      Uploaded
                    </div>
                  )}
                  {image.featured ? (
                    <span className="absolute bottom-1 left-1 rounded bg-primary px-1.5 py-0.5 text-[9px] font-bold text-primary-foreground">
                      Featured
                    </span>
                  ) : (
                    <button
                      type="button"
                      className="absolute bottom-1 left-1 rounded bg-background/80 p-1 opacity-0 group-hover:opacity-100"
                      onClick={() =>
                        onChange({
                          ...form,
                          images: form.images.map((item) => ({
                            ...item,
                            featured: item.mediaAssetId === image.mediaAssetId,
                          })),
                        })
                      }
                    >
                      <Star className="size-3" />
                    </button>
                  )}
                  <button
                    type="button"
                    className="absolute top-1 right-1 rounded bg-background/80 p-1 opacity-0 group-hover:opacity-100"
                    onClick={() =>
                      onChange({
                        ...form,
                        images: form.images.filter(
                          (item) => item.mediaAssetId !== image.mediaAssetId
                        ),
                      })
                    }
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                disabled={upload.isPending}
                onClick={() => fileInputRef.current?.click()}
                className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-input text-muted-foreground hover:border-primary hover:text-primary"
              >
                <ImagePlus className="size-5" />
                <span className="text-[10px] font-bold">
                  {upload.isPending ? "Uploading..." : "Upload"}
                </span>
              </button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Click the star to set a featured image.
            </p>
            <Field className="mt-4">
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
          <CardHeader>
            <CardTitle>Time Slots</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {form.timeslots.map((slot, index) => (
              <div key={slot.key} className="grid gap-2 md:grid-cols-4">
                <Input
                  value={slot.name}
                  placeholder="Morning"
                  onChange={(event) =>
                    onChange({
                      ...form,
                      timeslots: form.timeslots.map((item, itemIndex) =>
                        itemIndex === index
                          ? { ...item, name: event.target.value }
                          : item
                      ),
                    })
                  }
                />
                <Input
                  type="time"
                  value={slot.startTime}
                  onChange={(event) =>
                    onChange({
                      ...form,
                      timeslots: form.timeslots.map((item, itemIndex) =>
                        itemIndex === index
                          ? { ...item, startTime: event.target.value }
                          : item
                      ),
                    })
                  }
                />
                <Input
                  type="time"
                  value={slot.endTime}
                  onChange={(event) =>
                    onChange({
                      ...form,
                      timeslots: form.timeslots.map((item, itemIndex) =>
                        itemIndex === index
                          ? { ...item, endTime: event.target.value }
                          : item
                      ),
                    })
                  }
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-input"
                  onClick={() =>
                    onChange({
                      ...form,
                      timeslots: form.timeslots.filter(
                        (_, itemIndex) => itemIndex !== index
                      ),
                    })
                  }
                >
                  <X />
                  Remove
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-input"
              onClick={() =>
                onChange({
                  ...form,
                  timeslots: [...form.timeslots, createEmptyTimeslot()],
                })
              }
            >
              Add timeslot
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inclusions & exclusions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <StringListField
              label="Inclusions"
              values={form.inclusions}
              onChange={(inclusions) => onChange({ ...form, inclusions })}
              placeholder="Hotel pickup"
              addLabel="Add inclusion"
            />
            <StringListField
              label="Exclusions"
              values={form.exclusions}
              onChange={(exclusions) => onChange({ ...form, exclusions })}
              placeholder="Personal expenses"
              addLabel="Add exclusion"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Per-person add-ons</CardTitle>
            <CardDescription className="text-xs">
              Quantities apply to all adult travelers. These populate the
              &quot;Optional Enhancements&quot; step at checkout.
            </CardDescription>
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

        <Card>
          <CardHeader>
            <CardTitle>Logistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <StringListField
              label="Pickup zones"
              values={form.pickupZones}
              onChange={(pickupZones) => onChange({ ...form, pickupZones })}
              placeholder="Downtown Dubai"
              addLabel="Add zone"
            />
            <Field>
              <FieldLabel>Meeting point / address</FieldLabel>
              <Input
                value={form.meetingPoint}
                placeholder="Address or landmark"
                onChange={(event) =>
                  onChange({ ...form, meetingPoint: event.target.value })
                }
              />
            </Field>
            <div className="grid gap-3 md:grid-cols-3">
              <Field>
                <FieldLabel>Min. age</FieldLabel>
                <Input
                  type="number"
                  min={0}
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
                    if (value === "EASY" || value === "MODERATE" || value === "HARD") {
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
                    <SelectItem value="HARD">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel>Languages</FieldLabel>
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
            </div>
            <StringListField
              label="What to bring"
              values={form.whatToBring}
              onChange={(whatToBring) => onChange({ ...form, whatToBring })}
              placeholder="Sunscreen"
              addLabel="Add item"
            />
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Cancellation Policy</CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              items={policyItems}
              value={form.cancellationPolicyId || null}
              onValueChange={(value) => {
                if (typeof value === "string") {
                  onChange({ ...form, cancellationPolicyId: value })
                }
              }}
            >
              <SelectTrigger className="h-10 w-full">
                <SelectValue placeholder="Select a policy" />
              </SelectTrigger>
              <SelectContent>
                {cancellationPolicies.map((policy) => (
                  <SelectItem key={policy.id} value={policy.id}>
                    {policy.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
