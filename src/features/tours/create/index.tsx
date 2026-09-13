import { useNavigate } from "@tanstack/react-router"
import { useCallback, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { PagePlaceholder } from "@/components/page-placeholder"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AvailabilityTab } from "@/features/tours/create/tabs/availability-tab"
import { BasicInfoTab } from "@/features/tours/create/tabs/basic-info-tab"
import { CapacityTab } from "@/features/tours/create/tabs/capacity-tab"
import { PricingTab } from "@/features/tours/create/tabs/pricing-tab"
import { SettingsTab } from "@/features/tours/create/tabs/settings-tab"
import {
  buildTourRequest,
  createInitialTourForm,
  validateTourForm,
  type TourFormState,
} from "@/features/tours/create/tour-form"
import { useCancellationPolicyOptions } from "@/store/server/tours/cancellation-policies"
import { useTourCategories } from "@/store/server/tours/categories"
import { useCreateTour } from "@/store/server/tours/tours"
import type { TourResponse } from "@/store/server/tours/typed"

type CreatePageState = {
  form: TourFormState
  activeTab: string
  createdTour?: TourResponse
}

const CreateTourFeature = () => {
  const navigate = useNavigate()
  const [page, setPage] = useState<CreatePageState>(() => ({
    form: createInitialTourForm(),
    activeTab: "basic",
  }))
  const { form, activeTab, createdTour } = page
  const createTour = useCreateTour()
  const { data: primaryCategories = [] } = useTourCategories(true, {
    level: "PRIMARY",
  })
  const { data: secondaryCategories = [] } = useTourCategories(
    Boolean(form.primaryCategoryId),
    {
      level: "SECONDARY",
      parentId: form.primaryCategoryId || undefined,
    }
  )
  const { data: cancellationPolicies = [] } = useCancellationPolicyOptions()
  const createdPackages =
    createdTour?.timeslots?.flatMap((slot) => slot.packages ?? []) ?? []
  const featuredPackageId =
    createdPackages.find((pkg) => pkg.featured)?.id ?? createdPackages[0]?.id

  const updateForm = useCallback((nextForm: TourFormState) => {
    setPage((current) => ({ ...current, form: nextForm }))
  }, [])

  const goBack = () => {
    void navigate({ to: "/tours" })
  }

  const handleCreate = () => {
    const errors = validateTourForm(form)
    if (errors.length > 0) {
      toast.error(errors[0])
      setPage((current) => ({ ...current, activeTab: "basic" }))
      return
    }

    createTour.mutate(buildTourRequest(form), {
      onSuccess: (response) => {
        if (response.data) {
          setPage((current) => ({
            ...current,
            createdTour: response.data,
            activeTab: "availability",
          }))
        }
      },
    })
  }

  return (
    <div>
      <PagePlaceholder
        title={createdTour ? "Tour created" : "Add Tour"}
        subtitle={
          createdTour
            ? `${createdTour.title} is saved. Set availability, then tap Done.`
            : "Create the tour, then unlock the availability calendar."
        }
        actions={
          <>
            <Button type="button" variant="outline" onClick={goBack}>
              {createdTour ? "Done" : "Cancel"}
            </Button>
            {createdTour ? null : (
              <Button
                type="button"
                disabled={createTour.isPending}
                onClick={handleCreate}
              >
                {createTour.isPending ? "Creating..." : "Create Tour"}
              </Button>
            )}
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
          <TabsTrigger value="capacity">Capacity</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
        </TabsList>

        {activeTab === "basic" ? (
          <TabsContent value="basic">
            <BasicInfoTab
              form={form}
              onChange={updateForm}
              primaryCategories={primaryCategories}
              secondaryCategories={secondaryCategories}
              cancellationPolicies={cancellationPolicies}
            />
          </TabsContent>
        ) : null}
        {activeTab === "capacity" ? (
          <TabsContent value="capacity">
            <CapacityTab form={form} onChange={updateForm} />
          </TabsContent>
        ) : null}
        {activeTab === "settings" ? (
          <TabsContent value="settings">
            <SettingsTab
              form={form}
              onChange={updateForm}
              createdTour={createdTour}
            />
          </TabsContent>
        ) : null}
        {activeTab === "pricing" ? (
          <TabsContent value="pricing">
            <PricingTab
              form={form}
              onChange={updateForm}
              packageId={featuredPackageId}
            />
          </TabsContent>
        ) : null}
        {activeTab === "availability" ? (
          <TabsContent value="availability">
            <AvailabilityTab createdTour={createdTour} />
          </TabsContent>
        ) : null}
      </Tabs>
    </div>
  )
}

export default CreateTourFeature
