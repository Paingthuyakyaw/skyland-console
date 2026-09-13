import { Check, ImagePlus, Pencil, X } from "lucide-react"
import { useRef, useState, type FormEvent } from "react"

import { CustomDialog } from "@/components/custom-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { slugify } from "@/features/tours/components/utils"
import { cn } from "@/lib/utils"
import {
  useCreateComboCategory,
  useDeleteComboCategory,
  useComboCategories,
  useUpdateComboCategory,
} from "@/store/server/combo/categories"
import { useUploadMediaAsset } from "@/store/server/tours/media"

type ManageCategoriesDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ManageCategoriesDialog({
  open,
  onOpenChange,
}: ManageCategoriesDialogProps) {
  const { data: categories = [], isPending, isError } = useComboCategories(open)
  const createCategory = useCreateComboCategory()
  const updateCategory = useUpdateComboCategory()
  const deleteCategory = useDeleteComboCategory()
  const upload = useUploadMediaAsset()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [ui, setUi] = useState<{
    name: string
    editingId: string | null
    editName: string
    newImage: { id: string; url: string } | null
    uploadTargetId: string | null
  }>({
    name: "",
    editingId: null,
    editName: "",
    newImage: null,
    uploadTargetId: null,
  })

  const trimmedName = ui.name.trim()
  const canAdd = trimmedName.length > 0 && !createCategory.isPending
  const trimmedEditName = ui.editName.trim()
  const isUpdating = updateCategory.isPending
  const isDeleting = deleteCategory.isPending
  const isUploading = upload.isPending || isUpdating
  const canSaveEdit =
    ui.editingId !== null && trimmedEditName.length > 0 && !isUpdating

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!canAdd) return

    createCategory.mutate(
      {
        name: trimmedName,
        slug: slugify(trimmedName),
        level: "PRIMARY",
        imageMediaAssetId: newImage?.id,
      },
      {
        onSuccess: () => {
          setUi((current) => ({ ...current, name: "", newImage: null }))
        },
      }
    )
  }

  const startEdit = (id: string, currentName: string) => {
    setUi((current) => ({ ...current, editingId: id, editName: currentName }))
  }

  const cancelEdit = () => {
    setUi((current) => ({ ...current, editingId: null, editName: "" }))
  }

  const saveEdit = () => {
    if (!canSaveEdit || !ui.editingId) return

    const category = categories.find((item) => item.id === ui.editingId)
    if (!category) return

    updateCategory.mutate(
      {
        id: ui.editingId,
        version: category.version ?? 0,
        name: trimmedEditName,
        slug: slugify(trimmedEditName),
        level: "PRIMARY",
        sortOrder: category.sortOrder ?? 0,
      },
      {
        onSuccess: () => {
          cancelEdit()
        },
      }
    )
  }

  const openImagePicker = (categoryId?: string) => {
    setUi((current) => ({
      ...current,
      uploadTargetId: categoryId ?? "new",
    }))
    fileInputRef.current?.click()
  }

  const handleImageSelected = async (files: FileList | null) => {
    const file = files?.[0]
    const targetId = ui.uploadTargetId
    if (!file || !targetId) return

    try {
      const response = await upload.mutateAsync({
        file,
        folderPath: "combo-tour-categories",
      })
      const asset = response.data
      if (!asset?.id) return

      if (targetId === "new") {
        setUi((current) => ({
          ...current,
          newImage: {
            id: asset.id,
            url: asset.url ?? "",
          },
        }))
        return
      }

      const category = categories.find((item) => item.id === targetId)
      if (!category) return

      updateCategory.mutate({
        id: category.id,
        version: category.version ?? 0,
        name: category.name,
        slug: category.slug || slugify(category.name),
        level: "PRIMARY",
        sortOrder: category.sortOrder ?? 0,
        imageMediaAssetId: asset.id,
      })
    } finally {
      setUi((current) => ({ ...current, uploadTargetId: null }))
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  return (
    <CustomDialog
      open={open}
      onOpenChange={onOpenChange}
      trigger={
        <Button
          type="button"
          variant="outline"
          onClick={() => onOpenChange(true)}
        >
          Manage Categories
        </Button>
      }
      title="Manage combo tour categories"
      description="Combo tours use primary categories only."
      contentClassName="sm:max-w-xl"
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          void handleImageSelected(event.target.files)
        }}
      />
      <div className="rounded-lg border border-border p-3">
        <Label>Categories</Label>
        <div className="mt-2 max-h-72 space-y-1.5 overflow-y-auto">
          {isPending ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              Loading categories…
            </p>
          ) : null}

          {isError ? (
            <p className="py-4 text-center text-sm text-destructive">
              Failed to load categories.
            </p>
          ) : null}

          {!isPending && !isError && categories.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No categories yet.
            </p>
          ) : null}

          {categories.map((category) => {
            const isEditing = ui.editingId === category.id

            return (
              <div
                key={category.id}
                className="flex items-center justify-between gap-2 rounded-lg bg-muted/45 px-3 py-2"
              >
                <div className="flex min-w-0 flex-1 items-center gap-2.5">
                  <CategoryImageButton
                    imageUrl={category.imageUrl}
                    label={`Upload image for ${category.name}`}
                    disabled={Boolean(isUploading)}
                    pending={ui.uploadTargetId === category.id && isUploading}
                    onClick={() => openImagePicker(category.id)}
                  />
                  {isEditing ? (
                    <Input
                      autoFocus
                      className="h-8"
                      value={ui.editName}
                      onChange={(event) =>
                        setUi((current) => ({
                          ...current,
                          editName: event.target.value,
                        }))
                      }
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault()
                          saveEdit()
                        }
                        if (event.key === "Escape") {
                          event.preventDefault()
                          cancelEdit()
                        }
                      }}
                      disabled={isUpdating}
                      aria-label={`Edit ${category.name}`}
                    />
                  ) : (
                    <span className="min-w-0 truncate text-sm font-bold text-foreground">
                      {category.name}
                    </span>
                  )}
                </div>
                <div className="flex shrink-0 items-center">
                  {isEditing ? (
                    <>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="text-muted-foreground hover:text-primary"
                        aria-label={`Save ${category.name}`}
                        onClick={saveEdit}
                        disabled={!canSaveEdit}
                      >
                        <Check />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="text-muted-foreground hover:text-destructive"
                        aria-label="Cancel edit"
                        onClick={cancelEdit}
                        disabled={isUpdating}
                      >
                        <X />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="text-muted-foreground hover:text-primary"
                        aria-label={`Edit ${category.name}`}
                        onClick={() => startEdit(category.id, category.name)}
                        disabled={isUpdating || isDeleting}
                      >
                        <Pencil />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="text-muted-foreground hover:text-destructive"
                        aria-label={`Delete ${category.name}`}
                        onClick={() =>
                          deleteCategory.mutate({ id: category.id })
                        }
                        disabled={isDeleting}
                      >
                        <X />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <form className="mt-2 flex items-center gap-2" onSubmit={handleSubmit}>
          <CategoryImageButton
            imageUrl={ui.newImage?.url}
            label="Upload combo category image"
            disabled={isUploading}
            pending={isUploading && ui.uploadTargetId === "new"}
            onClick={() => openImagePicker()}
          />
          <Input
            placeholder="Add category"
            value={ui.name}
            onChange={(event) =>
              setUi((current) => ({ ...current, name: event.target.value }))
            }
            disabled={createCategory.isPending}
          />
          <Button type="submit" className="h-10 shrink-0" disabled={!canAdd}>
            {createCategory.isPending ? "Adding…" : "Add"}
          </Button>
        </form>
      </div>
    </CustomDialog>
  )
}

function CategoryImageButton({
  imageUrl,
  label,
  disabled,
  pending,
  onClick,
}: {
  imageUrl?: string
  label: string
  disabled?: boolean
  pending?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "relative size-10 shrink-0 overflow-hidden rounded-lg border border-dashed border-input bg-card text-muted-foreground hover:border-primary hover:text-primary disabled:pointer-events-none disabled:opacity-50",
        imageUrl && "border-solid"
      )}
    >
      {imageUrl ? (
        <img src={imageUrl} alt="" className="size-full object-cover" />
      ) : (
        <ImagePlus className="mx-auto size-4" />
      )}
      {pending ? (
        <span className="absolute inset-0 flex items-center justify-center bg-background/70 text-[10px] font-bold">
          …
        </span>
      ) : null}
    </button>
  )
}
