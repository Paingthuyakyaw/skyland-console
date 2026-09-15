import { GripVertical, ImagePlus, Plus, Star, Upload, X } from "lucide-react"
import { useRef } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  createEmptyBadge,
  type TourFormState,
} from "@/features/tours/create/tour-form"
import { useUploadMediaAsset } from "@/store/server/tours/media"

export function MediaBadgesSeoTab({
  form,
  onChange,
}: {
  form: TourFormState
  onChange: (form: TourFormState) => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const upload = useUploadMediaAsset()
  const metaTitle = form.metaTitle || form.title
  const metaDescription = form.metaDescription || form.shortDescription

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
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
      <div className="space-y-4 xl:col-span-2">
        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-3">
            <div>
              <CardTitle>Media gallery</CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">
                Drag to reorder. The first featured image is shown on customer
                cards.
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={upload.isPending}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="size-3.5" />
              Upload media
            </Button>
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
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {form.images.map((image) => (
                <div
                  key={image.mediaAssetId}
                  className="group relative aspect-square overflow-hidden rounded-lg border border-border"
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
                  <GripVertical className="absolute top-1 right-8 size-4 text-white opacity-0 drop-shadow group-hover:opacity-100" />
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
                className="flex aspect-square flex-col items-center justify-center rounded-lg border-2 border-dashed border-input text-xs font-bold text-muted-foreground hover:border-primary hover:text-primary"
              >
                <ImagePlus className="mb-1 size-5" />
                {upload.isPending ? "Uploading..." : "Add image"}
              </button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Badges</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {form.badges.map((badge, index) => (
              <div key={badge.key} className="grid gap-3 sm:grid-cols-3">
                <Field>
                  <FieldLabel>Logo URL</FieldLabel>
                  <Input
                    value={badge.logoUrl}
                    placeholder="https://"
                    onChange={(event) =>
                      onChange({
                        ...form,
                        badges: form.badges.map((item, itemIndex) =>
                          itemIndex === index
                            ? { ...item, logoUrl: event.target.value }
                            : item
                        ),
                      })
                    }
                  />
                </Field>
                <Field>
                  <FieldLabel>Title</FieldLabel>
                  <Input
                    value={badge.title}
                    placeholder="Instant confirmation"
                    onChange={(event) =>
                      onChange({
                        ...form,
                        badges: form.badges.map((item, itemIndex) =>
                          itemIndex === index
                            ? { ...item, title: event.target.value }
                            : item
                        ),
                      })
                    }
                  />
                </Field>
                <Field>
                  <FieldLabel>Short information</FieldLabel>
                  <div className="flex gap-2">
                    <Input
                      value={badge.shortInfo}
                      placeholder="Reserve in minutes"
                      onChange={(event) =>
                        onChange({
                          ...form,
                          badges: form.badges.map((item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, shortInfo: event.target.value }
                              : item
                          ),
                        })
                      }
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      onClick={() =>
                        onChange({
                          ...form,
                          badges: form.badges.filter(
                            (_, itemIndex) => itemIndex !== index
                          ),
                        })
                      }
                    >
                      <X />
                    </Button>
                  </div>
                </Field>
              </div>
            ))}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-primary hover:text-primary"
              onClick={() =>
                onChange({
                  ...form,
                  badges: [...form.badges, createEmptyBadge()],
                })
              }
            >
              <Plus className="size-3.5" />
              Add badge
            </Button>
            {form.badges.some((badge) => badge.title.trim()) ? (
              <div className="flex flex-wrap gap-2 border-t border-border pt-3">
                {form.badges
                  .filter((badge) => badge.title.trim())
                  .map((badge) => (
                    <span
                      key={badge.key}
                      className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs font-bold"
                    >
                      {badge.logoUrl ? (
                        <img
                          src={badge.logoUrl}
                          alt=""
                          className="size-4 rounded-full object-cover"
                        />
                      ) : null}
                      {badge.title}
                    </span>
                  ))}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Search preview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Field>
            <FieldLabel>Meta title</FieldLabel>
            <Input
              value={form.metaTitle}
              maxLength={60}
              placeholder={form.title || "Tour title"}
              onChange={(event) =>
                onChange({ ...form, metaTitle: event.target.value })
              }
            />
            <p className="text-[11px] text-muted-foreground">
              {(form.metaTitle || form.title).length}/60
            </p>
          </Field>
          <Field>
            <FieldLabel>Meta description</FieldLabel>
            <Textarea
              rows={4}
              maxLength={160}
              value={form.metaDescription}
              placeholder="Describe this tour for search…"
              onChange={(event) =>
                onChange({ ...form, metaDescription: event.target.value })
              }
            />
            <p className="text-[11px] text-muted-foreground">
              {(form.metaDescription || form.shortDescription).length}/160
            </p>
          </Field>
          <div className="rounded-lg border border-border p-3">
            <div className="text-xs text-emerald-700">
              skyland.ae/tours/{form.slug || "tour-slug"}
            </div>
            <div className="mt-1 text-sm font-bold text-primary">
              {metaTitle || "Tour title"}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {metaDescription || "A memorable Skyland experience."}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
