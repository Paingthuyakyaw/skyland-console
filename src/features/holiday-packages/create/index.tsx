import { useNavigate } from "@tanstack/react-router"
import { useCallback, useState } from "react"
import { toast } from "sonner"

import { PagePlaceholder } from "@/components/page-placeholder"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BasicInfoTab } from "@/features/holiday-packages/create/tabs/basic-info-tab"
import { TripDetailsTab } from "@/features/holiday-packages/create/tabs/trip-details-tab"
import {
  buildHolidayPackageRequest,
  createInitialHolidayForm,
  validateHolidayForm,
  type HolidayPackageFormState,
} from "@/features/holiday-packages/create/holiday-form"
import { useHolidayPackageCategories } from "@/store/server/holiday/categories"
import { useCreateHolidayPackage } from "@/store/server/holiday/packages"
import { useCancellationPolicyOptions } from "@/store/server/tours/cancellation-policies"

type CreatePageState = {
  form: HolidayPackageFormState
  activeTab: string
}

const CreateHolidayPackageFeature = () => {
  const navigate = useNavigate()
  const [page, setPage] = useState<CreatePageState>(() => ({
    form: createInitialHolidayForm(),
    activeTab: "basic",
  }))
  const { form, activeTab } = page
  const createPackage = useCreateHolidayPackage()
  const { data: categories = [] } = useHolidayPackageCategories()
  const { data: cancellationPolicies = [] } = useCancellationPolicyOptions()

  const updateForm = useCallback((nextForm: HolidayPackageFormState) => {
    setPage((current) => ({ ...current, form: nextForm }))
  }, [])

  const goBack = () => {
    void navigate({ to: "/holiday-packages" })
  }

  const handleCreate = () => {
    const errors = validateHolidayForm(form)
    if (errors.length > 0) {
      toast.error(errors[0].message)
      setPage((current) => ({ ...current, activeTab: errors[0].tab }))
      return
    }

    createPackage.mutate(buildHolidayPackageRequest(form), {
      onSuccess: () => {
        void navigate({ to: "/holiday-packages" })
      },
    })
  }

  return (
    <div>
      <PagePlaceholder
        title="New Holiday Package"
        subtitle="Inquiry-only holiday offer. Visitors see a starting price and submit a request."
        actions={
          <>
            <Button type="button" variant="outline" onClick={goBack}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={createPackage.isPending}
              onClick={handleCreate}
            >
              {createPackage.isPending ? "Saving..." : "Save package"}
            </Button>
          </>
        }
      />

      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          if (typeof value === "string") {
            setPage((current) => ({ ...current, activeTab: value }))
          }
        }}
        className="gap-4"
      >
        <TabsList
          variant="line"
          className="w-full justify-start border-b border-border"
        >
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="trip">Trip Details</TabsTrigger>
        </TabsList>

        {activeTab === "basic" ? (
          <TabsContent value="basic">
            <BasicInfoTab
              form={form}
              onChange={updateForm}
              categories={categories}
              cancellationPolicies={cancellationPolicies}
            />
          </TabsContent>
        ) : null}
        {activeTab === "trip" ? (
          <TabsContent value="trip">
            <TripDetailsTab form={form} onChange={updateForm} />
          </TabsContent>
        ) : null}
      </Tabs>
    </div>
  )
}

export default CreateHolidayPackageFeature
