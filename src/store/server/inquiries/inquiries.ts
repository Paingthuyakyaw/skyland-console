import { axios } from "@/api"
import { queryClient } from "@/lib/query-client"
import { apiErrorMessage } from "@/store/server/api-error"
import type {
  ApiResponse,
  PageResponse,
  ProductWorkflow,
  QuoteRequest,
  ResolutionRequest,
  SalesQueue,
  TourInquiriesQueryParams,
  VersionRequest,
} from "@/store/server/inquiries/typed"
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query"
import { toast } from "sonner"

export const SALES_QUEUE_PATH: Record<SalesQueue, string> = {
  tour: "tour-inquiries",
  combo: "combo-tour-quote-requests",
  holiday: "holiday-package-quote-requests",
}

const QUEUE_KEY: Record<SalesQueue, readonly string[]> = {
  tour: ["tour-inquiries"],
  combo: ["combo-tour-quote-requests"],
  holiday: ["holiday-package-quote-requests"],
}

function invalidateQueue(kind: SalesQueue) {
  void queryClient.invalidateQueries({ queryKey: QUEUE_KEY[kind] })
}

export const getSalesCases = async (
  kind: SalesQueue,
  params: TourInquiriesQueryParams = {}
) => {
  const { data } = await axios.get<ApiResponse<PageResponse<ProductWorkflow>>>(
    SALES_QUEUE_PATH[kind],
    {
      params: {
        query: params.query || undefined,
        status: params.status,
        page: params.page ?? 0,
        size: params.size ?? 20,
      },
    }
  )
  return data.data
}

export const useSalesCases = (
  kind: SalesQueue,
  params: TourInquiriesQueryParams = {}
) => {
  return useQuery({
    queryKey: [...QUEUE_KEY[kind], params],
    queryFn: () => getSalesCases(kind, params),
    placeholderData: keepPreviousData,
  })
}

export const getSalesCase = async (kind: SalesQueue, workflowId: string) => {
  const { data } = await axios.get<ApiResponse<ProductWorkflow>>(
    `${SALES_QUEUE_PATH[kind]}/${workflowId}`
  )
  return data.data
}

export const useSalesCase = (
  kind: SalesQueue,
  workflowId: string,
  enabled = true
) => {
  return useQuery({
    queryKey: [...QUEUE_KEY[kind], workflowId],
    queryFn: () => getSalesCase(kind, workflowId),
    enabled: enabled && Boolean(workflowId),
  })
}

function postWorkflow(
  kind: SalesQueue,
  workflowId: string,
  action: string,
  body: VersionRequest | QuoteRequest | ResolutionRequest
) {
  return axios.post<ApiResponse<ProductWorkflow>>(
    `${SALES_QUEUE_PATH[kind]}/${workflowId}/${action}`,
    body
  )
}

export function useStartProcessingSalesCase(kind: SalesQueue) {
  return useMutation({
    mutationFn: async ({
      workflowId,
      action,
    }: {
      workflowId: string
      action: VersionRequest
    }) => {
      const { data } = await postWorkflow(
        kind,
        workflowId,
        "start-processing",
        action
      )
      return data
    },
    onSuccess: (response) => {
      toast.success(response.message || "Inquiry moved to in progress")
      invalidateQueue(kind)
    },
    onError: (err) => {
      toast.error(apiErrorMessage(err, "Failed to start processing"))
    },
  })
}

export function useQuoteSalesCase(kind: SalesQueue) {
  return useMutation({
    mutationFn: async ({
      workflowId,
      action,
    }: {
      workflowId: string
      action: QuoteRequest
    }) => {
      const { data } = await postWorkflow(kind, workflowId, "quote", action)
      return data
    },
    onSuccess: (response) => {
      toast.success(response.message || "Quote recorded")
      invalidateQueue(kind)
    },
    onError: (err) => {
      toast.error(apiErrorMessage(err, "Failed to record quote"))
    },
  })
}

export function useAcceptSalesCase(kind: SalesQueue) {
  return useMutation({
    mutationFn: async ({
      workflowId,
      action,
    }: {
      workflowId: string
      action: VersionRequest
    }) => {
      const { data } = await postWorkflow(kind, workflowId, "accept", action)
      return data
    },
    onSuccess: (response) => {
      toast.success(response.message || "Inquiry marked accepted")
      invalidateQueue(kind)
    },
    onError: (err) => {
      toast.error(apiErrorMessage(err, "Failed to accept inquiry"))
    },
  })
}

export function useDeclineSalesCase(kind: SalesQueue) {
  return useMutation({
    mutationFn: async ({
      workflowId,
      action,
    }: {
      workflowId: string
      action: ResolutionRequest
    }) => {
      const { data } = await postWorkflow(kind, workflowId, "decline", action)
      return data
    },
    onSuccess: (response) => {
      toast.success(response.message || "Inquiry declined")
      invalidateQueue(kind)
    },
    onError: (err) => {
      toast.error(apiErrorMessage(err, "Failed to decline inquiry"))
    },
  })
}

export function useCloseSalesCase(kind: SalesQueue) {
  return useMutation({
    mutationFn: async ({
      workflowId,
      action,
    }: {
      workflowId: string
      action: ResolutionRequest
    }) => {
      const { data } = await postWorkflow(kind, workflowId, "close", action)
      return data
    },
    onSuccess: (response) => {
      toast.success(response.message || "Inquiry closed")
      invalidateQueue(kind)
    },
    onError: (err) => {
      toast.error(apiErrorMessage(err, "Failed to close inquiry"))
    },
  })
}
