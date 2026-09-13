import { useNavigate } from "@tanstack/react-router"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

import { PagePlaceholder } from "@/components/page-placeholder"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BasicInfoTab } from "@/features/holiday-packages/create/tabs/basic-info-tab"
import { TripDetailsTab } from "@/features/holiday-packages/create/tabs/trip-details-tab"
import {
  buildHolidayPackageRequest,
  createInitialHolidayForm,
  formFromDetail,
  validateHolidayForm,
  type HolidayPackageFormState,
} from "@/features/holiday-packages/create/holiday-form"
import { useHolidayPackageCategories } from "@/store/server/holiday/categories"
import {
  useCreateHolidayPackage,
  useHolidayPackage,
  useUpdateHolidayPackage,
} from "@/store/server/holiday/packages"
import { useCancellationPolicyOptions } from "@/store/server/tours/cancellation-policies"

type CreatePageState = {
  form: HolidayPackageFormState
  activeTab: string
}

type HolidayPackageFormPageProps = {
  packageId?: string
}

const HolidayPackageFormPage = ({
  packageId,
}: HolidayPackageFormPageProps) => {
  const navigate = useNavigate()
  const isEdit = Boolean(packageId)
  const [page, setPage] = useState<CreatePageState>(() => ({
    form: createInitialHolidayForm(),
    activeTab: "basic",
  }))
  const { form, activeTab } = page
  const packageQuery = useHolidayPackage(packageId ?? "", isEdit)
  const createPackage = useCreateHolidayPackage()
  const updatePackage = useUpdateHolidayPackage()
  const { data: categories = [] } = useHolidayPackageCategories()
  const { data: cancellationPolicies = [] } = useCancellationPolicyOptions()
  const saving = createPackage.isPending || updatePackage.isPending

  useEffect(() => {
    if (!packageQuery.data) return
    setPage({
      form: formFromDetail(packageQuery.data),
      activeTab: "basic",
    })
  }, [packageQuery.data])

  const updateForm = useCallback((nextForm: HolidayPackageFormState) => {
    setPage((current) => ({ ...current, form: nextForm }))
  }, [])

  const goBack = () => {
    void navigate({ to: "/holiday-packages" })
  }

  const handleSave = () => {
    const errors = validateHolidayForm(form)
    if (errors.length > 0) {
      toast.error(errors[0].message)
      setPage((current) => ({ ...current, activeTab: errors[0].tab }))
      return
    }

    const payload = buildHolidayPackageRequest(form)

    if (isEdit && packageId) {
      updatePackage.mutate(
        {
          id: packageId,
          version: form.version,
          holidayPackage: payload,
        },
        {
          onSuccess: () => {
            void navigate({ to: "/holiday-packages" })
          },
        }
      )
      return
    }

    createPackage.mutate(payload, {
      onSuccess: () => {
        void navigate({ to: "/holiday-packages" })
      },
    })
  }

  if (isEdit && packageQuery.isPending) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        Loading holiday package…
      </p>
    )
  }

  if (isEdit && packageQuery.isError) {
    return (
      <div className="space-y-4 py-10 text-center">
        <p className="text-sm text-destructive">
          Failed to load holiday package.
        </p>
        <Button type="button" variant="outline" onClick={goBack}>
          Back to list
        </Button>
      </div>
    )
  }

  return (
    <div>
      <PagePlaceholder
        title={isEdit ? form.title || "Edit Holiday Package" : "New Holiday Package"}
        subtitle="Inquiry-only holiday offer. Visitors see a starting price and submit a request."
        actions={
          <>
            <Button type="button" variant="outline" onClick={goBack}>
              Cancel
            </Button>
            <Button type="button" disabled={saving} onClick={handleSave}>
              {saving ? "Saving..." : "Save package"}
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

export default HolidayPackageFormPage
