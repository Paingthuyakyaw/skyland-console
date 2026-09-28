import { useState } from "react"
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { axios } from "@/api"
import { ListPagination } from "@/components/list-pagination"
import { Card } from "@/components/ui/card"
import { apiErrorMessage } from "@/store/server/api-error"
import type { ApiResponse, PageResponse } from "@/store/server/cms/typed"

type InquiryStatus = "NEW" | "IN_PROGRESS" | "RESOLVED"
type Subscription = { id: string; email: string; createdAt: string }
type Inquiry = {
  id: string
  fullName: string
  email: string
  phone: string | null
  inquiryType: string
  message: string
  status: InquiryStatus
  version: number
  createdAt: string
}

const PAGE_SIZE = 20
const statusOptions: InquiryStatus[] = ["NEW", "IN_PROGRESS", "RESOLVED"]

function formatDate(value: string) {
  return new Date(value).toLocaleString()
}

export function SubscriptionsTab() {
  const [page, setPage] = useState(0)
  const { data, isPending, isError } = useQuery({
    queryKey: ["cms", "subscriptions", page],
    queryFn: async () => {
      const response = await axios.get<ApiResponse<PageResponse<Subscription>>>(
        "cms/subscriptions",
        { params: { page, size: PAGE_SIZE } }
      )
      return response.data.data
    },
    placeholderData: keepPreviousData,
  })

  return (
    <Card className="gap-0 overflow-hidden py-0">
      <div className="border-b border-border px-5 py-4">
        <h3 className="font-bold">Email subscriptions</h3>
        <p className="text-xs text-muted-foreground">People who subscribed on the website.</p>
      </div>
      {isPending && <p className="p-6 text-sm">Loading subscriptions…</p>}
      {isError && <p className="p-6 text-sm text-destructive">Unable to load subscriptions.</p>}
      {data?.content.map((item) => (
        <div key={item.id} className="flex flex-wrap justify-between gap-2 border-b border-border px-5 py-3 text-sm">
          <a className="font-medium hover:underline" href={`mailto:${item.email}`}>{item.email}</a>
          <time className="text-muted-foreground" dateTime={item.createdAt}>{formatDate(item.createdAt)}</time>
        </div>
      ))}
      {data && data.content.length === 0 && <p className="p-6 text-sm text-muted-foreground">No subscriptions yet.</p>}
      {data && <ListPagination className="px-4 py-3" page={page} size={PAGE_SIZE} totalPages={data.totalPages} totalElements={data.totalElements} onPageChange={setPage} />}
    </Card>
  )
}

export function ContactInquiriesTab() {
  const [page, setPage] = useState(0)
  const [status, setStatus] = useState<InquiryStatus | "">("")
  const [openId, setOpenId] = useState<string | null>(null)
  const queryClient = useQueryClient()
  const { data, isPending, isError } = useQuery({
    queryKey: ["cms", "contact-inquiries", page, status],
    queryFn: async () => {
      const response = await axios.get<ApiResponse<PageResponse<Inquiry>>>(
        "cms/contact-inquiries",
        { params: { page, size: PAGE_SIZE, ...(status ? { status } : {}) } }
      )
      return response.data.data
    },
    placeholderData: keepPreviousData,
  })
  const update = useMutation({
    mutationFn: async ({ inquiry, nextStatus }: { inquiry: Inquiry; nextStatus: InquiryStatus }) => {
      const response = await axios.patch<ApiResponse<Inquiry>>(
        `cms/contact-inquiries/${inquiry.id}/status`,
        { status: nextStatus, version: inquiry.version }
      )
      return response.data.data
    },
    onSuccess: () => {
      toast.success("Inquiry status updated")
      void queryClient.invalidateQueries({ queryKey: ["cms", "contact-inquiries"] })
    },
    onError: (error) => toast.error(apiErrorMessage(error, "Unable to update status")),
  })

  return (
    <Card className="gap-0 overflow-hidden py-0">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div>
          <h3 className="font-bold">Contact inquiries</h3>
          <p className="text-xs text-muted-foreground">Open an inquiry to read its message and update its status.</p>
        </div>
        <select
          aria-label="Filter inquiry status"
          className="rounded-md border border-border bg-background px-3 py-2 text-sm"
          value={status}
          onChange={(event) => { setStatus(event.target.value as InquiryStatus | ""); setPage(0) }}
        >
          <option value="">All statuses</option>
          {statusOptions.map((option) => <option key={option} value={option}>{option.replace("_", " ")}</option>)}
        </select>
      </div>
      {isPending && <p className="p-6 text-sm">Loading inquiries…</p>}
      {isError && <p className="p-6 text-sm text-destructive">Unable to load inquiries.</p>}
      {data?.content.map((item) => (
        <div key={item.id} className="border-b border-border px-5 py-3">
          <button type="button" className="flex w-full flex-wrap items-center justify-between gap-2 text-left" onClick={() => setOpenId(openId === item.id ? null : item.id)}>
            <span className="font-medium">{item.fullName} <span className="text-sm font-normal text-muted-foreground">· {item.inquiryType.replace("_", " ")}</span></span>
            <span className="text-xs text-muted-foreground">{item.status.replace("_", " ")} · {formatDate(item.createdAt)}</span>
          </button>
          {openId === item.id && (
            <div className="mt-3 space-y-3 rounded-md bg-muted/40 p-4 text-sm">
              <div className="flex flex-wrap gap-x-6 gap-y-1">
                <a className="hover:underline" href={`mailto:${item.email}`}>{item.email}</a>
                {item.phone && <a className="hover:underline" href={`tel:${item.phone}`}>{item.phone}</a>}
              </div>
              <p className="whitespace-pre-wrap">{item.message}</p>
              <label className="flex items-center gap-2">Status
                <select
                  aria-label={`Status for ${item.fullName}`}
                  className="rounded-md border border-border bg-background px-3 py-2"
                  disabled={update.isPending}
                  value={item.status}
                  onChange={(event) => update.mutate({ inquiry: item, nextStatus: event.target.value as InquiryStatus })}
                >
                  {statusOptions.map((option) => <option key={option} value={option}>{option.replace("_", " ")}</option>)}
                </select>
              </label>
            </div>
          )}
        </div>
      ))}
      {data && data.content.length === 0 && <p className="p-6 text-sm text-muted-foreground">No inquiries found.</p>}
      {data && <ListPagination className="px-4 py-3" page={page} size={PAGE_SIZE} totalPages={data.totalPages} totalElements={data.totalElements} onPageChange={setPage} />}
    </Card>
  )
}
