import { Link, useNavigate } from "@tanstack/react-router"
import { ChevronRight } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

import { PagePlaceholder } from "@/components/page-placeholder"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AddonsTab } from "@/features/tours/create/tabs/addons-tab"
import { AvailabilityTab } from "@/features/tours/create/tabs/availability-tab"
import { BookingCapacityTab } from "@/features/tours/create/tabs/booking-capacity-tab"
import { ExperienceLogisticsTab } from "@/features/tours/create/tabs/experience-logistics-tab"
import { GeneralPublishingTab } from "@/features/tours/create/tabs/general-publishing-tab"
import { MediaBadgesSeoTab } from "@/features/tours/create/tabs/media-badges-seo-tab"
import { PromotionsTab } from "@/features/tours/create/tabs/promotions-tab"
import { TimeslotsPackagesTab } from "@/features/tours/create/tabs/timeslots-packages-tab"
import {
  buildTourRequest,
  createInitialTourForm,
  formFromDetail,
  validateTourForm,
  type TourFormState,
} from "@/features/tours/create/tour-form"
import { statusLabel } from "@/features/tours/components/utils"
import { cn } from "@/lib/utils"
import { useCancellationPolicyOptions } from "@/store/server/tours/cancellation-policies"
import { useTourCategories } from "@/store/server/tours/categories"
import {
  useCreateTour,
  useTour,
  useUpdateTour,
} from "@/store/server/tours/tours"
import type { TourResponse, TourStatus } from "@/store/server/tours/typed"

type CreatePageState = {
  form: TourFormState
  activeTab: string
  createdTour?: TourResponse
  savedAt?: string
}

type CreateTourPageProps = {
  tourId?: string
}

const POST_CREATE_TABS = new Set(["availability", "promotions"])

const TOUR_TABS = [
  { key: "general", label: "General & Publishing" },
  { key: "experience", label: "Experience & Logistics" },
  { key: "timeslots", label: "Timeslots & Packages" },
  { key: "booking", label: "Booking & Capacity Policy" },
  { key: "addons", label: "Add-ons" },
  { key: "media", label: "Media, Badges & SEO" },
  { key: "availability", label: "Availability", postCreate: true },
  { key: "promotions", label: "Promotions", postCreate: true },
] as const

function lastSavedLabel(value?: string) {
  if (!value) return "just now"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })
}

