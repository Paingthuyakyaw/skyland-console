export type TourStatus = "DRAFT" | "PUBLISHED" | "SCHEDULED"

export type TourDifficulty = "EASY" | "MODERATE" | "HARD"

export type TourCategoryLevel = "PRIMARY" | "SECONDARY"

export type TourCategorySummary = {
  id: string
  name: string
  slug: string
  level?: TourCategoryLevel
  levelLabel?: string
}

export type TourCategory = TourCategorySummary & {
  parent?: TourCategorySummary
  imageUrl?: string
  sortOrder?: number
  version?: number
  createdAt?: string
  updatedAt?: string
}

export type TourBadge = {
  logoUrl?: string
  title: string
  shortInfo?: string
}

export type TourSummary = {
  id: string
  title: string
  slug: string
  primaryCategory?: TourCategorySummary
  secondaryCategory?: TourCategorySummary
  status: TourStatus
  statusLabel?: string
  difficulty?: TourDifficulty
  difficultyLabel?: string
  adultPrice: number
  discountPrice?: number
  currency: string
  isAttraction?: boolean
  isHot?: boolean
  hotelPickupIncluded?: boolean
  badges?: TourBadge[]
  featuredImageUrl?: string
  version?: number
  createdAt?: string
  updatedAt?: string
}

export type ToursQueryParams = {
  query?: string
  status?: TourStatus
  difficulty?: TourDifficulty
  primaryCategoryId?: string
  secondaryCategoryId?: string
  page?: number
  size?: number
  sort?: string
  direction?: "asc" | "desc"
}

export type PageResponse<T> = {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  first?: boolean
  last?: boolean
}

export type ApiResponse<T> = {
  success: boolean
  message?: string
  data: T
  timestamp?: string
}

export type BookingMode = "SHARED" | "PRIVATE" | "BOTH"

export type Weekday =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY"

export type AvailabilityStatus = "OPEN" | "LIMITED" | "SOLD_OUT" | "BLOCKED"

export type RuleCategory = "SEASONAL" | "RELIGIOUS_OBSERVANCE" | "CUSTOM"

export type RuleEffectType =
  | "BLOCK"
  | "ADJUST_PRICE"
  | "ADJUST_CAPACITY"
  | "SHIFT_TIME"

export type AdjustmentMode = "PERCENTAGE" | "FLAT_AMOUNT"

export type PricingRuleType =
  | "ALL_YEAR"
  | "DATE_RANGE"
  | "WEEKDAY_PATTERN"
  | "SINGLE_DATE"

export type PricingAdjustmentType = "PERCENTAGE" | "FIXED_OVERRIDE"

export type CancellationPolicyOption = {
  id: string
  code: string
  name: string
}

export type CancellationPolicySummary = CancellationPolicyOption

export type CapacityRequest = {
  minGuestsToOperate: number
  overbookingAllowance: number
  bookingCutOffHours: number
  sameDayBookingAllowed: boolean
  payOnArrivalConfirmationDeadline: number
}

export type CapacityResponse = CapacityRequest

export type BookingSettingsRequest = {
  bookingMode: BookingMode
  instantConfirmation: boolean
  minGuestsPerBooking: number
  maxGuestsPerBooking: number
}

export type BookingSettingsResponse = BookingSettingsRequest & {
  bookingModeLabel?: string
}

export type SeoRequest = {
  metaTitle?: string
  metaDescription?: string
}

export type SeoResponse = SeoRequest

export type GroupPriceTierRequest = {
  minPax: number
  pricePerPax: number
}

export type GroupPriceTierResponse = GroupPriceTierRequest

export type TimeslotPackageRequest = {
  name: string
  vehicleType: string
  description: string
  adultPrice: number
  childPrice?: number
  infantPrice?: number
  seniorPrice?: number
  privateTourPrice?: number
  featured: boolean
  groupPriceTiers: GroupPriceTierRequest[]
  checklist: string[]
}

export type TimeslotPackageResponse = TimeslotPackageRequest & {
  id: string
  sortOrder?: number
}

export type TimeslotRequest = {
  name: string
  startTime: string
  endTime: string
  packages: TimeslotPackageRequest[]
}

export type TimeslotResponse = {
  id: string
  name: string
  startTime: string
  endTime: string
  crossesMidnight?: boolean
  sortOrder?: number
  packages?: TimeslotPackageResponse[]
}

export type ImageRequest = {
  mediaAssetId: string
  featured: boolean
}

export type ImageResponse = ImageRequest & {
  id?: string
  url?: string
  originalFilename?: string
  sortOrder?: number
}

export type AddonRequest = {
  name: string
  desc: string
  pricePerPerson: number
  maxCap: number
}

export type AddonResponse = AddonRequest

export type BadgeRequest = {
  logoUrl: string
  title: string
  shortInfo: string
}

export type TextItemResponse = {
  id?: string
  value: string
  sortOrder?: number
}

