import { useState } from "react"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PagePlaceholder } from "@/components/page-placeholder"
import { ComboInquiriesTab } from "@/features/combo-tours/components/combo-inquiries-tab"
import { ComboPackagesTab } from "@/features/combo-tours/components/combo-packages-tab"
import { DeleteComboTourDialog } from "@/features/combo-tours/components/delete-combo-tour-dialog"
import { ManageCategoriesDialog } from "@/features/combo-tours/manage-categories"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { useDeleteComboTour, useComboTours } from "@/store/server/combo/tours"

type TourToDelete = {
  id: string
  title: string
}

const ComboToursFeature = () => {
  const [categoriesOpen, setCategoriesOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [tourToDelete, setTourToDelete] = useState<TourToDelete | null>(null)
  const debouncedSearch = useDebouncedValue(search, 300)
  const deleteTour = useDeleteComboTour()

  const { data, isPending, isError } = useComboTours({
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
        title="Combo Tours"
        subtitle="Multi-tour bundle offers. Customers can select multiple tours bundled at a package price."
        actions={
          <>
            <ManageCategoriesDialog
              open={categoriesOpen}
              onOpenChange={setCategoriesOpen}
            />
            <Button type="button">
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
        </TabsContent>

        <TabsContent value="inquiries">
          <ComboInquiriesTab />
        </TabsContent>
      </Tabs>

      <DeleteComboTourDialog
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

export default ComboToursFeature
