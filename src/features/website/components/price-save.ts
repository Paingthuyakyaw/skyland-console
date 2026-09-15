import {
  buildComboTourRequest,
  formFromDetail as comboFormFromDetail,
} from "@/features/combo-tours/create/combo-form"
import {
  buildHolidayPackageRequest,
  formFromDetail as holidayFormFromDetail,
} from "@/features/holiday-packages/create/holiday-form"
import { buildAddonRequest } from "@/features/tours/create/tour-form"
import { queryClient } from "@/lib/query-client"
import { getComboTour, updateComboTour } from "@/store/server/combo/tours"
import {
  getHolidayPackage,
  updateHolidayPackage,
} from "@/store/server/holiday/packages"
import { getTour, updateTour } from "@/store/server/tours/tours"
import type {
  TextItemResponse,
  TourRequest,
  TourResponse,
} from "@/store/server/tours/typed"

export type PriceProductType = "Tour" | "Combo" | "Package"

export type PriceDraft = {
  type: PriceProductType
  productId: string
  price: number
  sale?: number
}

function textValues(items?: TextItemResponse[]) {
  return items?.map((item) => item.value.trim()).filter(Boolean) ?? []
}

function tourToRequest(
  detail: TourResponse,
  adultPrice: number,
  discountPrice?: number
): TourRequest {
  const request: TourRequest = {
    title: detail.title,
    slug: detail.slug,
    shortDescription: detail.shortDescription ?? "",
    longDescription: detail.longDescription ?? "",
    primaryCategoryId: detail.primaryCategory?.id ?? "",
    duration: Math.max(1, detail.duration ?? 1),
    cancellationPolicyId: detail.cancellationPolicy?.id ?? "",
    status: detail.status,
    minimumAge: detail.minimumAge ?? 0,
    meetingPoint: detail.meetingPoint ?? "",
    difficulty: detail.difficulty ?? "EASY",
    adultPrice,
    capacity: {
      minGuestsToOperate: detail.capacity?.minGuestsToOperate ?? 1,
      overbookingAllowance: detail.capacity?.overbookingAllowance ?? 0,
      bookingCutOffHours: detail.capacity?.bookingCutOffHours ?? 0,
      sameDayBookingAllowed: detail.capacity?.sameDayBookingAllowed ?? false,
      payOnArrivalConfirmationDeadline:
        detail.capacity?.payOnArrivalConfirmationDeadline ?? 0,
    },
    settings: {
      bookingMode: detail.settings?.bookingMode ?? "SHARED",
      instantConfirmation: detail.settings?.instantConfirmation ?? true,
      minGuestsPerBooking: detail.settings?.minGuestsPerBooking ?? 1,
      maxGuestsPerBooking: detail.settings?.maxGuestsPerBooking ?? 20,
    },
    languagesOffered: textValues(detail.languagesOffered),
    pickupZones: textValues(detail.pickupZones),
    inclusions: textValues(detail.inclusions),
    exclusions: textValues(detail.exclusions),
    whatToBring: textValues(detail.whatToBring),
    timeslots: (detail.timeslots ?? []).map((slot) => ({
      name: slot.name,
      startTime: slot.startTime,
      endTime: slot.endTime,
      packages: (slot.packages ?? []).map((pkg) => ({
        name: pkg.name,
        vehicleType: pkg.vehicleType,
        description: pkg.description,
        adultPrice: pkg.featured ? adultPrice : pkg.adultPrice,
        childPrice: pkg.childPrice,
        infantPrice: pkg.infantPrice,
        seniorPrice: pkg.seniorPrice,
        privateTourPrice: pkg.privateTourPrice,
        featured: pkg.featured,
        groupPriceTiers: pkg.groupPriceTiers ?? [],
        checklist: pkg.checklist ?? [],
      })),
    })),
    images: (detail.images ?? [])
      .filter((image) => Boolean(image.mediaAssetId))
      .map((image) => ({
        mediaAssetId: image.mediaAssetId,
        featured: image.featured,
      })),
    isAttraction: detail.isAttraction ?? false,
    isHot: detail.isHot ?? false,
    hotelPickupIncluded: detail.hotelPickupIncluded ?? false,
    badges: (detail.badges ?? []).map((badge) => ({
      logoUrl: badge.logoUrl ?? "",
      title: badge.title,
      shortInfo: badge.shortInfo ?? "",
    })),
  }

  if (detail.secondaryCategory?.id) {
    request.secondaryCategoryId = detail.secondaryCategory.id
  }
  if (detail.videoUrl) request.videoUrl = detail.videoUrl
  if (detail.scheduledPublishAt) {
    request.scheduledPublishAt = detail.scheduledPublishAt
  }
  if (typeof discountPrice === "number") {
    request.discountPrice = discountPrice
  }
  if (detail.addons?.length) {
    request.addons = detail.addons.map((addon) => buildAddonRequest(addon))
  }
  if (request.languagesOffered.length === 0) {
    request.languagesOffered = ["English"]
  }

  return request
}

async function saveTourPrice(draft: PriceDraft) {
  const detail = await getTour(draft.productId)
  await updateTour({
    id: detail.id,
    version: detail.version ?? 0,
    tour: tourToRequest(detail, draft.price, draft.sale),
  })
}

async function saveComboPrice(draft: PriceDraft) {
  const detail = await getComboTour(draft.productId)
  const form = comboFormFromDetail(detail)
  form.comboPrice = String(draft.price)
  form.discountPrice = typeof draft.sale === "number" ? String(draft.sale) : ""
  const comboTour = buildComboTourRequest(form)
  await updateComboTour({
    id: detail.id,
    version: form.version,
    comboTour: {
      ...comboTour,
      isAttraction: detail.isAttraction ?? false,
      isHot: detail.isHot ?? false,
      badges: (detail.badges ?? []).map((badge) => ({
        logoUrl: badge.logoUrl ?? "",
        title: badge.title,
        shortInfo: badge.shortInfo ?? "",
      })),
    },
  })
}

async function savePackagePrice(draft: PriceDraft) {
  const detail = await getHolidayPackage(draft.productId)
  const form = holidayFormFromDetail(detail)
  form.fromPrice = String(draft.price)
  const holidayPackage = buildHolidayPackageRequest(form)
  await updateHolidayPackage({
    id: detail.id,
    version: form.version,
    holidayPackage: {
      ...holidayPackage,
      ...(typeof draft.sale === "number" ? { discountPrice: draft.sale } : {}),
    } as typeof holidayPackage & { discountPrice?: number },
  })
}

export async function savePriceDrafts(drafts: PriceDraft[]) {
  for (const draft of drafts) {
    if (draft.type === "Tour") await saveTourPrice(draft)
    else if (draft.type === "Combo") await saveComboPrice(draft)
    else await savePackagePrice(draft)
  }

  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ["tours"] }),
    queryClient.invalidateQueries({ queryKey: ["combo-tours"] }),
    queryClient.invalidateQueries({ queryKey: ["holiday-packages"] }),
  ])
}
