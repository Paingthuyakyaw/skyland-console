import { Link, useNavigate } from "@tanstack/react-router"
import { ChevronRight } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

import { PagePlaceholder } from "@/components/page-placeholder"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TourChangeImpactDialog } from "@/features/tours/components/tour-change-impact-dialog"
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
  type PackageDraft,
  type TimeslotDraft,
  type TourFormState,
} from "@/features/tours/create/tour-form"
import { statusLabel } from "@/features/tours/components/utils"
import { cn } from "@/lib/utils"
import { apiErrorCode, apiErrorMessage } from "@/store/server/api-error"
import { getChangeImpact } from "@/store/server/tours/availability"
import { useCancellationPolicyOptions } from "@/store/server/tours/cancellation-policies"
import { useTourCategories } from "@/store/server/tours/categories"
import {
  useArchiveTimeslot,
  useArchiveTimeslotPackage,
  useCreateTour,
  useTour,
  useUpdateTour,
} from "@/store/server/tours/tours"
import type {
  CancellationPolicyOption,
  ChangeImpactResponse,
  TourCategory,
  TourResponse,
  TourStatus,
} from "@/store/server/tours/typed"

const EMPTY_CATEGORIES: TourCategory[] = []
const EMPTY_POLICIES: CancellationPolicyOption[] = []

type CreatePageState = {
  form: TourFormState
  activeTab: string
  createdTour?: TourResponse
  savedAt?: string
}

type CreateTourPageProps = {
  tourId?: string
}

type ArchiveTarget =
  | {
      kind: "timeslot"
      timeslotId: string
      label: string
    }
  | {
      kind: "package"
      timeslotId: string
      packageId: string
      label: string
    }

type ImpactDialogState =
  | {
      kind: "update"
      impact: ChangeImpactResponse | null
      form: TourFormState
      actionLabel: string
    }
  | {
      kind: "archive"
      impact: ChangeImpactResponse | null
      target: ArchiveTarget
      actionLabel: string
    }

function removeArchivedTarget(form: TourFormState, target: ArchiveTarget) {
  if (target.kind === "timeslot") {
    return {
      ...form,
      timeslots: form.timeslots.filter((slot) => slot.id !== target.timeslotId),
    }
  }

  return {
    ...form,
    timeslots: form.timeslots.map((slot) =>
      slot.id !== target.timeslotId
        ? slot
        : {
            ...slot,
            packages: slot.packages.filter(
              (timeslotPackage) => timeslotPackage.id !== target.packageId
            ),
          }
    ),
  }
}

function archiveActionLabel(target: ArchiveTarget) {
  return target.kind === "timeslot" ? "Archive timeslot" : "Archive package"
}

function archiveTitle(target: ArchiveTarget) {
  return target.kind === "timeslot" ? "Archive timeslot?" : "Archive package?"
}

function archiveDescription(target: ArchiveTarget) {
  return `“${target.label}” will no longer be available for future checkout. Existing booking and audit history will be retained.`
}

