import { ImagePlus, X } from "lucide-react"
import { useRef } from "react"

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
import {
  applyTitleChange,
  type ComboTourFormState,
} from "@/features/combo-tours/create/combo-form"
import { cn } from "@/lib/utils"
import type { ComboCategory, ComboTourStatus } from "@/store/server/combo/typed"
import { useUploadMediaAsset } from "@/store/server/tours/media"
import type { CancellationPolicyOption } from "@/store/server/tours/typed"

const STATUS_ITEMS = {
  PUBLISHED: "Active",
  DRAFT: "Draft",
} satisfies Record<ComboTourStatus, string>

export function BasicInfoTab({
  form,
  onChange,
  categories,
  cancellationPolicies,
}: {
  form: ComboTourFormState
  onChange: (form: ComboTourFormState) => void
  categories: ComboCategory[]
  cancellationPolicies: CancellationPolicyOption[]
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const upload = useUploadMediaAsset()
  const categoryItems = Object.fromEntries(
    categories.map((category) => [category.id, category.name])
  )
  const policyItems = Object.fromEntries(
    cancellationPolicies.map((policy) => [policy.id, policy.name])
  )

  const handleUpload = async (files: FileList | null) => {
    if (!files?.length) return

    const nextImages = [...form.images]
    for (const file of Array.from(files)) {
      const response = await upload.mutateAsync({
        file,
        folderPath: "combo-tours",
      })
      const asset = response.data
      if (!asset?.id) continue

      nextImages.push({
        mediaAssetId: asset.id,
        url: asset.url ?? "",
      })
    }

    onChange({ ...form, images: nextImages })
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <Field>
          <FieldLabel>Package title</FieldLabel>
          <Input
            value={form.title}
            onChange={(event) =>
              onChange(applyTitleChange(form, event.target.value))
            }
          />
        </Field>
        <Field>
          <FieldLabel>URL slug</FieldLabel>
          <Input
            value={form.slug}
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
            onChange={(event) =>
              onChange({ ...form, shortDescription: event.target.value })
            }
          />
        </Field>
        <Field>
          <FieldLabel>Long description</FieldLabel>
          <Textarea
            rows={4}
            value={form.longDescription}
            onChange={(event) =>
              onChange({ ...form, longDescription: event.target.value })
            }
          />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel>Primary category</FieldLabel>
            <Select
              items={categoryItems}
              value={form.primaryCategoryId || null}
              onValueChange={(value) => {
                if (typeof value === "string") {
                  onChange({ ...form, primaryCategoryId: value })
                }
              }}
            >
              <SelectTrigger className="h-10 w-full">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel>From price (AED)</FieldLabel>
            <Input
              type="number"
              min={0}
              value={form.comboPrice}
              onChange={(event) =>
                onChange({ ...form, comboPrice: event.target.value })
              }
            />
          </Field>
        </div>
        <Field>
          <FieldLabel>Discount price (AED)</FieldLabel>
          <Input
            type="number"
            min={0}
            value={form.discountPrice}
            onChange={(event) =>
              onChange({ ...form, discountPrice: event.target.value })
            }
          />
        </Field>
        <Field>
          <FieldLabel>Website status</FieldLabel>
          <Select
            items={STATUS_ITEMS}
            value={form.status}
            onValueChange={(value) => {
              if (value === "DRAFT" || value === "PUBLISHED") {
                onChange({ ...form, status: value })
              }
            }}
          >
            <SelectTrigger className="h-10 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PUBLISHED">Active</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field>
          <FieldLabel>Cancellation policy</FieldLabel>
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
              <SelectValue placeholder="Select policy" />
            </SelectTrigger>
            <SelectContent>
              {cancellationPolicies.map((policy) => (
                <SelectItem key={policy.id} value={policy.id}>
                  {policy.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <div>
        <span className="text-sm font-bold text-foreground">Package images</span>
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
        <div className="mt-2 grid grid-cols-4 gap-2">
          {form.images.map((image, index) => (
            <div
              key={image.mediaAssetId}
              className={cn(
                "group relative h-32 overflow-hidden rounded-xl",
                index === 0 ? "col-span-2" : ""
              )}
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
              <button
                type="button"
                className="absolute top-1.5 right-1.5 rounded-md bg-background/80 p-1 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive"
                aria-label="Remove image"
                onClick={() =>
                  onChange({
                    ...form,
                    images: form.images.filter(
                      (item) => item.mediaAssetId !== image.mediaAssetId
                    ),
                  })
                }
              >
                <X className="size-3.5" />
              </button>
            </div>
          ))}
          <button
            type="button"
            disabled={upload.isPending}
            onClick={() => fileInputRef.current?.click()}
            className="flex h-32 items-center justify-center rounded-xl border-2 border-dashed border-input text-primary transition-colors hover:bg-muted/40"
          >
            <ImagePlus className="size-6" />
            <span className="sr-only">
              {upload.isPending ? "Uploading..." : "Upload package image"}
            </span>
          </button>
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">
          The first image is used on the listing card.
        </p>
      </div>
    </div>
  )
}
