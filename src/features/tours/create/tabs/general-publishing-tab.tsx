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
import { Switch } from "@/components/ui/switch"
import { RichTextEditor } from "@/components/rich-text-editor"
import {
  applyTitleChange,
  type TourFormState,
} from "@/features/tours/create/tour-form"
import type {
  CancellationPolicyOption,
  TourCategory,
  TourStatus,
} from "@/store/server/tours/typed"

const STATUS_ITEMS = {
  DRAFT: "Draft",
  PUBLISHED: "Active",
  SCHEDULED: "Scheduled",
} satisfies Record<TourStatus, string>

export function GeneralPublishingTab({
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
  const primaryItems = Object.fromEntries(
    primaryCategories.map((category) => [category.id, category.name])
  )
  const secondaryItems = Object.fromEntries(
    secondaryCategories.map((category) => [category.id, category.name])
  )
  const policyItems = Object.fromEntries(
    cancellationPolicies.map((policy) => [policy.id, policy.name])
  )

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
              <p className="text-xs text-muted-foreground">
                skyland.ae/tours/{form.slug || "tour-slug"}
              </p>
            </Field>
            <Field>
              <FieldLabel>Short description (shown in listings)</FieldLabel>
              <Input
                value={form.shortDescription}
                placeholder="One-line pitch for this tour"
                onChange={(event) =>
                  onChange({ ...form, shortDescription: event.target.value })
                }
              />
            </Field>
            <Field>
              <FieldLabel>Long description (rich text)</FieldLabel>
              <RichTextEditor
                value={form.longDescription}
                placeholder="Full experience description…"
                onChange={(longDescription) =>
                  onChange({ ...form, longDescription })
                }
              />
              <p className="text-xs text-muted-foreground">
                Supports bold, bullet lists, and links.
              </p>
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
                  <SelectTrigger
                    className="h-10 w-full"
                    disabled={!form.primaryCategoryId}
                  >
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
                <FieldLabel>Duration</FieldLabel>
                <div className="relative">
                  <Input
                    type="number"
                    min={1}
                    value={form.duration}
                    placeholder="4"
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
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Commercial display</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field>
                <FieldLabel>Adult display price (AED)</FieldLabel>
                <Input
                  type="number"
                  min={0}
                  value={form.adultPrice}
                  onChange={(event) =>
                    onChange({ ...form, adultPrice: event.target.value })
                  }
                />
              </Field>
              <Field>
                <FieldLabel>Discount price (AED)</FieldLabel>
                <Input
                  type="number"
                  min={0}
                  value={form.discountPrice}
                  placeholder="Optional"
                  onChange={(event) =>
                    onChange({ ...form, discountPrice: event.target.value })
                  }
                />
              </Field>
            </div>
            <p className="text-xs text-muted-foreground">
              Tour display price is used for catalog presentation. Final
              customer price is resolved from the selected Timeslot Package.
            </p>
            {(
              [
                ["isAttraction", "Attraction", form.isAttraction],
                ["isHot", "Hot tour", form.isHot],
                [
                  "hotelPickupIncluded",
                  "Hotel pickup included",
                  form.hotelPickupIncluded,
                ],
              ] as const
            ).map(([key, label, checked]) => (
              <div
                key={key}
                className="flex items-center justify-between rounded-lg bg-muted/70 px-4 py-3"
              >
                <div className="text-sm font-bold">{label}</div>
                <Switch
                  checked={checked}
                  onCheckedChange={(value) =>
                    onChange({ ...form, [key]: value })
                  }
                />
              </div>
            ))}
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

        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Select
              items={STATUS_ITEMS}
              value={form.status}
              onValueChange={(value) => {
                if (
                  value === "DRAFT" ||
                  value === "PUBLISHED" ||
                  value === "SCHEDULED"
                ) {
                  onChange({ ...form, status: value })
                }
              }}
            >
              <SelectTrigger className="h-10 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="PUBLISHED">Active</SelectItem>
                <SelectItem value="SCHEDULED">Scheduled</SelectItem>
              </SelectContent>
            </Select>
            {form.status === "SCHEDULED" ? (
              <Field>
                <FieldLabel>Schedule date & time</FieldLabel>
                <Input
                  type="datetime-local"
                  value={form.scheduledPublishAt}
                  onChange={(event) =>
                    onChange({
                      ...form,
                      scheduledPublishAt: event.target.value,
                    })
                  }
                />
              </Field>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
