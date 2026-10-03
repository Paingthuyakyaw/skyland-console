import { CategoryFilter } from "@/components/category-filter"
import { useHolidayPackageCategories } from "@/store/server/holiday/categories"
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

const PAGE_SIZE = 6

type PackageToDelete = {
  id: string
  title: string
}

type HolidayPackagesUi = {
  categoriesOpen: boolean
  search: string
  categoryId: string
  page: number
  deleting: PackageToDelete | null
}

const HolidayPackageFeature = () => {
  const navigate = useNavigate()
  const [ui, setUi] = useState<HolidayPackagesUi>({
    categoriesOpen: false,
    search: "",
    categoryId: "",
    page: 0,
    deleting: null,
  })
  const { data: categories = [] } = useHolidayPackageCategories()
  const debouncedSearch = useDebouncedValue(ui.search, 300)
  const deletePackage = useDeleteHolidayPackage()

  const { data, isPending, isError, isFetching } = useHolidayPackages({
    query: debouncedSearch.trim() || undefined,
    categoryId: ui.categoryId || undefined,
    page: ui.page,
    size: PAGE_SIZE,
  })

  const packages = data?.content ?? []
  const totalElements = data?.totalElements ?? packages.length
  const totalPages =
    data?.totalPages && data.totalPages > 0
      ? data.totalPages
      : packages.length > 0
        ? Math.max(1, Math.ceil(totalElements / PAGE_SIZE))
        : 0

  if (data && !isFetching && ui.page > 0 && ui.page >= totalPages) {
    setUi((current) => ({ ...current, page: Math.max(0, totalPages - 1) }))
  }

  const handleConfirmDelete = () => {
    if (!ui.deleting) return

    deletePackage.mutate(
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
        title="Holiday Packages"
        subtitle="Inquiry-only holiday offers. Visitors see a starting price and submit a request — never a payment checkout."
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
            categoryFilter={
              <CategoryFilter
                value={ui.categoryId}
                categories={categories}
                onChange={(categoryId) =>
                  setUi((current) => ({ ...current, categoryId, page: 0 }))
                }
              />
            }
            search={ui.search}
            onSearchChange={(search) =>
              setUi((current) => ({ ...current, search, page: 0 }))
            }
            packages={packages}
            isPending={isPending}
            isError={isError}
            deleting={deletePackage.isPending}
            page={ui.page}
            totalPages={totalPages}
            totalElements={totalElements}
            pageSize={PAGE_SIZE}
            onPageChange={(page) => setUi((current) => ({ ...current, page }))}
            onEdit={(pkg) => {
              void navigate({
                to: "/holiday-packages/$id",
                params: { id: pkg.id },
              })
            }}
            onRequestDelete={(pkg) => {
              setUi((current) => ({
                ...current,
                deleting: { id: pkg.id, title: pkg.title },
              }))
            }}
          />
        </TabsContent>

        <TabsContent value="inquiries">
          <HolidayInquiriesTab />
        </TabsContent>
      </Tabs>

      <DeleteHolidayPackageDialog
        open={ui.deleting !== null}
        onOpenChange={(open) => {
          if (!open && !deletePackage.isPending) {
            setUi((current) => ({ ...current, deleting: null }))
          }
        }}
        packageTitle={ui.deleting?.title}
        deleting={deletePackage.isPending}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}

export default HolidayPackageFeature
