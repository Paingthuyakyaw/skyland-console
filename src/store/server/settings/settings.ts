import { axios } from "@/api"
import { queryClient } from "@/lib/query-client"
import { apiErrorMessage } from "@/store/server/api-error"
import type {
  AnalyticsTracking,
  AnalyticsTrackingRequest,
  ApiResponse,
  CompanyInformation,
  CompanyInformationRequest,
  CurrencySettings,
  CurrencySettingsRequest,
  NotificationSettings,
  NotificationSettingsRequest,
  TaxVatRequest,
  TaxVatSettings,
  WhatsAppIntegration,
  WhatsAppIntegrationRequest,
} from "@/store/server/settings/typed"
import { useMutation, useQuery } from "@tanstack/react-query"
import { isAxiosError } from "axios"
import { toast } from "sonner"

const SETTINGS_KEY = ["settings"] as const

async function getOrNull<T>(path: string) {
  try {
    const { data } = await axios.get<ApiResponse<T>>(path)
    return data.data
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 404) return null
    throw error
  }
}

function invalidateSettings(...suffix: string[]) {
  void queryClient.invalidateQueries({
    queryKey: suffix.length ? [...SETTINGS_KEY, ...suffix] : SETTINGS_KEY,
  })
}

export const getCompanyInformation = () =>
  getOrNull<CompanyInformation>("settings/company-information")

export const useCompanyInformation = () =>
  useQuery({
    queryKey: [...SETTINGS_KEY, "company"],
    queryFn: getCompanyInformation,
  })

export const updateCompanyInformation = async (
  payload: CompanyInformationRequest
) => {
  const { data } = await axios.put<ApiResponse<CompanyInformation>>(
    "settings/company-information",
    payload
  )
  return data
}

export function useUpdateCompanyInformation() {
  return useMutation({
    mutationFn: updateCompanyInformation,
    onSuccess: (response) => {
      toast.success(response.message || "Company information saved")
      invalidateSettings("company")
    },
    onError: (err) => {
      toast.error(apiErrorMessage(err, "Failed to save company information"))
    },
  })
}

export const getWhatsAppIntegration = () =>
  getOrNull<WhatsAppIntegration>("settings/whatsapp-integration")

export const useWhatsAppIntegration = () =>
  useQuery({
    queryKey: [...SETTINGS_KEY, "whatsapp"],
    queryFn: getWhatsAppIntegration,
  })

export const updateWhatsAppIntegration = async (
  payload: WhatsAppIntegrationRequest
) => {
  const { data } = await axios.put<ApiResponse<WhatsAppIntegration>>(
    "settings/whatsapp-integration",
    payload
  )
  return data
}

export function useUpdateWhatsAppIntegration() {
  return useMutation({
    mutationFn: updateWhatsAppIntegration,
    onSuccess: (response) => {
      toast.success(response.message || "WhatsApp settings saved")
      invalidateSettings("whatsapp")
    },
    onError: (err) => {
      toast.error(apiErrorMessage(err, "Failed to save WhatsApp settings"))
    },
  })
}

export const getCurrencySettings = () =>
  getOrNull<CurrencySettings>("settings/currency")

export const useCurrencySettings = () =>
  useQuery({
    queryKey: [...SETTINGS_KEY, "currency"],
    queryFn: getCurrencySettings,
  })

export const updateCurrencySettings = async (
  payload: CurrencySettingsRequest
) => {
  const { data } = await axios.put<ApiResponse<CurrencySettings>>(
    "settings/currency",
    payload
  )
  return data
}

export function useUpdateCurrencySettings() {
  return useMutation({
    mutationFn: updateCurrencySettings,
    onSuccess: (response) => {
      toast.success(response.message || "Currency settings saved")
      invalidateSettings("currency")
    },
    onError: (err) => {
      toast.error(apiErrorMessage(err, "Failed to save currency settings"))
    },
  })
}

export const getTaxVat = () => getOrNull<TaxVatSettings>("settings/tax-vat")

export const useTaxVat = () =>
  useQuery({
    queryKey: [...SETTINGS_KEY, "tax"],
    queryFn: getTaxVat,
  })

export const updateTaxVat = async (payload: TaxVatRequest) => {
  const { data } = await axios.put<ApiResponse<TaxVatSettings>>(
    "settings/tax-vat",
    payload
  )
  return data
}

export function useUpdateTaxVat() {
  return useMutation({
    mutationFn: updateTaxVat,
    onSuccess: (response) => {
      toast.success(response.message || "Tax settings saved")
      invalidateSettings("tax")
    },
    onError: (err) => {
      toast.error(apiErrorMessage(err, "Failed to save tax settings"))
    },
  })
}

export const getNotificationSettings = () =>
  getOrNull<NotificationSettings>("settings/notification-rules")

export const useNotificationSettings = () =>
  useQuery({
    queryKey: [...SETTINGS_KEY, "notifications"],
    queryFn: getNotificationSettings,
  })

export const updateNotificationSettings = async (
  payload: NotificationSettingsRequest
) => {
  const { data } = await axios.put<ApiResponse<NotificationSettings>>(
    "settings/notification-rules",
    payload
  )
  return data
}

export function useUpdateNotificationSettings() {
  return useMutation({
    mutationFn: updateNotificationSettings,
    onSuccess: (response) => {
      toast.success(response.message || "Notification settings saved")
      invalidateSettings("notifications")
    },
    onError: (err) => {
      toast.error(apiErrorMessage(err, "Failed to save notification settings"))
    },
  })
}

export const getAnalyticsTracking = () =>
  getOrNull<AnalyticsTracking>("settings/analytics-tracking")

export const useAnalyticsTracking = () =>
  useQuery({
    queryKey: [...SETTINGS_KEY, "analytics"],
    queryFn: getAnalyticsTracking,
  })

export const updateAnalyticsTracking = async (
  payload: AnalyticsTrackingRequest
) => {
  const { data } = await axios.put<ApiResponse<AnalyticsTracking>>(
    "settings/analytics-tracking",
    payload
  )
  return data
}

export function useUpdateAnalyticsTracking() {
  return useMutation({
    mutationFn: updateAnalyticsTracking,
    onSuccess: (response) => {
      toast.success(response.message || "Analytics settings saved")
      invalidateSettings("analytics")
    },
    onError: (err) => {
      toast.error(apiErrorMessage(err, "Failed to save analytics settings"))
    },
  })
}

