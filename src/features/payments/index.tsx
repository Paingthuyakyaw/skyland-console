import { useEffect, useState } from "react"
import { CircleDollarSign } from "lucide-react"

import { PagePlaceholder } from "@/components/page-placeholder"
import { Card } from "@/components/ui/card"
import { DatePicker } from "@/components/ui/date-picker"
import {
  MethodDonut,
  MonthlyLine,
  OptionBars,
} from "@/features/payments/components/charts"
import { TransactionLogTable } from "@/features/payments/components/transaction-log"
import {
  defaultPaymentRange,
  formatMoney,
  isValidRange,
} from "@/features/payments/components/utils"
import {
  useMonthlyRevenue,
  usePaymentMethods,
  useTotalPaid,
  useTourPaymentOptions,
  useTransactions,
} from "@/store/server/payments/payments"

const PAGE_SIZE = 20

const PaymentFeature = () => {
  const initial = defaultPaymentRange()
  const [from, setFrom] = useState(initial.from)
  const [to, setTo] = useState(initial.to)
  const [page, setPage] = useState(0)
  const range = { from, to }
  const enabled = isValidRange(from, to)
  const totalPaid = useTotalPaid(range, enabled)
  const methods = usePaymentMethods(range, enabled)
  const options = useTourPaymentOptions(range, enabled)
  const monthly = useMonthlyRevenue(range, enabled)
  const transactions = useTransactions(range, page, PAGE_SIZE, enabled)

  useEffect(() => {
    setPage(0)
  }, [from, to])

  return (
    <div>
      <PagePlaceholder
        title="Payments & Revenue"
        subtitle="Track cash flow, methods and transaction history."
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

      <Card className="mb-4 flex-row items-center gap-4 p-5 sm:max-w-sm">
        <div className="flex size-12 items-center justify-center rounded-[12px] bg-status-confirmed-bg text-status-confirmed">
          <CircleDollarSign className="size-6" />
        </div>
        <div>
          <div className="text-2xl font-black text-foreground">
            {enabled && totalPaid.isPending
              ? "—"
              : formatMoney(totalPaid.data?.amount)}
          </div>
          <div className="text-sm text-muted-foreground">Paid</div>
          {totalPaid.isError ? (
            <div className="text-xs text-destructive">
              Could not load the collected amount.
            </div>
          ) : null}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="gap-3 p-5">
          <h2 className="font-bold text-foreground">Payment Method</h2>
          {methods.isError ? (
            <p className="text-sm text-destructive">
              Payment methods could not be loaded.
            </p>
          ) : enabled && methods.isPending ? (
            <div className="h-48 animate-pulse rounded-xl bg-muted" />
          ) : (
            <MethodDonut groups={methods.data ?? []} />
          )}
        </Card>

        <Card className="gap-3 p-5">
          <div>
            <h2 className="font-bold text-foreground">Tour Payment Option</h2>
            <p className="text-xs text-muted-foreground">
              Full / Deposit / On arrival
            </p>
          </div>
          {options.isError ? (
            <p className="text-sm text-destructive">
              Payment options could not be loaded.
            </p>
          ) : enabled && options.isPending ? (
            <div className="h-48 animate-pulse rounded-xl bg-muted" />
          ) : (
            <OptionBars groups={options.data ?? []} />
          )}
        </Card>

        <Card className="gap-3 p-5">
          <div>
            <h2 className="font-bold text-foreground">Monthly Revenue</h2>
            <p className="text-xs text-muted-foreground">
              Seven months ending in the to month
            </p>
          </div>
          {monthly.isError ? (
            <p className="text-sm text-destructive">
              Monthly revenue could not be loaded.
            </p>
          ) : enabled && monthly.isPending ? (
            <div className="h-48 animate-pulse rounded-xl bg-muted" />
          ) : (
            <MonthlyLine points={monthly.data ?? []} />
          )}
        </Card>
      </div>

      <TransactionLogTable
        rows={transactions.data?.content ?? []}
        isPending={enabled && transactions.isPending}
        isError={transactions.isError}
        page={page}
        pageSize={PAGE_SIZE}
        totalPages={transactions.data?.totalPages ?? 0}
        totalElements={transactions.data?.totalElements ?? 0}
        onPageChange={setPage}
      />
    </div>
  )
}

export default PaymentFeature
