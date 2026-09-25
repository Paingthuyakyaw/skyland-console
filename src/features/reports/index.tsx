import { useEffect, useState } from "react"

import { PagePlaceholder } from "@/components/page-placeholder"
import { DatePicker } from "@/components/ui/date-picker"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ReportTable } from "@/features/reports/components/report-table"
import {
  defaultPaymentRange,
  formatDateTime,
  formatLabel,
  formatMoney,
  isValidRange,
} from "@/features/payments/components/utils"
import {
  useDeposits,
  usePayOnArrival,
  usePromoCodes,
  useRefundsCancellations,
} from "@/store/server/reports/reports"

const PAGE_SIZE = 20

type ReportTab = "promo" | "refunds" | "arrival" | "deposits"

function cell(value?: string | number) {
  if (value === undefined || value === null || value === "") return "—"
  return value
}

const ReportsFeature = () => {
  const initial = defaultPaymentRange()
  const [from, setFrom] = useState(initial.from)
  const [to, setTo] = useState(initial.to)
  const [tab, setTab] = useState<ReportTab>("promo")
  const [page, setPage] = useState(0)
  const enabled = isValidRange(from, to)
  const query = { from, to, page, size: PAGE_SIZE }
  const promo = usePromoCodes(query, enabled && tab === "promo")
  const refunds = useRefundsCancellations(query, enabled && tab === "refunds")
  const arrival = usePayOnArrival(query, enabled && tab === "arrival")
  const deposits = useDeposits(query, enabled && tab === "deposits")

  useEffect(() => {
    setPage(0)
  }, [from, to, tab])

  return (
    <div>
      <PagePlaceholder
        title="Reports"
        subtitle="Commercial, operational and financial reporting with export-ready detail."
        actions={
          <>
            <DatePicker
              value={from}
              onChange={setFrom}
              aria-label="From date"
              className="w-40"
            />
            <DatePicker
              value={to}
              onChange={setTo}
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
            value === "promo" ||
            value === "refunds" ||
            value === "arrival" ||
            value === "deposits"
          ) {
            setTab(value)
          }
        }}
        className="gap-4"
      >
        <TabsList
          variant="line"
          className="w-full justify-start border-b border-border"
        >
          <TabsTrigger value="promo">Promo codes</TabsTrigger>
          <TabsTrigger value="refunds">Refunds & cancellations</TabsTrigger>
          <TabsTrigger value="arrival">Pay on arrival</TabsTrigger>
          <TabsTrigger value="deposits">Deposits</TabsTrigger>
        </TabsList>

        <TabsContent value="promo">
          <ReportTable
            columns={[
              "Coupon",
              "Times redeemed",
              "Discount given",
              "Booking amount",
            ]}
            isPending={enabled && promo.isPending}
            isError={promo.isError}
            isEmpty={(promo.data?.content.length ?? 0) === 0}
            error="Promo code report could not be loaded."
            empty="No promo code redemptions in this date range."
            page={page}
            pageSize={PAGE_SIZE}
            totalPages={promo.data?.totalPages ?? 0}
            totalElements={promo.data?.totalElements ?? 0}
            onPageChange={setPage}
          >
            {promo.data?.content.map((row) => (
              <tr key={row.couponCode} className="border-t border-border">
                <td className="px-5 py-3 font-bold text-primary">
                  {cell(row.couponCode)}
                </td>
                <td className="px-5 py-3">{cell(row.timesRedeemed)}</td>
                <td className="px-5 py-3 font-bold">
                  {formatMoney(row.discountGiven)}
                </td>
                <td className="px-5 py-3 font-bold">
                  {formatMoney(row.totalBookingAmount)}
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

        <TabsContent value="deposits">
          <OutstandingTable
            rows={deposits.data?.content ?? []}
            isPending={enabled && deposits.isPending}
            isError={deposits.isError}
            error="Deposits report could not be loaded."
            empty="No deposit balances in this date range."
            page={page}
            totalPages={deposits.data?.totalPages ?? 0}
            totalElements={deposits.data?.totalElements ?? 0}
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
