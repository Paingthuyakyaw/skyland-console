import { axios } from "@/api"
import { queryClient } from "@/lib/query-client"
import { apiErrorMessage } from "@/store/server/api-error"
import type {
  ApiResponse,
  ApplyToOtherToursRequest,
  AuditLogResponse,
  BlockDatesRequest,
  BulkAvailabilityRequest,
  BulkAvailabilityResponse,
  CalendarDayResponse,
  CopyMonthRequest,
  PageResponse,
  RuleRequest,
  RuleResponse,
  RuleUpdateRequest,
} from "@/store/server/tours/typed"
import { useMutation, useQuery } from "@tanstack/react-query"
import { toast } from "sonner"

const availabilityKey = (tourId: string) =>
  ["tour-availability", tourId] as const

function invalidateAvailability(tourId: string) {
  void queryClient.invalidateQueries({ queryKey: availabilityKey(tourId) })
}

export const getAvailabilityCalendar = async (
  tourId: string,
  month: string
) => {
  const { data } = await axios.get<ApiResponse<CalendarDayResponse[]>>(
    `tours/${tourId}/availability/calendar`,
    { params: { month } }
  )
  return data.data ?? []
}

export function useAvailabilityCalendar(tourId?: string, month?: string) {
  return useQuery({
    queryKey: [...availabilityKey(tourId ?? ""), "calendar", month],
    queryFn: () => getAvailabilityCalendar(tourId!, month!),
    enabled: Boolean(tourId && month),
  })
}

export const getAvailabilityDay = async (tourId: string, date: string) => {
  const { data } = await axios.get<ApiResponse<CalendarDayResponse>>(
    `tours/${tourId}/availability/calendar/${date}`
  )
  return data.data
}

export function useAvailabilityDay(tourId?: string, date?: string | null) {
  return useQuery({
    queryKey: [...availabilityKey(tourId ?? ""), "day", date],
    queryFn: () => getAvailabilityDay(tourId!, date!),
    enabled: Boolean(tourId && date),
  })
}

export const getAvailabilityRules = async (tourId: string) => {
  const { data } = await axios.get<ApiResponse<RuleResponse[]>>(
    `tours/${tourId}/availability/rules`
  )
  return data.data ?? []
}

export function useAvailabilityRules(tourId?: string) {
  return useQuery({
    queryKey: [...availabilityKey(tourId ?? ""), "rules"],
    queryFn: () => getAvailabilityRules(tourId!),
    enabled: Boolean(tourId),
  })
}

export const createAvailabilityRule = async ({
  tourId,
  rule,
}: {
  tourId: string
  rule: RuleRequest
}) => {
  const { data } = await axios.post<ApiResponse<RuleResponse>>(
    `tours/${tourId}/availability/rules`,
    rule
  )
  return data
}

export function useCreateAvailabilityRule(tourId?: string) {
  return useMutation({
    mutationFn: createAvailabilityRule,
    onSuccess: (response) => {
      toast.success(response.message || "Rule created")
      if (tourId) invalidateAvailability(tourId)
    },
    onError: (err) => {
      toast.error(apiErrorMessage(err, "Failed to create rule"))
    },
  })
}

export const updateAvailabilityRule = async ({
  tourId,
  ruleId,
  payload,
}: {
  tourId: string
  ruleId: string
  payload: RuleUpdateRequest
}) => {
  const { data } = await axios.put<ApiResponse<RuleResponse>>(
    `tours/${tourId}/availability/rules/${ruleId}`,
    payload
  )
  return data
}

export function useUpdateAvailabilityRule(tourId?: string) {
  return useMutation({
    mutationFn: updateAvailabilityRule,
    onSuccess: (response) => {
      toast.success(response.message || "Rule updated")
      if (tourId) invalidateAvailability(tourId)
    },
    onError: (err) => {
      toast.error(apiErrorMessage(err, "Failed to update rule"))
    },
  })
}

export const deleteAvailabilityRule = async ({
  tourId,
  ruleId,
}: {
  tourId: string
  ruleId: string
}) => {
  const { data } = await axios.delete<ApiResponse<unknown>>(
    `tours/${tourId}/availability/rules/${ruleId}`
  )
  return data
}

