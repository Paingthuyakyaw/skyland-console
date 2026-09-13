import { useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { PagePlaceholder } from "@/components/page-placeholder"
import { DeleteTourDialog } from "@/features/tours/components/delete-tour-dialog"
import { ToursGrid } from "@/features/tours/components/tours-grid"
import { ManageCategoriesDialog } from "@/features/tours/manage-categories"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { useDeleteTour, useTours } from "@/store/server/tours/tours"

type TourToDelete = {
  id: string
  title: string
}

const ToursFeature = () => {
  const navigate = useNavigate()
  const [categoriesOpen, setCategoriesOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [tourToDelete, setTourToDelete] = useState<TourToDelete | null>(null)
  const debouncedSearch = useDebouncedValue(search, 300)
  const deleteTour = useDeleteTour()

  const { data, isPending, isError } = useTours({
    query: debouncedSearch.trim() || undefined,
    size: 50,
  })

  const tours = data?.content ?? []

  const handleConfirmDelete = () => {
    if (!tourToDelete) return

    deleteTour.mutate(
      { id: tourToDelete.id },
      {
        onSuccess: () => {
          setTourToDelete(null)
        },
      }
    )
  }

  return (
    <div>
      <PagePlaceholder
        title="Tours, Combos & Packages"
        subtitle="Tours are the foundational entity. Combos and Packages are lightweight bundles of existing tours."
        actions={
          <>
            <ManageCategoriesDialog
              open={categoriesOpen}
              onOpenChange={setCategoriesOpen}
            />
            <Button
              type="button"
              onClick={() => {
                void navigate({ to: "/tours/new" })
              }}
            >
              <Plus />
              New Tour
            </Button>
          </>
        }
      />

      <ToursGrid
        search={search}
        onSearchChange={setSearch}
        tours={tours}
        isPending={isPending}
        isError={isError}
        deleting={deleteTour.isPending}
        onRequestDelete={(tour) => {
          setTourToDelete({ id: tour.id, title: tour.title })
        }}
      />

      <DeleteTourDialog
        open={tourToDelete !== null}
        onOpenChange={(open) => {
          if (!open && !deleteTour.isPending) {
            setTourToDelete(null)
          }
        }}
        tourTitle={tourToDelete?.title}
        deleting={deleteTour.isPending}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}

export default ToursFeature
