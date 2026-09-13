import { useNavigate } from "@tanstack/react-router"
import { Plus } from "lucide-react"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PagePlaceholder } from "@/components/page-placeholder"
import { ComboInquiriesTab } from "@/features/combo-tours/components/combo-inquiries-tab"
import { ComboPackagesTab } from "@/features/combo-tours/components/combo-packages-tab"
import { DeleteComboTourDialog } from "@/features/combo-tours/components/delete-combo-tour-dialog"
import { ManageCategoriesDialog } from "@/features/combo-tours/manage-categories"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { useDeleteComboTour, useComboTours } from "@/store/server/combo/tours"

const PAGE_SIZE = 6

type TourToDelete = {
  id: string
  title: string
}

type ComboToursUi = {
  categoriesOpen: boolean
  search: string
  page: number
  deleting: TourToDelete | null
}

const ComboToursFeature = () => {
  const navigate = useNavigate()
  const [ui, setUi] = useState<ComboToursUi>({
    categoriesOpen: false,
    search: "",
    page: 0,
    deleting: null,
  })
  const debouncedSearch = useDebouncedValue(ui.search, 300)
  const deleteTour = useDeleteComboTour()

  useEffect(() => {
    setUi((current) => ({ ...current, page: 0 }))
  }, [debouncedSearch])

  const { data, isPending, isError } = useComboTours({
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
    if (totalPages > 0 && ui.page > totalPages - 1) {
      setUi((current) => ({ ...current, page: totalPages - 1 }))
    }
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
        title="Combo Tours"
        subtitle="Multi-tour bundle offers. Customers can select multiple tours bundled at a package price."
        actions={
          <>
            <ManageCategoriesDialog
              open={ui.categoriesOpen}
              onOpenChange={(categoriesOpen) =>
                setUi((current) => ({ ...current, categoriesOpen }))
              }
            />
            <Button
              type="button"
              onClick={() => {
                void navigate({ to: "/combo-tours/new" })
              }}
            >
              <Plus />
              New combo tour
            </Button>
          </>
        }
      />

      <Tabs defaultValue="packages" className="gap-4">
        <TabsList
          variant="line"
          className="w-full justify-start border-b border-border"
        >
          <TabsTrigger value="packages">Combo packages</TabsTrigger>
          <TabsTrigger value="inquiries">Customer inquiries</TabsTrigger>
        </TabsList>

        <TabsContent value="packages">
          <ComboPackagesTab
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
                to: "/combo-tours/$id",
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
        </TabsContent>

        <TabsContent value="inquiries">
          <ComboInquiriesTab />
        </TabsContent>
      </Tabs>

      <DeleteComboTourDialog
        open={ui.deleting !== null}
        onOpenChange={(open) => {
          if (!open && !deleteTour.isPending) {
            setUi((current) => ({ ...current, deleting: null }))
          }
        }}
        tourTitle={ui.deleting?.title}
        deleting={deleteTour.isPending}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}

export default ComboToursFeature
