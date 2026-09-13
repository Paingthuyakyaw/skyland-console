import { slugify } from "@/features/tours/components/utils"
import type {
  AddonRequest,
  BookingMode,
  TimeslotRequest,
  TourDifficulty,
  TourRequest,
  TourStatus,
} from "@/store/server/tours/typed"

export type GalleryImage = {
  mediaAssetId: string
  url: string
  featured: boolean
}

export type TimeslotDraft = TimeslotRequest & { key: string }

export type AddonDraft = AddonRequest & { key: string }

export type TourFormState = {
  title: string
  slug: string
  slugTouched: boolean
  shortDescription: string
  longDescription: string
  primaryCategoryId: string
  secondaryCategoryId: string
  duration: string
  videoUrl: string
  cancellationPolicyId: string
  status: TourStatus
  scheduledPublishAt: string
  minimumAge: string
  meetingPoint: string
  difficulty: TourDifficulty
  adultPrice: string
  discountPrice: string
  minGuestsToOperate: string
  overbookingAllowance: string
  bookingCutOffHours: string
  sameDayBookingAllowed: boolean
  payOnArrivalConfirmationDeadline: string
  bookingMode: BookingMode
  instantConfirmation: boolean
  minGuestsPerBooking: string
  maxGuestsPerBooking: string
  languagesOffered: string[]
  pickupZones: string[]
  inclusions: string[]
  exclusions: string[]
  whatToBring: string[]
  timeslots: TimeslotDraft[]
  images: GalleryImage[]
  isAttraction: boolean
  isHot: boolean
  hotelPickupIncluded: boolean
  addons: AddonDraft[]
  childPrice: string
  infantPrice: string
  seniorPrice: string
  privateTourPrice: string
  groupPrice4: string
  groupPrice10: string
  groupPrice20: string
}

function nextKey() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function createEmptyTimeslot(): TimeslotDraft {
  return {
    key: nextKey(),
    name: "Morning",
    startTime: "08:00",
    endTime: "12:00",
    packages: [],
  }
}

export function createEmptyAddon(): AddonDraft {
  return {
    key: nextKey(),
    name: "",
    desc: "",
    pricePerPerson: 0,
    maxCap: 1,
  }
}

export function createInitialTourForm(): TourFormState {
  return {
    title: "",
    slug: "",
    slugTouched: false,
    shortDescription: "",
    longDescription: "",
    primaryCategoryId: "",
    secondaryCategoryId: "",
    duration: "4",
    videoUrl: "",
    cancellationPolicyId: "",
    status: "DRAFT",
    scheduledPublishAt: "",
    minimumAge: "0",
    meetingPoint: "",
    difficulty: "EASY",
    adultPrice: "0",
    discountPrice: "",
    minGuestsToOperate: "4",
    overbookingAllowance: "0",
    bookingCutOffHours: "4",
    sameDayBookingAllowed: false,
    payOnArrivalConfirmationDeadline: "2",
    bookingMode: "SHARED",
    instantConfirmation: true,
    minGuestsPerBooking: "1",
    maxGuestsPerBooking: "20",
    languagesOffered: ["English"],
    pickupZones: [],
    inclusions: [""],
    exclusions: [""],
    whatToBring: [""],
    timeslots: [createEmptyTimeslot()],
    images: [],
    isAttraction: false,
    isHot: false,
    hotelPickupIncluded: false,
    addons: [],
    childPrice: "0",
    infantPrice: "0",
    seniorPrice: "0",
    privateTourPrice: "0",
    groupPrice4: "0",
    groupPrice10: "0",
    groupPrice20: "0",
  }
}