export function useDeleteAvailabilityRule(tourId?: string) {
  return useMutation({
    mutationFn: deleteAvailabilityRule,
    onSuccess: (response) => {
      toast.success(response.message || "Rule deleted")
      if (tourId) invalidateAvailability(tourId)
    },
    onError: (err) => {
      toast.error(apiErrorMessage(err, "Failed to delete rule"))
    },
  })
}

export const bulkUpdateAvailability = async ({
  tourId,
  payload,
}: {
  tourId: string
  payload: BulkAvailabilityRequest
}) => {
  const { data } = await axios.post<ApiResponse<BulkAvailabilityResponse>>(
    `tours/${tourId}/availability/bulk-update`,
    payload
  )
  return data
}

export function useBulkUpdateAvailability(tourId?: string) {
  return useMutation({
    mutationFn: bulkUpdateAvailability,
    onSuccess: (response) => {
      toast.success(response.message || "Availability updated")
      if (tourId) invalidateAvailability(tourId)
    },
    onError: (err) => {
      toast.error(apiErrorMessage(err, "Failed to bulk update availability"))
    },
  })
}

export const copyAvailabilityMonth = async ({
  tourId,
  payload,
}: {
  tourId: string
  payload: CopyMonthRequest
}) => {
  const { data } = await axios.post<ApiResponse<unknown>>(
    `tours/${tourId}/availability/copy-month`,
    payload
  )
  return data
}

export function useCopyAvailabilityMonth(tourId?: string) {
  return useMutation({
    mutationFn: copyAvailabilityMonth,
    onSuccess: (response) => {
      toast.success(response.message || "Month copied")
      if (tourId) invalidateAvailability(tourId)
    },
    onError: (err) => {
      toast.error(apiErrorMessage(err, "Failed to copy month"))
    },
  })
}

export const applyAvailabilityToOtherTours = async ({
  tourId,
  payload,
}: {
  tourId: string
  payload: ApplyToOtherToursRequest
}) => {
  const { data } = await axios.post<ApiResponse<unknown>>(
    `tours/${tourId}/availability/apply-to-other-tours`,
    payload
  )
  return data
}

export function useApplyAvailabilityToOtherTours(tourId?: string) {
  return useMutation({
    mutationFn: applyAvailabilityToOtherTours,
    onSuccess: (response) => {
      toast.success(response.message || "Applied to other tours")
      if (tourId) invalidateAvailability(tourId)
    },
    onError: (err) => {
      toast.error(apiErrorMessage(err, "Failed to apply to other tours"))
    },
  })
}

export const blockAvailabilityDates = async ({
  tourId,
  payload,
}: {
  tourId: string
  payload: BlockDatesRequest
}) => {
  const { data } = await axios.post<ApiResponse<unknown>>(
    `tours/${tourId}/availability/block-dates`,
    payload
  )
  return data
}

export function useBlockAvailabilityDates(tourId?: string) {
  return useMutation({
    mutationFn: blockAvailabilityDates,
    onSuccess: (response) => {
      toast.success(response.message || "Dates blocked")
      if (tourId) invalidateAvailability(tourId)
    },
    onError: (err) => {
      toast.error(apiErrorMessage(err, "Failed to block dates"))
    },
  })
}

export const getAuditLogs = async (params: {
  entityType?: string
  entityId?: string
  page?: number
  size?: number
}) => {
  const { data } = await axios.get<
    ApiResponse<PageResponse<AuditLogResponse>>
  >("audit-logs", {
    params: {
      entityType: params.entityType,
      entityId: params.entityId,
      page: params.page ?? 0,
      size: params.size ?? 20,
    },
  })
  return data.data
}

export function useAuditLogs(params: {
  entityType?: string
  entityId?: string
  enabled?: boolean
}) {
  return useQuery({
    queryKey: ["audit-logs", params.entityType, params.entityId],
    queryFn: () =>
      getAuditLogs({
        entityType: params.entityType,
        entityId: params.entityId,
      }),
    enabled: params.enabled !== false && Boolean(params.entityId),
  })
}
