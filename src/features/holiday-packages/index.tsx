import { useNavigate } from "@tanstack/react-router"
import { Plus } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PagePlaceholder } from "@/components/page-placeholder"
import { DeleteHolidayPackageDialog } from "@/features/holiday-packages/components/delete-holiday-package-dialog"
import { HolidayInquiriesTab } from "@/features/holiday-packages/components/holiday-inquiries-tab"
import { HolidayPackagesTab } from "@/features/holiday-packages/components/holiday-packages-tab"
import { ManageCategoriesDialog } from "@/features/holiday-packages/manage-categories"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import {
  useDeleteHolidayPackage,
  useHolidayPackages,
} from "@/store/server/holiday/packages"

type PackageToDelete = {
  id: string
  title: string
}

const HolidayPackageFeature = () => {
  const navigate = useNavigate()
  const [categoriesOpen, setCategoriesOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [packageToDelete, setPackageToDelete] =
    useState<PackageToDelete | null>(null)
  const debouncedSearch = useDebouncedValue(search, 300)
  const deletePackage = useDeleteHolidayPackage()

  const { data, isPending, isError } = useHolidayPackages({
    query: debouncedSearch.trim() || undefined,
    size: 50,
  })

  const packages = data?.content ?? []

  const handleConfirmDelete = () => {
    if (!packageToDelete) return

    deletePackage.mutate(
      { id: packageToDelete.id },
      {
        onSuccess: () => {
          setPackageToDelete(null)
        },
      }
    )
  }

  return (
    <div>
      <PagePlaceholder
        title="Holiday Packages"
        subtitle="Inquiry-only holiday offers. Visitors see a starting price and submit a request — never a payment checkout."
        actions={
          <>
            <ManageCategoriesDialog
              open={categoriesOpen}
              onOpenChange={setCategoriesOpen}
            />
            <Button
              type="button"
              onClick={() => {
                void navigate({ to: "/holiday-packages/new" })
              }}
            >
              <Plus />
              New holiday package
            </Button>
          </>
        }
      />

      <Tabs defaultValue="packages" className="gap-4">
        <TabsList
          variant="line"
          className="w-full justify-start border-b border-border"
        >
          <TabsTrigger value="packages">Holiday packages</TabsTrigger>
          <TabsTrigger value="inquiries">Customer inquiries</TabsTrigger>
        </TabsList>

        <TabsContent value="packages">
          <HolidayPackagesTab
            search={search}
            onSearchChange={setSearch}
            packages={packages}
            isPending={isPending}
            isError={isError}
            deleting={deletePackage.isPending}
            onRequestDelete={(pkg) => {
              setPackageToDelete({ id: pkg.id, title: pkg.title })
            }}
          />
        </TabsContent>

        <TabsContent value="inquiries">
          <HolidayInquiriesTab />
        </TabsContent>
      </Tabs>

      <DeleteHolidayPackageDialog
        open={packageToDelete !== null}
        onOpenChange={(open) => {
          if (!open && !deletePackage.isPending) {
            setPackageToDelete(null)
          }
        }}
        packageTitle={packageToDelete?.title}
        deleting={deletePackage.isPending}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}

export default HolidayPackageFeature
