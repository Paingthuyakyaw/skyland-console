import { useState } from "react"

import { PagePlaceholder } from "@/components/page-placeholder"
import { DatePicker } from "@/components/ui/date-picker"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ReportTable } from "@/features/reports/components/report-table"
import {
  defaultPaymentRange,
  formatDateTime,
  formatLabel,
  formatMonth,
  formatMoney,
  isValidRange,
} from "@/features/payments/components/utils"
import {
  useMonthlyRevenue,
  usePaymentMethods,
} from "@/store/server/payments/payments"
import {
  usePayOnArrival,
  useRefundsCancellations,
} from "@/store/server/reports/reports"

const PAGE_SIZE = 20

type ReportTab = "revenue" | "methods" | "refunds" | "arrival"

function cell(value?: string | number) {
  if (value === undefined || value === null || value === "") return "—"
  return value
}

const ReportsFeature = () => {
  const initial = defaultPaymentRange()
  const [from, setFrom] = useState(initial.from)
  const [to, setTo] = useState(initial.to)
  const [tab, setTab] = useState<ReportTab>("revenue")
  const [page, setPage] = useState(0)
  const enabled = isValidRange(from, to)
  const query = { from, to, page, size: PAGE_SIZE }
  const revenue = useMonthlyRevenue({ from, to }, enabled && tab === "revenue")
  const methods = usePaymentMethods({ from, to }, enabled && tab === "methods")
  const refunds = useRefundsCancellations(query, enabled && tab === "refunds")
  const arrival = usePayOnArrival(query, enabled && tab === "arrival")

  return (
    <div>
      <PagePlaceholder
        title="Reports"
        subtitle="Review revenue, payment methods, refunds, and outstanding arrival payments."
        actions={
          <>
            <DatePicker
              value={from}
              onChange={(value) => {
                setFrom(value)
                setPage(0)
              }}
              aria-label="From date"
              className="w-40"
            />
            <DatePicker
              value={to}
              onChange={(value) => {
                setTo(value)
                setPage(0)
              }}
              aria-label="To date"
              className="w-40"
            />
          </>
        }
      />

      {!enabled ? (
        <p className="mb-4 text-sm text-destructive">
          From date must be on or before the to date.
        </p>
      ) : null}

      <Tabs
        value={tab}
        onValueChange={(value) => {
          if (
            value === "revenue" ||
            value === "methods" ||
            value === "refunds" ||
            value === "arrival"
          ) {
            setTab(value)
            setPage(0)
          }
        }}
        className="gap-4"
      >
        <TabsList
          variant="line"
          className="w-full justify-start border-b border-border"
        >
          <TabsTrigger value="revenue">Monthly revenue</TabsTrigger>
          <TabsTrigger value="methods">Payment methods</TabsTrigger>
          <TabsTrigger value="refunds">Refunds & cancellations</TabsTrigger>
          <TabsTrigger value="arrival">Pay on arrival</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue">
          <ReportTable
            columns={["Month", "Collected revenue"]}
            isPending={enabled && revenue.isPending}
            isError={revenue.isError}
            isEmpty={(revenue.data?.length ?? 0) === 0}
            error="Monthly revenue could not be loaded."
            empty="No collected revenue in this date range."
            page={0}
            pageSize={Math.max(revenue.data?.length ?? 0, 1)}
            totalPages={1}
            totalElements={revenue.data?.length ?? 0}
            onPageChange={setPage}
            showPagination={false}
          >
            {revenue.data?.map((row) => (
              <tr key={row.month} className="border-t border-border">
                <td className="px-5 py-3 font-bold text-primary">
                  {formatMonth(row.month)} {row.month.slice(0, 4)}
                </td>
                <td className="px-5 py-3 font-bold">
                  {formatMoney(row.amount)}
                </td>
              </tr>
            ))}
          </ReportTable>
        </TabsContent>

        <TabsContent value="methods">
          <ReportTable
            columns={["Payment method", "Collected amount"]}
            isPending={enabled && methods.isPending}
            isError={methods.isError}
            isEmpty={(methods.data?.length ?? 0) === 0}
            error="Payment methods could not be loaded."
            empty="No payment methods in this date range."
            page={0}
            pageSize={Math.max(methods.data?.length ?? 0, 1)}
            totalPages={1}
            totalElements={methods.data?.length ?? 0}
            onPageChange={setPage}
            showPagination={false}
          >
            {methods.data?.map((row) => (
              <tr key={row.name} className="border-t border-border">
                <td className="px-5 py-3 font-bold text-primary">
                  {formatLabel(row.name)}
                </td>
                <td className="px-5 py-3 font-bold">
                  {formatMoney(row.amount)}
                </td>
              </tr>
            ))}
          </ReportTable>
        </TabsContent>

        <TabsContent value="refunds">
          <ReportTable
            columns={["Booking", "Tour", "Reason", "Refund", "Status", "Date"]}
            isPending={enabled && refunds.isPending}
            isError={refunds.isError}
            isEmpty={(refunds.data?.content.length ?? 0) === 0}
            error="Refunds and cancellations could not be loaded."
            empty="No refunds or cancellations in this date range."
            page={page}
            pageSize={PAGE_SIZE}
            totalPages={refunds.data?.totalPages ?? 0}
            totalElements={refunds.data?.totalElements ?? 0}
            onPageChange={setPage}
          >
            {refunds.data?.content.map((row, index) => (
              <tr
                key={`${row.bookingRef}-${index}`}
                className="border-t border-border"
              >
                <td className="px-5 py-3 font-bold text-primary">
                  {cell(row.bookingRef)}
                </td>
                <td className="px-5 py-3">{cell(row.tourName)}</td>
                <td className="px-5 py-3">{cell(row.reason)}</td>
                <td className="px-5 py-3 font-bold">
                  {formatMoney(row.refundAmount)}
                </td>
                <td className="px-5 py-3">{formatLabel(row.status)}</td>
                <td className="px-5 py-3 text-muted-foreground">
                  {formatDateTime(row.dateTime)}
                </td>
              </tr>
            ))}
          </ReportTable>
        </TabsContent>

        <TabsContent value="arrival">
          <OutstandingTable
            rows={arrival.data?.content ?? []}
            isPending={enabled && arrival.isPending}
            isError={arrival.isError}
            error="Pay-on-arrival report could not be loaded."
            empty="No pay-on-arrival balances in this date range."
            page={page}
            totalPages={arrival.data?.totalPages ?? 0}
            totalElements={arrival.data?.totalElements ?? 0}
            onPageChange={setPage}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function OutstandingTable({
  rows,
  isPending,
  isError,
  error,
  empty,
  page,
  totalPages,
  totalElements,
  onPageChange,
}: {
  rows: {
    bookingRef?: string
    tourName?: string
    customerName?: string
    outstandingAmount?: number
    collectedAmount?: number
    status?: string
  }[]
  isPending: boolean
  isError: boolean
  error: string
  empty: string
  page: number
  totalPages: number
  totalElements: number
  onPageChange: (page: number) => void
}) {
  return (
    <ReportTable
      columns={[
        "Booking",
        "Tour",
        "Customer",
        "Collected",
        "Outstanding",
        "Status",
      ]}
      isPending={isPending}
      isError={isError}
      isEmpty={rows.length === 0}
      error={error}
      empty={empty}
      page={page}
      pageSize={PAGE_SIZE}
      totalPages={totalPages}
      totalElements={totalElements}
      onPageChange={onPageChange}
    >
      {rows.map((row, index) => (
        <tr
          key={`${row.bookingRef}-${index}`}
          className="border-t border-border"
        >
          <td className="px-5 py-3 font-bold text-primary">
            {cell(row.bookingRef)}
          </td>
          <td className="px-5 py-3">{cell(row.tourName)}</td>
          <td className="px-5 py-3">{cell(row.customerName)}</td>
          <td className="px-5 py-3 font-bold">
            {formatMoney(row.collectedAmount)}
          </td>
          <td className="px-5 py-3 font-bold">
            {formatMoney(row.outstandingAmount)}
          </td>
          <td className="px-5 py-3">{formatLabel(row.status)}</td>
        </tr>
      ))}
    </ReportTable>
  )
}

export default ReportsFeature
