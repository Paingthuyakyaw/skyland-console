import { isEmptyHtml } from "@/components/rich-text-editor"
import { slugify } from "@/features/tours/components/utils"
import type {
  AddonRequest,
  AddonResponse,
  BadgeRequest,
  BookingMode,
  TextItemResponse,
  TimeslotPackageRequest,
  TimeslotRequest,
  TourDifficulty,
  TourRequest,
  TourResponse,
  TourStatus,
} from "@/store/server/tours/typed"

export type GalleryImage = {
  mediaAssetId: string
  url: string
  featured: boolean
}

export type PackageDraft = TimeslotPackageRequest & { key: string }

export type TimeslotDraft = Omit<TimeslotRequest, "packages"> & {
  key: string
  packages: PackageDraft[]
}

export type BadgeDraft = BadgeRequest & { key: string }

export type AddonDraft = AddonRequest & {
  key: string
  pricePerPerson: number
  maxCap: number
}

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
  badges: BadgeDraft[]
  metaTitle: string
  metaDescription: string
  version: number
}

function nextKey() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function createEmptyPackage(featured = false): PackageDraft {
  return {
    key: nextKey(),
    name: "Standard",
    vehicleType: "Shared 4x4",
    description: "",
    adultPrice: 0,
    childPrice: 0,
    infantPrice: 0,
    seniorPrice: 0,
    privateTourPrice: 0,
    featured,
    groupPriceTiers: [{ minPax: 4, pricePerPax: 0 }],
    checklist: [""],
  }
}

export function createEmptyTimeslot(): TimeslotDraft {
  return {
    key: nextKey(),
    name: "Morning",
    startTime: "08:00",
    endTime: "12:00",
    packages: [createEmptyPackage(true)],
  }
}

export function createEmptyBadge(): BadgeDraft {
  return {
    key: nextKey(),
    logoUrl: "",
    title: "",
    shortInfo: "",
  }
}

export function createEmptyAddon(): AddonDraft {
  return {
    key: nextKey(),
    name: "",
    desc: "",
    unitAmount: 0,
    status: "ACTIVE",
    pricingBasis: "PER_GUEST",
    currency: "AED",
    minQuantity: 1,
    maxQuantity: 1,
    maxCap: 1,
    pricePerPerson: 0,
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
    badges: [],
    metaTitle: "",
    metaDescription: "",
    version: 0,
  }
}

