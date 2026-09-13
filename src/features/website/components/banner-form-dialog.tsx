import { useEffect, useRef, useState } from "react"
import { ImagePlus } from "lucide-react"
import { toast } from "sonner"

import { CustomDialog } from "@/components/custom-dialog"
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
import { BANNER_TYPE_ITEMS } from "@/features/website/components/utils"
import { useUploadCmsImage } from "@/store/server/cms/cms"
import type { BannerResponse, BannerType } from "@/store/server/cms/typed"

type BannerForm = {
  title: string
  imageUrl: string
  active: boolean
  bannerType: BannerType
}

type BannerFormDialogProps = {
  open: boolean
  banner?: BannerResponse | null
  saving: boolean
  onOpenChange: (open: boolean) => void
  onSave: (form: BannerForm) => void
}

export function BannerFormDialog({
  open,
  banner,
  saving,
  onOpenChange,
  onSave,
}: BannerFormDialogProps) {
  const isEdit = Boolean(banner)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const upload = useUploadCmsImage()
  const [form, setForm] = useState<BannerForm>({
    title: "",
    imageUrl: "",
    active: true,
    bannerType: "HOME",
  })

  useEffect(() => {
    if (!open) return
    setForm({
      title: banner?.title ?? "",
      imageUrl: banner?.imageUrl ?? "",
      active: banner?.active ?? true,
      bannerType: banner?.bannerType ?? "HOME",
    })
  }, [banner, open])

  const handleUpload = async (files: FileList | null) => {
    const file = files?.[0]
    if (!file) return
    const response = await upload.mutateAsync({
      file,
      folderPath: "cms/banners",
    })
    const url = response.data?.url
    if (!url) {
      toast.error("Upload succeeded but no image URL was returned")
      return
    }
    setForm((current) => ({ ...current, imageUrl: url }))
  }

  return (
    <CustomDialog
      open={open}
      onOpenChange={(next) => {
        if (!saving && !upload.isPending) onOpenChange(next)
      }}
      title={isEdit ? "Edit banner" : "Add banner"}
      showDone={false}
      contentClassName="sm:max-w-md"
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            disabled={saving || upload.isPending}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={saving || upload.isPending}
            onClick={() => {
              if (!form.title.trim()) {
                toast.error("Title is required")
                return
              }
              if (!form.imageUrl.trim()) {
                toast.error("Upload a banner image")
                return
              }
              onSave({
                ...form,
                title: form.title.trim(),
                imageUrl: form.imageUrl.trim(),
              })
            }}
          >
            {saving ? "Saving…" : isEdit ? "Save changes" : "Add banner"}
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            void handleUpload(event.target.files)
            event.target.value = ""
          }}
        />
        <Field>
          <FieldLabel htmlFor="banner-title">Title</FieldLabel>
          <Input
            id="banner-title"
            value={form.title}
            onChange={(event) =>
              setForm((current) => ({ ...current, title: event.target.value }))
            }
            placeholder="Summer Desert Escape"
          />
        </Field>
        <Field>
          <FieldLabel>Image</FieldLabel>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex h-32 w-full items-center justify-center overflow-hidden rounded-control border-2 border-dashed border-input text-sm text-muted-foreground hover:border-primary hover:text-primary"
          >
            {form.imageUrl ? (
              <img
                src={form.imageUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="inline-flex items-center gap-2">
                <ImagePlus className="size-5" />
                {upload.isPending ? "Uploading…" : "Upload banner image"}
              </span>
            )}
          </button>
        </Field>
        <Field>
          <FieldLabel>Banner type</FieldLabel>
          <Select
            items={BANNER_TYPE_ITEMS}
            value={form.bannerType}
            onValueChange={(value) => {
              if (value && value in BANNER_TYPE_ITEMS) {
                setForm((current) => ({
                  ...current,
                  bannerType: value as BannerType,
                }))
              }
            }}
          >
            <SelectTrigger className="h-10 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(BANNER_TYPE_ITEMS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <div className="flex items-center justify-between rounded-lg bg-muted/60 px-4 py-3">
          <div>
            <div className="text-sm font-bold text-foreground">Active</div>
            <div className="text-xs text-muted-foreground">
              Show this banner on the website
            </div>
          </div>
          <Switch
            checked={form.active}
            onCheckedChange={(active) =>
              setForm((current) => ({ ...current, active }))
            }
          />
        </div>
      </div>
    </CustomDialog>
  )
}
