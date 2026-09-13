import { Check, ImagePlus, Pencil, X } from "lucide-react"
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react"

import { CustomDialog } from "@/components/custom-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  nextSortOrder,
  slugify,
} from "@/features/tours/components/utils"
import { cn } from "@/lib/utils"
import {
  useCreateTourCategory,
  useDeleteTourCategory,
  useTourCategories,
  useUpdateTourCategory,
} from "@/store/server/tours/categories"
import { useUploadMediaAsset } from "@/store/server/tours/media"
import type { TourCategory } from "@/store/server/tours/typed"

type ManageCategoriesDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ManageCategoriesDialog({
  open,
  onOpenChange,
}: ManageCategoriesDialogProps) {
  const [selectedPrimaryId, setSelectedPrimaryId] = useState("")
  const [primaryName, setPrimaryName] = useState("")
  const [secondaryName, setSecondaryName] = useState("")
  const [newPrimaryImage, setNewPrimaryImage] = useState<{
    id: string
    url: string
  } | null>(null)
  const [uploadTargetId, setUploadTargetId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const {
    data: primaryCategories = [],
    isPending: primariesPending,
    isError: primariesError,
  } = useTourCategories(open, { level: "PRIMARY" })
  const { data: secondaryCategories = [] } = useTourCategories(open, {
    level: "SECONDARY",
  })
  const {
    data: selectedSecondaries = [],
    isPending: secondariesPending,
    isError: secondariesError,
  } = useTourCategories(open && selectedPrimaryId.length > 0, {
    level: "SECONDARY",
    parentId: selectedPrimaryId || undefined,
  })
  const createCategory = useCreateTourCategory()
  const updateCategory = useUpdateTourCategory()
  const deleteCategory = useDeleteTourCategory()
  const upload = useUploadMediaAsset()

  useEffect(() => {
    if (!open) return

    const hasSelected = primaryCategories.some(
      (category) => category.id === selectedPrimaryId
    )
    if (hasSelected) return

    setSelectedPrimaryId(primaryCategories[0]?.id ?? "")
  }, [open, primaryCategories, selectedPrimaryId])

  const secondaryCountByParentId = useMemo(() => {
    const counts = new Map<string, number>()

    for (const category of secondaryCategories) {
      const parentId = category.parent?.id
      if (!parentId) continue
      counts.set(parentId, (counts.get(parentId) ?? 0) + 1)
    }

    if (selectedPrimaryId) {
      counts.set(
        selectedPrimaryId,
        Math.max(counts.get(selectedPrimaryId) ?? 0, selectedSecondaries.length)
      )
    }

    return counts
  }, [secondaryCategories, selectedPrimaryId, selectedSecondaries.length])

  const trimmedPrimaryName = primaryName.trim()
  const trimmedSecondaryName = secondaryName.trim()
  const isCreating = createCategory.isPending
  const creatingLevel = isCreating ? createCategory.variables?.level : undefined
  const isDeleting = deleteCategory.isPending
  const isUploading = upload.isPending || updateCategory.isPending
  const canAddPrimary = trimmedPrimaryName.length > 0 && !isCreating
  const canAddSecondary =
    trimmedSecondaryName.length > 0 &&
    selectedPrimaryId.length > 0 &&
    !isCreating

  const handleAddPrimary = (event: FormEvent) => {
    event.preventDefault()
    if (!canAddPrimary) return

    createCategory.mutate(
      {
        name: trimmedPrimaryName,
        slug: slugify(trimmedPrimaryName),
        level: "PRIMARY",
        sortOrder: nextSortOrder(
          primaryCategories.map((category) => category.sortOrder)
        ),
        imageMediaAssetId: newPrimaryImage?.id,
      },
      {
        onSuccess: () => {
          setPrimaryName("")
          setNewPrimaryImage(null)
        },
      }
    )
  }

  const handleAddSecondary = (event: FormEvent) => {
    event.preventDefault()
    if (!canAddSecondary) return

    createCategory.mutate(
      {
        name: trimmedSecondaryName,
        slug: slugify(trimmedSecondaryName),
        level: "SECONDARY",
        parentId: selectedPrimaryId,
        sortOrder: nextSortOrder(
          selectedSecondaries.map((category) => category.sortOrder)
        ),
      },
      {
        onSuccess: () => {
          setSecondaryName("")
        },
      }
    )
  }

  const handleDelete = (id: string) => {
    deleteCategory.mutate({ id })
  }

  const handleUpdateName = (category: TourCategory, name: string) => {
    const level = category.level ?? (category.parent ? "SECONDARY" : "PRIMARY")
    updateCategory.mutate({
      id: category.id,
      version: category.version ?? 0,
      name,
      slug: slugify(name),
      level,
      parentId:
        level === "SECONDARY"
          ? (category.parent?.id ?? selectedPrimaryId)
          : undefined,
      sortOrder: category.sortOrder ?? 0,
    })
  }

  const openImagePicker = (categoryId?: string) => {
    setUploadTargetId(categoryId ?? "new")
    fileInputRef.current?.click()
  }

  const handleImageSelected = async (files: FileList | null) => {
    const file = files?.[0]
    const targetId = uploadTargetId
    if (!file || !targetId) return

    try {
      const response = await upload.mutateAsync({
        file,
        folderPath: "tour-categories",
      })
      const asset = response.data
      if (!asset?.id) return

      if (targetId === "new") {
        setNewPrimaryImage({
          id: asset.id,
          url: asset.url ?? "",
        })
        return
      }

      const category = primaryCategories.find((item) => item.id === targetId)
      if (!category) return

      updateCategory.mutate({
        id: category.id,
        version: category.version ?? 0,
        name: category.name,
        slug: category.slug,
        level: "PRIMARY",
        sortOrder: category.sortOrder ?? 0,
        imageMediaAssetId: asset.id,
      })
    } finally {
      setUploadTargetId(null)
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
      title="Manage tour categories"
      description="Each secondary category belongs to one primary category. Removing a primary category also removes its children."
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
      <div className="space-y-4">
        <div className="rounded-lg border border-border p-3">
          <Label>Primary categories</Label>
          <CategoryRows
            categories={primaryCategories}
            isPending={primariesPending}
            isError={primariesError}
            emptyLabel="No primary categories yet."
            deleting={isDeleting}
            saving={updateCategory.isPending}
            onDelete={handleDelete}
            onUpdate={handleUpdateName}
            secondaryCountByParentId={secondaryCountByParentId}
            onUploadImage={openImagePicker}
            uploadingId={isUploading ? uploadTargetId : null}
          />
          <form className="mt-2 flex items-center gap-2" onSubmit={handleAddPrimary}>
            <CategoryImageButton
              imageUrl={newPrimaryImage?.url}
              label="Upload primary category image"
              disabled={isUploading}
              pending={isUploading && uploadTargetId === "new"}
              onClick={() => openImagePicker()}
            />
            <Input
              placeholder="Add primary category"
              value={primaryName}
              onChange={(event) => setPrimaryName(event.target.value)}
              disabled={isCreating}
            />
            <Button type="submit" className="h-10 shrink-0" disabled={!canAddPrimary}>
              {creatingLevel === "PRIMARY" ? "Adding…" : "Add"}
            </Button>
          </form>
        </div>

        <div className="rounded-lg border border-border p-3">
          <div className="flex items-center justify-between gap-3">
            <Label>Secondary categories</Label>
            <Select
              items={Object.fromEntries(
                primaryCategories.map((category) => [category.id, category.name])
              )}
              value={selectedPrimaryId || null}
              onValueChange={(value) => {
                if (typeof value === "string") {
                  setSelectedPrimaryId(value)
                }
              }}
              disabled={primaryCategories.length === 0}
            >
              <SelectTrigger
                className="h-8 w-44 text-xs"
                aria-label="Primary category"
              >
                <SelectValue
                  className="min-w-0 truncate"
                  placeholder="Select primary"
                />
              </SelectTrigger>
              <SelectContent align="end">
                {primaryCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <CategoryRows
            categories={selectedSecondaries}
            isPending={secondariesPending}
            isError={secondariesError}
            emptyLabel={
              selectedPrimaryId
                ? "No secondary categories yet."
                : "Select a primary category first."
            }
            deleting={isDeleting}
            saving={updateCategory.isPending}
            onDelete={handleDelete}
            onUpdate={handleUpdateName}
            muted="soft"
          />
          <form className="mt-2 flex items-center gap-2" onSubmit={handleAddSecondary}>
            <Input
              placeholder="Add secondary to selected primary"
              value={secondaryName}
              onChange={(event) => setSecondaryName(event.target.value)}
              disabled={isCreating || !selectedPrimaryId}
            />
            <Button type="submit" className="h-10 shrink-0" disabled={!canAddSecondary}>
              {creatingLevel === "SECONDARY" ? "Adding…" : "Add"}
            </Button>
          </form>
        </div>
      </div>
    </CustomDialog>
  )
}

type CategoryRowsProps = {
  categories: TourCategory[]
  isPending: boolean
  isError: boolean
  emptyLabel: string
  deleting: boolean
  saving?: boolean
  onDelete: (id: string) => void
  onUpdate: (category: TourCategory, name: string) => void
  secondaryCountByParentId?: Map<string, number>
  muted?: "default" | "soft"
  onUploadImage?: (id: string) => void
  uploadingId?: string | null
}

function CategoryRows({
  categories,
  isPending,
  isError,
  emptyLabel,
  deleting,
  saving,
  onDelete,
  onUpdate,
  secondaryCountByParentId,
  muted = "default",
  onUploadImage,
  uploadingId,
}: CategoryRowsProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draftName, setDraftName] = useState("")

  const startEdit = (category: TourCategory) => {
    setEditingId(category.id)
    setDraftName(category.name)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setDraftName("")
  }

  const saveEdit = (category: TourCategory) => {
    const name = draftName.trim()
    if (!name || name === category.name) {
      cancelEdit()
      return
    }
    onUpdate(category, name)
    cancelEdit()
  }

  return (
    <div className="mt-2 max-h-56 space-y-1.5 overflow-y-auto">
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
          {emptyLabel}
        </p>
      ) : null}

      {categories.map((category) => {
        const secondaryCount = secondaryCountByParentId?.get(category.id)
        const isEditing = editingId === category.id

        return (
          <div
            key={category.id}
            className={cn(
              "flex items-center justify-between gap-2 rounded-lg px-3 py-2",
              muted === "soft" ? "bg-primary-soft/40" : "bg-muted/45"
            )}
          >
            <div className="flex min-w-0 flex-1 items-center gap-2.5">
              {onUploadImage ? (
                <CategoryImageButton
                  imageUrl={category.imageUrl}
                  label={`Upload image for ${category.name}`}
                  disabled={Boolean(uploadingId)}
                  pending={uploadingId === category.id}
                  onClick={() => onUploadImage(category.id)}
                />
              ) : null}
              {isEditing ? (
                <Input
                  autoFocus
                  value={draftName}
                  onChange={(event) => setDraftName(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault()
                      saveEdit(category)
                    }
                    if (event.key === "Escape") {
                      event.preventDefault()
                      cancelEdit()
                    }
                  }}
                  className="h-8"
                  aria-label={`Edit ${category.name}`}
                />
              ) : (
                <div className="min-w-0">
                  <span className="text-sm font-bold text-foreground">
                    {category.name}
                  </span>
                  {secondaryCountByParentId ? (
                    <span className="ml-2 text-xs text-muted-foreground">
                      {secondaryCount ?? 0} secondary
                    </span>
                  ) : null}
                </div>
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
                    onClick={() => saveEdit(category)}
                    disabled={saving || !draftName.trim()}
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
                    disabled={saving}
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
                    onClick={() => startEdit(category)}
                    disabled={saving || deleting}
                  >
                    <Pencil />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="text-muted-foreground hover:text-destructive"
                    aria-label={`Delete ${category.name}`}
                    onClick={() => onDelete(category.id)}
                    disabled={deleting}
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