function toNumber(value: string, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function cleanList(values: string[]) {
  return values.map((value) => value.trim()).filter(Boolean)
}

function addonCodeFromName(name: string) {
  const code = slugify(name)
    .replace(/^category-/, "addon-")
    .slice(0, 80)
    .replace(/-+$/g, "")

  return code || `addon-${Date.now()}`
}

export function buildAddonRequest(
  addon: Partial<AddonRequest> & Partial<AddonResponse> & { key?: string }
): AddonRequest {
  const name = (addon.name ?? addon.title ?? "").trim()
  const desc = (addon.desc ?? addon.description ?? "").trim()
  const unitAmount = toNumber(String(addon.unitAmount ?? addon.pricePerPerson ?? 0))
  const maxCap = Math.max(0, toNumber(String(addon.maxCap ?? 0)))
  const maxQuantity = Math.max(
    1,
    toNumber(String(addon.maxQuantity ?? maxCap), 1)
  )
  const request: AddonRequest = {
    name,
    desc,
    unitAmount,
    status: addon.status ?? "ACTIVE",
    pricingBasis: addon.pricingBasis ?? "PER_GUEST",
    currency: addon.currency ?? "AED",
    minQuantity: Math.max(1, toNumber(String(addon.minQuantity ?? 1), 1)),
    maxQuantity,
    maxCap,
    pricePerPerson: toNumber(String(addon.pricePerPerson ?? unitAmount)),
  }

  const id = addon.id ?? addon.addonId
  if (id) request.id = id

  const code = (addon.code?.trim() || addonCodeFromName(name)).slice(0, 80)
  if (code) request.code = code

  return request
}

export function applyTitleChange(form: TourFormState, title: string) {
  return {
    ...form,
    title,
    slug: form.slugTouched ? form.slug : slugify(title),
  }
}

function textValues(items?: Array<TextItemResponse | string>) {
  return (
    items
      ?.map((item) => (typeof item === "string" ? item : item.value).trim())
      .filter(Boolean) ?? []
  )
}

function toDatetimeLocal(value?: string) {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function formFromDetail(detail: TourResponse): TourFormState {
  const images = [...(detail.images ?? [])].sort(
    (left, right) => (left.sortOrder ?? 0) - (right.sortOrder ?? 0)
  )
  const timeslots = [...(detail.timeslots ?? [])].sort(
    (left, right) => (left.sortOrder ?? 0) - (right.sortOrder ?? 0)
  )
  const languages = textValues(detail.languagesOffered)
  const inclusions = textValues(detail.inclusions)
  const exclusions = textValues(detail.exclusions)
  const whatToBring = textValues(detail.whatToBring)

  return {
    title: detail.title,
    slug: detail.slug,
    slugTouched: true,
    shortDescription: detail.shortDescription ?? "",
    longDescription: detail.longDescription ?? "",
    primaryCategoryId: detail.primaryCategory?.id ?? "",
    secondaryCategoryId: detail.secondaryCategory?.id ?? "",
    duration: String(detail.duration ?? 4),
    videoUrl: detail.videoUrl ?? "",
    cancellationPolicyId: detail.cancellationPolicy?.id ?? "",
    status: detail.status,
    scheduledPublishAt: toDatetimeLocal(detail.scheduledPublishAt),
    minimumAge: String(detail.minimumAge ?? 0),
    meetingPoint: detail.meetingPoint ?? "",
    difficulty: detail.difficulty ?? "EASY",
    adultPrice: String(detail.adultPrice ?? 0),
    discountPrice:
      detail.discountPrice == null ? "" : String(detail.discountPrice),
    minGuestsToOperate: String(detail.capacity?.minGuestsToOperate ?? 4),
    overbookingAllowance: String(detail.capacity?.overbookingAllowance ?? 0),
    bookingCutOffHours: String(detail.capacity?.bookingCutOffHours ?? 4),
    sameDayBookingAllowed: detail.capacity?.sameDayBookingAllowed ?? false,
    payOnArrivalConfirmationDeadline: String(
      detail.capacity?.payOnArrivalConfirmationDeadline ?? 2
    ),
    bookingMode: detail.settings?.bookingMode ?? "SHARED",
    instantConfirmation: detail.settings?.instantConfirmation ?? true,
    minGuestsPerBooking: String(detail.settings?.minGuestsPerBooking ?? 1),
    maxGuestsPerBooking: String(detail.settings?.maxGuestsPerBooking ?? 20),
    languagesOffered: languages.length > 0 ? languages : ["English"],
    pickupZones: textValues(detail.pickupZones),
    inclusions: inclusions.length > 0 ? inclusions : [""],
    exclusions: exclusions.length > 0 ? exclusions : [""],
    whatToBring: whatToBring.length > 0 ? whatToBring : [""],
    timeslots:
      timeslots.length > 0
        ? timeslots.map((slot) => ({
            key: slot.id,
            name: slot.name,
            startTime: slot.startTime,
            endTime: slot.endTime,
            packages:
              (slot.packages ?? []).length > 0
                ? (slot.packages ?? []).map((pkg) => ({
                    key: pkg.id,
                    name: pkg.name,
                    vehicleType: pkg.vehicleType,
                    description: pkg.description,
                    adultPrice: pkg.adultPrice,
                    childPrice: pkg.childPrice ?? 0,
                    infantPrice: pkg.infantPrice ?? 0,
                    seniorPrice: pkg.seniorPrice ?? 0,
                    privateTourPrice: pkg.privateTourPrice ?? 0,
                    featured: pkg.featured,
                    groupPriceTiers:
                      pkg.groupPriceTiers?.length > 0
                        ? pkg.groupPriceTiers
                        : [{ minPax: 4, pricePerPax: pkg.adultPrice }],
                    checklist:
                      pkg.checklist?.length > 0 ? pkg.checklist : [""],
                  }))
                : [createEmptyPackage(true)],
          }))
        : [createEmptyTimeslot()],
    images: images.map((image) => ({
      mediaAssetId: image.mediaAssetId,
      url: image.url ?? "",
      featured: image.featured,
    })),
    isAttraction: detail.isAttraction ?? false,
    isHot: detail.isHot ?? false,
    hotelPickupIncluded: detail.hotelPickupIncluded ?? false,
    addons: (detail.addons ?? []).map((addon) => {
      const request = buildAddonRequest(addon)
      return {
        ...request,
        key: addon.id ?? addon.addonId ?? nextKey(),
        pricePerPerson: request.pricePerPerson ?? request.unitAmount,
        maxCap: request.maxCap ?? request.maxQuantity,
      }
    }),
    badges: (detail.badges ?? []).map((badge) => ({
      key: nextKey(),
      logoUrl: badge.logoUrl ?? "",
      title: badge.title,
      shortInfo: badge.shortInfo ?? "",
    })),
    metaTitle: detail.seo?.metaTitle ?? "",
    metaDescription: detail.seo?.metaDescription ?? "",
    version: detail.version ?? 0,
  }
}

export function validateTourForm(form: TourFormState) {
  const errors: string[] = []

  if (!form.title.trim()) errors.push("Tour title is required")
  if (!form.slug.trim()) errors.push("URL slug is required")
  if (!form.shortDescription.trim()) errors.push("Short description is required")
  if (isEmptyHtml(form.longDescription)) {
    errors.push("Long description is required")
  }
  if (!form.primaryCategoryId) errors.push("Primary category is required")
  if (!form.cancellationPolicyId) errors.push("Cancellation policy is required")
  if (!form.meetingPoint.trim()) errors.push("Meeting point is required")
  if (toNumber(form.duration, 0) < 1) errors.push("Duration must be at least 1 hour")
  if (form.discountPrice.trim() && toNumber(form.discountPrice) < 0) {
    errors.push("Discount price cannot be negative")
  }
  if (form.images.length === 0) errors.push("Upload at least one gallery image")
  if (!form.images.some((image) => image.featured)) {
    errors.push("Set a featured gallery image")
  }

  const validTimeslots = form.timeslots.filter((slot) => {
    const hasIdentity = slot.name.trim() && slot.startTime && slot.endTime
    const hasPackage = slot.packages.some((pkg) => pkg.name.trim())
    return hasIdentity && hasPackage
  })
  if (validTimeslots.length === 0) {
    errors.push("Add at least one timeslot with a package")
  }

  return errors
}

function buildPackageRequest(
  pkg: PackageDraft,
  fallbackDescription: string
): TimeslotPackageRequest {
  const adultPrice = Math.max(0, toNumber(String(pkg.adultPrice)))
  const tiers = pkg.groupPriceTiers
    .filter((tier) => tier.minPax > 0)
    .map((tier) => ({
      minPax: Math.max(1, toNumber(String(tier.minPax), 1)),
      pricePerPax: Math.max(0, toNumber(String(tier.pricePerPax), adultPrice)),
    }))
    .sort((left, right) => left.minPax - right.minPax)

  return {
    name: pkg.name.trim(),
    vehicleType: pkg.vehicleType.trim() || "Shared",
    description:
      pkg.description.trim() || fallbackDescription || "Standard package",
    adultPrice,
    childPrice: Math.max(0, toNumber(String(pkg.childPrice))),
    infantPrice: Math.max(0, toNumber(String(pkg.infantPrice))),
    seniorPrice: Math.max(0, toNumber(String(pkg.seniorPrice))),
    privateTourPrice: Math.max(0, toNumber(String(pkg.privateTourPrice))),
    featured: pkg.featured,
    groupPriceTiers: tiers,
    checklist: cleanList(pkg.checklist),
  }
}

export function buildTourRequest(form: TourFormState): TourRequest {
  const fallbackDescription = form.shortDescription.trim()
  const timeslots = form.timeslots
    .filter((slot) => slot.name.trim() && slot.startTime && slot.endTime)
    .map((slot) => {
      const packages = slot.packages
        .filter((pkg) => pkg.name.trim())
        .map((pkg) => buildPackageRequest(pkg, fallbackDescription))
      if (packages.length > 0 && !packages.some((pkg) => pkg.featured)) {
        packages[0].featured = true
      }
      return {
        name: slot.name.trim(),
        startTime: slot.startTime,
        endTime: slot.endTime,
        packages,
      }
    })
    .filter((slot) => slot.packages.length > 0)

  const catalogAdult = toNumber(form.adultPrice)
  const featuredAdult =
    timeslots
      .flatMap((slot) => slot.packages)
      .find((pkg) => pkg.featured)?.adultPrice ?? 0
  const adultPrice = catalogAdult > 0 ? catalogAdult : featuredAdult

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
    badges: form.badges
      .filter((badge) => badge.title.trim())
      .map((badge) => ({
        logoUrl: badge.logoUrl.trim(),
        title: badge.title.trim(),
        shortInfo: badge.shortInfo.trim(),
      })),
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

  const metaTitle = form.metaTitle.trim() || form.title.trim()
  const metaDescription =
    form.metaDescription.trim() || form.shortDescription.trim()
  if (metaTitle || metaDescription) {
    request.seo = {
      metaTitle: metaTitle || undefined,
      metaDescription: metaDescription || undefined,
    }
  }

  const addons = form.addons
    .filter((addon) => addon.name.trim())
    .map((addon) =>
      buildAddonRequest({
        ...addon,
        unitAmount: toNumber(String(addon.pricePerPerson)),
        maxQuantity: Math.max(1, toNumber(String(addon.maxCap), 1)),
        maxCap: Math.max(0, toNumber(String(addon.maxCap))),
      })
    )
  if (addons.length > 0) {
    request.addons = addons
  }

  if (request.languagesOffered.length === 0) {
    request.languagesOffered = ["English"]
  }

  return request
}
