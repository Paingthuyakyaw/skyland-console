import { useNavigate } from "@tanstack/react-router"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

import { PagePlaceholder } from "@/components/page-placeholder"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BasicInfoTab } from "@/features/combo-tours/create/tabs/basic-info-tab"
import { TripDetailsTab } from "@/features/combo-tours/create/tabs/trip-details-tab"
import {
  buildComboTourRequest,
  createInitialComboForm,
  formFromDetail,
  validateComboForm,
  type ComboTourFormState,
} from "@/features/combo-tours/create/combo-form"
import { useComboCategories } from "@/store/server/combo/categories"
import {
  useComboTour,
  useCreateComboTour,
  useUpdateComboTour,
} from "@/store/server/combo/tours"
import { useCancellationPolicyOptions } from "@/store/server/tours/cancellation-policies"
import { useTours } from "@/store/server/tours/tours"

type CreatePageState = {
  form: ComboTourFormState
  activeTab: string
}

type ComboTourFormPageProps = {
  comboTourId?: string
}

const ComboTourFormPage = ({ comboTourId }: ComboTourFormPageProps) => {
  const navigate = useNavigate()
  const isEdit = Boolean(comboTourId)
  const [page, setPage] = useState<CreatePageState>(() => ({
    form: createInitialComboForm(),
    activeTab: "basic",
  }))
  const { form, activeTab } = page
  const comboQuery = useComboTour(comboTourId ?? "", isEdit)
  const createCombo = useCreateComboTour()
  const updateCombo = useUpdateComboTour()
  const { data: categories = [] } = useComboCategories()
  const { data: cancellationPolicies = [] } = useCancellationPolicyOptions()
  const { data: toursPage } = useTours({ size: 100 })
  const tours = toursPage?.content ?? []
  const saving = createCombo.isPending || updateCombo.isPending

  useEffect(() => {
    if (!comboQuery.data) return
    setPage({
      form: formFromDetail(comboQuery.data),
      activeTab: "basic",
    })
  }, [comboQuery.data])

  const updateForm = useCallback(
    (
      nextForm:
        | ComboTourFormState
        | ((current: ComboTourFormState) => ComboTourFormState)
    ) => {
      setPage((current) => ({
        ...current,
        form:
          typeof nextForm === "function" ? nextForm(current.form) : nextForm,
      }))
    },
    []
  )

  const goBack = () => {
    void navigate({ to: "/combo-tours" })
  }

  const handleSave = () => {
    const errors = validateComboForm(form)
    if (errors.length > 0) {
      toast.error(errors[0].message)
      setPage((current) => ({ ...current, activeTab: errors[0].tab }))
      return
    }

    const payload = buildComboTourRequest(form)

    if (isEdit && comboTourId) {
      updateCombo.mutate(
        {
          id: comboTourId,
          version: form.version,
          comboTour: payload,
        },
        {
          onSuccess: goBack,
        }
      )
      return
    }

    createCombo.mutate(payload, {
      onSuccess: goBack,
    })
  }

  if (isEdit && comboQuery.isPending) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        Loading combo tour…
      </p>
    )
  }

  if (isEdit && comboQuery.isError) {
    return (
      <div className="space-y-4 py-10 text-center">
        <p className="text-sm text-destructive">Failed to load combo tour.</p>
        <Button type="button" variant="outline" onClick={goBack}>
          Back to list
        </Button>
      </div>
    )
  }

  return (
    <div>
      <PagePlaceholder
        title={isEdit ? form.title || "Edit Combo Tour" : "New Combo Tour"}
        subtitle="Multi-tour bundle offer. Customers inquire and a tailored quote is sent — no online checkout."
        actions={
          <>
            <Button type="button" variant="outline" onClick={goBack}>
              Cancel
            </Button>
            <Button type="button" disabled={saving} onClick={handleSave}>
              {saving ? "Saving..." : "Save combo"}
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
            <TripDetailsTab form={form} onChange={updateForm} tours={tours} />
          </TabsContent>
        ) : null}
      </Tabs>
    </div>
  )
}

export default ComboTourFormPage
