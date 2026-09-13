/* eslint-disable react-refresh/only-export-components */
import HolidayPackageFormPage from "@/features/holiday-packages/create"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/_authenticated/holiday-packages/$id")({
  component: EditHolidayPackagePage,
})

function EditHolidayPackagePage() {
  const { id } = Route.useParams()
  return <HolidayPackageFormPage packageId={id} />
}
