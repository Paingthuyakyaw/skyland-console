import { useNavigate } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { PagePlaceholder } from "@/components/page-placeholder"
import { DeleteTourDialog } from "@/features/tours/components/delete-tour-dialog"
import { ToursGrid } from "@/features/tours/components/tours-grid"
import { ManageCategoriesDialog } from "@/features/tours/manage-categories"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { useDeleteTour, useTours } from "@/store/server/tours/tours"

const PAGE_SIZE = 6

type TourToDelete = {
  id: string
  title: string
}

type ToursUi = {
  categoriesOpen: boolean
  search: string
  page: number
  deleting: TourToDelete | null
}

const ToursFeature = () => {
  const navigate = useNavigate()
  const [ui, setUi] = useState<ToursUi>({
    categoriesOpen: false,
    search: "",
    page: 0,
    deleting: null,
  })
  const debouncedSearch = useDebouncedValue(ui.search, 300)
  const deleteTour = useDeleteTour()

  useEffect(() => {
    setUi((current) => (current.page === 0 ? current : { ...current, page: 0 }))
  }, [debouncedSearch])

  const { data, isPending, isError } = useTours({
    query: debouncedSearch.trim() || undefined,
    page: ui.page,
    size: PAGE_SIZE,
  })

  const tours = data?.content ?? []
  const totalElements = data?.totalElements ?? tours.length
  const totalPages =
    data?.totalPages && data.totalPages > 0
      ? data.totalPages
      : tours.length > 0
        ? Math.max(1, Math.ceil(totalElements / PAGE_SIZE))
        : 0

  useEffect(() => {
    if (totalPages <= 0) return
    setUi((current) => {
      const nextPage = Math.min(current.page, totalPages - 1)
      return nextPage === current.page
        ? current
        : { ...current, page: nextPage }
    })
  }, [ui.page, totalPages])

  const handleConfirmDelete = () => {
    if (!ui.deleting) return

    deleteTour.mutate(
      { id: ui.deleting.id },
      {
        onSuccess: () => {
          setUi((current) => ({ ...current, deleting: null }))
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
              open={ui.categoriesOpen}
              onOpenChange={(categoriesOpen) =>
                setUi((current) =>
                  current.categoriesOpen === categoriesOpen
                    ? current
                    : { ...current, categoriesOpen }
                )
              }
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
        search={ui.search}
        onSearchChange={(search) =>
          setUi((current) => ({ ...current, search }))
        }
        tours={tours}
        isPending={isPending}
        isError={isError}
        deleting={deleteTour.isPending}
        page={ui.page}
        totalPages={totalPages}
        totalElements={totalElements}
        pageSize={PAGE_SIZE}
        onPageChange={(page) => setUi((current) => ({ ...current, page }))}
        onEdit={(tour) => {
          void navigate({
            to: "/tours/$id",
            params: { id: tour.id },
          })
        }}
        onRequestDelete={(tour) => {
          setUi((current) => ({
            ...current,
            deleting: { id: tour.id, title: tour.title },
          }))
        }}
      />

      <DeleteTourDialog
        open={ui.deleting !== null}
        onOpenChange={(open) => {
          if (!open && !deleteTour.isPending) {
            setUi((current) =>
              current.deleting === null
                ? current
                : { ...current, deleting: null }
            )
          }
        }}
        tourTitle={ui.deleting?.title}
        deleting={deleteTour.isPending}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}

export default ToursFeature