const CreateTourFeature = ({ tourId }: CreateTourPageProps) => {
  const navigate = useNavigate()
  const isEdit = Boolean(tourId)
  const [page, setPage] = useState<CreatePageState>(() => ({
    form: createInitialTourForm(),
    activeTab: "general",
  }))
  const { form, activeTab, createdTour, savedAt } = page
  const tourQuery = useTour(tourId ?? "", isEdit)
  const createTour = useCreateTour()
  const updateTour = useUpdateTour()
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
  const savedTour = createdTour
  const tourCreated = Boolean(savedTour)
  const saving = createTour.isPending || updateTour.isPending

  useEffect(() => {
    const detail = tourQuery.data
    if (!detail) return
    setPage((current) => {
      if (
        current.createdTour?.id === detail.id &&
        current.createdTour.version === detail.version
      ) {
        return current
      }
      return {
        form: formFromDetail(detail),
        activeTab:
          current.createdTour?.id === detail.id ? current.activeTab : "general",
        createdTour: detail,
        savedAt: lastSavedLabel(detail.updatedAt),
      }
    })
  }, [tourQuery.data])

  const updateForm = useCallback((nextForm: TourFormState) => {
    setPage((current) => ({ ...current, form: nextForm }))
  }, [])

  const goBack = () => {
    void navigate({ to: "/tours" })
  }

  const openTab = (tab: string) => {
    if (POST_CREATE_TABS.has(tab) && !savedTour) return
    setPage((current) => ({ ...current, activeTab: tab }))
  }

  const applySavedTour = (
    nextForm: TourFormState,
    tour: TourResponse,
    nextTab?: string
  ) => {
    setPage((current) => ({
      ...current,
      form: { ...nextForm, version: tour.version ?? nextForm.version },
      createdTour: tour,
      savedAt: lastSavedLabel(tour.updatedAt) || lastSavedLabel(),
      activeTab: nextTab ?? current.activeTab,
    }))
  }

  const handleSave = (status: TourStatus) => {
    const nextForm = { ...form, status }
    const errors = validateTourForm(nextForm)
    if (errors.length > 0) {
      toast.error(errors[0])
      setPage((current) => ({
        ...current,
        form: nextForm,
        activeTab: "general",
      }))
      return
    }

    const payload = buildTourRequest(nextForm)

    if (savedTour) {
      updateTour.mutate(
        {
          id: savedTour.id,
          version: nextForm.version ?? savedTour.version ?? 0,
          tour: payload,
        },
        {
          onSuccess: (response) => {
            if (response.data) {
              applySavedTour(nextForm, response.data)
            }
          },
        }
      )
      return
    }

    createTour.mutate(payload, {
      onSuccess: (response) => {
        if (response.data) {
          applySavedTour(nextForm, response.data, "availability")
        }
      },
    })
  }

  const publishStatus: TourStatus =
    form.status === "SCHEDULED" ? "SCHEDULED" : "PUBLISHED"
  const primaryActionLabel = tourCreated ? "Update Tour" : "Publish Tour"
  const pageTitle = savedTour?.title || (isEdit ? "Edit Tour" : "Create Tour")

  if (isEdit && tourQuery.isPending) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        Loading tour…
      </p>
    )
  }

  if (isEdit && tourQuery.isError) {
    return (
      <div className="space-y-4 py-10 text-center">
        <p className="text-sm text-destructive">Failed to load tour.</p>
        <Button type="button" variant="outline" onClick={goBack}>
          Back to list
        </Button>
      </div>
    )
  }

  return (
    <div>
      <nav className="mb-2 flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
        <Link to="/tours" className="hover:text-foreground">
          Tours
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="font-medium text-foreground">{pageTitle}</span>
      </nav>

      <PagePlaceholder
        title={pageTitle}
        actions={
          <>
            <span className="hidden text-xs font-medium text-muted-foreground xl:inline">
              {savedTour
                ? `Last saved today, ${savedAt ?? "just now"}`
                : "Not yet saved"}
            </span>
            <Badge
              variant="outline"
              className={cn(
                "border-transparent font-bold",
                savedTour
                  ? savedTour.status === "PUBLISHED"
                    ? "bg-emerald-100 text-emerald-800"
                    : savedTour.status === "SCHEDULED"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-muted text-muted-foreground"
                  : "bg-amber-100 text-amber-800"
              )}
            >
              {savedTour
                ? statusLabel(savedTour.status, savedTour.statusLabel)
                : "Unsaved draft"}
            </Badge>
            <Button type="button" variant="outline" onClick={goBack}>
              {tourCreated ? "Done" : "Cancel"}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={() => handleSave("DRAFT")}
            >
              {saving && form.status === "DRAFT" ? "Saving..." : "Save Draft"}
            </Button>
            <Button
              type="button"
              disabled={saving}
              onClick={() =>
                handleSave(tourCreated ? form.status || publishStatus : publishStatus)
              }
            >
              {saving && form.status !== "DRAFT"
                ? tourCreated
                  ? "Updating..."
                  : "Publishing..."
                : primaryActionLabel}
            </Button>
          </>
        }
      />

      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          if (typeof value !== "string") return
          openTab(value)
        }}
        className="gap-4"
      >
        <TabsList
          variant="line"
          className="h-auto w-full flex-wrap justify-start border-b border-border"
        >
          {TOUR_TABS.map((tab) => (
            <TabsTrigger
              key={tab.key}
              value={tab.key}
              disabled={"postCreate" in tab && tab.postCreate && !tourCreated}
              title={
                "postCreate" in tab && tab.postCreate && !tourCreated
                  ? "Create the tour first to unlock this tab"
                  : undefined
              }
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {activeTab === "general" ? (
          <TabsContent value="general">
            <GeneralPublishingTab
              form={form}
              onChange={updateForm}
              primaryCategories={primaryCategories}
              secondaryCategories={secondaryCategories}
              cancellationPolicies={cancellationPolicies}
            />
          </TabsContent>
        ) : null}
        {activeTab === "experience" ? (
          <TabsContent value="experience">
            <ExperienceLogisticsTab
              form={form}
              onChange={updateForm}
              tourCreated={tourCreated}
              onOpenTab={openTab}
            />
          </TabsContent>
        ) : null}
        {activeTab === "timeslots" ? (
          <TabsContent value="timeslots">
            <TimeslotsPackagesTab
              form={form}
              onChange={updateForm}
              createdTour={savedTour}
            />
          </TabsContent>
        ) : null}
        {activeTab === "booking" ? (
          <TabsContent value="booking">
            <BookingCapacityTab
              form={form}
              onChange={updateForm}
              onOpenAvailability={() => openTab("availability")}
            />
          </TabsContent>
        ) : null}
        {activeTab === "addons" ? (
          <TabsContent value="addons">
            <AddonsTab form={form} onChange={updateForm} />
          </TabsContent>
        ) : null}
        {activeTab === "media" ? (
          <TabsContent value="media">
            <MediaBadgesSeoTab form={form} onChange={updateForm} />
          </TabsContent>
        ) : null}
        {activeTab === "availability" && savedTour ? (
          <TabsContent value="availability">
            <AvailabilityTab createdTour={savedTour} />
          </TabsContent>
        ) : null}
        {activeTab === "promotions" && savedTour ? (
          <TabsContent value="promotions">
            <PromotionsTab createdTour={savedTour} />
          </TabsContent>
        ) : null}
      </Tabs>
    </div>
  )
}

export default CreateTourFeature
