import { BookingsTrendCard } from "@/features/dashboard/components/bookings-trend-card"
import { InquiriesCard } from "@/features/dashboard/components/inquiries-card"
import { SummaryCards } from "@/features/dashboard/components/summary-cards"
import { TopToursSection } from "@/features/dashboard/components/top-tours-section"
import { dashboardDateLine } from "@/features/dashboard/components/utils"
import { PagePlaceholder } from "@/components/page-placeholder"
import {
  useDashboardSummary,
  useNewTourInquiryCount,
  usePreviousSevenDays,
  useTopSellingTours,
} from "@/store/server/dashboard/dashboard"

const DashboardFeature = () => {
  const summary = useDashboardSummary()
  const days = usePreviousSevenDays()
  const tours = useTopSellingTours()
  const inquiries = useNewTourInquiryCount()

  return (
    <div className="space-y-6">
      <PagePlaceholder title="Dashboard" subtitle={dashboardDateLine()} />

      <SummaryCards
        summary={summary.data}
        isPending={summary.isPending}
        isError={summary.isError}
      />

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <BookingsTrendCard
            days={days.data ?? []}
            isPending={days.isPending}
            isError={days.isError}
          />
        </div>
        <InquiriesCard
          count={inquiries.data?.totalCount}
          isPending={inquiries.isPending}
          isError={inquiries.isError}
        />
      </div>

      <TopToursSection
        tours={tours.data ?? []}
        isPending={tours.isPending}
        isError={tours.isError}
      />
    </div>
  )
}

export default DashboardFeature
