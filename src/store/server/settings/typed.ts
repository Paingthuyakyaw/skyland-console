export type ApiResponse<T> = {
  success: boolean
  message?: string
  data: T
  timestamp?: string
}

export type CompanyInformation = {
  id?: string
  companyName: string
  uaeOfficeAddress: string
  franceOfficeAddress: string
  contactEmail: string
  contactPhone: string
  logoUrl?: string
  version?: number
  updatedAt?: string
}

export type CompanyInformationRequest = {
  version: number
  companyName: string
  uaeOfficeAddress: string
  franceOfficeAddress: string
  contactEmail: string
  contactPhone: string
  logoUrl?: string
}

export type WhatsAppIntegration = {
  id?: string
  connectedNumber?: string
  verified: boolean
  autoReplyMessage: string
  autoReplyOutsideBusinessHoursEnabled: boolean
  version?: number
  updatedAt?: string
}

export type WhatsAppIntegrationRequest = {
  version: number
  connectedNumber?: string
  verified: boolean
  autoReplyMessage: string
  autoReplyOutsideBusinessHoursEnabled: boolean
}

export type CurrencyOption = {
  code: string
  enabled: boolean
}

export type CurrencySettings = {
  id?: string
  defaultCurrency: string
  exchangeRateSource: string
  options: CurrencyOption[]
  version?: number
  updatedAt?: string
}

export type CurrencySettingsRequest = {
  version: number
  defaultCurrency: string
  exchangeRateSource: string
  options: CurrencyOption[]
}

export type TaxVatSettings = {
  id?: string
  vatRatePercent: number
  pricesTaxInclusive: boolean
  invoiceNumberingPrefix: string
  version?: number
  updatedAt?: string
}

export type TaxVatRequest = {
  version: number
  vatRatePercent: number
  pricesTaxInclusive: boolean
  invoiceNumberingPrefix: string
}

export type NotificationEventType =
  "NEW_BOOKING" | "PAYMENT_RECEIVED" | "BOOKING_CANCELLED" | "REMINDER_24H"

export type NotificationRule = {
  eventType: NotificationEventType
  emailEnabled: boolean
  smsEnabled: boolean
  whatsappEnabled: boolean
}

export type NotificationSettings = {
  id?: string
  rules: NotificationRule[]
  version?: number
  updatedAt?: string
}

export type NotificationSettingsRequest = {
  version: number
  rules: NotificationRule[]
}

export type AnalyticsTracking = {
  id?: string
  ga4MeasurementId?: string
  googleAdsConversionId?: string
  metaPixelId?: string
  microsoftClarityProjectId?: string
  googleSearchConsoleVerification?: string
  bingWebmasterVerification?: string
  fullGa4EcommerceTracking: boolean
  conversionTracking: boolean
  callTracking: boolean
  whatsappClickTracking: boolean
  version?: number
  updatedAt?: string
}

export type AnalyticsTrackingRequest = {
  version: number
  ga4MeasurementId?: string
  googleAdsConversionId?: string
  metaPixelId?: string
  microsoftClarityProjectId?: string
  googleSearchConsoleVerification?: string
  bingWebmasterVerification?: string
  fullGa4EcommerceTracking: boolean
  conversionTracking: boolean
  callTracking: boolean
  whatsappClickTracking: boolean
}