export type MediaAssetResponse = {
  id: string
  provider?: string
  url?: string
  folderPath?: string
  originalFilename?: string
  contentType?: string
  sizeBytes?: number
  uploadedAt?: string
  uploadedBy?: string
}

export type TourRequest = {
  title: string
  slug: string
  shortDescription: string
  longDescription: string
  primaryCategoryId: string
  secondaryCategoryId?: string
  duration: number
  videoUrl?: string
  cancellationPolicyId: string
  status: TourStatus
  scheduledPublishAt?: string
  minimumAge: number
  meetingPoint: string
  difficulty: TourDifficulty
  adultPrice: number
  capacity: CapacityRequest
  settings: BookingSettingsRequest
  seo?: SeoRequest
  languagesOffered: string[]
  pickupZones: string[]
  inclusions: string[]
  exclusions: string[]
  whatToBring: string[]
  timeslots: TimeslotRequest[]
  images: ImageRequest[]
  discountPrice?: number
  isAttraction: boolean
  isHot: boolean
  hotelPickupIncluded: boolean
  addons?: AddonRequest[]
  badges: BadgeRequest[]
}

export type TourResponse = {
  id: string
  title: string
  slug: string
  shortDescription?: string
  longDescription?: string
  primaryCategory?: TourCategorySummary
  secondaryCategory?: TourCategorySummary
  duration?: number
  videoUrl?: string
  cancellationPolicy?: CancellationPolicySummary
  status: TourStatus
  statusLabel?: string
  scheduledPublishAt?: string
  minimumAge?: number
  meetingPoint?: string
  difficulty?: TourDifficulty
  difficultyLabel?: string
  adultPrice: number
  discountPrice?: number
  currency?: string
  isAttraction?: boolean
  isHot?: boolean
  hotelPickupIncluded?: boolean
  addons?: AddonResponse[]
  badges?: TourBadge[]
  capacity?: CapacityResponse
  settings?: BookingSettingsResponse
  seo?: SeoResponse
  languagesOffered?: TextItemResponse[]
  pickupZones?: TextItemResponse[]
  inclusions?: TextItemResponse[]
  exclusions?: TextItemResponse[]
  whatToBring?: TextItemResponse[]
  timeslots?: TimeslotResponse[]
  images?: ImageResponse[]
  rating?: number
  reviewCount?: number
  version?: number
  createdAt?: string
  updatedAt?: string
}

export type CalendarWindowResponse = {
  id: string
  timeslotId: string
  timeslotName?: string
  date?: string
  startTime?: string
  endTime?: string
  status: AvailabilityStatus
  capacity?: number
  bookedCount?: number
  remainingCapacity?: number
  price?: number
}

export type CalendarDayResponse = {
  date: string
  status: AvailabilityStatus
  maxCapacity?: number
  bookedCount?: number
  remainingCapacity?: number
  windows?: CalendarWindowResponse[]
}

export type DateSelection = {
  mode: "DATE_RANGE" | "WEEKDAY_PATTERN"
  from: string
  to: string
  weekdays?: Weekday[]
}

export type WindowBaselineRequest = {
  timeslotId: string
  maxCapacity?: number
  price?: number
  blocked?: boolean
}

export type BulkAvailabilityRequest = {
  selection: DateSelection
  maxCapacityForDay?: number
  windows: WindowBaselineRequest[]
}

export type BulkAvailabilityResponse = {
  datesApplied?: number
  windowsUpdated?: number
}

export type RuleRequest = {
  name: string
  category: RuleCategory
  dateRangeStart: string
  dateRangeEnd: string
  daysOfWeek?: Weekday[]
  targetWindowIds?: string[]
  effectType: RuleEffectType
  priceAdjustmentMode?: AdjustmentMode
  priceAdjustmentValue?: number
  capacityAdjustmentMode?: AdjustmentMode
  capacityAdjustmentValue?: number
  shiftedStartTime?: string
  shiftedEndTime?: string
  priority?: number
  active?: boolean
}

export type RuleResponse = RuleRequest & {
  id: string
  version?: number
}

export type RuleUpdateRequest = {
  version: number
  rule: RuleRequest
}

export type CopyMonthRequest = {
  sourceMonth: string
  targetMonth: string
  overwrite: boolean
}

export type ApplyToOtherToursRequest = {
  targetTourIds: string[]
  from: string
  to: string
  overwrite: boolean
}

export type BlockDatesRequest = {
  from: string
  to: string
  timeslotIds: string[]
  defaultCapacity: number
}

export type AuditLogResponse = {
  id: string
  actorId?: string
  action?: string
  entityType?: string
  entityId?: string
  changes?: Record<string, unknown>
  createdAt?: string
}

export type PricingRuleRequest = {
  name: string
  ruleType: PricingRuleType
  startDate?: string
  endDate?: string
  weekdays?: Weekday[]
  singleDate?: string
  adjustmentType: PricingAdjustmentType
  adjustmentValue: number
  priority: number
  active: boolean
}

export type PricingRuleResponse = PricingRuleRequest & {
  id: string
  version?: number
  createdAt?: string
  updatedAt?: string
}