function archiveImpactUnavailableDescription(target: ArchiveTarget) {
  return `We could not calculate the reservation impact for “${target.label}”. You can still archive it, but review active holds and confirmed bookings separately.`
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
  const [showValidation, setShowValidation] = useState(false)
  const [checkingImpact, setCheckingImpact] = useState(false)
  const [impactDialog, setImpactDialog] = useState<ImpactDialogState | null>(
    null
  )
  const { form, activeTab, createdTour, savedAt } = page
  const tourQuery = useTour(tourId ?? "", isEdit)
  const createTour = useCreateTour()
  const updateTour = useUpdateTour()
  const archiveTimeslot = useArchiveTimeslot()
  const archiveTimeslotPackage = useArchiveTimeslotPackage()
  const { data: primaryData } = useTourCategories(true, {
    level: "PRIMARY",
  })
  const { data: secondaryData } = useTourCategories(
    Boolean(form.primaryCategoryId),
    {
      level: "SECONDARY",
      parentId: form.primaryCategoryId || undefined,
    }
  )
  const { data: policyData } = useCancellationPolicyOptions()
  const primaryCategories = primaryData ?? EMPTY_CATEGORIES
  const secondaryCategories = secondaryData ?? EMPTY_CATEGORIES
  const cancellationPolicies = policyData ?? EMPTY_POLICIES
  const savedTour = createdTour
  const tourCreated = Boolean(savedTour)
  const archiving =
    archiveTimeslot.isPending || archiveTimeslotPackage.isPending
  const saving =
    createTour.isPending || updateTour.isPending || archiving || checkingImpact
  const validationIssues = showValidation ? validateTourForm(form) : []

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
    setPage((current) =>
      current.form === nextForm ? current : { ...current, form: nextForm }
    )
  }, [])

  const goBack = () => {
    void navigate({ to: "/tours" })
  }

  const openTab = (tab: string) => {
    if (POST_CREATE_TABS.has(tab) && !savedTour) return
    setPage((current) =>
      current.activeTab === tab ? current : { ...current, activeTab: tab }
    )
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

  const applyArchivedTarget = (tour: TourResponse, target: ArchiveTarget) => {
    setPage((current) => {
      const nextForm = removeArchivedTarget(current.form, target)
      return {
        ...current,
        form: { ...nextForm, version: tour.version ?? nextForm.version },
        createdTour: tour,
        savedAt: lastSavedLabel(tour.updatedAt) || lastSavedLabel(),
      }
    })
  }

  const updateSavedTour = (nextForm: TourFormState) => {
    if (!savedTour) return

    updateTour.mutate(
      {
        id: savedTour.id,
        version: nextForm.version ?? savedTour.version ?? 0,
        tour: buildTourRequest(nextForm),
      },
      {
        onSuccess: (response) => {
          setImpactDialog(null)
          if (response.data) {
            applySavedTour(nextForm, response.data)
          }
        },
        onError: (error) => {
          if (
            apiErrorCode(error) === "tour.change_impact_requires_resolution"
          ) {
            void checkChangeImpact(nextForm)
            return
          }

          toast.error(apiErrorMessage(error, "Failed to update the tour"))
        },
      }
    )
  }

  const checkChangeImpact = async (
    nextForm: TourFormState,
    actionLabel = nextForm.status === "DRAFT"
      ? "Continue and save draft"
      : "Continue and update tour"
  ) => {
    if (!savedTour) return

    setCheckingImpact(true)
    try {
      const impact = await getChangeImpact(savedTour.id)
      setImpactDialog({
        kind: "update",
        impact,
        form: nextForm,
        actionLabel,
      })
    } catch (error) {
      toast.warning(
        apiErrorMessage(
          error,
          "Could not calculate the tour change impact. You can still continue after confirming."
        )
      )
      setImpactDialog({
        kind: "update",
        impact: null,
        form: nextForm,
        actionLabel,
      })
    } finally {
      setCheckingImpact(false)
    }
  }

  const confirmArchive = async (target: ArchiveTarget) => {
    if (!savedTour) return

    setCheckingImpact(true)
    try {
      const impact = await getChangeImpact(savedTour.id)
      setImpactDialog({
        kind: "archive",
        impact,
        target,
        actionLabel: archiveActionLabel(target),
      })
    } catch (error) {
      toast.warning(
        apiErrorMessage(
          error,
          "Could not calculate the tour change impact. You can still archive after confirming."
        )
      )
      setImpactDialog({
        kind: "archive",
        impact: null,
        target,
        actionLabel: archiveActionLabel(target),
      })
    } finally {
      setCheckingImpact(false)
    }
  }

  const archiveSavedTarget = (target: ArchiveTarget) => {
    if (!savedTour) return

    const version = form.version ?? savedTour.version ?? 0
    const onSuccess = (response: { data: TourResponse }) => {
      setImpactDialog(null)
      applyArchivedTarget(response.data, target)
    }

    if (target.kind === "timeslot") {
      archiveTimeslot.mutate(
        {
          tourId: savedTour.id,
          timeslotId: target.timeslotId,
          version,
        },
        { onSuccess }
      )
      return
    }

    archiveTimeslotPackage.mutate(
      {
        tourId: savedTour.id,
        timeslotId: target.timeslotId,
        packageId: target.packageId,
        version,
      },
      { onSuccess }
    )
  }

  const requestTimeslotArchive = (timeslot: TimeslotDraft) => {
    if (!timeslot.id) return
    void confirmArchive({
      kind: "timeslot",
      timeslotId: timeslot.id,
      label: timeslot.name.trim() || "this timeslot",
    })
  }

  const requestPackageArchive = (
    timeslot: TimeslotDraft,
    timeslotPackage: PackageDraft
  ) => {
    if (!timeslot.id || !timeslotPackage.id) return
    void confirmArchive({
      kind: "package",
      timeslotId: timeslot.id,
      packageId: timeslotPackage.id,
      label: timeslotPackage.name.trim() || "this package",
    })
  }

  const handleSave = (status: TourStatus) => {
    const nextForm = { ...form, status }
    const errors = validateTourForm(nextForm)
    if (errors.length > 0) {
      setShowValidation(true)
      toast.error("Complete the required fields before saving the tour")
      setPage((current) => ({
        ...current,
        form: nextForm,
        activeTab: errors[0].tab,
      }))
      return
    }

    setShowValidation(false)

    if (savedTour) {
      void checkChangeImpact(nextForm)
      return
    }

    const payload = buildTourRequest(nextForm)
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
                handleSave(
                  tourCreated ? form.status || publishStatus : publishStatus
                )
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

      {validationIssues.length > 0 ? (
        <div
          role="alert"
          className="mb-4 rounded-xl border border-destructive/30 bg-destructive/10 p-4"
        >
          <p className="font-bold text-destructive">
            Complete the required fields before saving this tour.
          </p>
          <p className="mt-1 text-sm text-destructive/90">
            Select an item to jump to the relevant section.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {validationIssues.map((issue) => (
              <button
                key={`${issue.tab}-${issue.message}`}
                type="button"
                className="rounded-md border border-destructive/30 bg-background px-2.5 py-1.5 text-left text-xs font-medium text-destructive hover:bg-destructive/10"
                onClick={() => openTab(issue.tab)}
              >
                <span className="font-bold">{issue.message}</span>
                <span className="ml-1.5 text-destructive/70">
                  ({TOUR_TABS.find((tab) => tab.key === issue.tab)?.label})
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <Tabs
        value={activeTab}
        onValueChange={(value) => {
          if (typeof value !== "string") return
          if (value === activeTab) return
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
              onArchiveTimeslot={requestTimeslotArchive}
              onArchivePackage={requestPackageArchive}
              archivePending={checkingImpact || archiving}
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

      <TourChangeImpactDialog
        open={impactDialog !== null}
        onOpenChange={(open) => {
          if (!open && !updateTour.isPending && !archiving) {
            setImpactDialog(null)
          }
        }}
        impact={impactDialog?.impact ?? null}
        applying={
          impactDialog?.kind === "archive" ? archiving : updateTour.isPending
        }
        actionLabel={impactDialog?.actionLabel ?? "Update tour"}
        onApply={() => {
          if (!impactDialog) return
          if (impactDialog.kind === "archive") {
            archiveSavedTarget(impactDialog.target)
            return
          }
          updateSavedTour(impactDialog.form)
        }}
        title={
          impactDialog?.kind === "archive"
            ? archiveTitle(impactDialog.target)
            : undefined
        }
        description={
          impactDialog?.kind === "archive"
            ? archiveDescription(impactDialog.target)
            : undefined
        }
        applyingLabel={
          impactDialog?.kind === "archive" ? "Archiving…" : undefined
        }
        impactUnavailableDescription={
          impactDialog?.kind === "archive"
            ? archiveImpactUnavailableDescription(impactDialog.target)
            : undefined
        }
      />
    </div>
  )
}

export default CreateTourFeature
