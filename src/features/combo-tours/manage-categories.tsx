import { Check, Pencil, X } from "lucide-react"
import { useState, type FormEvent } from "react"

import { CustomDialog } from "@/components/custom-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  useCreateComboCategory,
  useDeleteComboCategory,
  useComboCategories,
  useUpdateComboCategory,
} from "@/store/server/combo/categories"

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
  const [name, setName] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")

  const trimmedName = name.trim()
  const canAdd = trimmedName.length > 0 && !createCategory.isPending
  const trimmedEditName = editName.trim()
  const isUpdating = updateCategory.isPending
  const isDeleting = deleteCategory.isPending
  const canSaveEdit =
    editingId !== null && trimmedEditName.length > 0 && !isUpdating

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!canAdd) return

    createCategory.mutate(
      { name: trimmedName },
      {
        onSuccess: () => {
          setName("")
        },
      }
    )
  }

  const startEdit = (id: string, currentName: string) => {
    setEditingId(id)
    setEditName(currentName)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditName("")
  }

  const saveEdit = () => {
    if (!canSaveEdit || !editingId) return

    updateCategory.mutate(
      { id: editingId, name: trimmedEditName },
      {
        onSuccess: () => {
          cancelEdit()
        },
      }
    )
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
            const isEditing = editingId === category.id

            return (
              <div
                key={category.id}
                className="flex items-center justify-between gap-2 rounded-lg bg-muted/45 px-3 py-2"
              >
                {isEditing ? (
                  <Input
                    autoFocus
                    className="h-8"
                    value={editName}
                    onChange={(event) => setEditName(event.target.value)}
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
                        onClick={() => deleteCategory.mutate({ id: category.id })}
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
          <Input
            placeholder="Add category"
            value={name}
            onChange={(event) => setName(event.target.value)}
            disabled={createCategory.isPending}
          />
          <Button
            type="submit"
            className="h-10 shrink-0"
            disabled={!canAdd}
          >
            {createCategory.isPending ? "Adding…" : "Add"}
          </Button>
        </form>
      </div>
    </CustomDialog>
  )
}
