import { slugify } from "@/features/tours/components/utils"
import type {
  HolidayPackageDifficulty,
  HolidayPackageHotelTier,
  HolidayPackageRequest,
  HolidayPackageStatus,
} from "@/store/server/holiday/typed"

export type GalleryImage = {
  mediaAssetId: string
  url: string
}

export type ItineraryDraft = {
  description: string
}

export type HolidayPackageFormState = {
  title: string
  slug: string
  slugTouched: boolean
  shortDescription: string
  longDescription: string
  categoryId: string
  fromPrice: string
  status: HolidayPackageStatus
  cancellationPolicyId: string
  images: GalleryImage[]
  duration: string
  minimumAge: string
  difficulty: HolidayPackageDifficulty
  languages: string
  hotelTier: HolidayPackageHotelTier
  airportTransferIncluded: boolean
  inclusions: string[]
  exclusions: string[]
  whatToBring: string[]
  itinerary: ItineraryDraft[]
}

export function createInitialHolidayForm(): HolidayPackageFormState {
  return {
    title: "",
    slug: "",
    slugTouched: false,
    shortDescription: "",
    longDescription: "",
    categoryId: "",
    fromPrice: "",
    status: "ACTIVE",
    cancellationPolicyId: "",
    images: [],
    duration: "",
    minimumAge: "0",
    difficulty: "EASY",
    languages: "English",
    hotelTier: "FOUR_STAR",
    airportTransferIncluded: false,
    inclusions: [],
    exclusions: [],
    whatToBring: [],
    itinerary: [],
  }
}

function toNumber(value: string, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function cleanList(values: string[]) {
  return values.map((value) => value.trim()).filter(Boolean)
}

function splitLanguages(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
}

export function applyTitleChange(
  form: HolidayPackageFormState,
  title: string
): HolidayPackageFormState {
  return {
    ...form,
    title,
    slug: form.slugTouched ? form.slug : slugify(title),
  }
}

export function validateHolidayForm(form: HolidayPackageFormState) {
  const errors: { message: string; tab: "basic" | "trip" }[] = []

  if (!form.title.trim()) {
    errors.push({ message: "Package title is required", tab: "basic" })
  }
  if (!form.slug.trim()) {
    errors.push({ message: "URL slug is required", tab: "basic" })
  }
  if (!form.shortDescription.trim()) {
    errors.push({ message: "Short description is required", tab: "basic" })
  }
  if (!form.longDescription.trim()) {
    errors.push({ message: "Long description is required", tab: "basic" })
  }
  if (!form.categoryId) {
    errors.push({ message: "Primary category is required", tab: "basic" })
  }
  if (form.fromPrice.trim() === "" || toNumber(form.fromPrice) < 0) {
    errors.push({ message: "From price is required", tab: "basic" })
  }
  if (!form.cancellationPolicyId) {
    errors.push({ message: "Cancellation policy is required", tab: "basic" })
  }
  if (form.images.length === 0) {
    errors.push({ message: "Upload at least one package image", tab: "basic" })
  }
  if (!form.duration.trim()) {
    errors.push({ message: "Duration is required", tab: "trip" })
  }

  return errors
}

export function buildHolidayPackageRequest(
  form: HolidayPackageFormState
): HolidayPackageRequest {
  const languages = splitLanguages(form.languages)

  return {
    title: form.title.trim(),
    slug: form.slug.trim(),
    shortDescription: form.shortDescription.trim(),
    longDescription: form.longDescription.trim(),
    categoryId: form.categoryId,
    fromPrice: toNumber(form.fromPrice),
    status: form.status,
    cancellationPolicyId: form.cancellationPolicyId,
    duration: form.duration.trim(),
    minimumAge: Math.max(0, toNumber(form.minimumAge)),
    difficulty: form.difficulty,
    hotelTier: form.hotelTier,
    airportTransferIncluded: form.airportTransferIncluded,
    imageMediaAssetIds: form.images.map((image) => image.mediaAssetId),
    itinerary: form.itinerary
      .map((day, index) => ({
        dayNumber: index + 1,
        description: day.description.trim(),
      }))
      .filter((day) => day.description.length > 0),
    languages: languages.length > 0 ? languages : ["English"],
    inclusions: cleanList(form.inclusions),
    exclusions: cleanList(form.exclusions),
    whatToBring: cleanList(form.whatToBring),
    hotelPickupIncluded: false,
    isAttraction: false,
    isHot: false,
    badges: [],
  }
}