function toNumber(value: string, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function cleanList(values: string[]) {
  return values.map((value) => value.trim()).filter(Boolean)
}

export function applyTitleChange(form: TourFormState, title: string) {
  return {
    ...form,
    title,
    slug: form.slugTouched ? form.slug : slugify(title),
  }
}

export function validateTourForm(form: TourFormState) {
  const errors: string[] = []

  if (!form.title.trim()) errors.push("Tour title is required")
  if (!form.slug.trim()) errors.push("URL slug is required")
  if (!form.shortDescription.trim()) errors.push("Short description is required")
  if (!form.longDescription.trim()) errors.push("Long description is required")
  if (!form.primaryCategoryId) errors.push("Primary category is required")
  if (!form.cancellationPolicyId) errors.push("Cancellation policy is required")
  if (!form.meetingPoint.trim()) errors.push("Meeting point is required")
  if (toNumber(form.duration, 0) < 1) errors.push("Duration must be at least 1 hour")
  if (form.images.length === 0) errors.push("Upload at least one gallery image")
  if (!form.images.some((image) => image.featured)) {
    errors.push("Set a featured gallery image")
  }

  const validTimeslots = form.timeslots.filter(
    (slot) => slot.name.trim() && slot.startTime && slot.endTime
  )
  if (validTimeslots.length === 0) {
    errors.push("Add at least one timeslot")
  }

  return errors
}

export function buildTourRequest(form: TourFormState): TourRequest {
  const adultPrice = toNumber(form.adultPrice)
  const featuredPackage = {
    name: "Standard",
    vehicleType: form.bookingMode === "PRIVATE" ? "Private" : "Shared",
    description: form.shortDescription.trim() || "Standard package",
    adultPrice,
    childPrice: toNumber(form.childPrice),
    infantPrice: toNumber(form.infantPrice),
    seniorPrice: toNumber(form.seniorPrice),
    privateTourPrice: toNumber(form.privateTourPrice),
    featured: true,
    groupPriceTiers: [
      { minPax: 4, pricePerPax: toNumber(form.groupPrice4, adultPrice) },
      { minPax: 10, pricePerPax: toNumber(form.groupPrice10, adultPrice) },
      { minPax: 20, pricePerPax: toNumber(form.groupPrice20, adultPrice) },
    ],
    checklist: [],
  }

  const timeslots = form.timeslots
    .filter((slot) => slot.name.trim() && slot.startTime && slot.endTime)
    .map((slot) => ({
      name: slot.name.trim(),
      startTime: slot.startTime,
      endTime: slot.endTime,
      packages: [featuredPackage],
    }))

  const request: TourRequest = {
    title: form.title.trim(),
    slug: form.slug.trim(),
    shortDescription: form.shortDescription.trim(),
    longDescription: form.longDescription.trim(),
    primaryCategoryId: form.primaryCategoryId,
    duration: Math.max(1, toNumber(form.duration, 1)),
    cancellationPolicyId: form.cancellationPolicyId,
    status: form.status,
    minimumAge: Math.max(0, toNumber(form.minimumAge)),
    meetingPoint: form.meetingPoint.trim(),
    difficulty: form.difficulty,
    adultPrice,
    capacity: {
      minGuestsToOperate: Math.max(1, toNumber(form.minGuestsToOperate, 1)),
      overbookingAllowance: Math.max(0, toNumber(form.overbookingAllowance)),
      bookingCutOffHours: Math.max(0, toNumber(form.bookingCutOffHours)),
      sameDayBookingAllowed: form.sameDayBookingAllowed,
      payOnArrivalConfirmationDeadline: Math.max(
        0,
        toNumber(form.payOnArrivalConfirmationDeadline)
      ),
    },
    settings: {
      bookingMode: form.bookingMode,
      instantConfirmation: form.instantConfirmation,
      minGuestsPerBooking: Math.max(1, toNumber(form.minGuestsPerBooking, 1)),
      maxGuestsPerBooking: Math.max(1, toNumber(form.maxGuestsPerBooking, 1)),
    },
    languagesOffered: cleanList(form.languagesOffered),
    pickupZones: cleanList(form.pickupZones),
    inclusions: cleanList(form.inclusions),
    exclusions: cleanList(form.exclusions),
    whatToBring: cleanList(form.whatToBring),
    timeslots,
    images: form.images.map((image) => ({
      mediaAssetId: image.mediaAssetId,
      featured: image.featured,
    })),
    isAttraction: form.isAttraction,
    isHot: form.isHot,
    hotelPickupIncluded: form.hotelPickupIncluded,
    badges: [],
  }

  if (form.secondaryCategoryId) {
    request.secondaryCategoryId = form.secondaryCategoryId
  }
  if (form.videoUrl.trim()) {
    request.videoUrl = form.videoUrl.trim()
  }
  if (form.status === "SCHEDULED" && form.scheduledPublishAt) {
    request.scheduledPublishAt = new Date(form.scheduledPublishAt).toISOString()
  }
  if (form.discountPrice.trim()) {
    request.discountPrice = toNumber(form.discountPrice)
  }

  const addons = form.addons
    .filter((addon) => addon.name.trim())
    .map((addon) => ({
      name: addon.name.trim(),
      desc: addon.desc.trim(),
      pricePerPerson: toNumber(String(addon.pricePerPerson)),
      maxCap: Math.max(1, toNumber(String(addon.maxCap), 1)),
    }))
  if (addons.length > 0) {
    request.addons = addons
  }

  if (request.languagesOffered.length === 0) {
    request.languagesOffered = ["English"]
  }

  return request
}
