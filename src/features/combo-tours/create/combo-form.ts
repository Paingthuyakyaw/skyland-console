import { formatDuration } from "@/features/combo-tours/components/utils"
import { slugify } from "@/features/tours/components/utils"
import type {
  ComboTourDetail,
  ComboTourItem,
  ComboTourRequest,
  ComboTourStatus,
  ComboTourTextItem,
} from "@/store/server/combo/typed"

export type GalleryImage = {
  mediaAssetId: string
  url: string
}

export type BundledTourDraft = {
  tourId: string
  quantity: number
  title?: string
}

export type ComboDifficulty = "EASY" | "MODERATE" | "HARD"

export type ItineraryDraft = {
  description: string
}

export type ComboTourFormState = {
  title: string
  slug: string
  slugTouched: boolean
  shortDescription: string
  longDescription: string
  primaryCategoryId: string
  comboPrice: string
  discountPrice: string
  status: ComboTourStatus
  cancellationPolicyId: string
  images: GalleryImage[]
  duration: string
  minimumAge: string
  difficulty: ComboDifficulty
  languages: string
  hotelPickupIncluded: boolean
  items: BundledTourDraft[]
  inclusions: string[]
  exclusions: string[]
  itinerary: ItineraryDraft[]
  version: number
}

export function createInitialComboForm(): ComboTourFormState {
  return {
    title: "",
    slug: "",
    slugTouched: false,
    shortDescription: "",
    longDescription: "",
    primaryCategoryId: "",
    comboPrice: "",
    discountPrice: "",
    status: "DRAFT",
    cancellationPolicyId: "",
    images: [],
    duration: "",
    minimumAge: "0",
    difficulty: "EASY",
    languages: "English",
    hotelPickupIncluded: false,
    items: [],
    inclusions: [],
    exclusions: [],
    itinerary: [],
    version: 0,
  }
}

function textValues(items?: Array<ComboTourTextItem | string>) {
  return (
    items
      ?.map((item) =>
        (typeof item === "string" ? item : item.value).trim()
      )
      .filter(Boolean) ?? []
  )
}

export function formFromDetail(detail: ComboTourDetail): ComboTourFormState {
  const images = [...(detail.images ?? [])].sort(
    (left, right) => (left.sortOrder ?? 0) - (right.sortOrder ?? 0)
  )
  const items = [...(detail.items ?? [])].sort(
    (left, right) => (left.sortOrder ?? 0) - (right.sortOrder ?? 0)
  )

  return {
    title: detail.title,
    slug: detail.slug,
    slugTouched: true,
    shortDescription: detail.shortDescription ?? "",
    longDescription: detail.longDescription ?? "",
    primaryCategoryId: detail.primaryCategory?.id ?? "",
    comboPrice: String(detail.comboPrice ?? ""),
    discountPrice:
      detail.discountPrice == null ? "" : String(detail.discountPrice),
    status: detail.status,
    cancellationPolicyId: detail.cancellationPolicy?.id ?? "",
    images: images.map((image) => ({
      mediaAssetId: image.mediaAssetId,
      url: image.url ?? "",
    })),
    duration: durationFromMinutes(detail.durationMinutes),
    minimumAge: "0",
    difficulty: "EASY",
    languages: "English",
    hotelPickupIncluded: detail.hotelPickupIncluded ?? false,
    items: items.map((item) => toBundledTour(item)),
    inclusions: textValues(detail.inclusions),
    exclusions: textValues(detail.exclusions),
    itinerary: [],
    version: detail.version ?? 0,
  }
}

function toBundledTour(item: ComboTourItem): BundledTourDraft {
  return {
    tourId: item.tourId,
    quantity: Math.max(1, item.quantity ?? 1),
    title: item.tourTitle,
  }
}

function durationFromMinutes(minutes?: number) {
  const label = formatDuration(minutes)
  return label === "—" ? "" : label
}

function parseDurationToMinutes(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return undefined

  const asNumber = Number(trimmed)
  if (Number.isFinite(asNumber) && asNumber >= 1) {
    return Math.round(asNumber)
  }

  const days = trimmed.match(/(\d+)\s*days?/i)
  const hours = trimmed.match(/(\d+)\s*h(?:ours?)?/i)
  const mins = trimmed.match(/(\d+)\s*m(?:in(?:utes?)?)?/i)

  let minutes = 0
  if (days) minutes += Number(days[1]) * 24 * 60
  if (hours) minutes += Number(hours[1]) * 60
  if (mins) minutes += Number(mins[1])

  return minutes >= 1 ? minutes : undefined
}

function toNumber(value: string, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function cleanList(values: string[]) {
  return values.map((value) => value.trim()).filter(Boolean)
}

export function applyTitleChange(
  form: ComboTourFormState,
  title: string
): ComboTourFormState {
  return {
    ...form,
    title,
    slug: form.slugTouched ? form.slug : slugify(title),
  }
}

export function validateComboForm(form: ComboTourFormState) {
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
  if (!form.primaryCategoryId) {
    errors.push({ message: "Primary category is required", tab: "basic" })
  }
  if (form.comboPrice.trim() === "" || toNumber(form.comboPrice) < 0) {
    errors.push({ message: "From price is required", tab: "basic" })
  }
  if (!form.cancellationPolicyId) {
    errors.push({ message: "Cancellation policy is required", tab: "basic" })
  }
  if (form.images.length === 0) {
    errors.push({ message: "Upload at least one package image", tab: "basic" })
  }
  if (form.items.length === 0) {
    errors.push({ message: "Select at least one bundled tour", tab: "trip" })
  }
  if (form.status === "PUBLISHED" && form.items.length < 2) {
    errors.push({
      message: "Published combos need at least two bundled tours",
      tab: "trip",
    })
  }

  return errors
}

export function buildComboTourRequest(
  form: ComboTourFormState
): ComboTourRequest {
  const durationMinutes = parseDurationToMinutes(form.duration)
  const discountPrice = form.discountPrice.trim()

  return {
    title: form.title.trim(),
    slug: form.slug.trim(),
    shortDescription: form.shortDescription.trim(),
    longDescription: form.longDescription.trim(),
    primaryCategoryId: form.primaryCategoryId,
    comboPrice: toNumber(form.comboPrice),
    status: form.status,
    cancellationPolicyId: form.cancellationPolicyId,
    items: form.items.map((item) => ({
      tourId: item.tourId,
      quantity: Math.max(1, item.quantity),
    })),
    images: form.images.map((image, index) => ({
      mediaAssetId: image.mediaAssetId,
      featured: index === 0,
    })),
    inclusions: cleanList(form.inclusions),
    exclusions: cleanList(form.exclusions),
    ...(typeof durationMinutes === "number" && durationMinutes >= 1
      ? { durationMinutes }
      : {}),
    ...(discountPrice === "" ? {} : { discountPrice: toNumber(discountPrice) }),
    isAttraction: false,
    isHot: false,
    hotelPickupIncluded: form.hotelPickupIncluded,
    badges: [],
  }
}
